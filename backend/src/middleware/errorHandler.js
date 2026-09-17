import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export const notFound = (req, _res, next) =>
  next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}.`))

/* The single place a failure turns into a response. Anything that is not an
   ApiError or a recognised database error is a bug on our side: it is logged in
   full and the client is told nothing beyond "something broke", so an internal
   message never leaks through a stack trace. */
// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity.
export const errorHandler = (error, req, res, _next) => {
  const mapped = translate(error)

  if (mapped.status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, error)
  }

  res.status(mapped.status).json({
    error: {
      message: mapped.message,
      ...(mapped.details ? { details: mapped.details } : {}),
      ...(env.isProduction || mapped.status < 500 ? {} : { stack: error.stack }),
    },
  })
}

function translate(error) {
  if (error instanceof ApiError) return error

  // Schema validation — report every offending field at once.
  if (error instanceof mongoose.Error.ValidationError) {
    const details = {}
    for (const [path, issue] of Object.entries(error.errors)) details[path] = issue.message
    return { status: 400, message: 'Some fields need attention.', details }
  }

  // A malformed ObjectId in a path parameter is a 404, not a server fault.
  if (error instanceof mongoose.Error.CastError) {
    return { status: 400, message: `\`${error.value}\` is not a valid ${error.path}.` }
  }

  // Duplicate key — almost always a slug or an email that is already taken.
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue ?? {})[0] ?? 'value'
    return {
      status: 409,
      message: `That ${field} is already in use.`,
      details: { [field]: `\`${error.keyValue?.[field]}\` already exists.` },
    }
  }

  if (error.type === 'entity.parse.failed') {
    return { status: 400, message: 'The request body is not valid JSON.' }
  }

  return { status: error.status ?? 500, message: 'Something went wrong on our side.' }
}
