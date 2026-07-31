import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { watchOnce } from '@/lib/revealOnce'
import { cn } from '@/lib/utils'

/**
 * Entrance reveal: a GSAP tween, fired by the shared reveal observer.
 *
 * The API is unchanged — `from`, `delay`, `as`, `className` all mean what they
 * meant — so every call site across the site keeps working untouched.
 *
 * GSAP still does the moving, and that is the half worth keeping: it interpolates
 * the whole distance itself, so the movement can be longer and softer than a CSS
 * transition without going sludgy at the end.
 *
 * ScrollTrigger no longer does the firing. This component is instantiated ~50
 * times across the site, and every trigger joins ScrollTrigger's shared
 * measurement pass — see lib/revealOnce.js for why that made navigation hitch and
 * what replaced it.
 */

/* Start offsets per direction. Deliberately small — a reveal that travels far
   reads as the page assembling itself, which is the thing that makes scroll
   animation feel cheap. 24px of vertical travel is felt but not watched. */
const FROM = {
  below: { y: 24, x: 0 },
  left: { x: -36, y: 0 },
  right: { x: 36, y: 0 },
}

/**
 * `delay` stays in milliseconds so it still reads like CSS at the call site
 * (`delay={i * 90}`), and is converted to GSAP's seconds here. Use it to stagger
 * the items of one list — not to choreograph whole sections against each other.
 *
 * `as` renders a different element when a plain <div> would be wrong inside its
 * parent (a list item, a table row).
 */
export default function Rise({
  as: Tag = 'div',
  from = 'below',
  delay = 0,
  className,
  children,
  ...props
}) {
  const ref = useRef(null)

  /* useLayoutEffect, not useEffect: this runs before the browser paints, so the
     element is set to its hidden state in the same frame it mounts and there is
     no flash of the finished layout. The markup itself carries no hidden state —
     if this effect never runs (JS fails, GSAP fails to load), the content is
     simply visible. A reveal is allowed to fail; a blank section is not. */
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced motion gets the end state, which is also the markup's natural
    // state — so there is nothing to do at all. No shortened tween, no fade.
    if (prefersReducedMotion()) return

    const offset = FROM[from] ?? FROM.below

    const ctx = gsap.context(() => {
      /* Hidden state goes on now, in the layout effect, so it lands before the
         browser paints and there is no flash of the finished block. */
      gsap.set(el, { opacity: 0, ...offset })
    }, el)

    /* Observation waits one frame, and that delay is load-bearing. An observer
       reports against the scroll position as it is when observation starts; on a
       route change these components mount while the window is still scrolled to
       wherever the previous page was left, and useScrollToTop doesn't reset it
       until its own (passive) effect runs. Observing in that window means a block
       halfway down the new page gets judged against a scroll position that's
       about to be thrown away — and since each element is unobserved the moment
       it fires, that verdict is final: the block is left permanently
       pre-revealed. One frame is enough for React to have flushed the scroll
       reset. */
    let stop = null
    let frame = requestAnimationFrame(() => {
      frame = 0
      stop = watchOnce(el, () => {
        ctx.add(() => {
          gsap.to(el, {
            opacity: 1,
            x: 0,
            y: 0,
            delay: delay / 1000,
            /* Hands the element back to the stylesheet once it has arrived,
               rather than leaving an inline transform and opacity on it for the
               life of the page. */
            clearProps: 'opacity,transform',
          })
        })
      })
    })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      stop?.()
      ctx.revert()
    }
  }, [from, delay])

  return (
    <Tag ref={ref} className={cn(className)} {...props}>
      {children}
    </Tag>
  )
}
