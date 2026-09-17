import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

/* Staff accounts for the admin side. There is no public sign-up: the first
   account is created by the bootstrap route or `npm run admin`, and any
   account after that needs ADMIN_SETUP_KEY. */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'An email address is needed to sign in.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'That address looks incomplete.'],
    },
    name: { type: String, trim: true, maxlength: 120, default: '' },
    /* `select: false` so the hash never leaves the database by accident — the
       login route asks for it explicitly. */
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
        return ret
      },
    },
  },
)

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 12)

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash)
}

export const User = mongoose.model('User', userSchema)
