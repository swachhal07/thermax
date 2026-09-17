import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import { api } from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { ApiError } from './utils/ApiError.js'

export function createApp() {
  const app = express()

  /* Behind a proxy (Render, Fly, nginx) the client IP arrives in
     X-Forwarded-For; without this the rate limiter would see one address for
     the whole internet. */
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  /* This API serves JSON to a separate frontend and never renders HTML, so the
     CSP and the cross-origin resource policy have nothing to protect and would
     only interfere with Cloudinary URLs being read from another origin. */
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }))

  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header — curl, a server-side call, a health check.
        if (!origin) return callback(null, true)
        if (env.corsOrigins.includes(origin)) return callback(null, true)
        callback(ApiError.forbidden(`Origin \`${origin}\` is not allowed to call this API.`))
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86_400,
    }),
  )

  app.use(express.json({ limit: '256kb' }))
  app.use(express.urlencoded({ extended: false, limit: '256kb' }))

  app.use(morgan(env.isProduction ? 'combined' : 'dev'))

  /* A broad ceiling — the site's own reads are well under it, and it exists to
     stop a loop or a scraper, not to shape normal traffic. The credential
     routes carry their own, much tighter limit. */
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: { message: 'Too many requests — slow down a moment.' } },
    }),
  )

  /* Versioned from the start: the frontend pins a base URL, and a future
     breaking change should be able to run beside this one rather than under
     it. */
  app.use('/api/v1', api)

  app.get('/', (_req, res) =>
    res.json({ data: { name: 'Thermax API', version: 'v1', docs: '/api/v1/health' } }),
  )

  app.use(notFound)
  app.use(errorHandler)

  return app
}
