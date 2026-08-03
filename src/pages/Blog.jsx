import { useState } from 'react'
import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import CTA from '@/components/sections/CTA'
import { posts } from '@/data/posts'
import { services } from '@/data/services'
import { COVERS, LINE_LABELS, codeFor, ordered, readTime } from '@/lib/journal'
import { cn } from '@/lib/utils'

const LINES = [
  { value: 'all', code: '——', label: 'Everything' },
  ...services
    .filter((s) => posts.some((p) => p.line === s.slug))
    .map((s) => ({ value: s.slug, code: s.code, label: LINE_LABELS[s.slug] ?? s.title })),
]

const [lead, ...rest] = ordered

export default function Blog() {
  const [line, setLine] = useState('all')

  const filtered = line === 'all' ? rest : rest.filter((p) => p.line === line)

  return (
    <>
      <section className="relative isolate overflow-hidden bg-white pb-16 pt-6 sm:pb-20 sm:pt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(110%_70%_at_50%_0%,black,transparent_75%)]"
        />

        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-muted">
            <span className="flex items-center gap-3 text-ink">
              <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                <span className="block h-[2px] w-3 bg-brand-600" />
                <span className="block h-[2px] w-1.5 bg-brand-600/40" />
              </span>
              Journal
            </span>
            <span className="hidden tabular-nums sm:block">
              {posts.length} notes
            </span>
          </div>
          <div aria-hidden="true" className="h-px w-full bg-ink/15" />

          <div className="mt-10 grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
            <Rise className="lg:col-span-7">
              <h1 className="max-w-[20ch] font-sans text-[2.75rem] font-extrabold leading-[1.0] tracking-[-0.025em] text-ink text-balance sm:text-[3.5rem] lg:text-[4.25rem]">
                Field notes, not <span className="text-brand-600">press releases.</span>
              </h1>
            </Rise>

            <Rise delay={120} className="lg:col-span-5 lg:self-end">
              <p className="max-w-[46ch] text-lg leading-relaxed text-muted text-pretty">
                Written by the desk that answers the phone, about the questions it
                gets asked twice a week. Short, specific, and occasionally about
                why the answer is no.
              </p>
            </Rise>
          </div>
        </div>
      </section>

      <section aria-labelledby="lead-heading" className="bg-white pb-20 sm:pb-24">
        <article id={lead.slug} className="mx-auto w-full max-w-[84rem] scroll-mt-32 px-5 sm:px-10">
          <div className="grid grid-cols-1 gap-y-8 border-t border-ink/15 pt-10 lg:grid-cols-12 lg:items-center lg:gap-x-14 lg:gap-y-0">
            <Rise from="left" className="lg:col-span-5">
              <p className="flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-600" />
                Latest
              </p>

              <h2
                id="lead-heading"
                className="mt-6 max-w-[24ch] font-sans text-[1.875rem] font-bold leading-[1.08] tracking-[-0.02em] text-ink text-balance sm:text-[2.25rem]"
              >
                {lead.title}
              </h2>

              <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-muted text-pretty">
                {lead.dek}
              </p>

              <dl className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-ink/15 pt-6 font-mono text-[0.625rem] uppercase tracking-[0.22em]">
                <div className="flex items-baseline gap-2.5">
                  <dt className="text-brand-600">Filed</dt>
                  <dd className="tabular-nums text-ink">
                    <time dateTime={lead.date}>{lead.dateLabel}</time>
                  </dd>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <dt className="text-brand-600">Line</dt>
                  <dd className="text-ink">{codeFor(lead.line)}</dd>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <dt className="text-brand-600">Desk</dt>
                  <dd className="text-ink">{lead.desk}</dd>
                </div>
              </dl>

              <Link
                to={`/blog/${lead.slug}`}
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-[0.9375rem] font-medium text-white shadow-[0_1px_2px_rgba(20,23,28,0.08),0_14px_30px_-18px_rgba(20,23,28,0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_1px_2px_rgba(20,23,28,0.1),0_22px_40px_-18px_rgba(20,23,28,0.55)] active:scale-[0.98] motion-reduce:transition-none"
              >
                Read the note
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

            <Rise from="right" delay={100} className="lg:col-span-7">
              <img
                src={COVERS[lead.slug].src}
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                alt={COVERS[lead.slug].alt}
                className="h-64 w-full rounded-[1.5rem] bg-ink/5 object-cover sm:h-80 lg:h-[26rem]"
              />
            </Rise>
          </div>
        </article>
      </section>

      <section aria-labelledby="index-heading" className="bg-white pb-20 pt-14 sm:pb-28 sm:pt-16">
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Rise>
              <h2
                id="index-heading"
                className="font-sans text-[1.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[2rem]"
              >
                Everything else
              </h2>
            </Rise>

            <Rise delay={80}>
              <p
                aria-live="polite"
                className="font-mono text-[0.625rem] uppercase tracking-[0.22em] tabular-nums text-muted"
              >
                {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
                {line !== 'all' && ' in this line'}
              </p>
            </Rise>
          </div>

          <Rise delay={120}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {LINES.map((item) => {
                const active = line === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLine(item.value)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-full py-2.5 pl-3.5 pr-4 text-[0.875rem] font-medium ring-1 transition-[transform,background-color,color,box-shadow] duration-300 active:scale-[0.98]',
                      active
                        ? 'bg-ink text-white ring-ink'
                        : 'bg-ink/[0.04] text-ink/75 ring-ink/[0.07] hover:bg-ink/[0.06] hover:text-ink hover:ring-ink/20',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'font-mono text-[0.625rem] tracking-[0.14em] transition-colors duration-300',
                        active ? 'text-white/55' : 'text-brand-600',
                      )}
                    >
                      {item.code}
                    </span>
                    {item.label}
                  </button>
                )
              })}
            </div>
          </Rise>

          {filtered.length === 0 ? (
            <Rise delay={160}>
              <div className="mt-10 border-t border-ink/15 py-16 text-center">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Nothing filed
                </p>
                <p className="mx-auto mt-4 max-w-[38ch] text-lg leading-relaxed text-ink text-pretty">
                  No notes under this line yet. The desk answers the same
                  questions on the phone in the meantime.
                </p>
                <button
                  type="button"
                  onClick={() => setLine('all')}
                  className="mt-6 text-[0.9375rem] font-medium text-ink/70 underline decoration-ink/20 decoration-1 underline-offset-4 transition-colors duration-300 hover:text-brand-600 hover:decoration-brand-600"
                >
                  Show everything
                </button>
              </div>
            </Rise>
          ) : (
            <Rise delay={160}>

              <ol className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((post) => {
                  const cover = COVERS[post.slug]

                  return (
                    <li key={post.slug} className="flex">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="group/card flex w-full flex-col rounded-[1.5rem] outline-offset-[6px]"
                      >
                        <article className="flex w-full flex-col">
                          <div className="relative h-52 overflow-hidden rounded-[1.5rem] bg-ink/5 sm:h-56">
                            <img
                              src={cover.src}
                              width={1200}
                              height={800}
                              loading="lazy"
                              decoding="async"
                              alt={cover.alt}
                              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/card:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
                            />
                          </div>

                          <p className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.625rem] uppercase tracking-[0.22em]">
                            <span className="font-medium text-brand-600">
                              {LINE_LABELS[post.line] ?? codeFor(post.line)}
                            </span>
                            <span aria-hidden="true" className="text-ink/25">
                              ·
                            </span>
                            <time dateTime={post.date} className="tabular-nums text-muted">
                              {post.dateLabel}
                            </time>
                            <span aria-hidden="true" className="text-ink/25">
                              ·
                            </span>
                            <span className="tabular-nums text-muted">
                              {readTime(post)} min read
                            </span>
                          </p>

                          <h3 className="mt-4 text-[1.375rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink text-balance transition-colors duration-300 group-hover/card:text-brand-600 motion-reduce:transition-none">
                            {post.title}
                          </h3>

                          <p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-muted text-pretty">
                            {post.dek}
                          </p>

                          <span
                            aria-hidden="true"
                            className="mt-auto flex w-fit items-center gap-2.5 pt-7 text-[0.9375rem] font-semibold text-ink transition-colors duration-300 group-hover/card:text-brand-600 motion-reduce:transition-none"
                          >
                            Read the note
                            <span className="text-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/card:translate-x-[3px] group-hover/card:-translate-y-[2px] motion-reduce:transition-none motion-reduce:group-hover/card:transform-none">
                              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                <path
                                  d="M6.5 17.5 17.5 6.5M9 6.5h8.5V15"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </span>
                        </article>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </Rise>
          )}
        </div>
      </section>

      <CTA />
    </>
  )
}
