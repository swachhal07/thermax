import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import ArrowButton from '@/components/ui/ArrowButton'
import Rise from '@/components/ui/Rise'
import { categoryBySlug } from '@/data/categories'
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
  const uses = (category.uses ?? [])
    .map((use) => ({ ...use, sector: sectorBySlug[use.sector] }))
    .filter((use) => use.sector)

  return (
    <>
      <section className="relative isolate overflow-hidden bg-white pt-6 sm:pt-10">
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

          <div className="mt-10 grid items-end gap-y-10 lg:grid-cols-12 lg:gap-x-12">
            <Rise className="lg:col-span-7">
              <h1 className="max-w-[16ch] font-sans text-[2.5rem] font-extrabold leading-[0.96] tracking-[-0.03em] text-ink text-balance sm:text-[3.25rem] lg:text-[4rem]">
                {category.name}
              </h1>

              <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-relaxed text-muted text-pretty">
                {category.body}
              </p>
            </Rise>

            <Rise delay={140} className="lg:col-span-5">
              <div className="rounded-[1.75rem] bg-ink/[0.04] p-1.5 ring-1 ring-ink/[0.06]">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-ink">
                  {photo && (
                    <img
                      src={photo}
                      alt={category.imageAlt}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            </Rise>
          </div>

          <div aria-hidden="true" className="mt-14 h-px w-full bg-ink/15 sm:mt-16" />
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

              <h2 className="mt-5 max-w-[20ch] font-sans text-[2rem] font-bold leading-[1.06] tracking-[-0.02em] text-ink text-balance sm:text-[2.5rem]">
                {category.name} on site
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
