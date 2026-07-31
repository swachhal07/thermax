import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { refreshTriggers } from '@/lib/gsap'

/**
 * SPAs don't reset scroll on navigation. Jump to top on route change, or to
 * the anchored section when the URL carries a hash (e.g. /about#quality).
 *
 * Also the point where ScrollTrigger is told to re-measure. A route change
 * replaces the document's entire contents and therefore its height, so every
 * start and end position on the page was measured against a document that no
 * longer exists.
 *
 * This used to be the most expensive moment on the site: entrance reveals were
 * ScrollTriggers too, ~50 of them, and refreshing forced all fifty to re-measure
 * in one synchronous layout pass on every navigation. The reveals now run on a
 * shared IntersectionObserver (see Rise), which has nothing to re-measure, so
 * what this refreshes is the handful of genuinely scroll-linked animations —
 * currently one, the About plate's parallax.
 */
export default function useScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Smooth scrolling is not set globally in CSS — as a property on <html> it
    // applies to every programmatic scroll and has no reduced-motion escape
    // hatch. Requested here instead, where the preference can be checked.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)

    /* Deferred by a frame for the same reason Rise defers its trigger: the new
       page's blocks register themselves during their own mount, and refreshing
       before they exist would re-measure only the outgoing page. Lazy routes
       arrive later still, but each block measures itself correctly on mount —
       this pass is what corrects the ones already standing when the height
       around them changed. */
    const frame = requestAnimationFrame(refreshTriggers)
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
}
