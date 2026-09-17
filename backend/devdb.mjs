/* A throwaway MongoDB for local work, so the admin can be driven without
   installing one. It listens on 27017 with the database name `thermax`, which
   is what .env.example already points at, and it keeps nothing when it stops.

     npm run dev:db      # leave this running in its own terminal
     npm run seed
     npm run dev

   Never in production: the data lives in a temp directory and goes with the
   process. */
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongo = await MongoMemoryServer.create({ instance: { port: 27017, dbName: 'thermax' } })
console.log(`[devdb] ${mongo.getUri()} — Ctrl-C to stop, nothing is kept`)

const stop = () => mongo.stop().then(() => process.exit(0))
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
