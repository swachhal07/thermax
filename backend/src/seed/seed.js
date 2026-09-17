/* Loads the site's existing static data into the database, so the API starts
   out holding exactly what the pages render today.

   The two source files are imported straight from the frontend — they are plain
   ESM with no asset imports — which means the seed cannot drift from them. Run
   it after editing either one and the database catches up.

   Default run is an upsert keyed on slug: existing rows are updated, new ones
   inserted, and nothing is deleted, so re-running it is safe and never touches
   an uploaded image. `--fresh` empties both collections first.

   It also creates the account named by ADMIN_EMAIL / ADMIN_PASSWORD in .env, so
   one command leaves you with both the data and a login that works. Staff
   accounts are never cleared by `--fresh` — losing everyone's access because
   you wanted to reload the ledger would be a poor trade.

     npm run seed
     npm run seed:fresh
*/


import { connectDb, disconnectDb } from '../config/db.js'
import { env } from '../config/env.js'
import { upsertAdmin } from './upsertAdmin.js'
import { Client } from '../models/Client.js'
import { Application } from '../models/Application.js'
import { categories } from '../../../src/data/categories.js'
import { clients } from '../../../src/data/clients.js'

const fresh = process.argv.includes('--fresh')

const upsert = (Model, rows) =>
  Model.bulkWrite(
    rows.map((row, index) => ({
      updateOne: {
        filter: { slug: row.slug },
        /* `order` is set on insert only: once someone has reordered the list in
           the admin, re-seeding must not undo it. */
        update: { $set: row, $setOnInsert: { order: index } },
        upsert: true,
      },
    })),
    { ordered: false },
  )

const applicationRows = categories.map((category) => ({
  slug: category.slug,
  name: category.name,
  body: category.body,
  imageAlt: category.imageAlt ?? '',
  uses: (category.uses ?? []).map((use) => ({ sector: use.sector, detail: use.detail })),
  published: true,
}))

const clientRows = clients.map((client) => ({
  slug: client.slug,
  name: client.name,
  sector: client.sector,
  project: client.project ?? '',
  year: client.year ?? null,
  capacityMw: client.capacityMw ?? null,
  published: true,
}))

await connectDb()

if (fresh) {
  await Promise.all([Client.deleteMany({}), Application.deleteMany({})])
  console.log('[seed] cleared clients and applications')
}

const [applicationResult, clientResult] = await Promise.all([
  upsert(Application, applicationRows),
  upsert(Client, clientRows),
])

const report = (label, rows, result) =>
  console.log(
    `[seed] ${label}: ${rows.length} in source — ${result.upsertedCount} inserted, ${result.modifiedCount} updated`,
  )

report('applications', applicationRows, applicationResult)
report('clients', clientRows, clientResult)

// Validators do not run on a bulkWrite upsert, so the seeded rows are read back
// and validated here — a sector slug that no longer exists in services.js would
// otherwise sit in the database unnoticed until a page rendered a blank label.
for (const Model of [Application, Client]) {
  for (const doc of await Model.find()) {
    const error = doc.validateSync()
    if (error) console.warn(`[seed] ${Model.modelName} ${doc.slug}: ${error.message}`)
  }
}

/* The login, from .env. Skipped silently when the password is blank — a
   deployed API that has already had its account created should not need to keep
   the password around just to run a seed. */
if (env.admin.configured) {
  const { user, created } = await upsertAdmin(env.admin)
  console.log(`[seed] admin: ${created ? 'created' : 'reset'} ${user.email} (${user.role})`)
} else {
  console.log('[seed] admin: no ADMIN_EMAIL / ADMIN_PASSWORD in .env — no account touched')
}

await Promise.all([Application.syncIndexes(), Client.syncIndexes()])
await disconnectDb()
console.log('[seed] done')
