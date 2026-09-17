import { createApp } from './app.js'
import { env } from './config/env.js'
import { connectDb, disconnectDb } from './config/db.js'

/* The database is connected before the port is opened, so the process is never
   listening in a state where every request would fail. */
const server = await start()

async function start() {
  await connectDb()

  const app = createApp()

  const listener = app.listen(env.port, () => {
    console.log(`[api] listening on http://localhost:${env.port}/api/v1 (${env.nodeEnv})`)
    if (!env.cloudinary.configured) {
      console.warn('[api] Cloudinary is not configured — image endpoints will refuse with 503.')
    }
  })

  /* Without this a busy port arrives as an unhandled 'error' event and a stack
     trace. The likeliest cause by far is a second copy of this server already
     running, which is worth saying in one line. */
  listener.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `[api] Port ${env.port} is already in use — another copy of the API is probably running. ` +
          'Stop it, or set PORT to something else in .env.',
      )
    } else {
      console.error('[api] could not listen', error)
    }
    process.exit(1)
  })

  return listener
}

/* In-flight requests are allowed to finish, then the database connection is
   closed. Ten seconds, after which the process is killed regardless so a stuck
   request cannot block a deploy. */
const shutdown = async (signal) => {
  console.log(`[api] ${signal} — shutting down`)

  const force = setTimeout(() => {
    console.error('[api] forced exit after 10s')
    process.exit(1)
  }, 10_000).unref()

  try {
    await new Promise((resolve) => server.close(resolve))
    await disconnectDb()
    clearTimeout(force)
    process.exit(0)
  } catch (error) {
    console.error('[api] shutdown failed', error)
    process.exit(1)
  }
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

/* A rejection nothing handled has left the process in an unknown state; log it
   and let the supervisor restart rather than serving from it. */
process.on('unhandledRejection', (reason) => {
  console.error('[api] unhandled rejection', reason)
  shutdown('unhandledRejection')
})
