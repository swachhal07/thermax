import { ApiError } from './ApiError.js'

const MAX_LIMIT = 100

/* ?page=2&limit=20. A limit of 0 is read as "no paging" and returns the whole
   collection, which is what the site's own pages want — there are tens of
   records, not thousands, and the ledger has to total all of them. */
export function readPaging(query, { defaultLimit = 0 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1)
  const raw = query.limit === undefined ? defaultLimit : Number.parseInt(query.limit, 10)

  if (Number.isNaN(raw) || raw < 0) throw ApiError.badRequest('`limit` must be 0 or a positive number.')

  const limit = Math.min(raw, MAX_LIMIT)
  return { page, limit, skip: limit > 0 ? (page - 1) * limit : 0 }
}

/* ?sort=-year,name — a leading minus means descending, matching the Mongo
   convention the models already use for their default ordering. Only fields on
   the allowlist are accepted so a caller cannot sort on an unindexed field and
   make the API do a collection scan. */
export function readSort(query, allowed, fallback) {
  if (!query.sort) return fallback

  const sort = {}

  for (const token of String(query.sort).split(',')) {
    const field = token.trim().replace(/^-/, '')
    if (!field) continue
    if (!allowed.includes(field)) {
      throw ApiError.badRequest(
        `Cannot sort on \`${field}\`. Sortable fields: ${allowed.join(', ')}.`,
      )
    }
    sort[field] = token.trim().startsWith('-') ? -1 : 1
  }

  return Object.keys(sort).length ? sort : fallback
}

/* Free-text search is a case-insensitive regex rather than a text index: the
   collections are small, and a regex matches part-words the way a
   type-as-you-filter admin table needs. The input is escaped so a stray `(`
   from the search box cannot throw. */
export function searchFilter(term, fields) {
  const value = String(term ?? '').trim()
  if (!value) return null

  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
  const rx = new RegExp(escaped, 'i')
  return { $or: fields.map((field) => ({ [field]: rx })) }
}

/* Published-only unless asked otherwise: the site is the default caller and a
   draft row must never appear on it by omission. `?published=all` is how the
   admin table asks for everything, `?published=false` for drafts alone. */
export function publishedFilter(value) {
  if (value === 'all') return null
  if (value === undefined) return { published: true }
  return { published: value !== 'false' && value !== '0' }
}
