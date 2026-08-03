import { Link, useParams } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { COVERS, LINE_LABELS, codeFor, findPost, ordered, readTime } from '@/lib/journal'
import { siteConfig } from '@/lib/siteConfig'

export default function Post() {
  const { slug } = useParams()
  const post = findPost(slug)

  if (!post) {
    return (
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
            No such note
          </p>
          <h1 className="mt-6 max-w-[24ch] font-sans text-[2.25rem] font-extrabold leading-[1.02] tracking-[-0.025em] text-ink text-balance sm:text-[2.75rem]">
            That note isn't here.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted text-pretty">
            It may have been renamed, or the link may have picked up a stray
            character. The index has everything that has been filed.
          </p>
          <Link
            to="/blog"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-[0.9375rem] font-medium text-white shadow-[0_1px_2px_rgba(20,23,28,0.08),0_14px_30px_-18px_rgba(20,23,28,0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_1px_2px_rgba(20,23,28,0.1),0_22px_40px_-18px_rgba(20,23,28,0.55)] active:scale-[0.98] motion-reduce:transition-none"
          >
            All notes
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
      </section>
    )
  }

  const cover = COVERS[post.slug]
  const alsoFiled = ordered.filter((p) => p.slug !== post.slug).slice(0, 4)

  return (
    <>
      <section className="relative isolate overflow-hidden bg-white pb-14 pt-6 sm:pt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(110%_70%_at_50%_0%,black,transparent_75%)]"
        />

        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-muted">
            <Link
              to="/blog"
              className="group flex items-center gap-3 text-ink transition-colors duration-300 hover:text-brand-600"
            >
              <span
                aria-hidden="true"
                className="text-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-x-[3px] motion-reduce:transition-none motion-reduce:group-hover:transform-none"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M18 12H6.5M11 7l-5 5 5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              All notes
            </Link>
            <span className="hidden tabular-nums sm:block">{post.dateLabel}</span>
          </div>
          <div aria-hidden="true" className="h-px w-full bg-ink/15" />

          <Rise>
            <h1 className="mt-10 max-w-[30ch] font-sans text-[2.25rem] font-extrabold leading-[1.02] tracking-[-0.025em] text-ink text-balance sm:text-[3rem] lg:text-[3.5rem]">
              {post.title}
            </h1>

            <p className="mt-7 max-w-[54ch] text-xl leading-relaxed text-muted text-pretty">
              {post.dek}
            </p>
          </Rise>

          <Rise delay={120}>
            <dl className="mt-10 grid grid-cols-2 border-b border-t border-ink/15 sm:grid-cols-4">
              <div className="border-ink/15 py-5 sm:pr-8">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Filed
                </dt>
                <dd className="mt-2 text-[0.9375rem] tabular-nums text-ink">
                  <time dateTime={post.date}>{post.dateLabel}</time>
                </dd>
              </div>
              <div className="border-l border-ink/15 py-5 pl-6 sm:px-8">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Line
                </dt>
                <dd className="mt-2 text-[0.9375rem] text-ink">
                  {LINE_LABELS[post.line] ?? codeFor(post.line)}
                </dd>
              </div>
              <div className="border-t border-ink/15 py-5 sm:border-l sm:border-t-0 sm:px-8">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Desk
                </dt>
                <dd className="mt-2 text-[0.9375rem] text-ink">{post.desk}</dd>
              </div>
              <div className="border-l border-t border-ink/15 py-5 pl-6 sm:border-t-0 sm:pl-8">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Length
                </dt>
                <dd className="mt-2 text-[0.9375rem] tabular-nums text-ink">
                  {readTime(post)} min read
                </dd>
              </div>
            </dl>
          </Rise>
        </div>
      </section>

      <article className="bg-white pb-20 sm:pb-24">
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <Rise>
            <img
              src={cover.src}
              width={1600}
              height={900}
              decoding="async"
              alt={cover.alt}
              className="h-64 w-full rounded-[1.5rem] bg-ink/5 object-cover sm:h-96 lg:h-[30rem]"
            />
          </Rise>

          <div className="mt-14 lg:grid lg:grid-cols-[minmax(0,68ch)_minmax(0,1fr)] lg:items-start lg:gap-x-16 xl:gap-x-24">
            <Rise delay={100}>
              <div className="max-w-[68ch]">
                {post.body.map((para, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? 'text-[1.1875rem] leading-relaxed text-ink text-pretty sm:text-[1.25rem]'
                        : 'mt-7 text-[1.0625rem] leading-relaxed text-ink/85 text-pretty sm:text-[1.125rem]'
                    }
                  >
                    {para}
                  </p>
                ))}

                <div className="mt-12 border-t border-ink/15 pt-8">
                  <p className="max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted text-pretty">
                    Specifying against something on site and this doesn't quite
                    cover it? The desk answers these on the phone —{' '}
                    <a
                      href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                      className="font-medium text-ink underline decoration-ink/25 decoration-1 underline-offset-4 transition-colors duration-300 hover:text-brand-600 hover:decoration-brand-600"
                    >
                      {siteConfig.phone}
                    </a>
                    , or{' '}
                    <Link
                      to="/contact"
                      className="font-medium text-ink underline decoration-ink/25 decoration-1 underline-offset-4 transition-colors duration-300 hover:text-brand-600 hover:decoration-brand-600"
                    >
                      send the job details
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </Rise>

            <aside
              aria-label="More from the journal"
              className="mt-16 hidden lg:sticky lg:top-28 lg:mt-0 lg:block"
            >
              <Rise delay={200}>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Also filed
                </p>
                <ul className="mt-5 border-t border-ink/15">
                  {alsoFiled.map((p) => (
                    <li key={p.slug} className="border-b border-ink/15">
                      <Link
                        to={`/blog/${p.slug}`}
                        className="group block py-4 transition-colors duration-300"
                      >
                        <span className="flex items-baseline justify-between gap-4 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted">
                          {LINE_LABELS[p.line] ?? codeFor(p.line)}
                          <time dateTime={p.date} className="tabular-nums">
                            {p.dateLabel}
                          </time>
                        </span>
                        <span className="mt-2 block text-[0.9375rem] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand-600">
                          {p.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/blog"
                  className="group mt-6 inline-flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:text-brand-600 motion-reduce:transition-none"
                >
                  <span
                    aria-hidden="true"
                    className="text-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-x-[3px] motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                      <path
                        d="M18 12H6.5M11 7l-5 5 5 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  All notes
                </Link>
              </Rise>
            </aside>
          </div>
        </div>
      </article>
    </>
  )
}
