import express, { Request } from 'express'
import {
  registerUser,
  loginUser,
  requireRole,
  verifyEmail,
} from '../controllers/userController'
import authMiddleware from '../middleware/auth'
import { CustomRequest } from '../../types/types'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/protected', authMiddleware, (req: CustomRequest, res) => {
  res.send("This is a protected route. You're authenticated!")
})
router.get(
  '/admin',
  authMiddleware,
  requireRole('admin'),
  (req: CustomRequest, res) => {
    // This route can only be accessed by authenticated users with the 'admin' role
    res.send('Welcome, admin!')
  }
)

router.get('/verify-email', verifyEmail)

export default router
