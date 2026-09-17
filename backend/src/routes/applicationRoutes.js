import { Router } from 'express'
import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  setApplicationImage,
  deleteApplicationImage,
  reorderApplications,
} from '../controllers/applicationController.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { receiveImage } from '../middleware/upload.js'
import {
  applicationCreateSchema,
  applicationUpdateSchema,
  reorderSchema,
} from '../validation/schemas.js'

export const applicationRoutes = Router()

// Reads are public — this is what the site itself calls.
applicationRoutes.get('/', listApplications)

/* Ahead of `/:slug`, or "reorder" would be read as a slug. */
applicationRoutes.patch('/reorder', requireAuth, validateBody(reorderSchema), reorderApplications)

applicationRoutes.get('/:slug', getApplication)

applicationRoutes.post('/', requireAuth, validateBody(applicationCreateSchema), createApplication)
applicationRoutes.patch(
  '/:slug',
  requireAuth,
  validateBody(applicationUpdateSchema),
  updateApplication,
)
applicationRoutes.delete('/:slug', requireAuth, deleteApplication)

applicationRoutes.post('/:slug/image', requireAuth, receiveImage, setApplicationImage)
applicationRoutes.delete('/:slug/image', requireAuth, deleteApplicationImage)
