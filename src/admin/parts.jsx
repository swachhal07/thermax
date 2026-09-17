import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button, Eyebrow } from './fields'
import { LABEL } from './styles'

/* The head of a panel: what the collection is, how many rows it holds, and the
   one button that adds to it. */
export function PanelHeader({ title, count, countLabel, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-ink/15 pb-5">
      <div>
        <Eyebrow>
          <span className="tabular-nums text-brand-600">{String(count).padStart(2, '0')}</span>{' '}
          {countLabel}
        </Eyebrow>
        <h1 className="mt-2.5 font-sans text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-ink">
          {title}
          <span className="text-brand-600">.</span>
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

/* Move up, move down, edit, delete — the same four on every row, in the same
   order, so the column reads as a column. Delete arms itself first: one click
   turns it into "Sure?", the next commits, and moving on disarms it. A modal
   for a row in a ten-row table is heavier than the mistake it prevents. */
export function RowActions({ onUp, onDown, onEdit, onDelete, editing, disabled, deleteLabel }) {
  const [armed, setArmed] = useState(false)

  return (
    <div className="flex items-center justify-end gap-1" onMouseLeave={() => setArmed(false)}>
      <IconButton label="Move up" disabled={disabled || !onUp} onClick={onUp}>
        <path d="M7 10.5 7 3.5M7 3.5 4 6.5M7 3.5l3 3" />
      </IconButton>
      <IconButton label="Move down" disabled={disabled || !onDown} onClick={onDown}>
        <path d="M7 3.5v7M7 10.5l3-3M7 10.5l-3-3" />
      </IconButton>

      <Button size="sm" tone="ghost" disabled={disabled} onClick={onEdit}>
        {editing ? 'Close' : 'Edit'}
      </Button>

      <Button
        size="sm"
        tone={armed ? 'danger' : 'ghost'}
        disabled={disabled}
        onClick={() => {
          if (!armed) return setArmed(true)
          setArmed(false)
          onDelete()
        }}
      >
        {armed ? (deleteLabel ?? 'Sure?') : 'Delete'}
      </Button>
    </div>
  )
}

function IconButton({ label, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className="flex h-7 w-7 items-center justify-center text-ink/35 outline-none transition-colors duration-200 hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 disabled:pointer-events-none disabled:opacity-20 motion-reduce:transition-none"
    >
      <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  )
}

/* The image sits outside the record form because it is a separate request: a
   file goes straight to Cloudinary through the API the moment it is chosen,
   rather than waiting on a save that might never come. Which also means a
   record must exist before it can carry a picture — hence the note on a new
   one. */
export function ImageField({ label, asset, alt, onUpload, onRemove, disabled, pending }) {
  const input = useRef(null)

  return (
    <div className="flex flex-col gap-3">
      <span className={LABEL}>{label}</span>

      <div className="flex items-start gap-4">
        <div
          className={cn(
            'relative flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden bg-ink/[0.04] ring-1 ring-ink/10',
            pending && 'animate-pulse',
          )}
        >
          {asset?.url ? (
            <img src={asset.url} alt={alt || ''} className="h-full w-full object-cover" />
          ) : (
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-ink/25">
              None
            </span>
          )}
        </div>

        <div className="flex flex-col items-start gap-2">
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) onUpload(file)
            }}
          />

          <div className="flex gap-2">
            <Button size="sm" disabled={disabled || pending} onClick={() => input.current?.click()}>
              {pending ? 'Uploading…' : asset?.url ? 'Replace' : 'Upload'}
            </Button>
            {asset?.url && (
              <Button size="sm" tone="ghost" disabled={disabled || pending} onClick={onRemove}>
                Remove
              </Button>
            )}
          </div>

          <p className="font-sans text-[0.75rem] leading-snug text-ink/35">
            {disabled
              ? 'Save the record first, then add a picture to it.'
              : 'JPEG, PNG, WebP, AVIF or SVG · up to 8MB'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* An editor opens under the row it belongs to rather than over the page. The
   table stays visible, so the row being edited keeps its place in the list. */
export function EditorPanel({ children }) {
  return (
    <div className="animate-note border-l-2 border-brand-600 bg-ink/[0.02] px-5 py-6 sm:px-7">
      {children}
    </div>
  )
}

export function EmptyRow({ children }) {
  return (
    <p className="border-b border-ink/8 py-8 text-center font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ink/30">
      {children}
    </p>
  )
}
