import { Router } from 'express'
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { SECTORS } from '../models/constants.js'
import { authRoutes } from './authRoutes.js'
import { clientRoutes } from './clientRoutes.js'
import { applicationRoutes } from './applicationRoutes.js'

export const api = Router()

/* Enough for a uptime check to tell a live API from a live process that has
   lost its database. */
api.get('/health', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const db = states[mongoose.connection.readyState] ?? 'unknown'

  res.status(db === 'connected' ? 200 : 503).json({
    data: {
      status: db === 'connected' ? 'ok' : 'degraded',
      db,
      images: env.cloudinary.configured ? 'cloudinary' : 'not configured',
      uptimeSeconds: Math.round(process.uptime()),
      env: env.nodeEnv,
    },
  })
})

/* The sector vocabulary both collections are validated against, so an admin
   form can build its own filters from the API rather than duplicating the
   list. */
api.get('/sectors', (_req, res) => res.json({ data: SECTORS }))

api.use('/auth', authRoutes)
api.use('/clients', clientRoutes)
api.use('/applications', applicationRoutes)
