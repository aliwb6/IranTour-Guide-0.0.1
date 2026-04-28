require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes         = require('./routes/auth.routes')
const eventsRoutes       = require('./routes/events.routes')
const usersRoutes        = require('./routes/users.routes')
const uploadRoutes       = require('./routes/upload.routes')
const { errorHandler }   = require('./middleware/errorHandler')

const app  = express()
const PORT = process.env.PORT || 8080

// ── CORS ──────────────────────────────────────────────────────
// FRONTEND_URL accepts a comma-separated list of allowed origins.
// Set to "*" in Railway to allow all origins, or list specific URLs:
//   FRONTEND_URL=https://your-app.vercel.app,http://localhost:5173
const rawOrigins = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'

let corsOrigin
if (rawOrigins === '*') {
  corsOrigin = '*'
} else {
  corsOrigin = rawOrigins.split(',').map(s => s.trim())
}

app.use(cors({
  origin: corsOrigin,
  credentials: corsOrigin !== '*',
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})
