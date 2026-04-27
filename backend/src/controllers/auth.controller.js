const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const prisma  = require('../config/db')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, type = 'attendee', phone, city } = req.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, type, phone, city },
      select: { id: true, name: true, email: true, type: true, phone: true, city: true, createdAt: true },
    })

    res.status(201).json({ token: signToken(user.id), user })
  } catch (err) { next(err) }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid email or password' })

    const { password: _, ...safeUser } = user
    res.json({ token: signToken(user.id), user: safeUser })
  } catch (err) { next(err) }
}

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by protect middleware
    res.json({ user: req.user })
  } catch (err) { next(err) }
}

module.exports = { register, login, getMe }
