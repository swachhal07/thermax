import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { cn } from '@/lib/utils'

import plateLab from '@/assets/about-plate-lab.webp'
/* The cast test cylinder under callipers. It pairs with the wet-chemistry plate
   beside it as the two halves of the same job — the formulation and the proof
   that the mix made strength — rather than as chemistry against a site. */
import plateSite from '@/assets/images/concrete_testing_2024_blog2.webp'

const TABS = [
  {
    id: 'history',
    label: 'History',
    body: 'Thermax has spent decades formulating chemistry for industry. Through the MV Dugar Group, that catalogue now reaches Nepali contractors, plants, and project teams — with stock held locally and technical support on the ground.',
  },
  {
    id: 'mission',
    label: 'Mission',
    body: 'Put the right product on site at the right time — specified correctly, delivered on schedule, and backed by people who take the call when a pour is waiting, rather than a week later once the slab has gone down.',
  },
  {
    id: 'vision',
    label: 'Vision',
    body: 'A built environment in Nepal that lasts longer than its warranty — fewer repairs, less waste, and structures that hold against water, load, and weather for decades rather than a handful of monsoons.',
  },
]

const LEDGER = [
  { term: 'Quality control', value: 'Tested at every batch' },
  { term: 'Technical support', value: 'On site, in person' },
  { term: 'Stock', value: 'Held in Nepal' },
]

export default function AboutIntro() {
  const [active, setActive] = useState(TABS[0].id)
  const activeIndex = TABS.findIndex((t) => t.id === active)
  const tabRefs = useRef([])

  const onKeyDown = (e) => {
    const dir =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0
    if (!dir) return
    e.preventDefault()
    const next = TABS[(activeIndex + dir + TABS.length) % TABS.length]
    setActive(next.id)
    tabRefs.current[TABS.indexOf(next)]?.focus()
  }

  return (
    <section
      id="about"
      className="relative isolate scroll-mt-24 overflow-hidden bg-white pt-24 pb-28 sm:pt-32 sm:pb-40"
    >
      <div
        aria-hidden="true"
        // The fade is a white radial painted over the grid rather than a
        // mask-image. A mask forces an offscreen buffer the size of the section,
        // rasterised the moment it scrolls in; over a white background this
        // reads identically and paints in one pass. The grain rides here too,
        // rather than on a second full-section element stacked over this one —
        // this section is ~1200px tall, so each overlay is a lot of area to
        // re-raster as it scrolls in.
        className="field-grain-on-white pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(120%_75%_at_50%_0%,transparent,white_78%),linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:auto,5.5rem_5.5rem,5.5rem_5.5rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(227,6,19,0.05),transparent_68%)]"
      />

      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] tracking-[0.2em] text-muted uppercase">
          <span className="flex items-center gap-3 text-ink">
            <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
              <span className="block h-[2px] w-3 bg-brand-600" />
              <span className="block h-[2px] w-1.5 bg-brand-600/40" />
            </span>
            Where it all started
          </span>
        </div>
        <div aria-hidden="true" className="h-px w-full bg-ink/15" />

        <div className="mt-10 grid gap-y-14 lg:grid-cols-12 lg:gap-x-14">
          <Rise className="lg:col-span-6">
            <div>
              <h2 className="max-w-[19ch] font-sans text-[2.75rem] leading-[0.98] font-bold tracking-[-0.03em] text-balance text-ink sm:text-6xl lg:text-[4rem]">
                Specified, supplied,{' '}
                <span className="text-brand-600">applied.</span>
              </h2>
            </div>

            <div>
              <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-pretty text-muted">
                From foundations to finishes, we supply the admixtures, waterproofing, and
                repair systems that decide how long a structure lasts.
              </p>
            </div>

            <div aria-hidden="true" className="mt-12 h-px w-full bg-ink/12" />

            <div className="mt-8">
              <div
                role="tablist"
                aria-label="About Thermax"
                onKeyDown={onKeyDown}
                className="flex flex-wrap items-center gap-x-7 gap-y-3 sm:gap-x-9"
              >
                {TABS.map((tab, i) => (
                  <button
                    key={tab.id}
                    ref={(el) => (tabRefs.current[i] = el)}
                    type="button"
                    role="tab"
                    id={`${tab.id}-tab`}
                    aria-selected={active === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    tabIndex={active === tab.id ? 0 : -1}
                    onClick={() => setActive(tab.id)}
                    className={cn(
                      'group relative py-1 text-[1.0625rem] tracking-[-0.01em]',
                      'transition-[color,transform] duration-300 active:translate-y-px',
                      active === tab.id
                        ? 'font-semibold text-ink'
                        : 'font-medium text-ink/45 hover:text-ink/75',
                    )}
                  >
                    {tab.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left bg-brand-600',
                        'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        active === tab.id ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </button>
                ))}
              </div>

              <div className="mt-7">
                <div className="grid">
                  {TABS.map((tab) => (
                    <p
                      key={tab.id}
                      role="tabpanel"
                      id={`${tab.id}-panel`}
                      aria-labelledby={`${tab.id}-tab`}
                      aria-hidden={active !== tab.id}
                      className={cn(
                        'col-start-1 row-start-1 max-w-[46ch] font-sans text-[1.1875rem] leading-[1.6] tracking-[-0.01em] text-pretty text-ink/85 sm:text-[1.3125rem]',
                        'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        active === tab.id
                          ? 'opacity-100'
                          : 'pointer-events-none opacity-0 motion-safe:translate-y-2',
                      )}
                    >
                      {tab.body}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <dl className="mt-12 border-t border-ink/12">
                {LEDGER.map(({ term, value }) => (
                  <div
                    key={term}
                    className="grid gap-x-6 gap-y-1 border-b border-ink/12 py-4 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:items-baseline"
                  >
                    <dt className="text-[0.9375rem] leading-snug text-ink/55">{term}</dt>
                    <dd className="text-[1.0625rem] leading-snug font-semibold text-ink">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <Link
                to="/about"
                className="group mt-10 inline-flex items-center gap-3 font-mono text-[0.75rem] tracking-[0.2em] text-ink uppercase transition-transform duration-150 active:translate-y-px"
              >
                <span className="relative py-1">
                  Explore more
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left bg-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-[1.18]"
                  />
                </span>
                <svg
                  viewBox="0 0 22 10"
                  aria-hidden="true"
                  className="h-2.5 w-5.5 text-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2"
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
          </Rise>

          <Rise
            from="right"
            delay={140}
            className="lg:col-span-6 lg:col-start-7 lg:-mr-10 xl:-mr-16"
          >
            <div className="grid grid-cols-5 gap-2.5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)] lg:h-full lg:grid-rows-[minmax(0,1fr)_14rem]">
              <figure className="relative col-span-5 h-72 overflow-hidden bg-ink/5 sm:h-96 lg:h-full">
                <img
                  src={plateLab}
                  width={1600}
                  height={1064}
                  decoding="async"
                  loading="lazy"
                  alt="Chemist in safety glasses drawing a sample from a separatory funnel in a fume hood"
                  className="h-full w-full object-cover object-[60%_50%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
                />
                <figcaption className="absolute bottom-4 left-4 flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
                  <span className="block h-[2px] w-3 bg-brand-500" />
                  Plate 01 — batch QC
                </figcaption>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
                />
              </figure>

              <div className="relative col-span-3 h-40 overflow-hidden bg-ink/5 sm:h-56 lg:h-full">
                <img
                  src={plateSite}
                  width={1082}
                  height={822}
                  decoding="async"
                  loading="lazy"
                  alt="A gloved technician measuring a cast concrete test cylinder with callipers beside a compression testing machine"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
                />
              </div>

              <div className="field-grain col-span-2 flex h-40 flex-col justify-between bg-brand-600 p-5 sm:h-56 lg:h-full">
                <span aria-hidden="true" className="flex shrink-0 flex-col gap-[3px]">
                  <span className="block h-[2px] w-6 bg-white" />
                  <span className="block h-[2px] w-3 bg-white/45" />
                </span>
                <p className="max-w-[16ch] text-[1.0625rem] leading-[1.3] font-semibold tracking-[-0.01em] text-balance text-white">
                  Specified and supported across Nepal.
                </p>
              </div>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  )
}
