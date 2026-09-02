import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { process } from '@/data/process'

export default function HowWeWork() {
  return (
    <section
      id="how-we-work"
      className="bg-white pb-20 pt-16 sm:pb-24 sm:pt-20"
    >
      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        <div className="grid grid-cols-1 gap-y-14 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-x-24 lg:gap-y-0">
          {/* A sticky element has its offset recomputed on every scroll frame it
              is pinned for. Unpromoted, that means repainting this whole column
              each frame — including the pill button's two-layer 30px-blur shadow,
              which is the expensive part. The hint gives it a layer so the
              compositor can move it without repainting anything. Scoped to lg
              because it isn't sticky below that, and it is a ~400x500 box rather
              than a full-viewport plate, so the layer is cheap to hold. */}
          <div className="lg:sticky lg:top-32 lg:self-start lg:[will-change:transform]">
            <Rise from="left">
              <p className="mb-6 flex w-fit items-center gap-3 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-ink">
                <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                  <span className="block h-[2px] w-3 bg-brand-600" />
                  <span className="block h-[2px] w-1.5 bg-brand-600/40" />
                </span>
                How we work
              </p>
              <h2 className="text-balance font-sans text-[2.5rem] font-bold leading-[1.04] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.25rem]">
                From spec to <span className="text-brand-600">site</span>
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted text-pretty">
                Three steps, and the same people across all of them — so nothing is
                lost between the specification and the day it goes down.
              </p>

              <Link
                to="/contact"
                className="group mt-9 inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-[0.9375rem] font-medium text-white shadow-[0_1px_2px_rgba(20,23,28,0.08),0_14px_30px_-18px_rgba(20,23,28,0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_1px_2px_rgba(20,23,28,0.1),0_22px_40px_-18px_rgba(20,23,28,0.55)] active:scale-[0.98] motion-reduce:transition-none"
              >
                Start a specification
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path
                      d="M6.5 17.5 17.5 6.5M9 6.5h8.5V15"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </Rise>
          </div>

          <ol className="grid list-none grid-cols-1 gap-4 p-0 sm:gap-5">
            {process.map((step, i) => (
              <Rise as="li" key={step.id} delay={i * 110}>
                <div>
                  <div className="group rounded-[2rem] bg-ink/[0.04] p-1.5 ring-1 ring-ink/[0.06] transition-[background-color,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.07] hover:ring-ink/10 motion-reduce:transition-none">
                    <div className="relative rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(20,23,28,0.04),0_18px_40px_-24px_rgba(20,23,28,0.28)] transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[3px] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(20,23,28,0.05),0_28px_56px_-26px_rgba(20,23,28,0.34)] motion-reduce:transition-none motion-reduce:group-hover:transform-none sm:p-8">
                      <div className="flex gap-5 sm:gap-7">
                        <div className="relative shrink-0">
                          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f4f4f6] font-mono text-[0.8125rem] tracking-[0.1em] text-brand-600 shadow-[inset_0_1px_2px_rgba(20,23,28,0.07)] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)] motion-reduce:transition-none">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {i < process.length - 1 && (
                            <span
                              aria-hidden="true"
                              className="absolute inset-x-0 top-[3.25rem] mx-auto h-[calc(100%+2.5rem)] w-px bg-gradient-to-b from-ink/12 to-transparent"
                            />
                          )}
                        </div>

                        <div className="min-w-0 pt-1.5">
                          <h3 className="text-xl font-semibold leading-snug text-ink">
                            {step.title}
                          </h3>
                          <p className="mt-2.5 max-w-prose text-[0.9375rem] leading-relaxed text-muted text-pretty">
                            {step.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Rise>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
