import { useRef, useState } from 'react'
import Rise from '@/components/ui/Rise'
import useInView from '@/hooks/useInView'
import { certifications } from '@/data/certifications'

export default function Certifications() {
  const trackRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const inView = useInView(trackRef, { rootMargin: '250px' })

  const paused = !inView || hovered

  return (
    <section id="certifications" className="bg-[#f4f4f6] pb-20 pt-14 sm:pb-28 sm:pt-20">
      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
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

      <div
        ref={trackRef}
        className="relative mt-10 overflow-hidden motion-reduce:overflow-x-auto sm:mt-14"
      >
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

                  <img
                    src={cert.logo}
                    alt={copy === 0 ? cert.alt : ''}
                    width={499}
                    height={352}
                    loading="lazy"
                    decoding="async"
                    className="h-28 w-auto sm:h-36"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Edge fades painted in the section colour rather than a mask-image. A
            mask over a strip that never stops moving allocates an offscreen
            buffer the full width of the track and recomposites it every frame;
            over a flat background these two gradients read identically. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#f4f4f6] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#f4f4f6] to-transparent"
        />
      </div>
    </section>
  )
}
