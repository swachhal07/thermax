import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })

/* Bearer token in the Authorization header. No cookies: the admin client is a
   separate origin from the API, and a header keeps CSRF out of the picture
   entirely. */
const readToken = (req) => {
  const header = req.get('authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null
}

/* The account is re-read on every request rather than trusted from the token,
   so revoking someone takes effect immediately instead of at token expiry. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = readToken(req)
  if (!token) throw ApiError.unauthorized('Sign in to make this change.')

  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret)
  } catch (error) {
    throw ApiError.unauthorized(
      error.name === 'TokenExpiredError' ? 'Your session has expired — sign in again.' : 'That token is not valid.',
    )
  }

  const user = await User.findById(payload.sub)
  if (!user) throw ApiError.unauthorized('That account no longer exists.')

  req.user = user
  next()
})

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized())
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This needs the ${roles.join(' or ')} role.`))
    }
    next()
  }
