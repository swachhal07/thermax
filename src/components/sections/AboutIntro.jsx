import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { cn } from '@/lib/utils'

import plateLab from '@/assets/about-plate-lab.webp'
import plateSite from '@/assets/images/about-site.webp'

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
  { term: 'Stock', value: 'Held in Kathmandu' },
]

export default function AboutIntro() {
  const [active, setActive] = useState(TABS[0].id)
  const activeIndex = TABS.findIndex((t) => t.id === active)
  const tabRefs = useRef([])
  const tablistRef = useRef(null)

  const [bar, setBar] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const list = tablistRef.current
    const tab = tabRefs.current[activeIndex]
    if (!list || !tab) return

    const measure = () => {
      const { width } = tab.getBoundingClientRect()
      if (width) setBar({ left: tab.offsetLeft, width })
    }
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(list)
    ro.observe(tab)
    return () => ro.disconnect()
  }, [activeIndex])

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
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(120%_75%_at_50%_0%,black,transparent_78%)]"
      />

      <div
        aria-hidden="true"
        className="field-grain-on-white pointer-events-none absolute inset-0 -z-10"
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
            About us
          </span>
          <span aria-hidden="true" className="hidden text-[0.6875rem] text-ink/35 sm:block">
            Thermax &times; MV Dugar Group
          </span>
        </div>
        <div aria-hidden="true" className="h-px w-full bg-ink/15" />

        <div className="mt-10 grid gap-y-14 lg:grid-cols-12 lg:gap-x-14">
          <Rise className="lg:col-span-6">
            <div>
              <h2 className="max-w-[19ch] font-sans text-[2.75rem] leading-[0.98] font-bold tracking-[-0.03em] text-balance text-ink sm:text-6xl lg:text-[4rem]">
                Chemistry that holds Nepal{' '}
                <span className="text-brand-600">together.</span>
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
                ref={tablistRef}
                role="tablist"
                aria-label="About Thermax"
                onKeyDown={onKeyDown}
                className="relative flex border-b border-ink/15"
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
                      'group flex flex-col gap-2 pt-1 pb-3.5 text-left',
                      'transition-transform duration-150 active:translate-y-px',
                      i > 0 && 'ml-7 sm:ml-11',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'font-mono text-[0.625rem] tracking-[0.2em] tabular-nums transition-colors duration-300',
                        active === tab.id
                          ? 'text-brand-600'
                          : 'text-ink/30 group-hover:text-brand-600/60',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'text-[0.9375rem] transition-colors duration-300 sm:text-base',
                        active === tab.id
                          ? 'font-semibold text-ink'
                          : 'text-ink/55 group-hover:text-ink',
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                ))}

                <span
                  aria-hidden="true"
                  style={{ transform: `translateX(${bar.left}px) scaleX(${bar.width})` }}
                  className="absolute -bottom-px left-0 h-0.5 w-px origin-left bg-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </div>

              <div className="mt-6 grid">
                {TABS.map((tab) => (
                  <p
                    key={tab.id}
                    role="tabpanel"
                    id={`${tab.id}-panel`}
                    aria-labelledby={`${tab.id}-tab`}
                    aria-hidden={active !== tab.id}
                    className={cn(
                      'col-start-1 row-start-1 max-w-[56ch] text-base leading-relaxed text-ink/75',
                      'transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      active === tab.id
                        ? 'opacity-100'
                        : 'pointer-events-none opacity-0 motion-safe:translate-y-1.5',
                    )}
                  >
                    {tab.body}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <dl className="mt-12 border-t border-ink/15">
                {LEDGER.map(({ term, value }) => (
                  <div
                    key={term}
                    className="flex flex-col gap-1 border-b border-ink/15 py-3.5 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <dt className="font-mono text-[0.625rem] tracking-[0.2em] whitespace-nowrap text-brand-600 uppercase">
                      {term}
                    </dt>
                    <span
                      aria-hidden="true"
                      className="hidden sm:mb-1.5 sm:block sm:min-w-6 sm:flex-1 sm:border-b sm:border-dotted sm:border-ink/25"
                    />
                    <dd className="text-[0.9375rem] text-ink/85 sm:text-right sm:whitespace-nowrap">
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
                  width={1100}
                  height={728}
                  decoding="async"
                  loading="lazy"
                  alt="Reinforcement bar and steel formwork laid out on a concrete deck, two workers in high-visibility jackets cutting and tying steel"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
                />
              </div>

              <div className="field-grain col-span-2 flex h-40 flex-col justify-between bg-brand-600 p-5 sm:h-56 lg:h-full">
                <svg viewBox="0 0 12 16" aria-hidden="true" className="h-5 w-4 fill-white">
                  <path d="M7 0L0 9h4l-1 7 8-10H7l1-6z" />
                </svg>
                <p className="font-mono text-[0.625rem] leading-[1.7] tracking-[0.16em] text-white uppercase">
                  Specified &amp; supported across Nepal
                </p>
              </div>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  )
}
