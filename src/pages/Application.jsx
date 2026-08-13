import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import ArrowButton from '@/components/ui/ArrowButton'
import Rise from '@/components/ui/Rise'
import { categories, categoryBySlug } from '@/data/categories'
import { services } from '@/data/services'

const PRODUCT_PHOTOS = import.meta.glob('../assets/images/product-*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const SECTOR_PHOTOS = import.meta.glob('../assets/images/service-*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const byPrefix = (photos, prefix) =>
  Object.fromEntries(
    Object.entries(photos).map(([path, src]) => [
      path.replace(new RegExp(`^.*/${prefix}`), '').replace(/\.\w+$/, ''),
      src,
    ]),
  )

const productPhoto = byPrefix(PRODUCT_PHOTOS, 'product-')
const sectorPhoto = byPrefix(SECTOR_PHOTOS, 'service-')
const sectorBySlug = Object.fromEntries(services.map((s) => [s.slug, s]))

export default function Application() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const category = categoryBySlug(slug)

  // 'default' key means this was a fresh load (deep link, refresh) with nothing to
  // go back to — fall through to the listing instead of leaving the site.
  const goBack = () =>
    location.key === 'default' ? navigate('/services') : navigate(-1)

  if (!category) return <Navigate to="/services" replace />

  const photo = productPhoto[category.slug] ?? null
  const rangeIndex = categories.findIndex((c) => c.slug === category.slug) + 1
  const uses = (category.uses ?? [])
    .map((use) => ({ ...use, sector: sectorBySlug[use.sector] }))
    .filter((use) => use.sector)

  return (
    <>
      <section className="relative isolate overflow-clip bg-white pt-6 sm:pt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(110%_70%_at_50%_0%,black,transparent_75%)]"
        />

        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <Rise className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <button
              type="button"
              onClick={goBack}
              className="group inline-flex items-center gap-3 rounded-full bg-ink/[0.04] py-1.5 pl-1.5 pr-5 font-sans text-sm font-medium text-ink ring-1 ring-ink/[0.07] transition-[background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.07] hover:ring-ink/[0.12] motion-reduce:transition-none"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow-[0_1px_2px_rgba(20,23,28,0.08)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-x-0.5 motion-reduce:transition-none"
              >
                <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor">
                  <path
                    d="M8.5 3 4.5 7l4 4"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Back
            </button>

            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted"
            >
              <Link to="/services" className="transition-colors hover:text-brand-600">
                Applications
              </Link>
              <span aria-hidden="true" className="text-ink/25">
                /
              </span>
              <span className="text-ink">{category.name}</span>
            </nav>
          </Rise>

          <div aria-hidden="true" className="mt-8 h-px bg-ink/15 lg:-mr-10 xl:-mr-20" />

          <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-14">
            <Rise className="lg:col-span-6 lg:pb-20">
              <p className="flex items-baseline gap-3 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.22em] tabular-nums text-muted">
                <span className="text-brand-600">{String(rangeIndex).padStart(2, '0')}</span>
                <span aria-hidden="true" className="text-ink/25">
                  /
                </span>
                <span>{String(categories.length).padStart(2, '0')} ranges held</span>
              </p>

              <h1 className="mt-8 font-sans text-[clamp(2.5rem,5.4vw,4.25rem)] font-extrabold leading-[0.94] tracking-[-0.035em] text-ink">
                {category.name}
                <span className="text-brand-600">.</span>
              </h1>

              <p className="mt-8 max-w-[46ch] border-l border-ink/12 pl-6 text-[1.0625rem] leading-relaxed text-ink/70 text-pretty sm:text-[1.125rem]">
                {category.body}
              </p>
            </Rise>

            <Rise
              from="right"
              delay={140}
              className="lg:col-span-6 lg:-mr-10 lg:h-full lg:pt-6 xl:-mr-20"
            >
              <figure className="relative h-72 overflow-hidden bg-ink/5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)] sm:h-[24rem] lg:h-full">
                {photo && (
                  <img
                    src={photo}
                    alt={category.imageAlt}
                    decoding="async"
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
                />
              </figure>
            </Rise>
          </div>

          <div
            aria-hidden="true"
            className="mt-14 h-px bg-ink/15 sm:mt-16 lg:-mr-10 xl:-mr-20"
          />
        </div>
      </section>

      <section className="bg-white pb-20 pt-12 sm:pb-28 sm:pt-14">
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <Rise as="header" className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-3 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-ink">
                <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                  <span className="block h-[2px] w-3 bg-brand-600" />
                  <span className="block h-[2px] w-1.5 bg-brand-600/40" />
                </span>
                Where you can use it
              </p>

              <h2 className="mt-5 font-sans text-[clamp(1.75rem,3.2vw,2.5rem)] font-bold leading-[1.06] tracking-[-0.02em] text-ink">
                {category.name} <span className="text-brand-600">on site</span>
              </h2>
            </div>

            <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] tabular-nums text-muted">
              {String(uses.length).padStart(2, '0')} sectors
            </p>
          </Rise>

          <ul className="mt-12 grid list-none grid-cols-1 gap-5 p-0 sm:gap-6 lg:grid-cols-2">
            {uses.map((use, i) => (
              <Rise as="li" key={use.sector.slug} delay={(i % 2) * 90}>
                <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-ink/[0.03] ring-1 ring-ink/[0.06] sm:flex-row">
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-ink sm:aspect-auto sm:w-[42%]">
                    {sectorPhoto[use.sector.slug] && (
                      <img
                        src={sectorPhoto[use.sector.slug]}
                        alt={use.sector.imageAlt}
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: use.sector.focus }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="absolute left-5 top-4 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-white/80"
                    >
                      {use.sector.code}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <h3 className="font-sans text-[1.25rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink text-balance">
                      {use.sector.title}
                    </h3>

                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                      {use.detail}
                    </p>
                  </div>
                </article>
              </Rise>
            ))}
          </ul>

          <Rise delay={120}>
            <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-8 sm:mt-16">
              <p className="max-w-[46ch] text-[0.9375rem] leading-relaxed text-muted text-pretty">
                Need the datasheet, a dosage rate, or a specification for a live tender? We hold
                the range in Kathmandu.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <ArrowButton to="/contact">Enquire about this range</ArrowButton>

                <Link
                  to="/services"
                  className="group inline-flex items-center gap-2.5 font-sans text-sm font-medium text-ink transition-colors duration-500 hover:text-brand-600"
                >
                  All applications
                  <span
                    aria-hidden="true"
                    className="block h-px w-6 origin-left bg-ink/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-9 group-hover:bg-brand-600"
                  />
                </Link>
              </div>
            </div>
          </Rise>
        </div>
      </section>
    </>
  )
}
