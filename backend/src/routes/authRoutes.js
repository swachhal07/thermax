import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, me, changePassword } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { loginSchema, registerSchema, passwordChangeSchema } from '../validation/schemas.js'

/* Tighter than the API-wide limiter: ten attempts per quarter hour per IP is
   more than a person needs and far less than a password guesser does. */
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Try again in a few minutes.' } },
})

export const authRoutes = Router()

authRoutes.post('/register', credentialLimiter, validateBody(registerSchema), register)
authRoutes.post('/login', credentialLimiter, validateBody(loginSchema), login)
authRoutes.get('/me', requireAuth, me)
authRoutes.post(
  '/password',
  credentialLimiter,
  requireAuth,
  validateBody(passwordChangeSchema),
  changePassword,
)
