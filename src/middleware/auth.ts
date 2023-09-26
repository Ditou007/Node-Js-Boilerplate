import jwt from 'jsonwebtoken'
import express from 'express'

interface CustomRequest extends express.Request {
  user?: any
}

const authMiddleware: express.RequestHandler = (
  req: CustomRequest,
  res,
  next
) => {
  const token = req.header('Authorization')?.split(' ')[1]

  if (!token) {
    return res.status(401).send({ error: 'No token provided.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).send({ error: 'Invalid token.' })
  }
}

export default authMiddleware
