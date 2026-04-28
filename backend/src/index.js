require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes         = require('./routes/auth.routes')
const eventsRoutes       = require('./routes/events.routes')
const usersRoutes        = require('./routes/users.routes')
const uploadRoutes       = require('./routes/upload.routes')
const { errorHandler }   = require('./middleware/errorHandler')

const app  = express()
const PORT = process.env.PORT
if (!PORT) {
  console.error('PORT environment variable is not set!')
  process.exit(1)
}

// ── CORS ──────────────────────────────────────────────────────
app.options('*', cors())
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/users',  usersRoutes)
app.use('/api/upload', uploadRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
})

// Global error handler (must be last)
app.use(errorHandler)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Bound to 0.0.0.0:${PORT}`)
})
