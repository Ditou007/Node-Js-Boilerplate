import express from 'express'
import path from 'path'
import { connectDatabase } from './config/database'
import userRoutes from './routes/userRoutes' // Import the user routes
import { requestLogger } from './utils/logger'

const app = express()
const port = 3000

// Initialize and connect to the database
connectDatabase()

// Setup view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

// Middleware to parse JSON bodies
app.use(express.json())

// Middleware for serving static files
app.use(express.static(path.join(__dirname, '../public')))

// Middleware for logging requests
app.use(requestLogger)

// Use the modularized routes
app.use('/users', userRoutes)

// Main index route
app.get('/', (req, res) => {
  res.render('index')
})

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  }
)

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`)
})
