import User from '../models/user'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'

export const registerUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const user = new User(req.body)
    console.log('req.body', req.body)
    await user.save()

    const token = jwt.sign(
      { userId: user._id, roles: user.roles },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1h',
      }
    )

    res.status(201).send({ user, token })
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
