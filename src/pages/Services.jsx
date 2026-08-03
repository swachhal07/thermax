import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { categories } from '@/data/categories'

const PHOTOS = import.meta.glob('../assets/images/product-*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const bySlug = Object.fromEntries(
  Object.entries(PHOTOS).map(([path, src]) => [
    path.replace(/^.*\/product-/, '').replace(/\.\w+$/, ''),
    src,
  ]),
)

export default function Services() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-white pb-16 pt-6 sm:pb-20 sm:pt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(110%_70%_at_50%_0%,black,transparent_75%)]"
        />

        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-muted">
            <span className="flex items-center gap-3 text-ink">
              <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                <span className="block h-[2px] w-3 bg-brand-600" />
                <span className="block h-[2px] w-1.5 bg-brand-600/40" />
              </span>
              Product range
            </span>
            <span className="hidden sm:block">Kathmandu</span>
          </div>
          <div aria-hidden="true" className="h-px w-full bg-ink/15" />

          <div className="mt-12 grid items-end gap-y-8 sm:mt-14 lg:grid-cols-12 lg:gap-x-12">
            <Rise className="lg:col-span-8">
              <h1 className="max-w-[14ch] font-sans text-[3rem] font-extrabold leading-[0.94] tracking-[-0.03em] text-ink text-balance sm:text-[4rem] lg:text-[5rem]">
                What we <span className="text-brand-600">stock.</span>
              </h1>
            </Rise>

            <Rise delay={140} className="lg:col-span-4 lg:justify-self-end lg:text-right">
              <p className="font-mono text-[clamp(3rem,6vw,4.5rem)] font-medium leading-none tracking-[-0.02em] tabular-nums text-ink">
                {String(categories.length).padStart(2, '0')}
              </p>
              <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted">
                Ranges held on the floor
              </p>
            </Rise>
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 pt-14 sm:pb-28 sm:pt-16">
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {categories.map((category, i) => {
              const photo = bySlug[category.slug] ?? null

              return (
                <Rise as="li" key={category.slug} delay={(i % 3) * 90}>
                  <Link to="/contact" className="group block h-full">
                    <div className="h-full rounded-[1.75rem] bg-ink/[0.04] p-1.5 ring-1 ring-ink/[0.06] transition-[background-color,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-ink/[0.07] group-hover:ring-ink/10 motion-reduce:transition-none">
                      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(20,23,28,0.04),0_18px_40px_-24px_rgba(20,23,28,0.28)] transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[3px] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(20,23,28,0.05),0_30px_60px_-26px_rgba(20,23,28,0.36)] motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-ink">
                          {photo && (
                            <img
                              src={photo}
                              loading="lazy"
                              decoding="async"
                              alt={category.imageAlt}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}

                          <div
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/55 to-transparent"
                          />

                          <span
                            aria-hidden="true"
                            className="absolute left-6 top-5 font-mono text-[0.75rem] tracking-[0.2em] tabular-nums text-white/75"
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>

                        </div>

                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                          <h2 className="font-sans text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.02em] text-ink text-balance sm:text-[1.5rem]">
                            {category.name}
                          </h2>

                          <p className="mt-3.5 max-w-[44ch] text-[0.9375rem] leading-relaxed text-muted text-pretty">
                            {category.body}
                          </p>

                          <span className="mt-auto flex items-center gap-4 overflow-hidden border-t border-ink/10 pt-5 text-[0.9375rem] font-medium text-ink sm:mt-7">
                            <span
                              aria-hidden="true"
                              className="block h-px w-6 shrink-0 origin-left bg-brand-600 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-x-[1.5] motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                            />
                            <span className="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                              Enquire about this range
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Rise>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}
