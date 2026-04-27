const jwt = require('jsonwebtoken')
const prisma = require('../config/db')

// Verify JWT and attach user to req.user
const protect = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized — no token' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, type: true, phone: true, city: true },
    })
    if (!user) return res.status(401).json({ message: 'User no longer exists' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Allow only organizers
const organizerOnly = (req, res, next) => {
  if (req.user?.type !== 'organizer') {
    return res.status(403).json({ message: 'Access restricted to organizers' })
  }
  next()
}

module.exports = { protect, organizerOnly }
