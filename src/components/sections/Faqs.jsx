import { useState } from 'react'
import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { faqs } from '@/data/faqs'

export default function Faqs() {
  const [openId, setOpenId] = useState(faqs[0].id)

  return (
    <section id="faqs" className="bg-white pb-24 pt-16 sm:pb-32 sm:pt-20">
      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        <Rise>
          <header className="mx-auto max-w-3xl text-center">
            <p className="mx-auto mb-6 flex w-fit items-center gap-3 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-ink">
              <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                <span className="block h-[2px] w-3 bg-brand-600" />
                <span className="block h-[2px] w-1.5 bg-brand-600/40" />
              </span>
              Questions
            </p>
            <h2 className="text-balance font-sans text-[2.5rem] font-bold leading-[1.04] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.25rem]">
              Asked before <span className="text-brand-600">every order</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted text-pretty">
              Stock, lead times, dosage, and who turns up on the day. If yours
              isn't here, it's a phone call rather than a form.
            </p>
          </header>
        </Rise>

        <ul className="mx-auto mt-12 grid max-w-[54rem] list-none grid-cols-1 gap-3 p-0 sm:mt-16 sm:gap-4">
          {faqs.map((faq, i) => {
            const isOpen = openId === faq.id

            return (
              <Rise as="li" key={faq.id} delay={i * 60}>
                <div>
                  <div
                    className={`group rounded-[1.75rem] p-1.5 ring-1 transition-[background-color,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                      isOpen
                        ? 'bg-ink/[0.07] ring-ink/10'
                        : 'bg-ink/[0.04] ring-ink/[0.06] hover:bg-ink/[0.06] hover:ring-ink/10'
                    }`}
                  >
                    <div className="rounded-[calc(1.75rem-0.375rem)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(20,23,28,0.04),0_18px_40px_-26px_rgba(20,23,28,0.26)]">
                      <h3>
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : faq.id)}
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${faq.id}`}
                          id={`faq-question-${faq.id}`}
                          className="flex w-full items-center justify-between gap-5 rounded-[calc(1.75rem-0.375rem)] px-6 py-5 text-left transition-[transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.995] motion-reduce:transition-none motion-reduce:active:scale-100 sm:gap-8 sm:px-8 sm:py-6"
                        >
                          <span className="text-[1.0625rem] font-semibold leading-snug text-ink text-pretty sm:text-[1.125rem]">
                            {faq.question}
                          </span>

                          <span
                            aria-hidden="true"
                            className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full transition-[background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                              isOpen
                                ? 'bg-brand-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]'
                                : 'bg-ink/[0.05] shadow-[inset_0_1px_2px_rgba(20,23,28,0.07)] group-hover:bg-ink/[0.08]'
                            }`}
                          >
                            <span
                              className={`absolute h-[1.5px] w-3.5 rounded-full transition-colors duration-500 ${
                                isOpen ? 'bg-white' : 'bg-ink'
                              }`}
                            />
                            <span
                              className={`absolute h-[1.5px] w-3.5 rounded-full transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                                isOpen ? 'rotate-0 bg-white' : 'rotate-90 bg-ink'
                              }`}
                            />
                          </span>
                        </button>
                      </h3>

                      <div
                        id={`faq-panel-${faq.id}`}
                        role="region"
                        aria-labelledby={`faq-question-${faq.id}`}
                        inert={!isOpen}
                        className={`grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div
                            className={`mx-6 border-t border-ink/[0.07] pb-6 pt-5 transition-opacity duration-500 sm:mx-8 sm:pb-7 ${
                              isOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            <p className="max-w-prose text-[0.9375rem] leading-relaxed text-muted text-pretty">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Rise>
            )
          })}
        </ul>

        <Rise>
          <div className="mx-auto mt-12 flex max-w-[54rem] flex-col items-start gap-6 border-t border-ink/10 pt-8 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-base leading-relaxed text-muted text-pretty">
              Still deciding what the pour needs? Send us the mix and the
              conditions — we'll come back with a product and a dosage.
            </p>

            <Link
              to="/contact"
              className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-[0.9375rem] font-medium text-white shadow-[0_1px_2px_rgba(20,23,28,0.08),0_14px_30px_-18px_rgba(20,23,28,0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_1px_2px_rgba(20,23,28,0.1),0_22px_40px_-18px_rgba(20,23,28,0.55)] active:scale-[0.98] motion-reduce:transition-none"
            >
              Ask us directly
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
          </div>
        </Rise>
      </div>
    </section>
  )
}
