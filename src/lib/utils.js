/**
 * Join conditional class names. Keeps JSX readable without pulling in clsx.
 *   cn('px-4', isActive && 'bg-brand-600')
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
