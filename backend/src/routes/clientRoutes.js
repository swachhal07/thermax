import { Router } from 'express'
import {
  listClients,
  clientLedger,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  setClientLogo,
  deleteClientLogo,
  reorderClients,
} from '../controllers/clientController.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { receiveImage } from '../middleware/upload.js'
import { clientCreateSchema, clientUpdateSchema, reorderSchema } from '../validation/schemas.js'

export const clientRoutes = Router()

clientRoutes.get('/', listClients)

/* Both ahead of `/:slug` so neither word is read as one. */
clientRoutes.get('/ledger', clientLedger)
clientRoutes.patch('/reorder', requireAuth, validateBody(reorderSchema), reorderClients)

clientRoutes.get('/:slug', getClient)

clientRoutes.post('/', requireAuth, validateBody(clientCreateSchema), createClient)
clientRoutes.patch('/:slug', requireAuth, validateBody(clientUpdateSchema), updateClient)
clientRoutes.delete('/:slug', requireAuth, deleteClient)

clientRoutes.post('/:slug/logo', requireAuth, receiveImage, setClientLogo)
clientRoutes.delete('/:slug/logo', requireAuth, deleteClientLogo)
