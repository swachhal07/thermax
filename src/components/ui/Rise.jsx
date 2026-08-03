import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { watchOnce } from '@/lib/revealOnce'
import { cn } from '@/lib/utils'

const FROM = {
  below: { y: 24, x: 0 },
  left: { x: -36, y: 0 },
  right: { x: 36, y: 0 },
}

export default function Rise({
  as: Tag = 'div',
  from = 'below',
  delay = 0,
  className,
  children,
  ...props
}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) return

    const offset = FROM[from] ?? FROM.below

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, ...offset })
    }, el)

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
