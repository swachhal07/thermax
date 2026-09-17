import { ApiError } from '../utils/ApiError.js'

/* Zod on the way in, so a handler only ever sees a body it can trust and the
   caller gets one 400 listing every field that is wrong rather than discovering
   them one save at a time. The parsed result replaces req.body — unknown keys
   are stripped by the schemas, which is what stops a caller setting `role` or
   `image` through a plain update. */
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {})

  if (!result.success) {
    return next(
      ApiError.badRequest('Some fields need attention.', fieldErrors(result.error)),
    )
  }

  req.body = result.data
  next()
}

function fieldErrors(error) {
  const details = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    if (!details[key]) details[key] = issue.message
  }
  return details
}
