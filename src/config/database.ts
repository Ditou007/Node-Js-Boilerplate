import mongoose from 'mongoose'

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Could not connect to MongoDB', error)
    process.exit(1)
  }
}
