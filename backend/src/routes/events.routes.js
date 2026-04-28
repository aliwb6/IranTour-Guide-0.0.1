const router = require('express').Router()
const { body } = require('express-validator')
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  registerForEvent, getRegistrations, getMyEvents,
} = require('../controllers/events.controller')
const { protect, organizerOnly } = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')

const eventRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('province').trim().notEmpty().withMessage('Province is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('startDate').isISO8601().withMessage('Valid startDate is required'),
  body('capacity').optional().isInt({ min: 0 }),
]

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
]

// Protected static routes BEFORE /:id to avoid Express matching "organizer" as an id param
router.get('/organizer/my', protect, organizerOnly, getMyEvents)

// Public routes
router.get('/',     getEvents)
router.get('/:id',  getEvent)

// Registration (public — optionally authenticated)
router.post('/:id/register', validate(registerRules), registerForEvent)

// Protected routes
router.get('/:id/registrations', protect, organizerOnly, getRegistrations)
router.post('/',   protect, organizerOnly, validate(eventRules), createEvent)
router.put('/:id', protect, organizerOnly,                       updateEvent)
router.delete('/:id', protect, organizerOnly,                    deleteEvent)

module.exports = router
