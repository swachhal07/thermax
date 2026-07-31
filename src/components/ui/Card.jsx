import { cn } from '@/lib/utils'

export default function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-black/8 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-black/5',
        className,
      )}
    >
      {children}
    </div>
  )
}
