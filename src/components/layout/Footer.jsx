import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { siteConfig, footerLinks } from '@/lib/siteConfig'
import { services } from '@/data/services'
import dugarLogo from '@/assets/dugar-logo.png'
import thermaxLogoLight from '@/assets/thermax-logo-light.png'

/**
 * Footer — THE INDEX.
 *
 * Four ruled columns on true black. The whole thing is one instrument: a
 * directory, read left to right, GROUP / PAGES / RANGE / REACH. Nothing here
 * argues for attention — the page has already made its case by the time anyone
 * arrives, so the closing move is to be legible and get out of the way.
 *
 * Structure comes from three things only: vertical hairlines between the
 * columns, a red tick on each label, and a dash leading into every row. No
 * cards — on a dark substrate enclosure is the wrong tool, since a near-black
 * panel on black is a muddy rectangle and a white one reads as a hole punched
 * in the page. Red is spent twice per column at most: the label tick, and the
 * dash of whichever row is under the cursor.
 *
 * The dash is doing real work. It gives every row a fixed left edge to align
 * to, turns the columns into a set of registered lists rather than four loose
 * stacks of text, and gives the hover somewhere to happen that isn't the text
 * itself — it lengthens and takes the accent while the label slides off it.
 *
 * GROUP opens at the left edge with both marks and one sentence of provenance,
 * doing the job a letterhead does — the relationship to MV Dugar is what the
 * rest of the footer is filed under, and it has no other home in the
 * navigation.
 */

/** Mono field label with the red tick the page's section kickers use. */
function Label({ children }) {
  return (
    <p className="flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-white/50">
      <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-600" />
      {children}
    </p>
  )
}

/**
 * One directory row: a dash, then the label. On hover the dash grows and takes
 * the brand red while the text slides right off it and lifts to full white —
 * the row reads as being pulled out of the list. Transform and colour only, so
 * it stays on the compositor.
 */
function Row({ to, href, children }) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="mt-[0.7em] block h-px w-3.5 shrink-0 origin-left bg-white/25 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/row:scale-x-[1.6] group-hover/row:bg-brand-600 motion-reduce:transition-none motion-reduce:group-hover/row:transform-none"
      />
      <span className="transition-[transform,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/row:translate-x-1 group-hover/row:text-white motion-reduce:transition-none motion-reduce:group-hover/row:transform-none">
        {children}
      </span>
    </>
  )

  const shell =
    'group/row flex items-start gap-3.5 text-[1rem] leading-snug text-white/65'

  return to ? (
    <Link to={to} className={shell}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={shell}>
      {inner}
    </a>
  )
}

/** Micro-label above a value in the REACH column. */
function FieldName({ children }) {
  return (
    <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.22em] text-white/30">
      {children}
    </dt>
  )
}

export default function Footer() {
  const socials = Object.entries(siteConfig.social).filter(([, href]) => href && href !== '#')

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <footer className="relative isolate bg-black pb-8 text-white">
      {/* Grain over the slab — inert, painted once, no filter. Without it a
          full-bleed #000 reads as an unpainted div rather than a surface. */}
      <div
        aria-hidden="true"
        className="field-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.055]"
      />

      {/* The seam where the white page meets the slab. A flat hairline across
          full black looks like a hard cut; this one is brightest at the centre
          and dissolves before either gutter, so the edge reads as lit rather
          than drawn. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2)_35%,rgba(255,255,255,0.2)_65%,transparent)]"
      />

      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        {/* ── THE INDEX ──────────────────────────────────────────────────────
            GROUP leads at the left edge, so the marks and the provenance line
            act as the letterhead and the three directory columns read as what
            follows from it. The rules then only ever fall between a heading and
            the next heading, never between the identity and itself.

            Uneven widths: RANGE carries the longest strings by a wide margin
            and gets the room, PAGES needs the least. Below lg the rules and the
            asymmetry both go away and it stacks. */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 pb-14 pt-24 sm:grid-cols-2 lg:grid-cols-[1fr_0.8fr_1.3fr_1fr] lg:gap-y-0">
          {/* The columns arrive left to right, the order they're read in. 80 ms
              apart is enough to be a direction without becoming a sequence. */}
          <Rise>
            <Label>Group</Label>
            <div className="mt-8 flex items-center gap-4">
              <img
                src={dugarLogo}
                alt="MV Dugar Group"
                loading="lazy"
                className="h-11 w-11 object-contain"
              />
              {/* Kept shorter than the marks it separates — a rule that matched
                  their height would read as the edge of a box around one of
                  them rather than as the seam between two. */}
              <span aria-hidden="true" className="block h-8 w-px bg-white/15" />
              <img
                src={thermaxLogoLight}
                alt={`${siteConfig.name} logo`}
                loading="lazy"
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="mt-6 max-w-[15rem] text-[1rem] leading-relaxed text-white/55 text-pretty">
              {siteConfig.name} in Nepal, through the MV Dugar Group.
            </p>
          </Rise>

          <Rise delay={80} className="lg:border-l lg:border-white/[0.09] lg:pl-8">
            <Label>Pages</Label>
            <nav className="mt-8">
              <ul className="grid list-none gap-3 p-0">
                {footerLinks.map((link) => (
                  <li key={link.to}>
                    <Row to={link.to}>{link.label}</Row>
                  </li>
                ))}
              </ul>
            </nav>
          </Rise>

          <Rise delay={160} className="lg:border-l lg:border-white/[0.09] lg:pl-8">
            <Label>Range</Label>
            <ul className="mt-8 grid list-none gap-3 p-0">
              {services.map((service) => (
                <li key={service.slug}>
                  <Row to={`/services#${service.slug}`}>{service.title}</Row>
                </li>
              ))}
            </ul>
          </Rise>

          <Rise delay={240} className="lg:border-l lg:border-white/[0.09] lg:pl-8">
            <Label>Reach</Label>
            <dl className="mt-8 grid gap-7">
              <div>
                <FieldName>Phone</FieldName>
                <dd className="mt-2.5">
                  <Row href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}>
                    {siteConfig.phone}
                  </Row>
                </dd>
              </div>
              <div>
                <FieldName>Warehouse</FieldName>
                {/* No dash — it isn't a link, and giving it one would invite a
                    click that goes nowhere. */}
                <dd className="mt-2.5 text-[1rem] leading-snug text-white/65">
                  {siteConfig.address}
                </dd>
              </div>
            </dl>
          </Rise>
        </div>

        {/* ── THE BASELINE ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 border-t border-white/[0.09] pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Three clauses on one mono line, divided by the same faint slash:
              ownership, the reservation, and the credit. The credit is deliberately
              LAST and set no louder than the rest — a build credit belongs in the
              fine print with the copyright, not as a line of its own competing with
              the client's name.

              It wraps rather than scrolls on a narrow phone: the `<p>` is a normal
              block, so the three clauses reflow and the slashes end up mid-line,
              which is what fine print is allowed to do. */}
          <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-white/35 uppercase">
            &copy; {new Date().getFullYear()} {siteConfig.name}
            <span aria-hidden="true" className="mx-2 text-white/15">
              /
            </span>
            All rights reserved
            <span aria-hidden="true" className="mx-2 text-white/15">
              /
            </span>
            Developed by Swachhal Lamsal
          </p>

          <div className="flex items-center gap-5">
            {/* Anything still on the `#` placeholder is dropped, so nothing
                here can ship as a dead link. */}
            {socials.length > 0 && (
              <div className="flex items-center gap-2">
                {socials.map(([name, href]) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${siteConfig.name} on ${name}`}
                    className="grid h-9 w-9 place-items-center rounded-[4px] font-mono text-[0.75rem] uppercase text-white/60 ring-1 ring-white/10 transition-[transform,background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-[2px] hover:bg-brand-600 hover:text-white hover:ring-brand-600 motion-reduce:transition-none motion-reduce:hover:transform-none"
                  >
                    {/* Initial in the page's mono face — the site has no icon
                        set, and a borrowed platform glyph would be the only
                        foreign shape in the design. */}
                    <span aria-hidden="true">{name.charAt(0)}</span>
                  </a>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={toTop}
              className="group/top inline-flex w-fit items-center gap-3 rounded-full py-2 pl-5 pr-2 text-[0.875rem] font-medium text-white ring-1 ring-white/15 transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.07] hover:ring-white/30 active:scale-[0.98] motion-reduce:transition-none"
            >
              Back to top
              <span
                aria-hidden="true"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/top:-translate-y-[3px] group-hover/top:scale-105 motion-reduce:transition-none motion-reduce:group-hover/top:transform-none"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M12 18.5V6m0 0-5 5m5-5 5 5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
