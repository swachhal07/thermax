/* Everything the process reads out of the environment, read once, validated
   once, and exported as plain values. Anything missing that the API cannot run
   without stops the boot here rather than surfacing as a confusing 500 on the
   first request that needs it.

   Cloudinary is treated as optional: the records are the point of this API and
   they work without it. Image endpoints refuse with a clear 503 when the keys
   are absent — see config/cloudinary.js. */

const required = (key) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. Copy backend/.env.example to backend/.env and fill it in.`,
    )
  }
  return value
}

const list = (key, fallback = '') =>
  (process.env[key] ?? fallback)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required('MONGODB_URI'),
  corsOrigins: list('CORS_ORIGINS', 'http://localhost:5173'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  adminSetupKey: process.env.ADMIN_SETUP_KEY ?? '',
  /* The account `npm run seed` and `npm run admin` create or reset. Keeping it
     here means the login can be changed by editing one file and re-running the
     seed, rather than by remembering a command line. Optional: leave the
     password blank and no account is touched.

     This is a real credential in a file, so it belongs only in a gitignored
     local .env. On a deployed API, set ADMIN_PASSWORD once, run the seed, then
     clear it — the account outlives the variable. */
  admin: {
    email: (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD ?? '',
    name: process.env.ADMIN_NAME ?? '',
    role: process.env.ADMIN_ROLE === 'editor' ? 'editor' : 'admin',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    folder: process.env.CLOUDINARY_FOLDER ?? 'thermax',
  },
}

env.isProduction = env.nodeEnv === 'production'
env.admin.configured = Boolean(env.admin.email && env.admin.password)
env.cloudinary.configured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret,
)
