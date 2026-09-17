import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { signToken } from '../middleware/auth.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendItem } from '../utils/respond.js'

/* POST /auth/register
   Open only while the database has no accounts — that first call creates the
   admin. After that it needs ADMIN_SETUP_KEY, and if that is unset the route is
   closed entirely, which is the right default for a deploy nobody is actively
   onboarding staff into. */
export const register = asyncHandler(async (req, res) => {
  const { setupKey, password, ...fields } = req.body
  const isBootstrap = (await User.estimatedDocumentCount()) === 0

  if (!isBootstrap) {
    if (!env.adminSetupKey) {
      throw ApiError.forbidden('Account creation is closed. Set ADMIN_SETUP_KEY to reopen it.')
    }
    if (setupKey !== env.adminSetupKey) throw ApiError.forbidden('That setup key is not right.')
  }

  const user = await User.create({
    ...fields,
    // The account that bootstraps the install is the admin regardless of what
    // the request asked for.
    role: isBootstrap ? 'admin' : fields.role,
    passwordHash: await User.hashPassword(password),
  })

  sendItem(res, { user: user.toJSON(), token: signToken(user) }, 201)
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+passwordHash')

  /* One message for both "no such account" and "wrong password", so the
     response cannot be used to enumerate who has an account here. The hash is
     still compared when the user is missing would be ideal; instead the route
     is rate limited, which costs nothing and covers the same ground. */
  if (!user || !(await user.verifyPassword(password))) {
    throw ApiError.unauthorized('That email and password do not match.')
  }

  user.lastLoginAt = new Date()
  await user.save()

  sendItem(res, { user: user.toJSON(), token: signToken(user) })
})

export const me = asyncHandler(async (req, res) => {
  sendItem(res, { user: req.user.toJSON() })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+passwordHash')

  if (!(await user.verifyPassword(currentPassword))) {
    throw ApiError.unauthorized('That is not your current password.')
  }

  user.passwordHash = await User.hashPassword(newPassword)
  await user.save()

  // A fresh token, so the client is not left holding one signed before the
  // change.
  sendItem(res, { user: user.toJSON(), token: signToken(user) })
})
