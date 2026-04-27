const router = require('express').Router()
const { body } = require('express-validator')
const { register, login, getMe } = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('type').optional().isIn(['organizer', 'attendee']).withMessage('type must be organizer or attendee'),
]

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
]

router.post('/register', validate(registerRules), register)
router.post('/login',    validate(loginRules),    login)
router.get('/me',        protect,                 getMe)

module.exports = router
