import Container from './Container'
import Rise from './Rise'
import { cn } from '@/lib/utils'

/** Vertical rhythm wrapper with an optional eyebrow/title header. */
export default function Section({ id, eyebrow, title, subtitle, className, children }) {
  return (
    <section id={id} className={cn('py-20 sm:py-28', className)}>
      <Container>
        {(eyebrow || title || subtitle) && (
          <Rise>
            <header className="max-w-2xl">
              {eyebrow && (
                <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="mt-3 text-4xl tracking-tight sm:text-5xl">
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
            </header>
          </Rise>
        )}
        {/* Body trails the header slightly so the two read as one movement. */}
        <Rise delay={120} className={cn(title && 'mt-12')}>
          {children}
        </Rise>
      </Container>
    </section>
  )
}
