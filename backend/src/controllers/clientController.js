import { Client } from '../models/Client.js'
import { SECTORS } from '../models/constants.js'
import { uploadBuffer, destroyAsset } from '../config/cloudinary.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assertSlugFree } from '../utils/slug.js'
import { sendItem, sendList, pageMeta, pruneUndefined, withId } from '../utils/respond.js'
import { readPaging, readSort, searchFilter, publishedFilter } from '../utils/query.js'

const SORTABLE = ['order', 'name', 'year', 'capacityMw', 'sector', 'createdAt', 'updatedAt']

/* The ledger's own order: biggest capacity first within a sector, and rows with
   no capacity figure at the foot rather than at the head. Mongo sorts null
   ahead of every number, so `hasCapacity` is computed first and sorted on
   before the capacity itself. */
const LEDGER_SORT = { hasCapacity: -1, capacityMw: -1, order: 1, name: 1 }

const bySlug = async (slug, { lean = false } = {}) => {
  const query = Client.findOne({ slug: String(slug).toLowerCase() })
  const doc = await (lean ? query.lean() : query)
  if (!doc) throw ApiError.notFound(`No client with the slug \`${slug}\`.`)
  return doc
}

const readSector = (value) => {
  if (!value) return null
  if (!SECTORS.includes(value)) {
    throw ApiError.badRequest(`\`${value}\` is not one of: ${SECTORS.join(', ')}.`)
  }
  return { sector: value }
}

const buildFilter = (query) => {
  const filter = {}
  Object.assign(filter, publishedFilter(query.published))
  Object.assign(filter, readSector(query.sector))
  if (query.featured !== undefined) filter.featured = query.featured !== 'false'

  const search = searchFilter(query.search, ['name', 'project'])
  if (search) Object.assign(filter, search)

  return filter
}

/* GET /clients
   ?sector=dams ?featured=true ?search= ?published=all ?page= ?limit= ?sort=
   Default order is the ledger's, so the flat list and the grouped ledger agree
   about which row comes first. */
export const listClients = asyncHandler(async (req, res) => {
  const { page, limit, skip } = readPaging(req.query)
  const filter = buildFilter(req.query)
  const sort = readSort(req.query, SORTABLE, null)

  const pipeline = [
    { $match: filter },
    { $addFields: { hasCapacity: { $cond: [{ $gt: ['$capacityMw', null] }, 1, 0] } } },
    { $sort: sort ?? LEDGER_SORT },
    { $project: { hasCapacity: 0, __v: 0 } },
  ]

  if (limit > 0) pipeline.push({ $skip: skip }, { $limit: limit })

  const [items, total] = await Promise.all([
    Client.aggregate(pipeline),
    Client.countDocuments(filter),
  ])

  sendList(res, items.map(withId), pageMeta({ total, page, limit: limit || total }))
})

/* GET /clients/ledger — what the Clients page actually renders: rows grouped by
   sector, each sector carrying its count, its installed-capacity total and the
   biggest single job in it, which is the figure every bar in that group is
   scaled against. Doing it here rather than in the browser means the page can
   render the ledger from one response without holding the arithmetic itself. */
export const clientLedger = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query)

  const groups = await Client.aggregate([
    { $match: filter },
    { $addFields: { hasCapacity: { $cond: [{ $gt: ['$capacityMw', null] }, 1, 0] } } },
    { $sort: LEDGER_SORT },
    {
      $group: {
        _id: '$sector',
        clients: { $push: '$$ROOT' },
        count: { $sum: 1 },
        // $sum ignores nulls, so sectors of uncounted repair work total 0.
        totalCapacityMw: { $sum: '$capacityMw' },
        maxCapacityMw: { $max: '$capacityMw' },
      },
    },
  ])

  const bySector = new Map(groups.map((group) => [group._id, group]))

  /* Sectors are emitted in the order services.js declares them, including the
     empty ones — the page draws a heading per sector and a gap is a fact worth
     showing, not a row to hide. */
  const sectors = SECTORS.map((slug) => {
    const group = bySector.get(slug)
    return {
      sector: slug,
      count: group?.count ?? 0,
      totalCapacityMw: round(group?.totalCapacityMw ?? 0),
      maxCapacityMw: group?.maxCapacityMw ?? null,
      clients: (group?.clients ?? []).map(({ hasCapacity: _hasCapacity, ...client }) => withId(client)),
    }
  })

  const totals = sectors.reduce(
    (acc, group) => ({
      clients: acc.clients + group.count,
      capacityMw: acc.capacityMw + group.totalCapacityMw,
    }),
    { clients: 0, capacityMw: 0 },
  )

  sendList(res, sectors, { ...totals, capacityMw: round(totals.capacityMw) })
})

export const getClient = asyncHandler(async (req, res) => {
  sendItem(res, await bySlug(req.params.slug, { lean: true }))
})

export const createClient = asyncHandler(async (req, res) => {
  await assertSlugFree(Client, req.body.slug ?? req.body.name)

  if (req.body.order === undefined) {
    const last = await Client.findOne({ sector: req.body.sector })
      .sort({ order: -1 })
      .select('order')
      .lean()
    req.body.order = (last?.order ?? -1) + 1
  }

  const created = await Client.create(req.body)
  sendItem(res, created.toJSON(), 201)
})

export const updateClient = asyncHandler(async (req, res) => {
  const client = await bySlug(req.params.slug)

  if (req.body.slug && req.body.slug !== client.slug) {
    await assertSlugFree(Client, req.body.slug, { excludeId: client._id })
  }

  Object.assign(client, pruneUndefined(req.body))
  await client.save()

  sendItem(res, client.toJSON())
})

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await bySlug(req.params.slug)

  await destroyAsset(client.logo?.publicId)
  await client.deleteOne()

  res.status(204).end()
})

/* POST /clients/:slug/logo — multipart, field `image`. */
export const setClientLogo = asyncHandler(async (req, res) => {
  const client = await bySlug(req.params.slug)
  const previousId = client.logo?.publicId

  client.logo = await uploadBuffer(req.file.buffer, {
    folder: 'clients',
    publicId: client.slug,
    tags: ['client', client.sector],
  })

  await client.save()

  if (previousId && previousId !== client.logo.publicId) await destroyAsset(previousId)

  sendItem(res, client.toJSON())
})

export const deleteClientLogo = asyncHandler(async (req, res) => {
  const client = await bySlug(req.params.slug)

  if (client.logo?.publicId) await destroyAsset(client.logo.publicId)
  client.logo = null
  await client.save()

  sendItem(res, client.toJSON())
})

export const reorderClients = asyncHandler(async (req, res) => {
  const slugs = req.body.slugs

  const known = await Client.find({ slug: { $in: slugs } })
    .select('slug')
    .lean()

  if (known.length !== slugs.length) {
    const found = new Set(known.map((doc) => doc.slug))
    throw ApiError.badRequest('Some of those slugs do not exist.', {
      slugs: slugs.filter((slug) => !found.has(slug)).join(', '),
    })
  }

  await Client.bulkWrite(
    slugs.map((slug, index) => ({
      updateOne: { filter: { slug }, update: { $set: { order: index } } },
    })),
  )

  const items = await Client.find({ slug: { $in: slugs } })
    .sort({ order: 1 })
    .lean()

  sendList(res, items.map(withId), pageMeta({ total: items.length, page: 1, limit: items.length }))
})

// Capacities carry two decimals (7.29 MW); float addition does not.
const round = (value) => Math.round(value * 100) / 100
