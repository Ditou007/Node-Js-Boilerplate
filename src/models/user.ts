import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    default: ['user'],
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date, // Date field to store the expiration time
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: '',
      },
    },
  ],
})

userSchema.pre('save', async function (next) {
  // 'this' refers to the user document about to be saved
  const user = this

  // Ensure password is modified before hashing
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
  }

  next()
})

const User = mongoose.model('User', userSchema)

export default User
