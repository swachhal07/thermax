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
    total: rated.reduce((sum, c) => sum + c.capacityMw, 0),
  }
})

// 330.29 rather than 330.3 — the 7.29 MW job is small enough that rounding it
// away would read as sloppy to anyone who knows the project.
const mw = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 })

export default function Clients() {
  const [selected, setSelected] = useState(0)
  const onSelect = useCallback((index) => setSelected(index), [])

  const slides = useMemo(
    () =>
      blocks.map(({ sector }) => ({
        src: bySlug[sector.slug],
        alt: sector.imageAlt,
        focus: sector.focus,
      })),
    [],
  )

  const { sector, roster, rated, total } = blocks[selected] ?? blocks[0]
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

              {/* "Projects", not "contractors": the dams ledger mixes developers,
                  project names and the municipality a job sits in. */}
              <p className="mt-3 max-w-[32ch] text-[0.875rem] leading-relaxed text-muted">
                Across {roster.length} {roster.length === 1 ? 'project' : 'projects'}
                {isRated && rated.length !== roster.length && `, ${rated.length} rated`}.
              </p>
            </div>
          </div>

          {/* The ledger, ordered biggest job first. Rows carry either an
              installed capacity or, where the job has none, the scope itself. */}
          <dl className="lg:col-span-8">
            {/* No capacity column: each figure is read as part of the name it
                belongs to — "Nasa Hydropower Pvt. Ltd. (200 MW)". "Client ·
                project" because the rows are a mix of developers, project names
                and the municipality a job sits in, and calling all of them
                contractors was wrong on half the ledger. */}
            <div className="border-b border-ink/25 pb-3 font-mono text-[0.6875rem] tracking-[0.22em] text-muted uppercase">
              {isRated ? 'Client · project' : 'Contractor'}
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

            {roster.map(({ slug, name, project, capacityMw }, i) => {
              const isBar = typeof capacityMw === 'number'

              /* One idea, not five: touching a row runs a plotter head across it.
                 A red pass sweeps through the glyphs of the name and its figure
                 left to right, the rule underneath fills red on the same heading
                 with a marker riding its leading edge, and a whisper of tint
                 lifts the row off the sheet. The project line is the only thing
                 that changes position, and it moves late.

                 The sweep is a second, aria-hidden copy of the line sitting
                 exactly over the first and revealed with clip-path — the glyphs
                 recolour in place, left to right, rather than the row
                 cross-fading between two colours. Identical content in an
                 identically sized box means the two copies break lines the same
                 way. Clip-path, width and opacity only, all of it on absolutely
                 positioned layers, so the row itself never reflows. */
              const sweep =
                'transition-[clip-path] duration-[820ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none'

              const line = (
                <>
                  {name}
                  {isBar && (
                    <span className="ml-2 font-mono text-[0.9375rem] font-normal tracking-[0.01em] whitespace-nowrap tabular-nums sm:text-[1rem]">
                      ({mw(capacityMw)} MW)
                    </span>
                  )}
                </>
              )

              return (
                <div
                  key={slug}
                  className="group/row relative grid cursor-default grid-cols-[1.75rem_minmax(0,1fr)] items-baseline gap-x-3 pt-6 sm:gap-x-5"
                >
                  {/* Sits first so every cell paints over it. 2% ink is under the
                      grain layer's own strength — enough to read as a surface,
                      not enough to become a grey band. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-x-4 -top-1 bottom-2 bg-ink/[0.02] opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/row:opacity-100 motion-reduce:transition-none"
                  />

                  <dt className="col-start-1 font-mono text-[0.8125rem] tracking-[0.1em] text-muted/70 tabular-nums transition-colors duration-300 group-hover/row:text-brand-600 motion-reduce:transition-none">
                    {String(i + 1).padStart(2, '0')}
                  </dt>

                  {/* The figure rides with the name it belongs to: mono and
                      unbolded so it reads as an annotation rather than a second
                      heading, and nowrap so a bracket never breaks over a line. */}
                  {/* The scale rides on the line's own box, not on either copy,
                      so the swept red layer grows with the ink underneath it and
                      the two stay registered to the pixel. Transform rather than
                      font-size: type that grows by reflow would push the project
                      line and every row below it. Origin left keeps the ledger's
                      left axis fixed while the words open to the right. */}
                  <dt className="relative col-start-2 origin-left text-[1.1875rem] leading-snug font-semibold text-pretty text-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/row:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none sm:text-[1.3125rem]">
                    {/* Resting state, unchanged: ink name, muted figure. The
                        figure takes its grey from here rather than from its own
                        class so the swept copy above can inherit red. */}
                    <span className="[&>span]:text-muted">{line}</span>

                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 text-brand-600 [clip-path:inset(0_100%_0_0)] group-hover/row:[clip-path:inset(0_0_0_0)] ${sweep}`}
                    >
                      {line}
                    </span>
                  </dt>

                  {project && (
                    <dd className="col-start-2 mt-1.5 text-[1rem] leading-relaxed text-pretty text-muted transition-transform delay-150 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/row:translate-x-1.5 motion-reduce:transform-none motion-reduce:transition-none">
                      {project}
                    </dd>
                  )}

                  {/* The rule fills on the same heading as the sweep, a touch
                      slower so it is still travelling once the type has settled,
                      with a marker on its leading edge. Width rather than
                      scaleX: a scaled fill would squash the marker with it. */}
                  <div
                    aria-hidden="true"
                    className="relative col-span-2 mt-6 h-px w-full bg-ink/12"
                  >
                    <span className="absolute inset-y-0 left-0 w-0 bg-brand-600 transition-[width] duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/row:w-full motion-reduce:transition-none">
                      <span className="absolute top-1/2 right-0 block h-[5px] w-[5px] translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 motion-reduce:hidden" />
                    </span>
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
