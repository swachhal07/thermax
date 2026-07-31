import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { watchOnce } from '@/lib/revealOnce'
import { cn } from '@/lib/utils'

/**
 * A figure that counts up when it scrolls into view.
 *
 * Three decisions worth knowing about, because the naive version of this
 * component gets all three wrong:
 *
 * 1. THE TWEEN DOES NOT GO THROUGH REACT. Animating a number with `useState`
 *    means sixty renders a second for as long as it runs, and on a row of four
 *    counters that's a reconciliation pass per frame per figure to change one
 *    text node. GSAP tweens a plain object and writes `textContent` directly.
 *
 * 2. THE FINAL VALUE IS WHAT'S IN THE MARKUP. The element renders its real
 *    figure and the layout effect winds it back to the start before the browser
 *    paints. If JavaScript never runs, or GSAP fails to load, the visitor sees
 *    the number — not a zero, and not a blank. Same rule as Rise: the animation
 *    is allowed to fail, the content is not.
 *
 * 3. THE BOX DOESN'T RESIZE AS DIGITS ARRIVE. Counting 0 → 247 takes the text
 *    from one character to three, and anything laid out next to it moves twice
 *    on the way. `tabular-nums` makes every digit the same width, and a
 *    `min-width` in `ch` — which in a monospace face is exactly one digit —
 *    reserves the finished width from the first frame.
 *
 * Screen readers get the real figure from a visually hidden span; the animating
 * one is hidden from them. No `aria-live`: a number announced sixty times is
 * hostile, and mid-tween it is also wrong.
 */
/* Module scope, not a closure inside the component. As a closure it would be a
   new function on every render, which makes it a dependency the layout effect
   below can never satisfy — and re-running that effect restarts the count. */
function format(n, group, suffix) {
  return `${group ? n.toLocaleString('en-US') : String(n)}${suffix}`
}

/* Worth knowing if this file is ever edited with the dev server up: when this
   component was first added, the running Vite server had not regenerated its
   stylesheet to include a brand-new source file, so `sr-only` below resolved to
   nothing, the hidden figure rendered beside the visible one, and every counter
   printed its number twice — `19981998`. The rule is in the compiled CSS and the
   markup was never wrong. If a utility appears to do nothing in dev, restart the
   server before believing it. */

export default function Counter({
  value,
  /* Where the count starts. Zero for a tally, but a year is not a tally — 1998
     counted up from nothing reads as a number reaching a total rather than as a
     date settling, so a year passes its own floor in. */
  from = 0,
  /** Printed after the figure, inside the animated span so it can't drift. */
  suffix = '',
  /* Thousands separators. On by default, and off for years — `1998` grouped is
     `1,998`, which is not a date. */
  group = true,
  duration = 1.8,
  className,
}) {
  const ref = useRef(null)

  const target = Number(value)
  const text = format(target, group, suffix)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !Number.isFinite(target)) return

    // The end state is already in the DOM, so reduced motion has nothing to do.
    if (prefersReducedMotion()) return

    const proxy = { n: from }

    const ctx = gsap.context(() => {
      /* Wound back to the start value here, in the layout effect, so it lands
         before the first paint and the figure is never seen at its total and
         then reset. */
      el.textContent = format(Math.round(from), group, suffix)
    }, el)

    /* Fired by the shared reveal observer rather than a ScrollTrigger of its own
       — same line, same reason as Rise (lib/revealOnce.js). Deferred a frame for
       the same reason too: on a route change this mounts while the window is
       still scrolled to wherever the last page was left, and a figure judged
       against that position counts itself up where nobody is looking and is sat
       at its total by the time the visitor arrives. */
    let stop = null
    let frame = requestAnimationFrame(() => {
      frame = 0
      stop = watchOnce(el, () => {
        ctx.add(() => {
          gsap.to(proxy, {
            n: target,
            duration,
            ease: 'power2.out',
            /* Deliberately not the house `power3.out`: that curve spends its last
               third barely moving, which is right for a block sliding into place
               and wrong for a number, where it reads as the count stalling short
               of the total. */
            onUpdate: () => {
              el.textContent = format(Math.round(proxy.n), group, suffix)
            },
            /* Guarantees the exact figure at the end. Rounding the eased value on
               the final frame can land a digit low. */
            onComplete: () => {
              el.textContent = text
            },
          })
        })
      })
    })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      stop?.()
      ctx.revert()
    }
  }, [target, from, suffix, group, duration, text])

  return (
    <>
      <span
        ref={ref}
        aria-hidden="true"
        className={cn('inline-block tabular-nums', className)}
        /* In a monospace face 1ch is one digit, so this is the finished width to
           the character — including the suffix, which is why `text` is measured
           rather than the number. */
        style={{ minWidth: `${text.length}ch` }}
      >
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </>
  )
}
