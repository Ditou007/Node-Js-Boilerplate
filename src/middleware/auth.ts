import jwt from 'jsonwebtoken'
import express from 'express'
import { AuthRequest, UserPayload } from '../types/types'

// Define a TypeScript interface for the payload of your JWTs.

const authMiddleware: express.RequestHandler = (
  req: AuthRequest,
  res,
  next
) => {
  const token = req.header('Authorization')?.split(' ')[1]

  if (!token) {
    return res.status(401).send({ error: 'No token provided.' })
  }

  try {
    // Use the UserPayload interface to type the decoded JWT payload.
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).send({ error: 'Invalid token.' })
  }
}

export default authMiddleware
