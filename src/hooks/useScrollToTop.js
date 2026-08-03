import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { refreshTriggers } from '@/lib/gsap'

export default function useScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)

    const frame = requestAnimationFrame(refreshTriggers)
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
}
