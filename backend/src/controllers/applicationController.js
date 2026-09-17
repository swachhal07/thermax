import { Application } from '../models/Application.js'
import { SECTORS } from '../models/constants.js'
import { uploadBuffer, destroyAsset } from '../config/cloudinary.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assertSlugFree } from '../utils/slug.js'
import { sendItem, sendList, pageMeta, pruneUndefined, withId } from '../utils/respond.js'
import { readPaging, readSort, searchFilter, publishedFilter } from '../utils/query.js'

const SORTABLE = ['order', 'name', 'slug', 'createdAt', 'updatedAt']
const DEFAULT_SORT = { order: 1, name: 1 }

const bySlug = async (slug, { lean = false } = {}) => {
  const query = Application.findOne({ slug: String(slug).toLowerCase() })
  const doc = await (lean ? query.lean() : query)
  if (!doc) throw ApiError.notFound(`No application range with the slug \`${slug}\`.`)
  return doc
}

/* GET /applications
   ?published=false|all  ?sector=tunnels  ?search=grout  ?page= ?limit= ?sort=
   Unpaged by default: there are single figures of ranges and the site's own
   listing numbers them against the total, so it wants all of them. */
export const listApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = readPaging(req.query)
  const sort = readSort(req.query, SORTABLE, DEFAULT_SORT)

  const filter = {}
  Object.assign(filter, publishedFilter(req.query.published))

  /* Filtering by sector means "this range is used on that kind of job" — it
     reaches into the `uses` array rather than a field of its own. */
  if (req.query.sector) {
    if (!SECTORS.includes(req.query.sector)) {
      throw ApiError.badRequest(`\`${req.query.sector}\` is not one of: ${SECTORS.join(', ')}.`)
    }
    filter['uses.sector'] = req.query.sector
  }

  const search = searchFilter(req.query.search, ['name', 'body', 'uses.detail'])
  if (search) Object.assign(filter, search)

  const query = Application.find(filter).sort(sort).lean()
  if (limit > 0) query.skip(skip).limit(limit)

  const [items, total] = await Promise.all([query, Application.countDocuments(filter)])

  sendList(res, items.map(withId), pageMeta({ total, page, limit: limit || total }))
})

export const getApplication = asyncHandler(async (req, res) => {
  sendItem(res, withId(await bySlug(req.params.slug, { lean: true })))
})

export const createApplication = asyncHandler(async (req, res) => {
  await assertSlugFree(Application, req.body.slug ?? req.body.name)

  /* A new range goes to the end of the list unless the caller places it, so an
     admin never has to think about `order` to add one. */
  if (req.body.order === undefined) {
    const last = await Application.findOne().sort({ order: -1 }).select('order').lean()
    req.body.order = (last?.order ?? -1) + 1
  }

  const created = await Application.create(req.body)
  sendItem(res, created.toJSON(), 201)
})

export const updateApplication = asyncHandler(async (req, res) => {
  const application = await bySlug(req.params.slug)

  if (req.body.slug && req.body.slug !== application.slug) {
    await assertSlugFree(Application, req.body.slug, { excludeId: application._id })
  }

  Object.assign(application, pruneUndefined(req.body))
  await application.save()

  sendItem(res, application.toJSON())
})

/* Deleting the record deletes its image too — nothing else references it, and
   leaving the file behind quietly grows the Cloudinary bill. */
export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await bySlug(req.params.slug)

  await destroyAsset(application.image?.publicId)
  await application.deleteOne()

  res.status(204).end()
})

/* POST /applications/:slug/image — multipart, field `image`.
   The Cloudinary public_id is the slug, so re-uploading replaces the file in
   place instead of leaving the old one orphaned. */
export const setApplicationImage = asyncHandler(async (req, res) => {
  const application = await bySlug(req.params.slug)
  const previousId = application.image?.publicId

  application.image = await uploadBuffer(req.file.buffer, {
    folder: 'applications',
    publicId: application.slug,
    tags: ['application', application.slug],
  })

  // An alt line may ride along with the upload, which is the moment someone is
  // most likely to have it to hand.
  if (typeof req.body?.imageAlt === 'string') application.imageAlt = req.body.imageAlt.trim()

  await application.save()

  // Only if the new upload landed under a different id — same id means it was
  // overwritten and deleting it now would remove the image we just stored.
  if (previousId && previousId !== application.image.publicId) await destroyAsset(previousId)

  sendItem(res, application.toJSON())
})

export const deleteApplicationImage = asyncHandler(async (req, res) => {
  const application = await bySlug(req.params.slug)

  if (application.image?.publicId) await destroyAsset(application.image.publicId)
  application.image = null
  await application.save()

  sendItem(res, application.toJSON())
})

/* PATCH /applications/reorder — the whole list in its new order, renumbered in
   one bulk write so the table is never left half-sorted. */
export const reorderApplications = asyncHandler(async (req, res) => {
  const slugs = req.body.slugs

  const known = await Application.find({ slug: { $in: slugs } })
    .select('slug')
    .lean()

  if (known.length !== slugs.length) {
    const found = new Set(known.map((doc) => doc.slug))
    throw ApiError.badRequest('Some of those slugs do not exist.', {
      slugs: slugs.filter((slug) => !found.has(slug)).join(', '),
    })
  }

  await Application.bulkWrite(
    slugs.map((slug, index) => ({
      updateOne: { filter: { slug }, update: { $set: { order: index } } },
    })),
  )

  const items = await Application.find({ slug: { $in: slugs } })
    .sort(DEFAULT_SORT)
    .lean()

  sendList(res, items.map(withId), pageMeta({ total: items.length, page: 1, limit: items.length }))
})
