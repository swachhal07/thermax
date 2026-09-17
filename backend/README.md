# Thermax API

The backend behind two parts of the site: the **client ledger** (`/clients`) and the
**product application ranges** (`/applications`) — the same records that live in
`src/data/clients.js` and `src/data/categories.js` today, so the frontend can read them
from an API and staff can edit them without a deploy.

Node + Express + MongoDB (Mongoose), with images on Cloudinary.

---

## Running it

```bash
cd backend
npm install
cp .env.example .env      # then fill it in — see below
npm run dev:db            # optional: a throwaway MongoDB, if you have none locally
npm run seed              # loads the site's existing data into the database
npm run dev               # http://localhost:4000/api/v1
```

`npm run dev:db` runs an in-memory MongoDB on 27017 under the name `thermax` — the
address `.env.example` already points at. It keeps nothing when it stops, so it is for
local work only.

`npm run dev` uses Node's own watcher and `--env-file`; there is no nodemon and no
dotenv import. `npm start` is the production entry.

### Environment

| Variable | Required | What it is |
| --- | --- | --- |
| `MONGODB_URI` | yes | `mongodb://127.0.0.1:27017/thermax`, or an Atlas SRV string |
| `JWT_SECRET` | yes | Signs admin tokens. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CORS_ORIGINS` | yes in prod | Comma-separated origins allowed to call the API from a browser |
| `PORT` | no | Defaults to 4000 |
| `JWT_EXPIRES_IN` | no | Defaults to `7d` |
| `ADMIN_SETUP_KEY` | no | Needed to create staff accounts after the first one. Blank closes registration |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | no | The `/admin` login. `npm run seed` and `npm run admin` create or reset it |
| `ADMIN_NAME` / `ADMIN_ROLE` | no | Display name, and `admin` or `editor` |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | no | Without them everything works except image upload, which returns a clear 503 |
| `CLOUDINARY_FOLDER` | no | Namespaces uploads. Defaults to `thermax` |

A missing required variable stops the boot with a message naming it, rather than
surfacing later as a confused 500.

### The login

The `/admin` account lives in `.env`:

```ini
ADMIN_EMAIL=desk@thermax.com.np
ADMIN_PASSWORD=a long password
ADMIN_NAME=Front desk
ADMIN_ROLE=admin
```

`npm run seed` creates it, so one command leaves you with both the data and a login that
works. **To change the email or password, edit those lines and run:**

```bash
npm run admin
```

An address that already exists has its password reset rather than erroring — that is the
point of running it. Passwords need at least 10 characters. Flags override `.env` for a
one-off or a second member of staff:

```bash
npm run admin -- --email someone@thermax.com.np --password "…" --role editor
```

That is a real credential sitting in a file, so `.env` is gitignored and belongs only on
your machine. On a deployed API, set `ADMIN_PASSWORD` once, run the seed, then clear it —
the account outlives the variable. `POST /auth/register` is the other route in: open on
an empty database, guarded by `ADMIN_SETUP_KEY` after that.

### Tests

```bash
npm test
```

26 checks over a real MongoDB started in memory — no database of your own, no `.env`.
They cover the public reads, the ledger arithmetic, the auth wall on every write, slug
and sector validation, and the reorder bulk write.

---

## Shape of a response

Everything comes back in one envelope, so a client never has to guess what it got.

```jsonc
{ "data": { … } }                              // one record
{ "data": [ … ], "meta": { "total": 10, … } }  // a list
{ "error": { "message": "…", "details": { "year": "That year is in the future." } } }
```

`details` is present on validation failures and names each offending field.

---

## Endpoints

Base URL `"/api/v1"`. **Reads are public** — the site calls them directly. **Every write
needs `Authorization: Bearer <token>`.**

### Applications — the product ranges

| Method | Path | |
| --- | --- | --- |
| `GET` | `/applications` | The ordered list |
| `GET` | `/applications/:slug` | One range |
| `POST` | `/applications` | Create. Slug derives from the name unless given |
| `PATCH` | `/applications/:slug` | Update any subset of fields |
| `DELETE` | `/applications/:slug` | Removes the record and its image |
| `PATCH` | `/applications/reorder` | `{ "slugs": [...] }` — renumbers the whole list in one write |
| `POST` | `/applications/:slug/image` | multipart, field `image` (≤8MB, JPEG/PNG/WebP/AVIF/SVG) |
| `DELETE` | `/applications/:slug/image` | |

Query parameters on the list: `?sector=tunnels` (ranges *used on* that kind of job),
`?search=grout`, `?published=all|false`, `?page=` `?limit=` `?sort=-updatedAt`.

A range:

```jsonc
{
  "id": "…",
  "slug": "waterproofing",
  "name": "Waterproofing",
  "body": "PVC sheet and spray-applied MMA membranes …",
  "imageAlt": "Foundation walls coated in black waterproofing membrane",
  "image": { "url": "https://res.cloudinary.com/…", "publicId": "thermax/applications/waterproofing", "width": 1600, "height": 1067, "format": "webp", "bytes": 184203 },
  "uses": [{ "sector": "tunnels", "detail": "Sheet membrane laid behind the final lining …" }],
  "order": 0,
  "published": true
}
```

### Clients — the ledger

| Method | Path | |
| --- | --- | --- |
| `GET` | `/clients` | Flat list, in ledger order |
| `GET` | `/clients/ledger` | **Grouped by sector, with the arithmetic done** |
| `GET` | `/clients/:slug` | |
| `POST` | `/clients` | |
| `PATCH` | `/clients/:slug` | |
| `DELETE` | `/clients/:slug` | Removes the record and its logo |
| `PATCH` | `/clients/reorder` | `{ "slugs": [...] }` |
| `POST` | `/clients/:slug/logo` | multipart, field `image` |
| `DELETE` | `/clients/:slug/logo` | |

Query parameters: `?sector=dams`, `?featured=true`, `?search=`, `?published=all|false`,
plus paging and `?sort=`.

`/clients/ledger` is what the Clients page actually draws — every sector (including the
empty ones, which are a fact worth showing), its rows in order, its installed-capacity
total, and the biggest single job in it, which is the figure each bar is scaled against:

```jsonc
{
  "data": [
    {
      "sector": "dams",
      "count": 9,
      "totalCapacityMw": 491.69,
      "maxCapacityMw": 200,
      "clients": [ { "slug": "nasa-hydropower", "name": "Nasa Hydropower Pvt. Ltd.", "capacityMw": 200, … } ]
    }
  ],
  "meta": { "clients": 10, "capacityMw": 491.69 }
}
```

Rows with no capacity figure sort to the foot of their sector and carry `capacityMw: null`
rather than `0`, so the page can leave the bar off entirely.

### Auth and utility

| Method | Path | |
| --- | --- | --- |
| `POST` | `/auth/register` | Open only on an empty database; `setupKey` after that |
| `POST` | `/auth/login` | `{ user, token }` |
| `GET` | `/auth/me` | |
| `POST` | `/auth/password` | `{ currentPassword, newPassword }`, returns a fresh token |
| `GET` | `/health` | 200 with a live database, 503 without |
| `GET` | `/sectors` | The sector vocabulary both collections validate against |

---

## Decisions worth knowing

**Slugs are the public identifier.** The site already routes on them
(`/services/waterproofing`), so records are addressed by slug rather than by id, and
the seed preserves the ones the static files use. A clash is a 409 naming the record
that holds it.

**Sectors are a closed set** — `dams, bridges, roads, tunnels, restoration` — matching
`src/data/services.js`, which supplies each one's title, code and photograph. A record
referencing anything else would render as a blank label, so both models reject it.

**Unpublished is invisible by default.** A list with no `?published=` returns published
rows only; the admin table asks for `?published=all`.

**Images only move through the image endpoints.** The Zod schemas strip `image` and
`logo` from ordinary bodies, so a URL cannot be forged into a record. The Cloudinary
`public_id` is the record's slug, so re-uploading replaces the file rather than
accumulating orphans, and deleting a record deletes its file.

**Reordering is one endpoint, not a field.** Dragging a row renumbers several records;
doing that as N separate PATCHes leaves the list half-sorted when one fails. Re-seeding
sets `order` on insert only, so it never undoes a reorder.

**Nothing touches disk.** Uploads are held in memory and streamed to Cloudinary, so this
runs unchanged on a read-only or ephemeral filesystem.

---

## The admin — `/admin`

The site serves its own back of house at **`/admin`**, outside the marketing layout and
marked `noindex`. Sign in with the account above and you get the two collections this API
owns: the clients ledger and the application ranges, each with create, edit, publish,
reorder, delete and image upload.

It reads `VITE_API_URL` from the frontend's `.env` (see `.env.example` in the repo root),
defaulting to `http://localhost:4000/api/v1`. `CORS_ORIGINS` here has to include wherever
the site is served from, or the browser will refuse the calls.

Frontend files: `src/pages/Admin.jsx` (the route and the session gate), `src/admin/*`
(shell, panels, fields), `src/lib/api.js` (the one place the site talks to this API).

## Pointing the public pages at it

Set `VITE_API_URL=http://localhost:4000/api/v1` in the frontend's `.env`, then read the
two collections from `/applications` and `/clients/ledger` in place of the imports from
`src/data/`. The response fields are named exactly as the static files name them, so the
components need no reshaping — `capacityMw` is still a number or absent, `uses` is still
`{ sector, detail }`, and `slug` still resolves the photograph.

The static files remain the source of truth until that switch is made; `npm run seed`
keeps the database matching them in the meantime.
