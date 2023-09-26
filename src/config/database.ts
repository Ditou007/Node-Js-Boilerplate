import mongoose from 'mongoose'

export const connectDatabase = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mydatabase')
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Could not connect to MongoDB', error)
    process.exit(1)
  }
}
