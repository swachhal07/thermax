import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Container from '@/components/ui/Container'
import useInView from '@/hooks/useInView'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { siteConfig } from '@/lib/siteConfig'
import { cn } from '@/lib/utils'
// Left as the JPEG on purpose: re-encoded to WebP at matching quality this
// frame comes out ~30% LARGER, which is the usual outcome for a noisy
// photographic still at 1600px.
import heroPoster from '@/assets/hero-poster.jpg'

// Served from /public so the browser streams them instead of Vite bundling them
// into the JS graph. Swap the files without touching this component.
//
// 1600×900 at 2.1 Mbps and 960×540 at 0.7 Mbps, 27 seconds, 30 fps, no audio.
// 6.9 MB and 2.3 MB. These are the originals as delivered, and the size is a
// deliberate choice, not an oversight.
//
// A denoised 1280×720 re-encode got the desktop file to 1.7 MB and was rejected
// for looking soft. The reason it shrank so far is the reason it looked soft:
// this footage is noisy, x264 spends most of its bitrate describing that grain,
// and stripping the grain (hqdn3d) is what frees the bits — but the grain is also
// the water texture on the clarifier, so removing it smears the one thing in
// frame that reads as detail. Encoding at native resolution instead does not
// shrink at all: x264 needs MORE bits than the source to hold that much noise, so
// CRF 27 at 1600×900 comes out larger than the file it came from.
//
// So the levers are: this, a softer picture, or a shorter clip. Duration is the
// only one that costs nothing visually — a 10-second loop is the same picture at
// roughly a third of the weight, since the loop point is a hard cut either way.
// Recipes and measurements in media-src/README.md.
//
// This was briefly a YouTube embed and is deliberately back to a self-hosted
// file. The embed cannot be made chrome-free: YouTube draws its video title and
// channel avatar along the top edge, its wordmark and a share button along the
// bottom, and a control overlay dead centre whenever the player isn't playing.
// No embed parameter turns those off — `modestbranding` used to hide the wordmark
// and YouTube removed it in August 2023. Overscaling the iframe crops the top and
// bottom bands but never the centre one. A plain <video> has no chrome at all,
// loops without re-buffering at the seam, decodes in hardware, and costs less than
// the player's own JavaScript.
const VIDEO_DESKTOP = '/hero.mp4'
const VIDEO_MOBILE = '/hero-mobile.mp4'

/**
 * Picks the right video for the viewport, or `null` when the visitor has asked
 * for reduced motion — in that case the poster image stands in and nothing
 * autoplays.
 *
 * Deliberately does NOT resolve on mount. The poster is the largest thing in
 * the first viewport and therefore the LCP element; mounting a <video> in the
 * same tick puts megabytes of stream in front of it on the same connection, and
 * the first paint ends up waiting on bytes that aren't in it. So the source
 * resolves once the page has finished loading and the main thread goes idle.
 * The poster is already on screen by then and the swap is invisible.
 */
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

    // Timeout on the idle request so a permanently busy thread can't hold the
    // video back forever.
    const start = () => {
      handle = canIdle ? requestIdleCallback(pick, { timeout: 2500 }) : setTimeout(pick, 1200)
    }

    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })

    // Once a source is live, a change of viewport or motion preference re-picks
    // immediately — waiting for another idle window would strand the visitor on
    // the wrong file.
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

/**
 * The hero's intro, which is the one place on the site that animates on load
 * rather than on scroll.
 *
 * Badge, headline and paragraph rise in sequence with a heavy overlap — the next
 * line starts while the previous is still settling, so the three read as one
 * gesture rather than three cues. This is the only stagger on the site allowed
 * to be this deliberate; it's the first thing seen and it sets the pace for
 * everything below.
 *
 * There WAS a scrubbed parallax on the backdrop here, and it is deliberately
 * gone. A `scrub: true` trigger writes a transform on the backdrop on every
 * scroll event, and the backdrop is the layer holding the playing video — so the
 * compositor was re-transforming a layer whose texture the decoder replaces 24
 * times a second, for the entire height of the first viewport. Transform-only
 * animation is normally free; it is not free when the layer's contents change
 * underneath it, and this was the single largest cause of the hero scrolling
 * heavily on integrated graphics. Nothing replaces it: the drift was never load-
 * bearing, and a static full-bleed plate costs zero per frame.
 *
 * Deliberately does NOT wait for the video. The intro plays against the poster,
 * which is already painted; gating it on a stream that resolves on idle would
 * leave the first viewport empty for as long as the network takes.
 */
function useHeroMotion(sectionRef) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    /* Scoped to the section, so the selector strings below resolve inside this
       hero and nowhere else, and one revert() cleans it up. */
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
  /**
   * True once the video has enough data to paint a frame of its own.
   *
   * Purely a performance signal, and it changes nothing you can see. The poster
   * is a 1600×900 JPEG sitting directly underneath the video and fully covered by
   * it, so for as long as both are live the browser is holding two full-size
   * textures where one is visible.
   *
   * The poster is not removed, only hidden: it stays the LCP element (it paints
   * first and is what the page is measured on), and the <video> keeps the same
   * file as its own `poster` attribute, so a stream that stalls after `canplay`
   * still shows the frame rather than bare ink.
   */
  const [videoPainting, setVideoPainting] = useState(false)
  // Chrome doesn't stop decoding a muted autoplaying video when it leaves the
  // viewport, so the hero was spending a frame's worth of decode on every frame
  // of the whole page, all the way down to the footer.
  const inView = useInView(sectionRef, { rootMargin: '150px' })

  useHeroMotion(sectionRef)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (inView) {
      // Autoplay can be refused (power saving, data saver). Nothing depends on
      // it succeeding — the poster is underneath — so the rejection is dropped.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [inView, videoSrc])

  /* A source change means a different file has to become paintable again, so the
     poster comes back for the gap rather than the layer briefly showing nothing.
     This fires on the viewport/motion re-pick in useHeroVideo, not on every
     render. */
  useEffect(() => setVideoPainting(false), [videoSrc])

  return (
    <section
      ref={sectionRef}
      /* Full viewport — the fixed header overlays this rather than sitting above it. */
      className="relative isolate flex min-h-dvh items-center overflow-hidden bg-ink"
    >
      {/* Poster and video as one plate, sized to the section exactly.

          Was 18% taller than the section with `will-change-transform`, both of
          which existed only to serve the parallax that used to run here: the
          overhang stopped the bottom edge lifting off the scrim mid-drift, and
          the hint promoted the layer for it. With the drift gone the overhang is
          just 18% more video being decoded off-screen, and the hint is a
          permanent GPU layer for something that never moves. */}
      <div data-hero="backdrop" aria-hidden="true" className="absolute inset-0 -z-20">
        {/* Poster paints immediately; the video covers it once playable.
            Intrinsic size and high fetch priority because this is the LCP.

            `content-visibility: hidden` once the video is painting, rather than
            `display: none` or unmounting: the element keeps its box and stays the
            LCP candidate, but the browser stops carrying its texture. `opacity-0`
            would NOT do — a fully transparent layer is still rasterised. */}
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
            /* `canplay`, not `playing`: the frame is decoded and on screen at
               that point, so hiding the poster underneath cannot flash. */
            onCanPlay={() => setVideoPainting(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* Legibility scrim — even across the frame now that the copy is centered. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/25 to-black/45"
      />

      {/* Tight vignette right behind the headline, kept light — white type needs
          far less help than the brand red did. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_50%,rgba(0,0,0,0.35),transparent_75%)]"
      />

      <Container className="relative py-24">
                <div className="mx-auto max-w-4xl text-center">
          <div data-hero="badge">
            {/* Badge pill. Was frosted; a backdrop-filter sitting on top of a
                playing video is the single most expensive thing on the page —
                the blurred region has to be recomputed for every decoded frame,
                forever. A flat scrim of its own does the same legibility job
                against any frame, for nothing. */}
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {siteConfig.heroBadge}
            </p>
          </div>

          {/* Bold grotesque, not the display serif. Short headline, so it can run
              much larger than the old four-line one. */}
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
