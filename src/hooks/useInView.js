import { useEffect, useState } from 'react'

/**
 * Whether the referenced element is currently in (or near) the viewport.
 *
 * Exists for the two things on this site that keep the compositor busy for as
 * long as they're mounted rather than for as long as they're visible: the hero
 * video and the certification marquee. Neither is throttled by the browser when
 * it scrolls out of frame — a muted autoplaying video keeps decoding every
 * frame, and an infinite CSS animation keeps compositing its layer — so both
 * were spending the entire session's scroll budget on work nobody could see.
 *
 * Defaults to `true`. If IntersectionObserver is missing, or before the
 * observer's first callback lands, the caller must behave exactly as it did
 * before this hook existed: playing, animating, visible. Nothing here may gate
 * whether content appears.
 *
 * `rootMargin` deliberately overshoots the viewport so the thing being watched
 * is already running by the time its edge arrives.
 */
export default function useInView(ref, { rootMargin = '200px' } = {}) {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return inView
}
