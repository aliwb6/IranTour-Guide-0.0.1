const bcrypt  = require('bcryptjs')
const prisma  = require('../config/db')

// ── GET /api/users/profile ────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, type: true,
        phone: true, city: true, createdAt: true,
        _count: { select: { registrations: true, savedEvents: true, events: true } },
      },
    })
    res.json({ user })
  } catch (err) { next(err) }
}

// ── PUT /api/users/profile ────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, currentPassword, newPassword } = req.body

    const data = {}
    if (name)  data.name  = name
    if (phone) data.phone = phone
    if (city)  data.city  = city

    // Password change (requires currentPassword for verification)
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required to set new password' })
      }
      const user = await prisma.user.findUnique({ where: { id: req.user.id } })
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return res.status(401).json({ message: 'Current password is incorrect' })
      data.password = await bcrypt.hash(newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, type: true, phone: true, city: true },
    })
    res.json({ user: updated })
  } catch (err) { next(err) }
}

// ── GET /api/users/saved-events ───────────────────────────────
const getSavedEvents = async (req, res, next) => {
  try {
    const saved = await prisma.savedEvent.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          select: {
            id: true, title: true, province: true, city: true, venue: true,
            startDate: true, category: true, status: true, capacity: true, imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ savedEvents: saved.map(s => s.event) })
  } catch (err) { next(err) }
}

// ── POST /api/users/saved-events/:eventId ─────────────────────
const saveEvent = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId)
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) return res.status(404).json({ message: 'Event not found' })

    await prisma.savedEvent.create({ data: { userId: req.user.id, eventId } })
    res.status(201).json({ message: 'Event saved' })
  } catch (err) {
    // P2002 = unique constraint — already saved
    if (err.code === 'P2002') return res.status(409).json({ message: 'Already saved' })
    next(err)
  }
}

// ── DELETE /api/users/saved-events/:eventId ───────────────────
const unsaveEvent = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId)
    await prisma.savedEvent.deleteMany({ where: { userId: req.user.id, eventId } })
    res.json({ message: 'Event removed from saved' })
  } catch (err) { next(err) }
}

// ── GET /api/users/registrations ─────────────────────────────
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          select: {
            id: true, title: true, province: true, city: true,
            startDate: true, category: true, status: true, imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ registrations })
  } catch (err) { next(err) }
}

module.exports = {
  getProfile, updateProfile,
  getSavedEvents, saveEvent, unsaveEvent,
  getMyRegistrations,
}
