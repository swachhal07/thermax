/**
 * Fire a callback the first time an element comes into view, then forget it.
 *
 * This is the whole of what the site's entrance animations need from the scroll
 * position: one edge, crossed once. It used to be ScrollTrigger's job, and
 * ScrollTrigger is the wrong tool for it — every trigger joins a shared
 * measurement pass, so `ScrollTrigger.refresh()` on route change (useScrollToTop)
 * had to re-measure every waiting reveal on the page in one synchronous layout
 * pass. With ~50 Rise blocks and a counter per fact, that was the most expensive
 * moment on the site, and it landed squarely on navigation.
 *
 * An IntersectionObserver has nothing to re-measure. The browser tracks
 * intersection off the back of work it already does and reports asynchronously —
 * no forced layout, and nothing to correct when the document height changes
 * underneath it. ScrollTrigger keeps only the animations that genuinely follow
 * the scroll position continuously (currently one: the About plate's parallax).
 *
 * What this gives up: a trigger reports progress *through* an element, an observer
 * only reports that it crossed a line. Nothing using this needed progress.
 */

/* One observer for every reveal on the page rather than one each — fifty
   observers watching one element apiece is fifty separate callbacks into JS,
   where one observer watching fifty elements batches them into one delivery. */
let observer = null
const waiting = new Map()

function forget(el) {
  waiting.delete(el)
  observer?.unobserve(el)
}

/**
 * Calls `reveal` once, when `el` first crosses into view. Returns the cancel
 * function — call it on unmount so an element that never appeared doesn't sit in
 * the map holding a reference to a torn-down component's closure.
 *
 * Reveals immediately where IntersectionObserver isn't available. Content being
 * visible outranks content arriving prettily.
 */
export function watchOnce(el, reveal) {
  if (typeof IntersectionObserver === 'undefined') {
    reveal()
    return () => {}
  }

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          /* Already scrolled past, as opposed to merely not reached yet. A hash
             landing (/about#quality) drops the visitor mid-document with whole
             sections above them; those will never intersect on the way down, and
             left to the observer alone they would sit at opacity 0 until someone
             scrolled back up to collect them. ScrollTrigger got this for free —
             a trigger created past its own start fires on creation — so it has
             to be spelled out here. */
          const passed =
            entry.rootBounds && entry.boundingClientRect.bottom <= entry.rootBounds.top

          if (!entry.isIntersecting && !passed) continue

          const fire = waiting.get(entry.target)
          forget(entry.target)
          fire?.()
        }
      },
      /* The viewport with its bottom edge pulled up 12%, which is the line
         ScrollTrigger's `start: 'top 88%'` drew: a block starts moving just after
         it crosses into view rather than exactly on the line, where the reveal
         reads as lagging behind the scroll. */
      { rootMargin: '0px 0px -12% 0px' },
    )
  }

  waiting.set(el, reveal)
  observer.observe(el)

  return () => forget(el)
}
