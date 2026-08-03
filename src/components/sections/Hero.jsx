import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Container from '@/components/ui/Container'
import useInView from '@/hooks/useInView'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { siteConfig } from '@/lib/siteConfig'
import { cn } from '@/lib/utils'
import heroPoster from '@/assets/hero-poster.jpg'

const VIDEO_DESKTOP = '/hero.mp4'
const VIDEO_MOBILE = '/hero-mobile.mp4'

function useHeroVideo() {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const small = window.matchMedia('(max-width: 767px)')
    const canIdle = typeof window.requestIdleCallback === 'function'
    let handle = 0
    let done = false

    const pick = () => {
      done = true
      setSrc(motion.matches ? null : small.matches ? VIDEO_MOBILE : VIDEO_DESKTOP)
    }

    const start = () => {
      handle = canIdle ? requestIdleCallback(pick, { timeout: 2500 }) : setTimeout(pick, 1200)
    }

    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })

    const repick = () => done && pick()
    motion.addEventListener('change', repick)
    small.addEventListener('change', repick)

    return () => {
      window.removeEventListener('load', start)
      if (canIdle) cancelIdleCallback(handle)
      else clearTimeout(handle)
      motion.removeEventListener('change', repick)
      small.removeEventListener('change', repick)
    }
  }, [])

  return src
}

function useHeroMotion(sectionRef) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { duration: 1.1, ease: 'power3.out' } })
        .from('[data-hero="badge"]', { opacity: 0, y: 16, duration: 0.8 })
        .from('[data-hero="headline"]', { opacity: 0, y: 34 }, '-=0.55')
        .from('[data-hero="sub"]', { opacity: 0, y: 22 }, '-=0.85')
    }, section)

    return () => ctx.revert()
  }, [sectionRef])
}

export default function Hero() {
  const videoSrc = useHeroVideo()
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const [videoPainting, setVideoPainting] = useState(false)
  const inView = useInView(sectionRef, { rootMargin: '150px' })

  useHeroMotion(sectionRef)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (inView) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [inView, videoSrc])

  useEffect(() => setVideoPainting(false), [videoSrc])

  return (
    <section
      ref={sectionRef}

      className="relative isolate flex min-h-svh items-center overflow-hidden bg-ink"
    >

      <div data-hero="backdrop" aria-hidden="true" className="absolute inset-0 -z-20">

        <img
          src={heroPoster}
          alt=""
          width={1600}
          height={900}
          fetchPriority="high"
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            videoPainting && '[content-visibility:hidden]',
          )}
        />

        {videoSrc && (
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            poster={heroPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            onCanPlay={() => setVideoPainting(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_50%,rgba(0,0,0,0.35),transparent_75%),linear-gradient(to_bottom,rgba(0,0,0,0.45),rgba(0,0,0,0.25),rgba(0,0,0,0.45))]"
      />

      <Container className="relative py-24">
                <div className="mx-auto max-w-4xl text-center">
          <div data-hero="badge">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {siteConfig.heroBadge}
            </p>
          </div>

          <div data-hero="headline">
            <h1 className="mt-7 font-sans text-5xl font-extrabold leading-[0.95] tracking-[-0.02em] text-balance text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.35)] sm:text-7xl lg:text-8xl">
              {siteConfig.heroHeadline}
            </h1>
          </div>

          <div data-hero="sub">
            <p className="mx-auto mt-7 max-w-xl text-base text-white/70 [text-shadow:0_1px_3px_rgb(0_0_0/0.35)] sm:text-lg">
              {siteConfig.heroSubheadline}
            </p>
          </div>
        </div>
      </Container>

    </section>
  )
}
