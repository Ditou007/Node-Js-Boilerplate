import User from '../models/user'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'
import { AuthRequest, UserPayload } from '../types/types'
import crypto from 'crypto'
import { sendEmail } from '../config/mailer'
import upload from '../middleware/upload'
import AWS from 'aws-sdk'

//!AWS CONFIG
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'your-region',
})

function generateVerificationToken(): string {
  return crypto.randomBytes(20).toString('hex')
}

export const registerUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email })
    if (existingUser) {
      return res.status(400).send({ message: 'Email already registered.' })
    }
    const user = new User(req.body)

    // Generate email verification token
    const token = generateVerificationToken()
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now in milliseconds
    user.emailVerificationToken = token
    user.emailVerificationTokenExpires = oneHourFromNow

    await user.save()

    //! Change this to the link where you handle email verification on your frontend
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`
    await sendEmail(
      user.email,
      'Email Verification',
      `Please verify your email by clicking on the following link: ${verificationLink}`
    )

    const jwtToken = jwt.sign(
      { userId: user._id, roles: user.roles },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1h',
      }
    )

    res.status(201).send({ user, token: jwtToken })
  } catch (error) {
    res.status(400).send(error)
  }
}

export const loginUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      return res.status(400).send({ error: 'Invalid login credentials.' })
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password)
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid login credentials.' })
    }

    const token = jwt.sign(
      { userId: user._id, roles: user.roles },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1h',
      }
    )

    res.send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
}

export const requireRole = (role: string): express.RequestHandler => {
  return (req: AuthRequest, res, next) => {
    console.log('req.user', req.user)
    console.log('role', role)

    if (req.user && req.user.roles && req.user.roles.includes(role)) {
      next()
    } else {
      res.status(403).send('Access denied.')
    }
  }
}
export const verifyEmail = async (req: AuthRequest, res: express.Response) => {
  const token = req.query.token as string

  // Find the user with the matching verification token
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpires: { $gt: Date.now() },
  })

  if (!user) {
    return res.status(400).send({ message: 'Invalid or expired token.' })
  }

  // Set user's email as verified and clear the verification token and expiration
  user.emailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationTokenExpires = undefined
  await user.save()

  res.send({ message: 'Email verified successfully.' })
}

const s3 = new AWS.S3()

async function uploadToS3(
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const params = {
    Bucket: 'projectadsbucket',
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  }
  await s3.upload(params).promise()
  return `https://projectadsbucket.s3.amazonaws.com/${key}`
}

async function uploadImageToStorage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const key = `uploads/${Date.now()}.jpg` // Generate a unique key, adjust as needed
  return uploadToS3(key, imageBuffer, mimeType)
}

//! Specially done for file type

interface RequestWithFile extends AuthRequest {
  file?: any
  user?: UserPayload // Add this line to recognize the user property.
}

export const uploadImage = [
  upload.single('image'),
  async (req: RequestWithFile, res: express.Response) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.')
      }

      // Add a check for req.user and req.user.userId since TypeScript might not be aware that they are defined.
      if (!req.user || !req.user.userId) {
        return res.status(401).send('Unauthorized.')
      }

      const userId = req.user.userId
      const imageUrl = await uploadImageToStorage(
        req.file.buffer,
        req.file.mimetype
      )
      const description = req.body.description

      await User.findByIdAndUpdate(
        userId,
        { $push: { images: { url: imageUrl, description } } },
        { new: true }
      )

      res.status(200).send({ message: 'Image uploaded successfully!' })
    } catch (error) {
      res.status(500).send(error)
    }
  },
]
