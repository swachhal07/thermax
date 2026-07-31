import { cn } from '@/lib/utils'

/** Consistent page gutter + max width. Use this instead of ad-hoc mx-auto px-4. */
export default function Container({ className, children }) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>
      {children}
    </div>
  )
}
