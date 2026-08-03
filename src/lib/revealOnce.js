let observer = null
const waiting = new Map()

function forget(el) {
  waiting.delete(el)
  observer?.unobserve(el)
}

export function watchOnce(el, reveal) {
  if (typeof IntersectionObserver === 'undefined') {
    reveal()
    return () => {}
  }

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const passed =
            entry.rootBounds && entry.boundingClientRect.bottom <= entry.rootBounds.top

          if (!entry.isIntersecting && !passed) continue

          const fire = waiting.get(entry.target)
          forget(entry.target)
          fire?.()
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
  }

  waiting.set(el, reveal)
  observer.observe(el)

  return () => forget(el)
}
