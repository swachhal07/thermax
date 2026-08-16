import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { CoverflowCarousel } from '@/components/ui/CoverflowCarousel'
import { clients } from '@/data/clients'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'

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

// Driven by the sectors that actually have someone in them, so a sector with no
// clients yet never becomes a slide with nothing behind it.
const blocks = services
  .map((sector) => ({ sector, roster: clients.filter((c) => c.sector === sector.slug) }))
  .filter((b) => b.roster.length > 0)

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

  const { sector, roster } = blocks[selected] ?? blocks[0]

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
      <div className="mx-auto mt-12 w-full max-w-[84rem] px-5 sm:mt-14 sm:px-10">
        <div key={sector.slug} className="grid animate-note gap-x-14 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-sans text-[2rem] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance text-ink sm:text-[2.75rem]">
              {sector.title}
            </h2>

            <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-relaxed text-pretty text-muted">
              {sector.summary}
            </p>

            <Link
              to={`/services/${sector.slug}`}
              className="group/link mt-8 inline-flex w-fit items-center gap-3.5 text-[0.9375rem] font-medium text-ink"
            >
              <span className="relative py-1">
                What we supply into {sector.title.toLowerCase()}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 block h-[1.5px] w-full origin-left bg-brand-600 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/link:scale-x-[1.12] motion-reduce:transition-none"
                />
              </span>
              <svg
                viewBox="0 0 22 10"
                aria-hidden="true"
                className="h-2.5 w-5.5 shrink-0 text-brand-600 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/link:translate-x-2 motion-reduce:transition-none"
              >
                <path
                  d="M0 5h20M16 1l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <dl className="lg:col-span-5 lg:col-start-8">
            {roster.map(({ slug, name, project, year }, i) => (
              <div
                key={slug}
                className={cn(
                  'grid gap-x-6 gap-y-1 border-b border-ink/12 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline',
                  i === 0 && 'border-t border-ink/12',
                )}
              >
                <dt className="text-[1.0625rem] leading-snug font-semibold text-ink">
                  {name}
                </dt>
                <dd className="text-[0.875rem] text-muted tabular-nums sm:text-right">
                  {year}
                </dd>
                {project && (
                  <dd className="text-[0.9375rem] leading-relaxed text-pretty text-muted sm:col-span-2">
                    {project}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
