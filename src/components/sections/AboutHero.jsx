import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/siteConfig'
/* Resized from DJI_0341.jpg, 5464×3640 and 16.8MB straight off the drone, to
   1920w webp at 480KB. This is the about page's LCP image — the original would
   have been roughly thirty-five times the weight of every other asset on the
   page put together. The drone originals stay in the folder as masters; none of
   them should ever be imported directly. */
import plateHeadworks from '@/assets/images/about-hydro-aerial.webp'

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
              className="font-sans text-[clamp(2.25rem,4.4vw,4rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-ink"
            >
              <span className="block">Made for industry.</span>
              <span className="block text-brand-600">Held in Nepal.</span>
            </h1>

            <p
              data-about-hero="sub"
              className="mt-7 max-w-[52ch] text-base leading-relaxed text-pretty text-ink/75 sm:text-lg"
            >
              Thermax has spent decades formulating construction chemistry for
              industry — admixtures, waterproofing, grouts and anchors, repair
              systems, protective coatings, surface treatment. One of India’s
              leading manufacturers in the field, producing across multiple
              plants, with a technical data sheet and batch documentation behind
              every drum. That is the chemistry held here in Kathmandu, quoted
              and specified against your mix, and taken to site when the
              substrate turns out not to match the drawing.
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
                  src={plateHeadworks}
                  width={1920}
                  height={1279}
                  fetchPriority="high"
                  decoding="async"
                  alt="A hydropower headworks from the air: a weir spilling into a Himalayan river beside twin desilting basins and their gates, cut into a forested gorge"
                  className="absolute inset-0 h-[112%] w-full object-cover object-[50%_50%]"
                />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
              />
            </figure>
          </div>
        </div>

        <div data-about-hero="lines" className="mt-10 lg:mt-12 lg:-mr-10 xl:-mr-20">

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

          <ul className="grid list-none grid-cols-1 divide-y divide-ink/10 p-0 sm:grid-cols-2 lg:grid-cols-5 lg:divide-y-0">
            {services.map(({ slug, code, title }, i) => (
              <li
                key={slug}
                className={cn(
                  'relative',
                  i % 2 === 1 && 'sm:border-l sm:border-ink/12',
                  i > 0 && 'lg:border-l lg:border-ink/12',
                )}
              >
                <Link
                  to="/services"
                  className={cn(
                    'group/line flex h-full flex-col gap-3 py-6 lg:min-h-[7.5rem]',
                    i % 2 === 1 && 'sm:pl-6',
                    i > 0 && 'lg:pl-6',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute top-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-brand-600',
                      'transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/line:scale-x-100',
                      'motion-reduce:transition-none',
                    )}
                  />

                  <span className="font-mono text-[0.625rem] tracking-[0.2em] text-ink/45 uppercase transition-colors duration-300 group-hover/line:text-brand-600">
                    {code}
                  </span>

                  <span className="mt-auto flex items-start gap-2.5 text-[0.9375rem] leading-snug font-semibold text-pretty text-ink transition-colors duration-300 group-hover/line:text-brand-600">
                    {title}
                    <svg
                      viewBox="0 0 22 10"
                      aria-hidden="true"
                      className="mt-[0.35em] h-2 w-4 shrink-0 text-ink/25 transition-[transform,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/line:translate-x-1 group-hover/line:text-brand-600 motion-reduce:transition-none"
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
