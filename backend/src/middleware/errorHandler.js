const { validationResult } = require('express-validator')

// Run validation rules and return 422 on failure
const validate = (rules) => async (req, res, next) => {
  await Promise.all(rules.map(rule => rule.run(req)))
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  next()
}

// Global error handler — must be registered last in Express
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`)

  // Prisma unique constraint violation (e.g. duplicate email)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] ?? 'field'
    return res.status(409).json({ message: `${field} already exists` })
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' })
  }

  const status  = err.statusCode || err.status || 500
  const message = err.message    || 'Internal server error'
  res.status(status).json({ message })
}

module.exports = { validate, errorHandler }
