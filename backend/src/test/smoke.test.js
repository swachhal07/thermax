/* An end-to-end pass over both collections against a real MongoDB — an
   in-memory one, downloaded and started by mongodb-memory-server, so this needs
   no database of your own and no .env.

     npm test

   It covers what a wrong change here would actually break: the public reads the
   site depends on, the ledger arithmetic, the auth wall on every write, slug
   and sector validation, and the reorder bulk write. Image endpoints are
   exercised only as far as the 503 they return without Cloudinary keys —
   uploading for real would mean hitting Cloudinary from a test run.
*/

import test from 'node:test'
import assert from 'node:assert/strict'
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongo = await MongoMemoryServer.create()

process.env.MONGODB_URI = mongo.getUri('thermax_test')
process.env.JWT_SECRET = 'test-secret-not-used-anywhere-real'
process.env.NODE_ENV = 'test'
process.env.CORS_ORIGINS = 'http://localhost:5173'
process.env.ADMIN_SETUP_KEY = ''
delete process.env.CLOUDINARY_CLOUD_NAME

// Imported after the environment is set, since config/env.js reads it on load.
const { connectDb, disconnectDb } = await import('../config/db.js')
const { createApp } = await import('../app.js')
const { Client } = await import('../models/Client.js')
const { Application } = await import('../models/Application.js')
const { User } = await import('../models/User.js')

await connectDb()
const server = createApp().listen(0)
const base = `http://127.0.0.1:${server.address().port}/api/v1`

let token = ''

const call = async (method, path, { body, auth = false, headers = {} } = {}) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : null }
}

test.after(async () => {
  await new Promise((resolve) => server.close(resolve))
  await disconnectDb()
  await mongo.stop()
})

test('health reports a connected database', async () => {
  const { status, body } = await call('GET', '/health')
  assert.equal(status, 200)
  assert.equal(body.data.db, 'connected')
  assert.equal(body.data.images, 'not configured')
})

test('the first account bootstraps as admin without a setup key', async () => {
  const { status, body } = await call('POST', '/auth/register', {
    body: { email: 'Desk@Thermax.test', name: 'Desk', password: 'a-long-enough-password' },
  })

  assert.equal(status, 201)
  assert.equal(body.data.user.role, 'admin')
  assert.equal(body.data.user.email, 'desk@thermax.test')
  assert.equal(body.data.user.passwordHash, undefined, 'the hash must never be returned')
  assert.ok(body.data.token)

  token = body.data.token
})

test('a second account is refused while ADMIN_SETUP_KEY is unset', async () => {
  const { status } = await call('POST', '/auth/register', {
    body: { email: 'second@thermax.test', password: 'a-long-enough-password' },
  })
  assert.equal(status, 403)
})

test('login is rejected on a wrong password and says nothing about why', async () => {
  const bad = await call('POST', '/auth/login', {
    body: { email: 'desk@thermax.test', password: 'not-the-password' },
  })
  const missing = await call('POST', '/auth/login', {
    body: { email: 'nobody@thermax.test', password: 'not-the-password' },
  })

  assert.equal(bad.status, 401)
  assert.equal(missing.status, 401)
  assert.equal(bad.body.error.message, missing.body.error.message)
})

test('login returns a working token', async () => {
  const { status, body } = await call('POST', '/auth/login', {
    body: { email: 'desk@thermax.test', password: 'a-long-enough-password' },
  })

  assert.equal(status, 200)
  const me = await call('GET', '/auth/me', { auth: true, headers: { Authorization: `Bearer ${body.data.token}` } })
  assert.equal(me.status, 200)
  assert.equal(me.body.data.user.email, 'desk@thermax.test')
})

test('writes are refused without a token', async () => {
  for (const [method, path] of [
    ['POST', '/clients'],
    ['PATCH', '/clients/anything'],
    ['DELETE', '/clients/anything'],
    ['POST', '/applications'],
    ['PATCH', '/applications/reorder'],
  ]) {
    const { status } = await call(method, path, { body: { name: 'x' } })
    assert.equal(status, 401, `${method} ${path} should need a token`)
  }
})

test('a range is created with a derived slug and lands at the end of the list', async () => {
  const first = await call('POST', '/applications', {
    auth: true,
    body: {
      name: 'Waterproofing',
      body: 'PVC sheet and spray-applied MMA membranes for structures under permanent water load.',
      imageAlt: 'Foundation walls coated in black membrane',
      uses: [{ sector: 'tunnels', detail: 'Sheet membrane behind the final lining.' }],
    },
  })

  assert.equal(first.status, 201)
  assert.equal(first.body.data.slug, 'waterproofing')
  assert.equal(first.body.data.order, 0)
  assert.equal(first.body.data.image, null)

  const second = await call('POST', '/applications', {
    auth: true,
    body: {
      name: 'Repair & Rehabilitation',
      body: 'Cementitious and epoxy repair mortars that restore cover and long-term performance.',
    },
  })

  assert.equal(second.body.data.slug, 'repair-and-rehabilitation')
  assert.equal(second.body.data.order, 1, 'a new range goes to the foot of the list')
})

test('a duplicate slug is a 409, not a 500', async () => {
  const { status, body } = await call('POST', '/applications', {
    auth: true,
    body: { name: 'Waterproofing', body: 'A second range claiming the same slug as the first.' },
  })

  assert.equal(status, 409)
  assert.match(body.error.message, /already in use/)
})

test('an unknown sector inside `uses` is a 400 listing the ones that exist', async () => {
  const { status, body } = await call('POST', '/applications', {
    auth: true,
    body: {
      name: 'Flooring',
      body: 'Epoxy and PU floor systems for plant rooms and workshop bays.',
      uses: [{ sector: 'airports', detail: 'Not a sector this site covers.' }],
    },
  })

  assert.equal(status, 400)
  assert.ok(body.error.details, 'the offending field should be named')
})

test('fields the API does not own are rejected rather than silently stored', async () => {
  const { status, body } = await call('PATCH', '/applications/waterproofing', {
    auth: true,
    body: { image: { url: 'https://example.test/forged.png' } },
  })

  assert.equal(status, 400)
  assert.ok(body.error.details)
})

test('ranges can be filtered by the sector they are used on', async () => {
  const { body } = await call('GET', '/applications?sector=tunnels')
  assert.equal(body.data.length, 1)
  assert.equal(body.data[0].slug, 'waterproofing')
})

test('an unpublished range disappears from the public list but not from the admin one', async () => {
  await call('PATCH', '/applications/repair-and-rehabilitation', {
    auth: true,
    body: { published: false },
  })

  const publicList = await call('GET', '/applications')
  const adminList = await call('GET', '/applications?published=all')

  assert.deepEqual(
    publicList.body.data.map((row) => row.slug),
    ['waterproofing'],
  )
  assert.equal(adminList.body.data.length, 2)
  assert.equal(adminList.body.meta.total, 2)
})

test('reordering renumbers the whole list in one write', async () => {
  const { status, body } = await call('PATCH', '/applications/reorder', {
    auth: true,
    body: { slugs: ['repair-and-rehabilitation', 'waterproofing'] },
  })

  assert.equal(status, 200)
  assert.deepEqual(
    body.data.map((row) => [row.slug, row.order]),
    [
      ['repair-and-rehabilitation', 0],
      ['waterproofing', 1],
    ],
  )
})

test('reordering with an unknown slug changes nothing', async () => {
  const before = await Application.find().sort({ order: 1 }).lean()

  const { status } = await call('PATCH', '/applications/reorder', {
    auth: true,
    body: { slugs: ['waterproofing', 'no-such-range'] },
  })

  assert.equal(status, 400)

  const after = await Application.find().sort({ order: 1 }).lean()
  assert.deepEqual(
    after.map((row) => row.slug),
    before.map((row) => row.slug),
  )
})

test('image endpoints refuse clearly while Cloudinary is unconfigured', async () => {
  const form = new FormData()
  form.append('image', new Blob([Buffer.from('not-really-a-png')], { type: 'image/png' }), 'a.png')

  const response = await fetch(`${base}/applications/waterproofing/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  assert.equal(response.status, 503)
  const body = await response.json()
  assert.match(body.error.message, /not configured/)
})

test('a non-image upload is refused before it reaches storage', async () => {
  const form = new FormData()
  form.append('image', new Blob([Buffer.from('#!/bin/sh')], { type: 'text/x-sh' }), 'a.sh')

  const response = await fetch(`${base}/applications/waterproofing/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  assert.equal(response.status, 400)
})

test('clients are created, including rows with no capacity figure', async () => {
  const rows = [
    { name: 'Nasa Hydropower Pvt. Ltd.', sector: 'dams', capacityMw: 200 },
    { name: 'PAN Himalaya Energy Pvt. Ltd', sector: 'dams', capacityMw: 77 },
    { name: 'Phalakhu Khola Hydropower Project', sector: 'dams', capacityMw: 7.29 },
    { name: 'R.J. Construction Company Pvt. Ltd.', sector: 'dams' },
    {
      name: 'Milan Multi Construction Pvt. Ltd.',
      sector: 'restoration',
      project: 'Government repair work, Kathmandu',
      year: 2024,
    },
  ]

  for (const row of rows) {
    const { status, body } = await call('POST', '/clients', { auth: true, body: row })
    assert.equal(status, 201, `${row.name} should have been accepted`)
    assert.ok(body.data.slug)
  }

  const uncounted = await Client.findOne({ slug: 'r-j-construction-company-pvt-ltd' }).lean()
  assert.equal(uncounted.capacityMw, null)
})

test('the flat list puts rows without a capacity figure at the foot of the sector', async () => {
  const { body } = await call('GET', '/clients?sector=dams')

  assert.deepEqual(
    body.data.map((row) => row.capacityMw),
    [200, 77, 7.29, null],
  )
})

test('the ledger groups by sector and does the arithmetic', async () => {
  const { status, body } = await call('GET', '/clients/ledger')

  assert.equal(status, 200)
  assert.deepEqual(
    body.data.map((group) => group.sector),
    ['dams', 'bridges', 'roads', 'tunnels', 'restoration'],
    'every sector is emitted, including the empty ones',
  )

  const dams = body.data.find((group) => group.sector === 'dams')
  assert.equal(dams.count, 4)
  assert.equal(dams.totalCapacityMw, 284.29, 'nulls contribute nothing and the sum keeps 2dp')
  assert.equal(dams.maxCapacityMw, 200, 'the figure every bar in this group scales against')
  assert.equal(dams.clients.at(-1).capacityMw, null)

  const roads = body.data.find((group) => group.sector === 'roads')
  assert.equal(roads.count, 0)
  assert.equal(roads.maxCapacityMw, null)
  assert.deepEqual(roads.clients, [])

  assert.equal(body.meta.clients, 5)
  assert.equal(body.meta.capacityMw, 284.29)
})

test('a client is fetched, updated and deleted by slug', async () => {
  const slug = 'milan-multi-construction-pvt-ltd'

  const read = await call('GET', `/clients/${slug}`)
  assert.equal(read.status, 200)
  assert.equal(read.body.data.year, 2024)

  const patched = await call('PATCH', `/clients/${slug}`, {
    auth: true,
    body: { project: '', featured: true },
  })
  assert.equal(patched.body.data.project, '', 'an empty string clears an optional line')
  assert.equal(patched.body.data.featured, true)

  const removed = await call('DELETE', `/clients/${slug}`, { auth: true })
  assert.equal(removed.status, 204)

  const gone = await call('GET', `/clients/${slug}`)
  assert.equal(gone.status, 404)
})

test('a year in the future is refused', async () => {
  const { status } = await call('POST', '/clients', {
    auth: true,
    body: { name: 'Someone Later', sector: 'bridges', year: new Date().getFullYear() + 5 },
  })
  assert.equal(status, 400)
})

test('an empty PATCH is reported rather than accepted as a no-op', async () => {
  const { status } = await call('PATCH', '/clients/nasa-hydropower-pvt-ltd', {
    auth: true,
    body: {},
  })
  assert.equal(status, 400)
})

test('an unknown route is a 404 in the same envelope as every other error', async () => {
  const { status, body } = await call('GET', '/nope')
  assert.equal(status, 404)
  assert.ok(body.error.message)
})

test('the sector vocabulary is published for admin forms to read', async () => {
  const { body } = await call('GET', '/sectors')
  assert.deepEqual(body.data, ['dams', 'bridges', 'roads', 'tunnels', 'restoration'])
})

test('a disallowed origin is refused', async () => {
  const response = await fetch(`${base}/clients`, { headers: { Origin: 'https://evil.test' } })
  assert.equal(response.status, 403)
})

test('the password change hands back a fresh token', async () => {
  const { status, body } = await call('POST', '/auth/password', {
    auth: true,
    body: { currentPassword: 'a-long-enough-password', newPassword: 'another-long-password' },
  })

  assert.equal(status, 200)
  assert.ok(body.data.token)

  const relogin = await call('POST', '/auth/login', {
    body: { email: 'desk@thermax.test', password: 'another-long-password' },
  })
  assert.equal(relogin.status, 200)

  const users = await User.countDocuments()
  assert.equal(users, 1)
})
