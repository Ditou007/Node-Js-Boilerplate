import express from 'express'
import { registerUser, loginUser } from '../controllers/userController'
import authMiddleware from '../middleware/auth'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/protected', authMiddleware, (req, res) => {
  res.send("This is a protected route. You're authenticated!")
})

export default router
