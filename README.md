# MV Dugar — Thermax Nepal

Marketing site for MV Dugar, the Thermax distributor in Nepal. React 19 + Vite 8
+ Tailwind v4, with GSAP-driven scroll reveals.

## Running it

```bash
npm install
npm run dev
```

`npm run build` compiles to `dist/`. `npm run preview` serves that build.
`npm run lint` runs Oxlint.

## Deploying

Vercel, configured by `vercel.json`. Import the repo and take the defaults —
the config file already sets the framework preset, build command and output
directory, so nothing needs filling in on the dashboard.

Three things in that file are load-bearing:

**The SPA rewrite.** This is a client-side-routed app: React Router owns
`/services`, `/about`, `/blog/:slug` and the rest, and none of those paths
exist as files in `dist/`. Without `rewrites` sending everything to
`/index.html`, a visitor who lands on a deep link — or reloads one — gets a
404 from Vercel before React ever boots. Vercel applies `rewrites` *after* the
filesystem check, which is why the catch-all doesn't swallow `/assets/*` or
the videos.

**Immutable caching on `/assets/*` only.** Vite fingerprints everything it
emits there, so those URLs can never go stale and are safe to cache for a year.
The files in `public/` are copied through with their names intact, so the `.mp4`
rule deliberately gives them a one-day cache with a week of
`stale-while-revalidate` instead — a new hero cut reuses the same filename, and
an immutable header there would pin the old video in caches indefinitely.

**`.vercelignore` excludes `media-src/`.** Those are the video masters the
served files were encoded from; nothing imports them, so shipping them to the
builder is ~9 MB of upload per deploy for no reason. The ffmpeg recipes that
produced `public/hero.mp4` are in `media-src/README.md`.
