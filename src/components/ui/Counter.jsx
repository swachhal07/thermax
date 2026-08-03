import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { watchOnce } from '@/lib/revealOnce'
import { cn } from '@/lib/utils'

function format(n, group, suffix) {
  return `${group ? n.toLocaleString('en-US') : String(n)}${suffix}`
}

export default function Counter({
  value,
  from = 0,
  suffix = '',
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

    if (prefersReducedMotion()) return

    const proxy = { n: from }

    const ctx = gsap.context(() => {
      el.textContent = format(Math.round(from), group, suffix)
    }, el)

    let stop = null
    let frame = requestAnimationFrame(() => {
      frame = 0
      stop = watchOnce(el, () => {
        ctx.add(() => {
          gsap.to(proxy, {
            n: target,
            duration,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = format(Math.round(proxy.n), group, suffix)
            },
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
        style={{ minWidth: `${text.length}ch` }}
      >
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </>
  )
}
