import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { cn } from '@/lib/utils'
import { services } from '@/data/services'

const PHOTOS = import.meta.glob('../../assets/images/service-*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const bySlug = Object.fromEntries(
  Object.entries(PHOTOS).map(([path, src]) => [
    path.replace(/^.*\/service-/, '').replace(/\.\w+$/, ''),
    src,
  ]),
)

const photoFor = (slug) => bySlug[slug] ?? null

const LAYOUT = [
  { span: 'lg:col-span-7', wide: true },
  { span: 'lg:col-span-5', wide: false },
  { span: 'lg:col-span-5', wide: false },
  { span: 'lg:col-span-7', wide: true },
  { span: 'sm:col-span-2 lg:col-span-12', wide: true },
]

export default function ServicesGrid() {
  return (
    <section
      id="services"
      className="sheet-grain relative bg-[#f4f4f6] pb-16 pt-12 sm:pb-24 sm:pt-16"
    >
      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        <Rise as="header" className="mb-12 text-center sm:mb-16">
          <p className="mx-auto mb-6 flex w-fit items-center gap-3 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-ink">
            <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
              <span className="block h-[2px] w-3 bg-brand-600" />
              <span className="block h-[2px] w-1.5 bg-brand-600/40" />
            </span>
            Where it goes
          </p>
          <h2
            className="mx-auto max-w-3xl text-balance font-sans text-[2.5rem] font-bold leading-[1.04] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.25rem]"
          >
            One catalogue, <span className="text-brand-600">specified per sector</span>
          </h2>

          <div className="mt-9 flex items-center gap-5 sm:mt-11">
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/8 to-ink/15"
            />
            <span className="shrink-0 font-mono text-[0.75rem] uppercase tracking-[0.18em] tabular-nums text-muted">
              {String(services.length).padStart(2, '0')} sectors
            </span>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-l from-transparent via-ink/8 to-ink/15"
            />
          </div>
        </Rise>

        <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-12">
          {services.map((service, i) => {
            const photo = photoFor(service.slug)
            const { span, wide } = LAYOUT[i % LAYOUT.length]

            return (
              <Rise as="li" key={service.slug} delay={i * 90} className={span}>

                <Link
                  to="/services"
                  className="group relative block h-full rounded-xl bg-ink"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl [box-shadow:0_1px_2px_rgba(20,23,28,0.06),0_12px_28px_-16px_rgba(20,23,28,0.35)]"
                  />

                  <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl ring-1 ring-inset ring-white/10 sm:aspect-[16/10] lg:aspect-auto lg:h-[clamp(21rem,30vw,27rem)]">
                    {photo ? (
                      <img
                        src={photo}
                        loading="lazy"
                        decoding="async"
                        alt={service.imageAlt}
                        style={{ objectPosition: service.focus }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="field-grain flex h-full w-full items-center justify-center bg-ink">
                        <span
                          aria-hidden="true"
                          className="font-mono text-[clamp(3rem,8vw,5rem)] uppercase leading-none tracking-[0.08em] text-white/[0.07]"
                        >
                          {service.code}
                        </span>
                      </div>
                    )}

                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-ink/95 via-ink/60 to-transparent"
                    />
                  </div>

                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-white/60 sm:left-6 sm:top-6"
                  >
                    {service.code}
                  </span>

                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white sm:right-6 sm:top-6"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                      <path
                        d="M6.5 17.5 17.5 6.5M9 6.5h8.5V15"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <h3
                      className={cn(
                        'font-semibold leading-[1.15] tracking-[-0.01em] text-white text-balance',
                        wide ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
                      )}
                    >
                      {service.title}
                    </h3>

                    <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-white/75 text-pretty">
                      {service.summary}
                    </p>
                  </div>
                </Link>
              </Rise>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
