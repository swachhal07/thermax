import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

/* The primary red CTA: lifts on hover, deepens fill, and a specular highlight
   sweeps across once. Shared so the hero and the range pages stay identical. */
export default function ArrowButton({ to, href, className, children, ...props }) {
  const classes = cn(
    'group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-brand-600 py-1.5 pl-6 pr-1.5 font-sans text-sm font-medium text-white',
    'shadow-[inset_0_1px_1px_rgba(255,255,255,0.24)]',
    'transition-[transform,background-color] duration-500 motion-reduce:transition-none',
    EASE,
    'hover:-translate-y-0.5 hover:bg-brand-700',
    'active:translate-y-0 active:scale-[0.98]',
    className,
  )

  const content = (
    <>
      {/* Specular sweep — parked off the left edge, crosses once on hover. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 -left-full w-full',
          'bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.35),transparent)]',
          'transition-transform duration-[900ms] group-hover:translate-x-[200%]',
          'motion-reduce:hidden',
          EASE,
        )}
      />

      <span className="relative">{children}</span>

      <span
        aria-hidden="true"
        className={cn(
          'relative ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/15',
          'transition-[transform,background-color] duration-500 motion-reduce:transition-none',
          EASE,
          'group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 group-hover:bg-white/25',
        )}
      >
        <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor">
          <path
            d="M4 10 10 4M5 4h5v5"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </>
  )

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <Link to={to} className={classes} {...props}>
      {content}
    </Link>
  )
}
