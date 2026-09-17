/* Class strings shared by the admin's fields and panels. They live apart from
   the components so those files export components alone and Fast Refresh keeps
   working while editing them. */

/* A ruled line rather than a filled box: six grey rectangles stacked in a panel
   is the heaviest thing on the screen, and a hairline the text sits on carries
   the same affordance with none of the weight. The focus line is a box-shadow,
   not a thicker border, so nothing reflows when it lands. */
export const FIELD = [
  'w-full rounded-none border-0 border-b border-ink/[0.18] bg-transparent px-0 py-2.5',
  'font-sans text-[0.9375rem] text-ink placeholder:text-ink/25',
  'transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
  'hover:border-ink/35',
  'outline-none focus:border-brand-600 focus:shadow-[0_1px_0_0_var(--color-brand-600)]',
  'disabled:text-ink/40 motion-reduce:transition-none',
].join(' ')

export const FIELD_ERROR = 'border-brand-600 shadow-[0_1px_0_0_var(--color-brand-600)]'

export const LABEL =
  'flex items-baseline gap-2 font-mono text-[0.5625rem] uppercase tracking-[0.22em] text-muted'
