import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/siteConfig'
import platePeople from '@/assets/images/Kaligandaki_Hydro.jpg'

const FACTS = [
  { term: 'Made by', value: 'Thermax' },
  { term: 'Held by', value: 'MV Dugar Group' },
  { term: 'In stock', value: `${services.length} lines` },
]

function useAboutHeroMotion(sectionRef) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { duration: 1.05, ease: 'power3.out' } })
        .from('[data-about-hero="kicker"]', { opacity: 0, y: 14, duration: 0.7 })
        .from('[data-about-hero="headline"]', { opacity: 0, y: 32 }, '-=0.45')
        .from('[data-about-hero="sub"]', { opacity: 0, y: 22 }, '-=0.8')
        .from('[data-about-hero="facts"] > *', { opacity: 0, y: 18, stagger: 0.08 }, '-=0.85')
        .from('[data-about-hero="lines"]', { opacity: 0, y: 20, duration: 0.95 }, '-=0.7')
        .from('[data-about-hero="plate"]', { opacity: 0, x: 48, duration: 1.3 }, 0.25)

      gsap.to('[data-about-hero="plate-inner"]', {
        yPercent: -9,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [sectionRef])
}

export default function AboutHero() {
  const sectionRef = useRef(null)
  useAboutHeroMotion(sectionRef)

  return (
    <section
      ref={sectionRef}

      className="relative isolate overflow-clip bg-white pt-6 pb-16 sm:pt-10 sm:pb-24"
    >

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(110%_70%_at_50%_0%,black,transparent_75%)]"
      />

      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">

        <div data-about-hero="kicker">
          <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] tracking-[0.2em] text-muted uppercase">
            <span className="flex items-center gap-3 text-ink">
              <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                <span className="block h-[2px] w-3 bg-brand-600" />
                <span className="block h-[2px] w-1.5 bg-brand-600/40" />
              </span>
              About us
            </span>
            <span className="hidden sm:block">{siteConfig.address}</span>
          </div>

          <div aria-hidden="true" className="h-px bg-ink/15 lg:-mr-10 xl:-mr-20" />
        </div>

        <div className="mt-10 grid items-start gap-y-14 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-6">
            <h1
              data-about-hero="headline"
              className="font-sans text-[2.75rem] leading-[0.98] font-extrabold tracking-[-0.025em] text-balance text-ink sm:text-6xl lg:text-[4.25rem]"
            >
              Made for industry.
              <br className="hidden sm:block" />{' '}
              <span className="text-brand-600">Held in Kathmandu.</span>
            </h1>

            <p
              data-about-hero="sub"
              className="mt-7 max-w-[52ch] text-base leading-relaxed text-pretty text-ink/75 sm:text-lg"
            >
              Thermax makes chemistry for industry. The MV Dugar Group holds it
              here, quotes it, specifies it against your mix, and goes to site
              when the substrate turns out not to match the drawing.
            </p>

            <dl data-about-hero="facts" className="mt-10 flex flex-wrap items-center">
              <span
                aria-hidden="true"
                className="mr-4 block h-[2px] w-3 shrink-0 bg-brand-600"
              />
              {FACTS.map(({ term, value }, i) => (
                <div
                  key={term}
                  className={cn(
                    'flex items-baseline gap-2.5 py-1 whitespace-nowrap',
                    i > 0 && 'ml-5 border-l border-ink/15 pl-5',
                  )}
                >
                  <dt className="font-mono text-[0.625rem] tracking-[0.18em] text-ink/40 uppercase">
                    {term}
                  </dt>
                  <dd className="text-[0.9375rem] leading-snug font-semibold text-ink tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

          </div>

          <div
            data-about-hero="plate"
            className="lg:col-span-6 lg:h-full lg:-mr-10 lg:self-stretch xl:-mr-20"
          >
            <figure className="relative overflow-hidden bg-ink/5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)] lg:h-full">

              <div
                data-about-hero="plate-inner"
                className="relative h-[19rem] will-change-transform sm:h-[26rem] lg:absolute lg:inset-0 lg:h-full"
              >
                <img
                  src={platePeople}
                  width={2048}
                  height={1536}
                  fetchPriority="high"
                  decoding="async"
                  alt="The Kali Gandaki hydropower dam in Nepal, its spillway gates holding back a turquoise reservoir in a steep river gorge"
                  className="absolute inset-0 h-[112%] w-full object-cover object-[50%_50%]"
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
              />
              <figcaption className="absolute bottom-4 left-5 flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
                <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-500" />
                Kali Gandaki — hydropower dam
              </figcaption>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
              />
            </figure>
          </div>
        </div>

        <div data-about-hero="lines" className="mt-18 lg:-mr-10 xl:-mr-20 lg:mt-20">

          <div className="flex items-end justify-end gap-6 pb-4 font-mono text-[0.8125rem] tracking-[0.2em] text-muted uppercase">
            <Link
              to="/services"
              className="flex items-center gap-2 transition-colors duration-300 hover:text-brand-600"
            >
              Full catalogue
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div aria-hidden="true" className="h-px bg-ink/15" />

          <ul className="grid list-none grid-cols-1 divide-y divide-ink/10 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0">
            {services.map(({ slug, code, title }, i) => (
              <li
                key={slug}
                className={cn(
                  i % 2 === 1 && 'sm:border-l sm:border-ink/12',
                  i > 0 && 'lg:border-l lg:border-ink/12',
                )}
              >
                <Link
                  to="/services"
                  className={cn(
                    'group/line flex h-full flex-col gap-2.5 py-5 transition-colors duration-300',
                    i % 2 === 1 && 'sm:pl-6',
                    i > 0 && 'lg:pl-6',
                  )}
                >
                  <span className="font-mono text-[0.625rem] tracking-[0.2em] text-ink/45 uppercase">
                    {code}
                  </span>
                  <span className="flex items-center gap-2.5 text-[0.9375rem] leading-snug font-semibold text-pretty text-ink transition-colors duration-300 group-hover/line:text-brand-600">
                    {title}
                    <span
                      aria-hidden="true"
                      className="shrink-0 leading-none text-ink/30 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/line:translate-x-1 group-hover/line:text-brand-600"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
