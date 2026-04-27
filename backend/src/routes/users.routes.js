const router = require('express').Router()
const {
  getProfile, updateProfile,
  getSavedEvents, saveEvent, unsaveEvent,
  getMyRegistrations,
} = require('../controllers/users.controller')
const { protect } = require('../middleware/auth')

// All user routes require authentication
router.use(protect)

router.get('/profile',                   getProfile)
router.put('/profile',                   updateProfile)
router.get('/saved-events',              getSavedEvents)
router.post('/saved-events/:eventId',    saveEvent)
router.delete('/saved-events/:eventId',  unsaveEvent)
router.get('/registrations',             getMyRegistrations)

module.exports = router
