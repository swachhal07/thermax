import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Single place GSAP is configured.
 *
 * Everything animated on the site pulls `gsap` and `ScrollTrigger` from here
 * rather than from the package, for two reasons: the plugin gets registered
 * exactly once (registering per module is harmless but easy to forget, and a
 * missed registration fails at runtime, not at build), and the shared defaults
 * below are the reason separate sections read as one piece of motion instead of
 * a dozen components each easing differently.
 *
 * ScrollTrigger is the only plugin. Nothing here needs ScrollSmoother or
 * SplitText — both are Club plugins and neither earns its weight on a marketing
 * site whose slowest moment is a video decode.
 */

gsap.registerPlugin(ScrollTrigger)

/* The house curve. A long, front-loaded ease: quick to leave, slow to settle —
   the same cubic-bezier(0.32, 0.72, 0, 1) the hover and accordion transitions
   in CSS already use, so GSAP-driven motion and CSS-driven motion match. */
export const EASE = 'power3.out'
export const DURATION = 0.9

gsap.defaults({ ease: EASE, duration: DURATION })

/* Sub-pixel transforms on text are the difference between a reveal that glides
   and one that visibly steps. Costs nothing — it only stops GSAP rounding. */
gsap.config({ force3D: true })

/* Route changes swap the whole document under ScrollTrigger's feet: every
   trigger's start/end was measured against a page that no longer exists. One
   refresh after the new page has laid out re-measures all of them at once,
   which is much cheaper than each trigger doing it on scroll. */
export function refreshTriggers() {
  ScrollTrigger.refresh()
}

/**
 * True when the visitor has asked for less motion.
 *
 * Read at animation-setup time rather than cached at module scope, so toggling
 * the OS preference mid-session is respected on the next setup.
 */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export { gsap, ScrollTrigger }
