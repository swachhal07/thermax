import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'

/* Create the account, or reset the password on the one that already holds this
   address. Resetting rather than erroring is the point: this is what runs when
   someone has forgotten the password or has just edited it in .env, and both
   cases should end with a login that works.

   Shared by `npm run seed` (which calls it with whatever is in .env) and
   `npm run admin` (which calls it with the flags you passed). */
export async function upsertAdmin({ email, password, name = '', role = 'admin' }) {
  if (!email || !password) {
    throw new ApiError(400, 'An email address and a password are both needed.')
  }

  if (password.length < 10) {
    throw new ApiError(400, 'Use a password of at least 10 characters.')
  }

  const passwordHash = await User.hashPassword(password)
  const existing = await User.findOne({ email: email.trim().toLowerCase() })

  if (existing) {
    existing.passwordHash = passwordHash
    // Only overwrite these when the caller actually supplied them, so a bare
    // password change does not silently blank someone's name.
    if (name) existing.name = name
    if (role) existing.role = role
    await existing.save()

    return { user: existing, created: false }
  }

  const user = await User.create({ email, name, role, passwordHash })
  return { user, created: true }
}
