/* Creates or resets a staff account.

   With no flags it uses ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME / ADMIN_ROLE
   from .env, which is the usual way in — change the login by editing that file
   and running this again:

     npm run admin

   Flags override .env for a one-off account, or for a second member of staff:

     npm run admin -- --email someone@thermax.com.np --password "…" --role editor

   An existing address has its password reset rather than erroring — that is the
   point of running this.
*/

import { connectDb, disconnectDb } from '../config/db.js'
import { env } from '../config/env.js'
import { upsertAdmin } from './upsertAdmin.js'

const arg = (name) => {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
}

const email = arg('email') ?? env.admin.email
const password = arg('password') ?? env.admin.password
const name = arg('name') ?? env.admin.name
const role = arg('role') ?? env.admin.role

if (!email || !password) {
  console.error(
    'No account to create. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env, or pass\n' +
      '  npm run admin -- --email <address> --password <password> [--name <name>] [--role admin|editor]',
  )
  process.exit(1)
}

await connectDb()

try {
  const { user, created } = await upsertAdmin({ email, password, name, role })
  console.log(`[admin] ${created ? 'created' : 'reset'} ${user.email} (${user.role})`)
} catch (error) {
  console.error(`[admin] ${error.message}`)
  await disconnectDb()
  process.exit(1)
}

await disconnectDb()
