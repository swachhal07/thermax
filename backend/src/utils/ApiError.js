/* A thrown error carrying the status the client should see. Anything else that
   reaches the error handler is treated as a genuine 500 and its message is not
   sent to the client. `details` carries field-level validation output. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    if (details) this.details = details
    Error.captureStackTrace?.(this, ApiError)
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details)
  }

  static unauthorized(message = 'Authentication required.') {
    return new ApiError(401, message)
  }

  static forbidden(message = 'You do not have access to this.') {
    return new ApiError(403, message)
  }

  static notFound(message = 'Not found.') {
    return new ApiError(404, message)
  }

  static conflict(message, details) {
    return new ApiError(409, message, details)
  }
}
