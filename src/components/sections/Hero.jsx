import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowButton from '@/components/ui/ArrowButton'
import useInView from '@/hooks/useInView'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { siteConfig } from '@/lib/siteConfig'
import { cn } from '@/lib/utils'
import tunnelImage from '@/assets/images/hero-tunnel.jpg'
import hydroImage from '@/assets/images/hero-hydro.jpg'
import roadImage from '@/assets/images/hero-road.webp'
import surveyImage from '@/assets/images/hero-survey.jpg'

const SLIDES = [
  { src: tunnelImage, label: 'Tunnelling', note: 'Shotcrete · grouts · waterproofing' },
  { src: hydroImage, label: 'Hydropower', note: 'Admixtures · repair systems' },
  { src: roadImage, label: 'Roads & bridges', note: 'Curing compounds · sealants' },
  { src: surveyImage, label: 'Survey & design', note: 'Specification support on site' },
]

const SLIDE_MS = 6500
const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

// Two-line lockup, split near the middle so neither line dominates.
function headlineLines(text) {
  const words = text.trim().split(/\s+/)
  if (words.length < 3) return [words.join(' ')]
  const at = Math.floor(words.length / 2)
  return [words.slice(0, at).join(' '), words.slice(at).join(' ')]
}

function useHeroSlides(active) {
  const [index, setIndex] = useState(0)
  const [held, setHeld] = useState(false)
  const running = active && !held

  useEffect(() => {
    if (!running || prefersReducedMotion() || SLIDES.length < 2) return

    const id = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length)
    }, SLIDE_MS)

    return () => clearInterval(id)
  }, [running])

  return { index, setIndex, running, setHeld }
}

function useHeroMotion(sectionRef) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { duration: 1.25, ease: 'power3.out' } })
        .from('[data-hero="line"]', { opacity: 0, yPercent: 105, stagger: 0.11 })
        .from('[data-hero="cta"]', { opacity: 0, y: 16 }, '-=0.95')
        .from('[data-hero="rail"]', { opacity: 0, y: 26 }, '-=1.05')
    }, section)

    return () => ctx.revert()
  }, [sectionRef])
}

export default function Hero() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { rootMargin: '150px' })
  const { index, setIndex, running, setHeld } = useHeroSlides(inView)
  const lines = headlineLines(siteConfig.heroHeadline)

  useHeroMotion(sectionRef)

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-ink"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            width={1920}
            height={1080}
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading="eager"
            decoding="async"
            className={cn(
              'absolute inset-0 h-full w-full object-cover will-change-transform',
              'transition-opacity duration-[1800ms] motion-reduce:transition-none',
              EASE,
              i === index
                ? 'animate-drift opacity-100 motion-reduce:animate-none'
                : 'scale-[1.04] opacity-0',
              !running && '[animation-play-state:paused]',
            )}
          />
        ))}
      </div>

      {/* Grade in two parts: an even floor so no slide is ever fully bright, plus a
          soft scrim centred on the type — the photos vary too much for a fixed ramp. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,10,13,0.88)_0%,rgba(8,10,13,0.55)_18%,rgba(8,10,13,0.34)_46%,rgba(8,10,13,0.34)_68%,rgba(8,10,13,0.6)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(68%_46%_at_50%_44%,rgba(8,10,13,0.55),rgba(8,10,13,0.22)_58%,transparent_78%)]"
      />
      <div
        aria-hidden="true"
        className="field-grain-on-black pointer-events-none absolute inset-0 -z-10 opacity-60 mix-blend-overlay"
      />

      <div className="relative flex w-full flex-1 flex-col items-center justify-center px-5 pb-8 pt-28 text-center sm:px-8 lg:px-16 lg:pb-10 lg:pt-32">
        <h1 className="font-sans text-[clamp(1.9375rem,4.8vw,5rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-white [text-shadow:0_2px_28px_rgb(0_0_0/0.5)]">
          {lines.map((line, i) => (
            // pb clears the descender inside the reveal mask; -mb cancels it so the
            // tight leading is unchanged.
            <span key={`${line}-${i}`} className="-mb-[0.34em] block overflow-hidden pb-[0.34em]">
              <span data-hero="line" className="block">
                {line}
                {i === lines.length - 1 && <span className="text-brand-500">.</span>}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-9 sm:mt-10">
          <div data-hero="cta" className="flex flex-wrap items-center justify-center gap-6">
            <ArrowButton to="/services">What we supply</ArrowButton>

            <Link
              to="/contact"
              className="group inline-flex items-center gap-2.5 font-sans text-sm font-medium text-white/75 transition-colors duration-500 hover:text-white"
            >
              Talk to a specialist
              <span
                aria-hidden="true"
                className={cn(
                  'block h-px w-6 origin-left bg-white/40 transition-all duration-500 group-hover:w-9 group-hover:bg-white',
                  EASE,
                )}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Baseline index — the slideshow control, read as an editorial contents rail. */}
      <div
        data-hero="rail"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        className="relative w-full px-5 pb-8 sm:px-8 lg:px-16 lg:pb-10"
      >
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 sm:gap-x-8 lg:gap-x-12">
          {SLIDES.map((slide, i) => {
            const current = i === index
            return (
              <li key={slide.label}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={current}
                  className="group relative block w-full pt-4 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-0 top-0 h-px transition-colors duration-500',
                      current ? 'bg-white/30' : 'bg-white/15 group-hover:bg-white/35',
                    )}
                  />
                  {current && (
                    <span
                      key={running ? `${i}-run` : `${i}-hold`}
                      aria-hidden="true"
                      style={{ '--rail': `${SLIDE_MS}ms` }}
                      className={cn(
                        'absolute inset-x-0 top-0 h-px origin-left bg-brand-500',
                        running ? 'animate-rail motion-reduce:animate-none' : 'scale-x-100',
                      )}
                    />
                  )}

                  <span
                    className={cn(
                      'font-mono text-[10px] tabular-nums transition-colors duration-500',
                      current ? 'text-brand-400' : 'text-white/40',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span
                    className={cn(
                      'mt-1.5 block font-sans text-sm transition-colors duration-500 sm:text-[0.9375rem]',
                      current ? 'text-white' : 'text-white/60 group-hover:text-white/85',
                    )}
                  >
                    {slide.label}
                  </span>

                  <span
                    className={cn(
                      'mt-1 hidden font-sans text-xs leading-snug transition-opacity duration-700 sm:block',
                      EASE,
                      current ? 'text-white/45 opacity-100' : 'text-white/45 opacity-0',
                    )}
                  >
                    {slide.note}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
