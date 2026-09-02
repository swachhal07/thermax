import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowButton from '@/components/ui/ArrowButton'
import useInView from '@/hooks/useInView'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { siteConfig } from '@/lib/siteConfig'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
// The backdrop is not decorative: every plate belongs to one of the applications
// in the index below it, so the photo and the highlighted name always agree. An
// application may hold several plates — they play through in order before the
// index moves on to the next name. The list is shared with the sector grid
// further down the page, so a swap here shows up in both places.
import { PLATES } from '@/data/plates'

const SLIDES = services.filter((s) => PLATES[s.slug]?.length)

// Flattened play order. `slideIndex` maps a frame back to the name it belongs to.
const FRAMES = SLIDES.flatMap((slide, slideIndex) =>
  PLATES[slide.slug].map((src, i) => ({ src, slide, slideIndex, key: `${slide.slug}-${i}` })),
)

// Where each name's run begins, so hovering it starts from that first plate.
const FIRST_FRAME = SLIDES.map((slide) => FRAMES.findIndex((f) => f.slide === slide))

const SLIDE_MS = 6500
const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

// Two-line lockup, split near the middle so neither line dominates.
function headlineLines(text) {
  const words = text.trim().split(/\s+/)
  if (words.length < 3) return [words.join(' ')]
  const at = Math.floor(words.length / 2)
  return [words.slice(0, at).join(' '), words.slice(at).join(' ')]
}

// Autoplay stops while the hero is off-screen or while a pointer rests on the
// index. Keying on index too means a manual pick restarts the dwell rather than
// inheriting whatever was left of the previous one.
function useHeroSlides(running) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!running || prefersReducedMotion() || FRAMES.length < 2) return

    const id = setTimeout(() => {
      setIndex((current) => (current + 1) % FRAMES.length)
    }, SLIDE_MS)

    return () => clearTimeout(id)
  }, [running, index])

  return [index, setIndex]
}

// On narrow screens the index is wider than the viewport, so autoplay would walk
// the active name off-screen. Scroll the row itself — scrollIntoView would drag
// the whole page with it.
function useIndexFollow(rowRef, index) {
  useEffect(() => {
    const row = rowRef.current
    if (!row || row.scrollWidth <= row.clientWidth + 4) return

    const item = row.children[index]
    if (!item) return

    row.scrollTo({
      left: item.offsetLeft - (row.clientWidth - item.clientWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [rowRef, index])
}

// Ten full-bleed plates fetched at once starve the first one — the LCP — and
// mount ten compositor layers before anything has moved. Worse, they used to
// accumulate: by the end of one pass all ten were live, ~86MB of decoded bitmap
// in stacked full-viewport layers that the compositor carries on every frame
// whether or not any of it is visible. Hold a sliding window instead — the plate
// on screen, the one fading out behind it, and the one after. Anything else is
// evicted; by the time a plate is needed again it has had a full dwell to arrive
// and it comes back from cache.
const WINDOW = 3

function useMountedFrames(index) {
  const [mounted, setMounted] = useState(() => [0, 1 % FRAMES.length])

  useEffect(() => {
    setMounted((prev) => {
      const next = (index + 1) % FRAMES.length
      if (prev.length <= WINDOW && prev[0] === index && prev[1] === next) return prev

      // Oldest goes first, so the plate pushed on the previous change — the one
      // still mid-crossfade — survives exactly one more turn. Slots always land
      // in this order: [on screen, preloading, fading out].
      const keep = prev.filter((i) => i !== index && i !== next)
      return [index, next, ...keep].slice(0, WINDOW)
    })
  }, [index])

  return mounted
}

function useHeroMotion(sectionRef) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { duration: 1.3, ease: 'power3.out' } })
        .from('[data-hero="line"]', { opacity: 0, yPercent: 106, stagger: 0.12 })
        .from('[data-hero="cta"]', { opacity: 0, y: 16 }, '-=1')
        .from('[data-hero="index"]', { opacity: 0, y: 20, duration: 1 }, '-=1.05')
    }, section)

    return () => ctx.revert()
  }, [sectionRef])
}

export default function Hero() {
  const sectionRef = useRef(null)
  const rowRef = useRef(null)
  const [resting, setResting] = useState(false)
  const inView = useInView(sectionRef, { rootMargin: '150px' })
  const [index, setIndex] = useHeroSlides(inView && !resting)
  const lines = headlineLines(siteConfig.heroHeadline)
  const activeSlide = FRAMES[index].slideIndex

  // Slot 2 is the plate on its way out — see useMountedFrames.
  const mounted = useMountedFrames(index)
  const [, , outgoing] = mounted

  useHeroMotion(sectionRef)
  useIndexFollow(rowRef, activeSlide)

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-ink"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        {FRAMES.map((frame, i) => {
          if (!mounted.includes(i)) return null
          const on = i === index
          // The plate mid-fade-out keeps drifting. Dropping the animation the
          // instant it stopped being current snapped its transform from wherever
          // the zoom had got to back to the resting scale — a visible jolt at the
          // start of every crossfade, while it was still fully opaque.
          const drifting = on || i === outgoing

          return (
            <img
              key={frame.key}
              src={frame.src}
              alt=""
              width={1920}
              height={1080}
              fetchPriority={i === 0 ? 'high' : 'low'}
              loading="eager"
              decoding="async"
              style={{ objectPosition: frame.slide.focus }}
              className={cn(
                'absolute inset-0 h-full w-full object-cover',
                'transition-opacity duration-[1600ms] motion-reduce:transition-none',
                EASE,
                on ? 'opacity-100' : 'opacity-0',
                // will-change matters on the drifting plates specifically. A
                // scale animation on a full-viewport image without it lets Chrome
                // re-rasterise 1.3MP as the scale changes, which is the jank;
                // with it the layer is rastered once at the animation's peak
                // scale and the compositor just transforms it. At most two plates
                // hold a layer at a time — the zoom and the one fading out.
                drifting
                  ? 'animate-drift will-change-transform motion-reduce:animate-none'
                  : 'scale-[1.04]',
                !inView && '[animation-play-state:paused]',
              )}
            />
          )
        })}
      </div>

      {/* Light hand: an even floor so no plate is ever fully bright, plus a soft
          scrim centred on the type. The photos should still read as photos.
          Both live in one element — as two they were two full-viewport paint
          layers stacked over the plate for no visual difference. Radial is listed
          first because background layers paint front to back. */}
      {/* The grain rides on this same element. Plain opacity, not
          mix-blend-overlay: a blended full-viewport layer has to recomposite
          against the plate beneath it on every frame of the drift. 0.025 is what
          the old 0.055 tile at opacity-45 came to. */}
      <div
        aria-hidden="true"
        className="field-grain-on-black pointer-events-none absolute inset-0 -z-10 [--grain-opacity:0.025] [background-image:radial-gradient(64%_44%_at_50%_46%,rgba(8,10,13,0.5),rgba(8,10,13,0.18)_60%,transparent_80%),linear-gradient(to_top,rgba(8,10,13,0.8)_0%,rgba(8,10,13,0.34)_20%,rgba(8,10,13,0.22)_52%,rgba(8,10,13,0.44)_100%)]"
      />

      {/* ── Lockup, centred ──────────────────────────────────────────────── */}
      {/* Top padding runs heavier than the bottom: it clears the fixed header and
          drops the lockup below the true middle, where it reads better. */}
      <div className="relative flex w-full flex-1 flex-col items-center justify-center px-5 pb-28 pt-36 text-center sm:px-8 lg:px-16 lg:pb-36 lg:pt-44">
        <div className="w-full max-w-[72rem]">
          <h1 className="font-sans text-[clamp(2.125rem,5.9vw,5rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-white [text-shadow:0_2px_32px_rgb(0_0_0/0.5)]">
            {lines.map((line, i) => (
              // pb clears the descender inside the reveal mask; -mb cancels it
              // so the tight leading is unchanged.
              <span key={`${line}-${i}`} className="-mb-[0.34em] block overflow-hidden pb-[0.34em]">
                <span data-hero="line" className="block">
                  {line}
                  {/* Zero-width so the period hangs into the right margin instead
                      of dragging this line off the axis the line above sits on. */}
                  {i === lines.length - 1 && (
                    <span aria-hidden="true" className="inline-block w-0 text-brand-600">
                      .
                    </span>
                  )}
                </span>
              </span>
            ))}
          </h1>

          <div
            data-hero="cta"
            className="mt-11 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:mt-12"
          >
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

      {/* ── Index: names the plate on screen, and routes to it ───────────── */}
      <div
        data-hero="index"
        onMouseEnter={() => setResting(true)}
        onMouseLeave={() => setResting(false)}
        className="relative border-t border-white/12"
      >
        <div className="mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-10">
          <ul
            ref={rowRef}
            className="flex gap-8 overflow-x-auto lg:justify-between lg:gap-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {SLIDES.map((slide, i) => {
              const on = i === activeSlide
              return (
                // Fixed height, items pinned to the bottom: the name grows in
                // size, so the row's height and every baseline in it have to be
                // held by something other than the type. Only the width of the
                // active item changes, which lets the names either side ease
                // aside as it opens.
                <li key={slide.slug} className="flex h-[5.25rem] shrink-0 items-end">
                  <Link
                    to={`/services/${slide.slug}`}
                    onMouseEnter={() => setIndex(FIRST_FRAME[i])}
                    onFocus={() => {
                      setResting(true)
                      setIndex(FIRST_FRAME[i])
                    }}
                    onBlur={() => setResting(false)}
                    aria-current={on ? 'true' : undefined}
                    /* The size change is real font-size, not a transform. A
                       scaled-up label is a rasterised bitmap stretched 30% —
                       soft edges on the one word the section wants you to read.
                       Growing the type keeps every stage crisp, and confining
                       the reflow to this row is cheap: five inline items, no
                       height change, nothing above it moves. */
                    className={cn(
                      'relative block pb-5 leading-none whitespace-nowrap font-sans transition-[font-size,color,letter-spacing] duration-700',
                      EASE,
                      on
                        ? 'text-[1.25rem] font-semibold tracking-[-0.02em] text-white lg:text-[1.5rem]'
                        : 'text-sm font-normal tracking-normal text-white/45 hover:text-white/85',
                    )}
                  >
                    <span
                      className={cn(
                        'mr-3 font-mono text-[0.625rem] tracking-[0.2em] transition-colors duration-700',
                        EASE,
                        on ? 'text-white' : 'text-white/30',
                      )}
                    >
                      {slide.code}
                    </span>
                    {slide.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
