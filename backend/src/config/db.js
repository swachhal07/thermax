import mongoose from 'mongoose'
import { env } from './env.js'

/* Mongoose buffers commands while it connects, which turns a bad connection
   string into requests that hang for 30s instead of failing. Ten seconds of
   server selection and no command buffering means a misconfigured deploy tells
   you so immediately. */
mongoose.set('strictQuery', true)
mongoose.set('bufferCommands', false)

export async function connectDb() {
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: !env.isProduction,
  })

  const { host, name } = mongoose.connection
  console.log(`[db] connected to ${host}/${name}`)

  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'))
  mongoose.connection.on('error', (error) => console.error('[db] error', error.message))

  // In production indexes are built deliberately rather than on every model
  // touch, so a cold start does not pay for them.
  if (env.isProduction) {
    await Promise.all(
      Object.values(mongoose.models).map((model) => model.syncIndexes().catch(() => {})),
    )
  }

  return mongoose.connection
}

export async function disconnectDb() {
  await mongoose.connection.close(false)
}
