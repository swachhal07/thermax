import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const EASE = 'power3.out'
export const DURATION = 0.9

gsap.defaults({ ease: EASE, duration: DURATION })

gsap.config({ force3D: true })

export function refreshTriggers() {
  ScrollTrigger.refresh()
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export { gsap, ScrollTrigger }
