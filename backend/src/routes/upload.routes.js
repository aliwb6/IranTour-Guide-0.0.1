const router     = require('express').Router()
const multer     = require('multer')
const cloudinary = require('cloudinary').v2
const { protect } = require('../middleware/auth')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Use memory storage — pipe buffer directly to Cloudinary
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

// POST /api/upload/image
router.post('/image', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'irantour-events', resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
        (err, result) => err ? reject(err) : resolve(result)
      )
      stream.end(req.file.buffer)
    })

    res.json({ url: result.secure_url, publicId: result.public_id })
  } catch (err) { next(err) }
})

module.exports = router
