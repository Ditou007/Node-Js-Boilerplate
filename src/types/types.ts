import { Request } from 'express'

export interface UserPayload {
  userId: string
  roles: string[]
}

export interface AuthRequest extends Request {
  user?: UserPayload
}
