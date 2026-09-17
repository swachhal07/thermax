import { cn } from '@/lib/utils'
import { FIELD, FIELD_ERROR, LABEL } from './styles'

/* The admin borrows the site's own language rather than inventing a second one:
   mono uppercase micro-labels, hairline rules, one red accent, and fields that
   are a ruled line rather than a filled box. It is the Contact form's idiom at
   a denser rhythm, because this screen is a ledger being edited, not a page
   being read. */

export function Field({ id, label, error, hint, optional, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={LABEL}>
        {label}
        {optional && <span className="text-ink/30 normal-case tracking-normal">optional</span>}
      </label>
      {children}
      {error ? (
        <p className="font-sans text-[0.75rem] leading-snug text-brand-700">{error}</p>
      ) : hint ? (
        <p className="font-sans text-[0.75rem] leading-snug text-ink/35">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ error, className, ...props }) {
  return <input {...props} className={cn(FIELD, error && FIELD_ERROR, className)} />
}

export function Textarea({ error, className, rows = 4, ...props }) {
  return <textarea rows={rows} {...props} className={cn(FIELD, error && FIELD_ERROR, className)} />
}

export function Select({ error, className, children, ...props }) {
  return (
    <select {...props} className={cn(FIELD, 'appearance-none', error && FIELD_ERROR, className)}>
      {children}
    </select>
  )
}

/* Two shapes of button and nothing else: the one that commits, and the one that
   does not. Anything destructive is `tone="danger"` and says what it removes. */
export function Button({ tone = 'default', size = 'md', className, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono uppercase tracking-[0.18em]',
        'transition-[background-color,color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none',
        size === 'sm' ? 'px-3 py-1.5 text-[0.5625rem]' : 'px-5 py-2.5 text-[0.625rem]',
        tone === 'primary' && 'bg-ink text-white hover:bg-brand-600',
        tone === 'danger' && 'text-brand-700 ring-1 ring-brand-600/25 hover:bg-brand-600 hover:text-white hover:ring-brand-600',
        tone === 'default' && 'text-ink ring-1 ring-ink/15 hover:bg-ink/[0.05] hover:ring-ink/30',
        tone === 'ghost' && 'text-muted hover:text-ink',
        className,
      )}
    />
  )
}

/* Checkboxes are a two-state switch drawn as a rule, so `published` reads at a
   glance down a column of rows without a box per line. */
export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2.5 outline-none disabled:opacity-40"
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative h-4 w-8 shrink-0 rounded-full transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
          'group-focus-visible:ring-2 group-focus-visible:ring-brand-600 group-focus-visible:ring-offset-2',
          checked ? 'bg-brand-600' : 'bg-ink/15',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-[0_1px_2px_rgba(20,23,28,0.25)]',
            'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
            checked ? 'translate-x-4.5' : 'translate-x-0.5',
          )}
        />
      </span>
      <span className={cn(LABEL, 'text-ink')}>{label}</span>
    </button>
  )
}

/* Every panel's status line. One place, so a save, a failure and a network
   outage all read the same way and in the same spot. */
export function Note({ tone = 'info', children }) {
  if (!children) return null

  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'animate-note font-mono text-[0.625rem] uppercase tracking-[0.18em]',
        tone === 'error' ? 'text-brand-700' : 'text-muted',
      )}
    >
      {children}
    </p>
  )
}

export function Eyebrow({ children, className }) {
  return (
    <p className={cn('font-mono text-[0.5625rem] uppercase tracking-[0.24em] text-muted', className)}>
      {children}
    </p>
  )
}
