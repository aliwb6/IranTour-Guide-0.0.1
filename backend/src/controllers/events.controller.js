const prisma = require('../config/db')

// ── Helpers ───────────────────────────────────────────────────
const eventSelect = {
  id: true, title: true, description: true, province: true, city: true,
  venue: true, startDate: true, endDate: true, category: true, status: true,
  capacity: true, phone: true, email: true, website: true, imageUrl: true,
  style: true, duration: true, createdAt: true,
  organizer: { select: { id: true, name: true, email: true } },
  _count: { select: { registrations: true } },
}

// ── GET /api/events ───────────────────────────────────────────
const getEvents = async (req, res, next) => {
  try {
    const {
      search, category, province, status,
      dateFrom, dateTo,
      sortBy = 'startDate', order = 'asc',
      page = '1', limit = '20',
    } = req.query

    const where = {}

    if (search) {
      where.OR = [
        { title:    { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
        { city:     { contains: search, mode: 'insensitive' } },
        { venue:    { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) where.category = category
    if (province) where.province = province
    if (status)   where.status   = status
    if (dateFrom || dateTo) {
      where.startDate = {}
      if (dateFrom) where.startDate.gte = new Date(dateFrom)
      if (dateTo)   where.startDate.lte = new Date(dateTo)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const allowedSort = ['startDate', 'createdAt', 'title', 'capacity']
    const orderBy = allowedSort.includes(sortBy)
      ? { [sortBy]: order === 'desc' ? 'desc' : 'asc' }
      : { startDate: 'asc' }

    const [events, total] = await Promise.all([
      prisma.event.findMany({ where, select: eventSelect, orderBy, skip, take }),
      prisma.event.count({ where }),
    ])

    res.json({
      events,
      pagination: { total, page: parseInt(page), limit: take, pages: Math.ceil(total / take) },
    })
  } catch (err) { next(err) }
}

// ── GET /api/events/:id ───────────────────────────────────────
const getEvent = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { ...eventSelect, registrations: { select: { id: true, status: true } } },
    })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json({ event })
  } catch (err) { next(err) }
}

// ── POST /api/events ──────────────────────────────────────────
const createEvent = async (req, res, next) => {
  try {
    const {
      title, description, province, city, venue,
      startDate, endDate, category, capacity,
      phone, email, website, imageUrl, style, duration,
    } = req.body

    const event = await prisma.event.create({
      data: {
        title, description, province, city, venue,
        startDate: new Date(startDate),
        endDate:   endDate ? new Date(endDate) : null,
        category, capacity: parseInt(capacity) || 0,
        phone, email, website, imageUrl, style, duration,
        status: 'pending',
        organizerId: req.user.id,
      },
      select: eventSelect,
    })
    res.status(201).json({ event })
  } catch (err) { next(err) }
}

// ── PUT /api/events/:id ───────────────────────────────────────
const updateEvent = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Event not found' })
    if (existing.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this event' })
    }

    const {
      title, description, province, city, venue,
      startDate, endDate, category, status, capacity,
      phone, email, website, imageUrl, style, duration,
    } = req.body

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(title       !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(province    !== undefined && { province }),
        ...(city        !== undefined && { city }),
        ...(venue       !== undefined && { venue }),
        ...(startDate   !== undefined && { startDate: new Date(startDate) }),
        ...(endDate     !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(category    !== undefined && { category }),
        ...(status      !== undefined && { status }),
        ...(capacity    !== undefined && { capacity: parseInt(capacity) }),
        ...(phone       !== undefined && { phone }),
        ...(email       !== undefined && { email }),
        ...(website     !== undefined && { website }),
        ...(imageUrl    !== undefined && { imageUrl }),
        ...(style       !== undefined && { style }),
        ...(duration    !== undefined && { duration }),
      },
      select: eventSelect,
    })
    res.json({ event })
  } catch (err) { next(err) }
}

// ── DELETE /api/events/:id ────────────────────────────────────
const deleteEvent = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Event not found' })
    if (existing.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' })
    }

    await prisma.event.delete({ where: { id } })
    res.json({ message: 'Event deleted' })
  } catch (err) { next(err) }
}

// ── POST /api/events/:id/register ────────────────────────────
const registerForEvent = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id)
    const { name, phone } = req.body

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) return res.status(404).json({ message: 'Event not found' })

    // Check if user already registered (if authenticated)
    if (req.user) {
      const existing = await prisma.registration.findFirst({
        where: { eventId, userId: req.user.id },
      })
      if (existing) return res.status(409).json({ message: 'Already registered for this event' })
    }

    const registration = await prisma.registration.create({
      data: {
        name,
        phone,
        eventId,
        userId: req.user?.id ?? null,
        status: 'pending',
      },
    })
    res.status(201).json({ registration })
  } catch (err) { next(err) }
}

// ── GET /api/events/:id/registrations (organizer only) ───────
const getRegistrations = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id)
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ registrations, total: registrations.length })
  } catch (err) { next(err) }
}

// ── GET /api/events/my  (organizer's own events) ──────────────
const getMyEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user.id },
      select: { ...eventSelect },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ events })
  } catch (err) { next(err) }
}

module.exports = {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  registerForEvent, getRegistrations, getMyEvents,
}
