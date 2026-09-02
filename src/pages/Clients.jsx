import { useCallback, useMemo, useState } from 'react'
import Rise from '@/components/ui/Rise'
import { CoverflowCarousel } from '@/components/ui/CoverflowCarousel'
import { clients } from '@/data/clients'
import { services } from '@/data/services'

const PHOTOS = import.meta.glob('../assets/images/service-*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const bySlug = Object.fromEntries(
  Object.entries(PHOTOS).map(([path, src]) => [
    path.replace(/^.*\/service-/, '').replace(/\.\w+$/, ''),
    src,
  ]),
)

// Every sector gets a slide. Ones with no client on the books yet fall back to a
// placeholder row rather than an empty column — drop the fallback once the real
// names land in data/clients.js.
//
// Each block is measured once at module scope: the roster runs biggest job
// first, and `total` is the figure the left column leads with. Sectors whose
// work carries no capacity figure (repair, framework contracts) fall back to a
// contract count instead.
const blocks = services.map((sector) => {
  const roster = clients
    .filter((c) => c.sector === sector.slug)
    .sort((a, b) => (b.capacityMw ?? -1) - (a.capacityMw ?? -1))

  const rated = roster.filter((c) => typeof c.capacityMw === 'number')

  return {
    sector,
    roster,
    rated,
    // Roster runs biggest first, so the head of `rated` is the yardstick every
    // row's bar is drawn against.
    max: rated[0]?.capacityMw ?? 0,
    total: rated.reduce((sum, c) => sum + c.capacityMw, 0),
  }
})

// 330.29 rather than 330.3 — the 7.29 MW job is small enough that rounding it
// away would read as sloppy to anyone who knows the project.
const mw = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 })

// Whole percent: the shares are a sense of scale, not an accounting figure, and
// a decimal here would compete with the capacity column beside it.
const pct = (n, of) => (of > 0 ? Math.round((n / of) * 100) : 0)

export default function Clients() {
  const [selected, setSelected] = useState(0)
  // Which rated job the pointer is on, shared by the ledger rows and the share
  // meter in the rail so the two read as one instrument rather than two lists.
  const [active, setActive] = useState(null)
  const onSelect = useCallback((index) => {
    setSelected(index)
    setActive(null)
  }, [])

  const slides = useMemo(
    () =>
      blocks.map(({ sector }) => ({
        src: bySlug[sector.slug],
        alt: sector.imageAlt,
        focus: sector.focus,
      })),
    [],
  )

  const { sector, roster, rated, max, total } = blocks[selected] ?? blocks[0]
  const isRated = rated.length > 0

  return (
    <section className="relative isolate overflow-hidden bg-white pt-6 pb-24 sm:pt-10 sm:pb-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(110%_70%_at_50%_0%,black,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="field-grain-on-white pointer-events-none absolute inset-0 -z-10"
      />

      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] tracking-[0.2em] text-muted uppercase">
          <span className="flex items-center gap-3 text-ink">
            <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
              <span className="block h-[2px] w-3 bg-brand-600" />
              <span className="block h-[2px] w-1.5 bg-brand-600/40" />
            </span>
            Clients
          </span>
          <span className="hidden sm:block">Kathmandu</span>
        </div>
        <div aria-hidden="true" className="h-px w-full bg-ink/15" />

        <Rise className="mt-12 sm:mt-14">
          <h1 className="font-sans text-[clamp(2rem,6.4vw,5rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance text-ink">
            Where the chemistry <span className="text-brand-600">ends up.</span>
          </h1>
        </Rise>
      </div>

      <Rise delay={120} className="mt-10 sm:mt-14">
        <CoverflowCarousel
          slides={slides}
          label="Sectors supplied"
          cardWidth="clamp(240px, 34vw, 460px)"
          showNavigation
          showPagination
          onSelect={onSelect}
        />
      </Rise>

      {/* Detail for whichever card is centred. Keyed on the slug so the copy
          re-runs its fade whenever the carousel settles on a new sector. */}
      <div className="mx-auto mt-12 w-full max-w-[84rem] px-5 sm:mt-16 sm:px-10">
        <div className="grid animate-note gap-x-14 gap-y-12 lg:grid-cols-12" key={sector.slug}>
          {/* Left rail. */}
          <div className="lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
            {/* Sized to hold every sector title on one line. Below lg the rail
                is full width so 1.75rem never wraps; from lg up the column is
                only ~4/12 and narrows to about 277px at the breakpoint itself,
                so the size tracks the viewport instead of sitting fixed. */}
            <h2 className="font-sans text-[1.75rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-ink lg:text-[clamp(1.5rem,2.1vw,2.125rem)]">
              {sector.title}
            </h2>

            <p className="mt-5 max-w-[38ch] text-[1.0625rem] leading-relaxed text-pretty text-muted">
              {sector.summary}
            </p>

            <div className="mt-9">
              <p className="flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.22em] text-muted uppercase">
                <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-600" />
                {isRated ? 'Capacity supplied' : 'On the books'}
              </p>

              {/* Unit sits muted rather than red: on this page red marks the
                  things you can act on — tick marks and links — and spending it
                  on a unit of measure blunts it everywhere else. */}
              <p className="mt-3.5 flex items-baseline gap-2 text-ink">
                <span className="text-[clamp(2.5rem,6vw,3.5rem)] leading-[0.9] font-extrabold tracking-[-0.03em] tabular-nums">
                  {isRated ? mw(total) : String(roster.length).padStart(2, '0')}
                </span>
                <span className="font-mono text-[0.8125rem] tracking-[0.16em] text-muted uppercase">
                  {isRated ? 'MW' : roster.length === 1 ? 'Contract' : 'Contracts'}
                </span>
              </p>

              <p className="mt-3 max-w-[32ch] text-[0.875rem] leading-relaxed text-muted">
                Across {roster.length}{' '}
                {roster.length === 1 ? 'contractor' : 'contractors'}
                {isRated && rated.length !== roster.length && `, ${rated.length} rated`}.
              </p>

              {/* The total split back into the jobs that make it up. One bar of
                  five segments, sized by share — hovering a ledger row lights
                  its segment here, and hovering a segment lights the row. */}
              {isRated && (
                <div className="mt-8">
                  <div className="flex h-2.5 w-full gap-[3px]">
                    {rated.map((c, i) => (
                      <span
                        key={c.slug}
                        onMouseEnter={() => setActive(i)}
                        onMouseLeave={() => setActive(null)}
                        style={{ flex: `${c.capacityMw} 0 0%`, animationDelay: `${i * 70}ms` }}
                        className={`animate-bar origin-left transition-colors duration-300 motion-reduce:animate-none ${
                          active === i
                            ? 'bg-brand-600'
                            : active === null
                              ? 'bg-ink/20'
                              : 'bg-ink/8'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Readout swaps to the hovered job so the meter always says
                      what it is pointing at. Height is held by the fixed line
                      so the rail never shifts under the pointer. */}
                  <p className="mt-3 flex h-4 items-center justify-between gap-4 font-mono text-[0.6875rem] tracking-[0.16em] text-muted uppercase">
                    <span className="truncate">
                      {active === null
                        ? 'Share by contractor'
                        : rated[active].project ?? rated[active].name}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {active === null
                        ? `Largest ${mw(max)} MW`
                        : `${pct(rated[active].capacityMw, total)}%`}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* The ledger, ordered biggest job first. Rows carry either an
              installed capacity or, where the job has none, the scope itself. */}
          <dl className="lg:col-span-8">
            {/* The unit is stated once, here. Repeating "MW" on every row cost
                the column its axis — the digits' right edges shifted with the
                width of each number, so 7.29 and 200 never lined up. */}
            <div className="flex items-baseline justify-between gap-4 border-b border-ink/25 pb-3 font-mono text-[0.6875rem] tracking-[0.22em] text-muted uppercase">
              <span>Contractor</span>
              <span>{isRated ? 'Installed · MW' : 'Scope'}</span>
            </div>

            {roster.length === 0 && (
              <div className="border-b border-dashed border-ink/20 py-7">
                <dt className="text-[1.0625rem] leading-snug font-semibold text-ink/35">
                  Client list in progress
                </dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-pretty text-muted/70">
                  Placeholder — projects supplied into {sector.title.toLowerCase()}{' '}
                  are being confirmed.
                </dd>
              </div>
            )}

            {roster.map((client, i) => {
              const { slug, name, project, capacityMw } = client
              const isBar = typeof capacityMw === 'number'
              // Unrated jobs sort last, so a rated row's ledger position is its
              // position in the meter too — but read it off `rated` rather than
              // assume it, in case the sort ever changes.
              const ri = isBar ? rated.indexOf(client) : -1
              const on = isBar && active === ri

              return (
                <div
                  key={slug}
                  onMouseEnter={isBar ? () => setActive(ri) : undefined}
                  onMouseLeave={isBar ? () => setActive(null) : undefined}
                  className="group/row grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3 pt-5 sm:gap-x-5"
                >
                  <dt
                    className={`col-start-1 font-mono text-[0.75rem] tracking-[0.1em] tabular-nums transition-colors duration-500 motion-reduce:transition-none ${
                      on ? 'text-brand-600' : 'text-muted/70'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </dt>

                  {/* Name and project shift together on hover so the row reads as
                      one object rather than three cells that happen to align. */}
                  <dt
                    className={`col-start-2 text-[1.0625rem] leading-snug font-semibold text-pretty text-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transform-none motion-reduce:transition-none ${
                      on ? 'translate-x-1' : ''
                    }`}
                  >
                    {name}
                  </dt>

                  <dd className="col-start-3 self-baseline text-right">
                    {isBar ? (
                      <>
                        {/* min-w holds the axis steady: without it a two-digit
                            row would let the column collapse and the digits
                            would drift. */}
                        <span className="block min-w-[4ch] text-[1.375rem] leading-none font-semibold tracking-[-0.02em] text-ink tabular-nums">
                          {mw(capacityMw)}
                        </span>
                        <span className="mt-1.5 block font-mono text-[0.6875rem] tracking-[0.12em] text-muted/70 tabular-nums">
                          {pct(capacityMw, total)}%
                        </span>
                      </>
                    ) : (
                      // No capacity figure, so the scope column carries the job
                      // itself rather than a filler word. Held to one line from
                      // sm up; on a phone the column is too narrow for that
                      // without crushing the contractor name beside it.
                      <span className="block text-[0.9375rem] leading-snug text-muted sm:whitespace-nowrap">
                        {project ?? '—'}
                      </span>
                    )}
                  </dd>

                  {project && isBar && (
                    <dd
                      className={`col-start-2 col-end-4 mt-1 text-[0.9375rem] leading-relaxed text-pretty text-muted transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transform-none motion-reduce:transition-none ${
                        on ? 'translate-x-1' : ''
                      }`}
                    >
                      {project}
                    </dd>
                  )}

                  {/* The divider is the chart. Every row already needed a rule
                      under it, so the rule carries the job's size against the
                      biggest one in the sector — 200 MW against 7.29 stops being
                      two numbers you have to compare in your head. */}
                  <div
                    aria-hidden="true"
                    className="relative col-span-3 mt-5 h-[2px] w-full overflow-hidden bg-ink/10"
                  >
                    {isBar && (
                      <span
                        style={{
                          width: `${(capacityMw / max) * 100}%`,
                          animationDelay: `${i * 70}ms`,
                        }}
                        className={`animate-bar absolute inset-y-0 left-0 origin-left transition-colors duration-300 motion-reduce:animate-none ${
                          on ? 'bg-brand-600' : 'bg-ink/45'
                        }`}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </dl>
        </div>
      </div>
    </section>
  )
}
