import { ApiError } from './ApiError.js'
import { slugify } from './slugify.js'

/* The unique index is the guarantee; this is the message. Left to the index
   alone, a clash surfaces as a driver error the handler has to translate, and
   on a cold collection whose index is still building it would not surface at
   all. Checking first means a duplicate always reads as "that slug is taken"
   and names the record holding it. */
export async function assertSlugFree(Model, source, { excludeId } = {}) {
  const slug = slugify(source)
  if (!slug) return

  const filter = { slug }
  if (excludeId) filter._id = { $ne: excludeId }

  const existing = await Model.findOne(filter).select('name slug').lean()
  if (!existing) return

  throw ApiError.conflict(`The slug \`${slug}\` is already in use.`, {
    slug: `Taken by "${existing.name}". Give this one a slug of its own.`,
  })
}
