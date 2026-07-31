import { useRef, useState } from 'react'
import Rise from '@/components/ui/Rise'
import useInView from '@/hooks/useInView'
import { certifications } from '@/data/certifications'

/**
 * Certification marquee.
 *
 * The track carries two identical copies of the row; the keyframe travels
 * exactly -50%, so copy two arrives where copy one began and the seam never
 * shows. Each copy is its own flex row with its own trailing gap — putting a
 * single `gap` on the track instead would make the two halves unequal widths
 * and the loop would jump.
 *
 * Only the first copy is exposed to assistive tech; the second is scenery.
 */
export default function Certifications() {
  const trackRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  // An infinite transform animation composites on every frame for as long as it
  // is running, and this track is several thousand pixels wide. Off screen that
  // is pure cost, and it was running for the whole session.
  const inView = useInView(trackRef, { rootMargin: '250px' })

  // Both reasons to stop resolve to one inline value. `animation-play-state` as
  // a utility class can't be relied on to win against the `animation` shorthand
  // that `animate-marquee` sets — the shorthand resets play-state to running,
  // and at equal specificity the outcome depends on emit order. Inline always
  // wins, so hover-to-pause moves onto the same channel rather than staying a
  // class that would then lose to it.
  const paused = !inView || hovered

  return (
    /* Padding stepped up with the heading — at section rank the old py-16
       crowded it. Grey field, following the white how-we-work section above,
       so the change in tone carries the seam and no top hairline is needed.
       Top padding is trimmed against that section's own bottom padding, which
       the heading was otherwise sitting a long way beneath. */
    <section id="certifications" className="bg-[#f4f4f6] pb-20 pt-14 sm:pb-28 sm:pt-20">
      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        {/* Same lockup as the services header: centred mark and kicker, the
            heading at section rank with red on the closing phrase, then the
            lead beneath at body size. */}
        <Rise>
          <header className="mx-auto max-w-3xl text-center">
            <p className="mx-auto mb-6 flex w-fit items-center gap-3 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-ink">
              <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                <span className="block h-[2px] w-3 bg-brand-600" />
                <span className="block h-[2px] w-1.5 bg-brand-600/40" />
              </span>
              Certifications
            </p>
            <h2 className="text-balance font-sans text-[2.5rem] font-bold leading-[1.04] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.25rem]">
              Certified upstream, <span className="text-brand-600">stocked locally</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted text-pretty">
              Every line we carry is made under audited management systems. The
              certificates sit with the manufacturer; the stock, the specification,
              and the site support sit with us.
            </p>
          </header>
        </Rise>
      </div>

      {/* Full-bleed, so the row reads as passing through the page rather than
          sitting in a box. Masked at both edges so marks fade rather than being
          guillotined by the viewport. */}
      <div
        ref={trackRef}
        className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%-5rem),transparent)] motion-reduce:overflow-x-auto sm:mt-14"
      >
        {/* Paused rather than unmounted when it's out of frame: the row keeps
            its position, so scrolling back to it doesn't restart the loop from
            the left edge. `will-change` is gone — an infinite transform
            animation is promoted to its own layer anyway, so declaring it only
            pinned the layer in memory while the animation was paused. */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
          className="flex w-max animate-marquee motion-reduce:animate-none"
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? 'true' : undefined}
              className="flex list-none items-center gap-10 p-0 pr-10 sm:gap-14 sm:pr-14"
            >
              {certifications.map((cert) => (
                <li key={cert.name} className="shrink-0">
                  {/* Intrinsic size is load-bearing here, not just good
                      practice: the track's width has to be correct for the
                      -50% translate to land seamlessly. Without width/height
                      an unloaded image measures zero, the second copy
                      collapses, and the loop opens a gap.

                      Lazy-loading is off for the same reason — the duplicate
                      row sits outside the viewport by design and would never
                      be triggered. Six marks at ~130 kB total. */}
                  <img
                    src={cert.logo}
                    alt={copy === 0 ? cert.alt : ''}
                    width={499}
                    height={352}
                    decoding="async"
                    className="h-28 w-auto sm:h-36"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
