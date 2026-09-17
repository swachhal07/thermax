/* One envelope for every response so the client never has to guess whether it
   got a bare document, a list, or an error. Lists always carry `meta` with the
   page they came from. */
export const sendItem = (res, data, status = 200) => res.status(status).json({ data })

export const sendList = (res, data, meta) => res.json({ data, meta })

/* A PATCH carries only the fields it changes. Optional fields that were left
   out come through the schemas as `undefined`, and assigning that onto a
   document would blank the stored value, so they are dropped before the
   assignment. Sending `null` explicitly still clears a field — that is the
   difference between "not mentioned" and "cleared". */
export const pruneUndefined = (body) =>
  Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined))

/* `.lean()` and aggregation both skip the schema's toJSON transform, so
   documents that come back that way are given the same `id` the rest of the API
   returns rather than a raw `_id`. */
export const withId = (doc) => {
  const { _id, __v, ...rest } = doc
  return { id: _id, ...rest }
}

export const pageMeta = ({ total, page, limit }) => ({
  total,
  page,
  limit,
  pages: limit > 0 ? Math.ceil(total / limit) : 1,
  hasMore: page * limit < total,
})
