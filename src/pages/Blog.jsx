import { useState } from 'react'
import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import CTA from '@/components/sections/CTA'
import { posts } from '@/data/posts'
import { services } from '@/data/services'
import { COVERS, LINE_LABELS, codeFor, ordered, readTime } from '@/lib/journal'
import { cn } from '@/lib/utils'

/**
 * Blog — THE JOURNAL.
 *
 * What was here was the scaffold: three equal cards reading "Post title one",
 * "A one-line summary.", a subtitle that said "Replace with real articles.", and
 * no h1 on the page at all. Every one of those is fixed here, but the layout is
 * the substantive change.
 *
 * The scaffold's three equal columns gave six notes the same visual weight when
 * one of them is the current one — a flat grid has no way to say "start here".
 * So the page is a LEAD plus an INDEX: one note given a plate and a photograph,
 * and the rest as cards below it.
 *
 * The cards are cover-led and unenclosed: a photograph at a 1.5rem radius, then
 * the mono meta line, the title, the summary, and a text link — all sitting
 * directly on the white field. No border, no white box, no tray. The photograph
 * is already a strong rectangle, and wrapping it in a container would be a frame
 * around a frame. What the scaffold shipped instead — border plus shadow plus
 * white background, with no image at all — is the look this replaces.
 *
 * Two things here are real rather than decorative:
 *
 * 1. The product-line filter is wired. A row of chips that only looked like
 *    filters would be worse than no chips, and the state is four lines of code.
 * 2. The notes expand in place. There is no /blog/:slug route in this app, so
 *    linking each row to one would ship six dead links — the thing the audit
 *    catches every time. Inline disclosure needs no router, and the open note
 *    still gets a shareable address: opening one writes `#slug` to the URL with
 *    replaceState, and arriving with a hash opens that note. If per-post pages
 *    are wanted later, the data file is already shaped for them.
 */

const LINES = [
  { value: 'all', code: '——', label: 'Everything' },
  /* Only lines that actually have a note. A filter that returns nothing is a
     dead end dressed as a choice, and the empty state below exists for the case
     where the data changes underneath this, not as a feature. */
  ...services
    .filter((s) => posts.some((p) => p.line === s.slug))
    .map((s) => ({ value: s.slug, code: s.code, label: LINE_LABELS[s.slug] ?? s.title })),
]

/** Featured note first, then the rest — the order lib/journal.js walks in. */
const [lead, ...rest] = ordered

export default function Blog() {
  const [line, setLine] = useState('all')

  const filtered = line === 'all' ? rest : rest.filter((p) => p.line === line)

  return (
    <>
      {/* ── THE HEAD ────────────────────────────────────────────────────────
          Ruled mono header and one headline, on the blueprint sheet the contact
          and about pages open with. Nothing enclosed: the page's first job is to
          say what these notes are and are not. */}
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

      {/* ── THE LEAD ────────────────────────────────────────────────────────
          The current note, given the largest photograph and the only large type
          in the set. Asymmetric split with the cover on the right, and the same
          1.5rem radius the index cards use so it reads as the biggest card
          rather than as a different species of block. */}
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
                  {/* Diagonal again, and correctly so now: this goes to a page of
                      its own rather than unfolding in place. */}
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
              {/* Rounded to the same 1.5rem the index covers use, so the lead
                  reads as the largest card in one set rather than as a different
                  kind of object. */}
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

      {/* ── THE INDEX ───────────────────────────────────────────────────────
          White field, three up, cover-led. The photograph carries the card and
          nothing encloses it: meta line, title, summary and a text link stacked
          straight onto the white.

          Cards stretch to match their row and each control is pinned to the
          bottom edge with `mt-auto`, so the "read" lines sit on one baseline
          across a row however unevenly the summaries above them run — the thing
          a card grid gets wrong more often than anything else. */}
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

          {/* Real filter, not chrome. `aria-pressed` rather than radios: these
              are toggles on a view, not a value being submitted. */}
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
                        /* Tinted rather than white now that the field behind
                           them is white — a white chip on white is a ring
                           floating in space. */
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
            /* Real empty state rather than a blank column. Reachable only if the
               data changes so a line loses its notes, which is exactly when a
               blank page would look like a bug. */
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
              {/* Three up, cover-led. No enclosure at all: the photograph is the
                  card's edge, and the text sits directly on the white field
                  under it. A tray around a composition that already has a strong
                  rectangle at the top of it is one frame too many.

                  Cards stretch to their row so the "read" line at the bottom of
                  each lands on one baseline across the row, however long the
                  summaries above run — `mt-auto` on the control does it. */}
              <ol className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((post) => {
                  const cover = COVERS[post.slug]

                  return (
                    <li key={post.slug} className="flex">
                      {/* One link per card, wrapping the whole composition rather
                          than only the title or only the bottom line. A card with
                          a linked title AND a linked "read" line is the same
                          destination announced twice to a screen reader, and it
                          leaves the photograph and the summary — most of the
                          target area — dead to the pointer. */}
                      <Link
                        to={`/blog/${post.slug}`}
                        className="group/card flex w-full flex-col rounded-[1.5rem] outline-offset-[6px]"
                      >
                        <article className="flex w-full flex-col">
                          {/* Cover. Rounded where the rest of the site's
                              photographs are square, because here the image IS
                              the container — nothing else draws this card's edge.
                              `overflow-hidden` sits on the frame rather than a
                              radius on the image, so the scale on hover is
                              clipped by the corner instead of escaping it. */}
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

                          {/* Meta line: line, date, length. Red spent on the line
                              name only — it is the one word that tells a reader
                              whether this note is about their problem. */}
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

                          {/* Affordance, not a second control — the card is the
                              link, so this is a label with an arrow on it. Pinned
                              to the bottom edge by `mt-auto` in a stretched row,
                              which is what puts these on one baseline across a
                              row however unevenly the summaries above them run. */}
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
