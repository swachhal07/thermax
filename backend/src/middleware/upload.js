import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

const MAX_BYTES = 8 * 1024 * 1024

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])

/* Files are held in memory and streamed straight to Cloudinary — nothing is
   written to disk, so this runs unchanged on a read-only or ephemeral
   filesystem. 8MB is generous for a site photograph and small enough that a
   handful of concurrent uploads cannot exhaust the process. */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(
        ApiError.badRequest(
          `\`${file.mimetype}\` is not an image type we store. Use JPEG, PNG, WebP, AVIF or SVG.`,
        ),
      )
    }
    cb(null, true)
  },
}).single('image')

/* multer's own errors carry codes rather than statuses, so they are translated
   here — a file that is too large should read as a 400 with the limit in it,
   not as a 500. */
export const receiveImage = (req, res, next) =>
  uploadImage(req, res, (error) => {
    if (!error) {
      if (!req.file) return next(ApiError.badRequest('Attach the image as the `image` field.'))
      return next()
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest(`That image is over the ${MAX_BYTES / 1024 / 1024}MB limit.`))
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(ApiError.badRequest('Send exactly one file, in the `image` field.'))
      }
      return next(ApiError.badRequest(error.message))
    }

    next(error)
  })
