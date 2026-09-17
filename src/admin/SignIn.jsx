import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, auth } from '@/lib/api'
import { cn } from '@/lib/utils'

/* The sign-in as a specification plate: a red band, a masthead, mono spec rows,
   everything set on a hairline rule, and the form itself lifted off the sheet as
   an inset plate with two registration corners. Same paper as the rest of the
   site, drawn tighter — this is the cover sheet on a drawing set, not another
   page of it.

   The spec rows are read live from the public endpoints before you type, so the
   plate says what is actually in the ledger this morning rather than describing
   it in the abstract. That doubles as the health check the row used to be: if
   the figures do not arrive, the server is down, and it says so in those words
   rather than naming an endpoint nobody signing in here cares about. */

/* Reveal order: band, masthead, spec rows, then the form. Staggered through
   inline delays on the site's existing `note` keyframe rather than a new one. */
const rise = (delay) => ({ animationDelay: `${delay}ms` })
const RISE = 'animate-note motion-reduce:animate-none'

/* What each row says before the figures land, and what it falls back to if they
   never do. */
const SPECS = [
  { key: 'clients', term: 'Clients', value: 'Ledger rows, capacities, sectors, logos' },
  { key: 'applications', term: 'Applications', value: 'Ranges, their uses by sector, images' },
  { key: 'session', term: 'Session', value: 'Seven days, this browser only' },
]

const plural = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`

// 491.69 MW, but 200 MW rather than 200.00 MW.
const mw = (value) => (Number.isInteger(value) ? value : value.toFixed(2))

/* "3 days ago", from the most recently touched record in either collection. The
   browser's own formatter, so it reads correctly in whatever locale is set. */
const RELATIVE = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
const UNITS = [
  ['year', 31_536_000_000],
  ['month', 2_592_000_000],
  ['week', 604_800_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

function since(iso) {
  const elapsed = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(elapsed)) return null

  for (const [unit, ms] of UNITS) {
    if (elapsed >= ms) return RELATIVE.format(-Math.floor(elapsed / ms), unit)
  }
  return 'just now'
}

const FIELD = [
  'plate-field w-full rounded-none border-0 border-b bg-transparent px-0 pb-2.5 pt-1',
  'font-sans text-[1.0625rem] text-ink placeholder:text-ink/25',
  'transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
  'outline-none motion-reduce:transition-none',
].join(' ')

const FIELD_REST =
  'border-ink/20 hover:border-ink/40 focus:border-brand-600 focus:shadow-[0_1px_0_0_var(--color-brand-600)]'
const FIELD_ERROR = 'border-brand-600 shadow-[0_1px_0_0_var(--color-brand-600)]'

export default function SignIn({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [caps, setCaps] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  /* null while in flight, an object once the figures land, false if the server
     never answered. Both reads are of the public routes the site itself calls,
     so they cost no session and expose nothing a visitor cannot already see. */
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      api.clients.ledger(undefined, controller.signal),
      api.applications.list(undefined, controller.signal),
    ])
      .then(([ledger, applications]) => {
        /* The freshest edit across both collections — the ledger response
           carries every client's updatedAt, so this needs no third request. */
        const touched = [
          ...ledger.data.flatMap((group) => group.clients),
          ...applications.data,
        ]
          .map((record) => record.updatedAt)
          .filter(Boolean)
          .sort()
          .at(-1)

        setSummary({
          clients: ledger.meta.clients,
          capacityMw: ledger.meta.capacityMw,
          applications: applications.data.length,
          updatedAt: touched ?? null,
        })
      })
      .catch((failure) => failure.name !== 'AbortError' && setSummary(false))

    return () => controller.abort()
  }, [])

  const live = summary
    ? {
        clients: `${plural(summary.clients, 'row')} · ${mw(summary.capacityMw)} MW listed`,
        applications: plural(summary.applications, 'range'),
      }
    : {}

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    setBusy(true)

    try {
      const { data } = await api.signIn(email.trim(), password)
      auth.set(data.token)
      onSignedIn(data.user)
    } catch (failure) {
      setError(failure.message)
      setBusy(false)
    }
  }

  return (
    <div className="field-grain-on-white relative min-h-dvh overflow-clip bg-white text-ink">
      {/* The site's own surveyor's grid, masked so it falls away from the
          masthead corner and leaves the rest of the sheet clean. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(20,23,28,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.05)_1px,transparent_1px)] [background-size:4.5rem_4.5rem] [mask-image:radial-gradient(120%_90%_at_18%_10%,black,transparent_72%)]"
      />

      {/* On a phone the form comes first — nothing about the plate is worth a
          scroll before you can sign in — so the masthead, the form and the spec
          rows are placed explicitly rather than left in source order. At lg the
          form spans both rows of the right column and the left column reads
          masthead over specs, which is the composition this was drawn as. */}
      <div className="relative mx-auto grid min-h-dvh w-full max-w-[84rem] content-center items-center gap-x-16 gap-y-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[auto_auto] lg:gap-y-14 lg:py-20">
        {/* ─── The plate's face ─── */}
        <div className="order-1 max-w-[38rem] lg:col-start-1 lg:row-start-1 lg:self-end">
          <div className={RISE} style={rise(0)}>
            {/* The way out. Someone who lands here by accident — or who came to
                edit something and changed their mind — should not have to reach
                for the back button. It sits above the masthead because that is
                where a door belongs, and its arrow travels on hover the way the
                site's own back control does. */}
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-muted transition-colors duration-300 hover:text-ink motion-reduce:transition-none"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 14 14"
                className="h-3 w-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-x-1 motion-reduce:transition-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11.5 7h-9M6.5 3l-4 4 4 4" />
              </svg>
              Back to the website
            </Link>

            <div className="mt-7 flex items-center gap-4">
              <span aria-hidden="true" className="h-[3px] w-12 bg-brand-600" />
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-muted">
                Thermax
              </p>
            </div>
          </div>

          <h1
            className={cn(RISE, 'mt-8 font-sans text-[clamp(2.5rem,7vw,5.25rem)] font-extrabold leading-[0.86] tracking-[-0.045em] text-ink')}
            style={rise(90)}
          >
            Back of
            <br />
            {/* The one serif word on the sheet, and the only italic — it is the
                site's display face, used here as a signature rather than as a
                heading style. */}
            <span className="font-display text-[1.08em] font-normal italic tracking-[-0.02em] text-brand-600">
              house
            </span>
            <span className="text-brand-600">.</span>
          </h1>

          {/* Atmosphere the desktop composition has room for; on a phone it
              would push the fields under the fold, and the spec rows under the
              form say the same thing. */}
          <p
            className={cn(RISE, 'mt-8 hidden max-w-[34ch] border-l border-ink/15 pl-6 text-[1.0625rem] leading-relaxed text-ink/60 text-pretty lg:block')}
            style={rise(160)}
          >
            The clients ledger and the application ranges, editable without a deploy.
          </p>
        </div>

        {/* ─── What the plate holds, and whether the API behind it answers ─── */}
        <div className="order-3 lg:col-start-1 lg:row-start-2 lg:max-w-[38rem] lg:self-start">
          <dl className={cn(RISE, 'border-t border-ink/15')} style={rise(230)}>
            {SPECS.map((spec, index) => (
              <div
                key={spec.term}
                className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-ink/10 py-3.5"
              >
                <span className="font-mono text-[0.625rem] tabular-nums text-brand-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <dt className="w-[7.5rem] shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ink">
                  {spec.term}
                </dt>
                <dd
                  className={cn(
                    'min-w-[16ch] flex-1 text-[0.8125rem] leading-snug transition-colors duration-500 motion-reduce:transition-none',
                    live[spec.key] ? 'text-ink' : 'text-ink/50',
                  )}
                >
                  {live[spec.key] ?? spec.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* What the old row was for, said usefully: when the ledger was last
              touched, which is the one thing worth knowing before you open it.
              If the figures never arrived the server is down, and this is where
              that is reported — in those words, not as an endpoint. */}
          <div
            className={cn(RISE, 'mt-8 flex flex-wrap items-center gap-x-4 gap-y-2')}
            style={rise(300)}
          >
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              {summary && (
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50 motion-reduce:animate-none" />
              )}
              <span
                className={cn(
                  'relative h-2 w-2 rounded-full transition-colors duration-700 motion-reduce:transition-none',
                  summary === null ? 'bg-ink/20' : summary ? 'bg-emerald-500' : 'bg-brand-600',
                )}
              />
            </span>

            <p
              role="status"
              className={cn(
                'font-mono text-[0.625rem] uppercase tracking-[0.2em]',
                summary === false ? 'text-brand-700' : 'text-muted',
              )}
            >
              {summary === null
                ? 'Reading the ledger…'
                : summary === false
                  ? "Can't reach the server — it may not be running"
                  : summary.updatedAt
                    ? `Last edited ${since(summary.updatedAt)}`
                    : 'Nothing edited yet'}
            </p>
          </div>
        </div>

        {/* ─── The form, on its own plate with cut corners ─── */}
        <form
          onSubmit={submit}
          className={cn(RISE, 'relative order-2 w-full max-w-md bg-white px-7 py-9 shadow-[0_40px_90px_-60px_rgba(20,23,28,0.55)] ring-1 ring-ink/10 sm:px-10 sm:py-11 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center lg:justify-self-end')}
          style={rise(380)}
        >
          {/* Registration marks, two corners only — the asymmetry is the point.
              A full frame would read as a card; two brackets read as a plate
              set down on the grid. */}
          <span
            aria-hidden="true"
            className="absolute -left-px -top-px h-6 w-6 border-l-2 border-t-2 border-brand-600"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -right-px h-6 w-6 border-b-2 border-r-2 border-brand-600"
          />

          <p className="font-mono text-[0.625rem] uppercase tracking-[0.28em] text-muted">Sign in</p>

          <div className="mt-9 flex flex-col gap-8">
            <label className="block">
              <span className="flex items-baseline justify-between font-mono text-[0.5625rem] uppercase tracking-[0.24em] text-muted">
                Email
              </span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={cn(FIELD, 'mt-2', error ? FIELD_ERROR : FIELD_REST)}
              />
            </label>

            <label className="block">
              <span className="flex items-baseline justify-between gap-3 font-mono text-[0.5625rem] uppercase tracking-[0.24em] text-muted">
                Password
                <span className="flex items-center gap-3">
                  {/* Worth saying out loud: a wrong password because the caps
                      lock is on is the single most common way this screen
                      wastes someone's time. */}
                  {caps && (
                    <span className="animate-note text-brand-700 motion-reduce:animate-none">
                      Caps lock
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setReveal((current) => !current)}
                    className="uppercase tracking-[0.24em] text-ink/40 transition-colors duration-300 hover:text-ink motion-reduce:transition-none"
                  >
                    {reveal ? 'Hide' : 'Show'}
                  </button>
                </span>
              </span>
              <input
                type={reveal ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyUp={(event) => setCaps(event.getModifierState?.('CapsLock') ?? false)}
                className={cn(FIELD, 'mt-2', error ? FIELD_ERROR : FIELD_REST)}
              />
            </label>
          </div>

          {/* Reserved height, so an error appearing does not shift the button
              out from under the cursor that is about to press it again. */}
          <div className="mt-5 min-h-[2.5rem]">
            {error && (
              <p
                role="alert"
                className="animate-note border-l-2 border-brand-600 pl-4 text-[0.8125rem] leading-snug text-brand-700 motion-reduce:animate-none"
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy || !email || !password}
            className={cn(
              'group mt-2 flex w-full items-center justify-between gap-4 bg-brand-600 px-6 py-4',
              'font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-white',
              'transition-[background-color,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
              'hover:bg-ink',
              'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600',
              'disabled:pointer-events-none disabled:bg-ink/[0.07] disabled:text-ink/30',
              'motion-reduce:transition-none',
            )}
          >
            {busy ? 'Checking…' : 'Sign in'}
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 motion-reduce:transition-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 8h11M9.5 4l4 4-4 4" />
            </svg>
          </button>

          <p className="mt-7 border-t border-ink/10 pt-5 text-[0.75rem] leading-relaxed text-ink/40">
            Accounts are issued from the server, not requested here. Ask whoever holds the setup
            key.
          </p>
        </form>
      </div>
    </div>
  )
}
