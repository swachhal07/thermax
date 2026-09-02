import { useLayoutEffect, useRef, useState } from 'react'
import Rise from '@/components/ui/Rise'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { siteConfig } from '@/lib/siteConfig'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
import siteWork from '@/assets/images/about-site.webp'
import pourImage from '@/assets/images/Pouring_concrete-e1745414985283.webp'

const LINE_LABELS = {
  dams: 'Dams',
  bridges: 'Bridges',
  roads: 'Roads',
  tunnels: 'Tunnels',
}

const LINES = services.map((s) => ({
  value: s.slug,
  code: s.code,
  label: LINE_LABELS[s.slug] ?? s.title,
}))

const ASSURANCES = [
  {
    term: 'Reply',
    value: 'Same or next working day for anything in the valley.',
  },
  {
    term: 'Outside Kathmandu',
    value: 'Depends on the transport leg. You get the honest date, not the hopeful one.',
  },
  {
    term: 'Trials',
    value: 'Trial quantities for a genuine project are usually workable — say the volume it leads to.',
  },
]

const EMPTY = { name: '', company: '', email: '', phone: '', lines: [], message: '' }

const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(siteConfig.mapQuery)}&z=17&output=embed`
const MAP_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteConfig.mapQuery)}`

const MAP_COORDS = (() => {
  const [lat, lng] = siteConfig.mapQuery.split(',').map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return siteConfig.address
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`
})()

function validate(form) {
  const errors = {}

  if (!form.name.trim()) errors.name = 'We need a name to address the reply to.'

  const email = form.email.trim()
  if (!email) errors.email = 'An email address, so the reply has somewhere to land.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    errors.email = 'That address looks incomplete — worth a second look.'

  if (form.message.trim().length < 12)
    errors.message = 'A couple of lines about the job, and we can come back with a product.'

  return errors
}

function FieldLabel({ htmlFor, children, optional }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink"
    >
      <span aria-hidden="true" className="mt-[0.35em] block h-[2px] w-3 shrink-0 bg-brand-600" />
      {children}
      {optional && <span className="text-ink/40">optional</span>}
    </label>
  )
}

/* Ruled fields, not filled boxes. Six grey rectangles stacked in a white plate
   is the heaviest thing on this page; a hairline the text sits on carries the
   same affordance with none of the weight, and it is the language the rest of
   the site already speaks. The focus line is drawn with a box-shadow rather
   than a thicker border so nothing reflows when it lands. */
const FIELD = [
  'w-full rounded-none border-0 border-b border-ink/[0.18] bg-transparent px-0 py-3.5',
  'text-[1.0625rem] text-ink placeholder:text-ink/30',
  'transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
  'hover:border-ink/35',
  'outline-none focus:border-brand-600 focus:shadow-[0_1px_0_0_var(--color-brand-600)]',
  'motion-reduce:transition-none',
].join(' ')

const FIELD_ERROR = 'border-brand-600 shadow-[0_1px_0_0_var(--color-brand-600)]'

function ErrorNote({ id, children }) {
  return (
    <p id={id} className="mt-2 text-[0.8125rem] leading-snug text-brand-700">
      {children}
    </p>
  )
}

/* The contact hero is the page's first viewport, so it gets a composed intro
   rather than the generic per-block fade Rise gives the sections below. Same
   idiom as the about hero: kicker leads, headline and copy overlap into it, and
   the photograph arrives from the right on its own slightly later track while
   the rows at the foot come up last. Everything is opacity/transform,
   and `from` tweens mean the static markup is the finished state — so with
   reduced motion, or before the script runs, the section is already complete. */
function useContactHeroMotion(sectionRef) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { duration: 1.05, ease: 'power3.out' } })
        .from('[data-contact-hero="kicker"]', { opacity: 0, y: 14, duration: 0.7 })
        .from('[data-contact-hero="headline"] > span', { opacity: 0, y: 34, stagger: 0.09 }, '-=0.45')
        .from('[data-contact-hero="sub"]', { opacity: 0, y: 22 }, '-=0.85')
        .from('[data-contact-hero="cta"]', { opacity: 0, y: 18, duration: 0.9 }, '-=0.8')
        .from('[data-contact-hero="figure"]', { opacity: 0, x: 44, duration: 1.3 }, 0.25)
        .from('[data-contact-hero="plate"]', { opacity: 0, y: 22, duration: 1 }, '-=0.7')
        .from('[data-contact-hero="rows"] > *', { opacity: 0, y: 14, stagger: 0.08 }, '-=0.85')
    }, section)

    return () => ctx.revert()
  }, [sectionRef])
}

export default function Contact() {
  const heroRef = useRef(null)
  useContactHeroMotion(heroRef)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [mapLive, setMapLive] = useState(false)
  const fields = useRef({})

  const set = (name) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  // Product line is a multi-select: a job can want admixtures for the deck and
  // waterproofing for the tunnel in the same enquiry.
  const toggleLine = (value) => () =>
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.includes(value)
        ? prev.lines.filter((v) => v !== value)
        : [...prev.lines, value],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    const found = validate(form)
    const firstBad = Object.keys(found).find((key) => found[key])
    if (firstBad) {
      setErrors(found)
      fields.current[firstBad]?.focus()
      return
    }

    setErrors({})
    setStatus('sending')

    try {
      await new Promise((resolve) => setTimeout(resolve, 700))
      setStatus('sent')
      setForm(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  const tel = `tel:${siteConfig.phone.replace(/\s+/g, '')}`
  const telAlt = `tel:${siteConfig.phoneAlt.replace(/\s+/g, '')}`
  const sending = status === 'sending'

  return (
    <>
      {/* The contact opening used to be a white page split 7/5: a column of copy
          beside a column of contact details, both drawn in the same hairlines
          and mono labels, both the same weight. Nothing led, the right half read
          as leftover, and the full width of the page was never used.

      {/* The contact opening used to be a white page split 7/5: a column of copy
          beside a column of contact details, both drawn in the same hairlines
          and mono labels, both the same weight. Nothing led, the right half read
          as leftover, and the full width of the page was never used.

      {/* Four passes on this section all failed the same way: every idea that
          got added — a numbered strip of the three things to send, a tinted
          board of four labelled cells, a corner bloom — was defensible on its
          own and made the page heavier in aggregate. What is actually needed at
          the top of a contact page is a headline, one line of context, and a
          number to call.

          So: three blocks, one hairline, and a lot of air. The three things to
          send were cut outright — the form below asks for all of them by name,
          and listing them here was the page saying the same thing twice. */}
      <section
        ref={heroRef}
        className="field-grain-on-white relative isolate overflow-hidden bg-white pb-14 pt-6 sm:pb-20 sm:pt-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.045)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(95%_60%_at_50%_0%,black,transparent_72%)]"
        />

        <div className="mx-auto w-full max-w-[96rem] px-5 sm:px-10">
          <div data-contact-hero="kicker">
            <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-muted">
              <span className="flex items-center gap-3 text-ink">
                <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                  <span className="block h-[2px] w-3 bg-brand-600" />
                  <span className="block h-[2px] w-1.5 bg-brand-600/40" />
                </span>
                Contact
              </span>
              <span className="hidden sm:block">{MAP_COORDS}</span>
            </div>
            <div aria-hidden="true" className="h-px w-full bg-ink/15" />
          </div>

          {/* Every other page hero on this site sets the headline against a
              photograph that runs full height and bleeds off the right edge —
              about, and each of the application pages. Contact was the only one
              carrying its whole fold on type and hairlines, which is why no
              amount of re-ruling the columns fixed it: the section was missing
              the thing the rest of the site uses to hold the right half, not
              missing a better arrangement of labels. */}
          <div className="mt-10 grid items-start gap-y-12 pb-12 sm:pb-16 lg:grid-cols-12 lg:gap-x-16">
            <div className="lg:col-span-6">
              <h1
                data-contact-hero="headline"
                className="font-sans text-[clamp(2.25rem,4.4vw,4rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink text-balance"
              >
                Tell us what the job <span className="text-brand-600">needs.</span>
              </h1>

              <p
                data-contact-hero="sub"
                className="mt-7 max-w-[52ch] text-base leading-relaxed text-ink/75 text-pretty sm:text-lg"
              >
                Not a brochure request. Send the mix, the substrate and the date it
                has to be on site, and what comes back is a product, a dosage, and
                the data sheet the recommendation rests on.
              </p>

              <a
                data-contact-hero="cta"
                href="#brief"
                className="group mt-9 inline-flex w-fit items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-[0.9375rem] font-medium text-white shadow-[0_1px_2px_rgba(20,23,28,0.08),0_14px_30px_-18px_rgba(20,23,28,0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_1px_2px_rgba(20,23,28,0.1),0_22px_40px_-18px_rgba(20,23,28,0.55)] active:scale-[0.98] motion-reduce:transition-none"
              >
                Write the specification
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-[3px] group-hover:bg-brand-600 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path
                      d="M12 5.5v13M6.5 13l5.5 5.5L17.5 13"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </div>

            {/* A pour, because that is the deadline the copy is asking about —
                the date it has to be on site is the day this happens, and the
                specification either arrived before it or did not.

                It does not bleed past the measure: its right edge is the same
                one the two rules and the last column of facts sit on, and it
                takes its height from the copy beside it so neither column ends
                with a run of dead space under it. It reaches left to the far
                side of the gutter, which is as wide as it goes without eating
                the copy's measure; giving it a height floor instead would only
                move the leftover space into the left column. */}
            <div
              data-contact-hero="figure"
              className="lg:col-span-6 lg:col-start-7 lg:h-full lg:self-stretch"
            >
              <figure className="relative overflow-hidden bg-ink/5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)] lg:h-full">
                <div className="relative h-[17rem] sm:h-[23rem] lg:absolute lg:inset-0 lg:h-full">
                  <img
                    src={pourImage}
                    fetchPriority="high"
                    decoding="async"
                    alt="Fresh concrete going down on a site pour, screeded flat while it is still workable"
                    className="absolute inset-0 h-full w-full object-cover object-[58%_58%]"
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10"
                />
              </figure>
            </div>
          </div>
        </div>

        {/* The facts run edge to edge rather than stopping at the 84rem measure
            the copy above uses — the extra width is what keeps four columns
            from crowding, and the band reads as the floor of the section rather
            than as one more block stacked inside it. It shares its 96rem
            measure with the copy above, so the kicker, the headline and the
            first column of facts all hang off one left edge — and the rule over
            the facts starts and ends exactly where the rule under the kicker
            does, rather than running out into the gutters. The first column
            is given half again the width of the others so both numbers sit on
            one line; below that they wrap rather than overrun the divider.

            The top padding sits on the cells, not on the wrapper, so each
            column's rule starts at the horizontal one and the row is drawn as a
            connected grid instead of four lines floating under a line. */}
        <div
          data-contact-hero="plate"
          className="mx-auto w-full max-w-[96rem] px-5 sm:px-10"
        >
          <dl
            data-contact-hero="rows"
            className="grid grid-cols-1 gap-y-8 border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-y-0"
          >
            <div className="pt-7">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted">
                Phone
              </dt>
              <dd className="mt-2.5 flex flex-wrap items-baseline gap-x-6 gap-y-1">
                {[
                  { number: siteConfig.phone, href: tel },
                  { number: siteConfig.phoneAlt, href: telAlt },
                ].map(({ number, href }) => (
                  <a
                    key={number}
                    href={href}
                    className="w-fit whitespace-nowrap text-[1.1875rem] leading-snug tabular-nums text-ink transition-colors duration-300 hover:text-brand-600"
                  >
                    {number}
                  </a>
                ))}
              </dd>
            </div>

            <div className="pt-7 sm:border-l sm:border-ink/12 sm:pl-8">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted">
                Email
              </dt>
              <dd className="mt-2.5">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-[1.1875rem] leading-snug text-ink transition-colors duration-300 hover:text-brand-600"
                >
                  {siteConfig.email}
                </a>
              </dd>
            </div>

            <div className="pt-7 lg:border-l lg:border-ink/12 lg:pl-8">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted">
                Warehouse
              </dt>
              <dd className="mt-2.5">
                <a
                  href={MAP_DIRECTIONS}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 text-[1.1875rem] leading-snug text-ink transition-colors duration-300 hover:text-brand-600"
                >
                  {siteConfig.address}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-ink/35 transition-colors duration-300 group-hover:text-brand-600"
                  >
                    <path
                      d="M6.5 17.5 17.5 6.5M9 6.5h8.5V15"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </dd>
            </div>

            <div className="pt-7 sm:border-l sm:border-ink/12 sm:pl-8">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted">
                Hours
              </dt>
              <dd className="mt-2.5 text-[1.1875rem] leading-snug text-ink">
                {siteConfig.hours}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="brief" className="scroll-mt-24 bg-[#f4f4f6] pb-20 pt-14 sm:pb-28 sm:pt-16">
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-14 lg:gap-y-0">
            <Rise>
              <div className="rounded-[2rem] bg-ink/[0.04] p-1.5 ring-1 ring-ink/[0.06]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-white p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(20,23,28,0.04),0_18px_40px_-24px_rgba(20,23,28,0.28)] sm:p-11">
                  {status === 'sent' ? (
                    <div className="py-6 sm:py-10">
                      <p className="flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.22em] text-ink">
                        <span
                          aria-hidden="true"
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
                            <path
                              d="m5 12.5 4.5 4.5L19 7.5"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        Received
                      </p>
                      <h2 className="mt-6 max-w-[24ch] font-sans text-[1.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink text-balance sm:text-[2rem]">
                        It's with the desk,{' '}
                        <span className="text-brand-600">not a queue.</span>
                      </h2>
                      <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted text-pretty">
                        Someone reads it today and comes back with a product, a
                        dosage and a date — same or next working day. If the pour
                        is sooner than that, call.
                      </p>

                      <div className="mt-8 flex flex-col gap-4 border-t border-ink/10 pt-7 sm:flex-row sm:items-center">
                        <a
                          href={tel}
                          className="group inline-flex w-fit items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-[0.9375rem] font-medium text-white shadow-[0_1px_2px_rgba(20,23,28,0.08),0_14px_30px_-18px_rgba(20,23,28,0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_1px_2px_rgba(20,23,28,0.1),0_22px_40px_-18px_rgba(20,23,28,0.55)] active:scale-[0.98] motion-reduce:transition-none"
                        >
                          Call {siteConfig.phone}
                          <span
                            aria-hidden="true"
                            className="grid h-9 w-9 place-items-center rounded-full bg-ink/[0.07] transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:scale-105 group-hover:bg-white/15 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
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
                        </a>

                        <button
                          type="button"
                          onClick={() => setStatus('idle')}
                          className="w-fit text-left text-[0.9375rem] font-medium text-ink/70 underline decoration-ink/20 decoration-1 underline-offset-4 transition-colors duration-300 hover:text-brand-600 hover:decoration-brand-600"
                        >
                          Send another enquiry
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate>
                      <p className="flex w-fit items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.22em] text-ink">
                        <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                          <span className="block h-[2px] w-3 bg-brand-600" />
                          <span className="block h-[2px] w-1.5 bg-brand-600/40" />
                        </span>
                        Enquiry
                      </p>
                      <h2 className="mt-5 max-w-[24ch] font-sans text-[2rem] font-bold leading-[1.06] tracking-[-0.025em] text-ink text-balance sm:text-[2.5rem]">
                        Six lines and we can{' '}
                        <span className="text-brand-600">specify it.</span>
                      </h2>

                      <fieldset className="mt-11 border-0 p-0">
                        <legend className="mb-4 flex items-baseline gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink">
                          <span
                            aria-hidden="true"
                            className="mt-[0.35em] block h-[2px] w-3 shrink-0 bg-brand-600"
                          />
                          Product line
                          <span className="text-ink/40">optional &mdash; pick any</span>
                        </legend>

                        <div className="flex flex-wrap gap-2.5">
                          {LINES.map((line) => (
                            <label key={line.value} className="cursor-pointer">
                              <input
                                type="checkbox"
                                name="lines"
                                value={line.value}
                                checked={form.lines.includes(line.value)}
                                onChange={toggleLine(line.value)}
                                className="peer sr-only"
                              />
                              <span
                                className={cn(
                                  'flex items-center gap-2.5 rounded-full py-3 pr-5 pl-4 text-[0.875rem] font-medium ring-1',
                                  'transition-[background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                                  'bg-[#f2f2f5] text-ink/75 ring-ink/[0.07]',
                                  'peer-checked:bg-ink peer-checked:text-white peer-checked:ring-ink',
                                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600',
                                  'motion-reduce:transition-none',
                                )}
                              >
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    'font-mono text-[0.625rem] tracking-[0.14em] transition-colors duration-300',
                                    form.lines.includes(line.value)
                                      ? 'text-white/55'
                                      : 'text-brand-600',
                                  )}
                                >
                                  {line.code}
                                </span>
                                {line.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <div className="mt-11 grid gap-8 sm:grid-cols-2 sm:gap-x-10">
                        <div>
                          <FieldLabel htmlFor="name">Name</FieldLabel>
                          <input
                            id="name"
                            name="name"
                            ref={(el) => (fields.current.name = el)}
                            value={form.name}
                            onChange={set('name')}
                            autoComplete="name"
                            placeholder="Who we're replying to"
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                            className={cn('mt-1', FIELD, errors.name && FIELD_ERROR)}
                          />
                          {errors.name && <ErrorNote id="name-error">{errors.name}</ErrorNote>}
                        </div>

                        <div>
                          <FieldLabel htmlFor="company" optional>
                            Company / site
                          </FieldLabel>
                          <input
                            id="company"
                            name="company"
                            value={form.company}
                            onChange={set('company')}
                            autoComplete="organization"
                            placeholder="Contractor, plant, or project"
                            className={cn('mt-1', FIELD)}
                          />
                        </div>

                        <div>
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            inputMode="email"
                            ref={(el) => (fields.current.email = el)}
                            value={form.email}
                            onChange={set('email')}
                            autoComplete="email"
                            placeholder="name@company.com"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            className={cn('mt-1', FIELD, errors.email && FIELD_ERROR)}
                          />
                          {errors.email && <ErrorNote id="email-error">{errors.email}</ErrorNote>}
                        </div>

                        <div>
                          <FieldLabel htmlFor="phone" optional>
                            Phone
                          </FieldLabel>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            value={form.phone}
                            onChange={set('phone')}
                            autoComplete="tel"
                            placeholder="Faster than email, both ways"
                            className={cn('mt-1', FIELD)}
                          />
                        </div>
                      </div>

                      <div className="mt-9">
                        <FieldLabel htmlFor="message">What the job needs</FieldLabel>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          ref={(el) => (fields.current.message = el)}
                          value={form.message}
                          onChange={set('message')}
                          placeholder="The mix and substrate, the ambient conditions, what the element has to survive, the volume, and the date it has to be on site."
                          aria-invalid={Boolean(errors.message)}
                          aria-describedby={cn(
                            'message-hint',
                            errors.message && 'message-error',
                          )}
                          className={cn(
                            'mt-1 resize-y leading-relaxed',
                            FIELD,
                            errors.message && FIELD_ERROR,
                          )}
                        />
                        {errors.message ? (
                          <ErrorNote id="message-error">{errors.message}</ErrorNote>
                        ) : null}
                        <p
                          id="message-hint"
                          className="mt-2 text-[0.8125rem] leading-snug text-muted"
                        >
                          Rough is fine — the specifics are what stop the reply
                          being a question back.
                        </p>
                      </div>

                      <div className="mt-11 flex flex-col gap-5 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="submit"
                          disabled={sending}
                          className="group inline-flex w-fit items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-[0.9375rem] font-medium text-white shadow-[0_1px_2px_rgba(20,23,28,0.08),0_14px_30px_-18px_rgba(20,23,28,0.5)] transition-[transform,box-shadow,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_1px_2px_rgba(20,23,28,0.1),0_22px_40px_-18px_rgba(20,23,28,0.55)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none"
                        >
                          {sending ? 'Sending…' : 'Send the enquiry'}
                          <span
                            aria-hidden="true"
                            className="grid h-9 w-9 place-items-center rounded-full bg-ink/[0.07] transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:scale-105 group-hover:bg-white/15 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                          >
                            {sending ? (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="8"
                                  stroke="currentColor"
                                  strokeOpacity="0.3"
                                  strokeWidth="1.75"
                                />
                                <path
                                  d="M20 12a8 8 0 0 0-8-8"
                                  stroke="currentColor"
                                  strokeWidth="1.75"
                                  strokeLinecap="round"
                                />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                <path
                                  d="M6.5 17.5 17.5 6.5M9 6.5h8.5V15"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                        </button>

                        <p className="max-w-[24ch] text-[0.8125rem] leading-snug text-muted">
                          Goes to the technical desk. Nothing here is used for
                          anything else.
                        </p>
                      </div>

                      <div aria-live="polite" className="empty:hidden">
                        {status === 'error' && (
                          <div className="mt-6 rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-600/25">
                            <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-700">
                              Not sent
                            </p>
                            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink">
                              The form didn't get through. Try again, or call{' '}
                              <a
                                href={tel}
                                className="font-medium underline decoration-brand-600/40 decoration-1 underline-offset-4 hover:decoration-brand-600"
                              >
                                {siteConfig.phone}
                              </a>{' '}
                              — your text is still in the fields.
                            </p>
                          </div>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </Rise>

            <Rise from="right" delay={140} className="lg:sticky lg:top-32 lg:self-start">
              <img
                src={siteWork}
                width={1100}
                height={728}
                loading="lazy"
                decoding="async"
                alt="Two steel fixers in orange vests kneeling over a rebar mat on a fresh slab, cutting gear and coiled hose around them"
                className="h-56 w-full bg-ink/5 object-cover object-[50%_45%] sm:h-72 lg:h-64"
              />

              <dl className="mt-9 border-t border-ink/15">
                {ASSURANCES.map(({ term, value }) => (
                  <div key={term} className="border-b border-ink/15 py-5">
                    <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                      {term}
                    </dt>
                    <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink/80 text-pretty">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-6 text-[0.875rem] leading-relaxed text-muted text-pretty">
                Specifying against a live pour?{' '}
                <a
                  href={tel}
                  className="font-medium text-ink underline decoration-ink/25 decoration-1 underline-offset-4 transition-colors duration-300 hover:text-brand-600 hover:decoration-brand-600"
                >
                  Call instead
                </a>
                {' '}— it's a shorter conversation than a form.
              </p>
            </Rise>
          </div>
        </div>
      </section>

      {/* The depot, as one instrument rather than three centred things.
          Before: a centred kicker and headline, a map bled off the right edge on
          a different axis to everything above it, and a centred button floating
          underneath — nothing shared a left edge, and the map carried the whole
          claim on its own. A map is not evidence of stock; the address, the
          hours you can collect in, and a number to ring before you drive are.
          So the map keeps its half and the other half states the depot, welded
          into a single plate with no gap between them. */}
      <section
        aria-labelledby="place-heading"
        className="relative isolate overflow-clip bg-white pt-12 pb-24 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-32"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(50%_26%_at_6%_8%,black,transparent_72%)]"
        />

        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          {/* Same rail every other section on the site opens with, so this one
              hangs off the page's left edge instead of its centre line. */}
          <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] tracking-[0.2em] text-muted uppercase">
            <span className="flex items-center gap-3 text-ink">
              <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                <span className="block h-[2px] w-3 bg-brand-600" />
                <span className="block h-[2px] w-1.5 bg-brand-600/40" />
              </span>
              Warehouse
            </span>
            <span className="hidden tabular-nums sm:block">{MAP_COORDS}</span>
          </div>
          <div aria-hidden="true" className="h-px w-full bg-ink/15" />

          <Rise className="mt-12 sm:mt-14">
            <h2
              id="place-heading"
              className="mx-auto text-center font-sans text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.06] font-extrabold tracking-[-0.03em] text-balance text-ink"
            >
              The stock is in this city,{' '}
              <span className="text-brand-600">not on a ship.</span>
            </h2>
          </Rise>

          {/* One plate, two halves, no gutter between them: the depot's facts and
              the ground they sit on are the same object. */}
          <Rise delay={140} className="mt-12 sm:mt-16">
            {/* The panel is a fixed plate and the map takes the rest: a 12-column
                split gave the facts 44% of the width at 1440 and left the map
                looking like the smaller half of an argument it is supposed to be
                the evidence for. */}
            <div className="grid overflow-hidden bg-white shadow-[0_1px_2px_rgba(20,23,28,0.05),0_44px_86px_-54px_rgba(20,23,28,0.6)] ring-1 ring-ink/[0.09] ring-inset lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
              {/* Ink half. The site is white nearly everywhere, which is what
                  makes one dark plate at the foot of the page read as the floor
                  rather than as decoration — and it is what stops the map's own
                  greys from being the darkest thing here. */}
              <div className="field-grain-on-black relative flex flex-col bg-ink p-7 text-white sm:p-9 lg:p-10">
                <p className="flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.22em] text-white/55 uppercase">
                  <span aria-hidden="true" className="block h-[2px] w-3 shrink-0 bg-brand-600" />
                  Collection point
                </p>

                <p className="mt-6 font-sans text-[1.375rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-[1.5rem]">
                  {siteConfig.mapPlace}
                </p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/55">
                  {siteConfig.address}
                </p>

                {/* Coordinates rather than a street line because that is what
                    the address field actually resolves to — and they are what
                    you hand a driver. */}
                <dl className="mt-8 border-t border-white/[0.14]">
                  {[
                    { term: 'Open', value: siteConfig.hours },
                    { term: 'Call ahead', value: siteConfig.phone, href: tel },
                    { term: 'Coordinates', value: MAP_COORDS, mono: true },
                  ].map(({ term, value, href, mono }) => (
                    <div
                      key={term}
                      className="flex items-baseline justify-between gap-5 border-b border-white/[0.14] py-3.5"
                    >
                      <dt className="shrink-0 font-mono text-[0.625rem] tracking-[0.22em] text-white/45 uppercase">
                        {term}
                      </dt>
                      <dd
                        className={cn(
                          'text-right text-[0.9375rem] leading-snug text-white',
                          mono && 'font-mono text-[0.8125rem] tracking-[0.06em] tabular-nums',
                        )}
                      >
                        {href ? (
                          <a
                            href={href}
                            className="tabular-nums whitespace-nowrap underline decoration-white/25 decoration-1 underline-offset-4 transition-colors duration-300 hover:text-brand-400 hover:decoration-brand-400"
                          >
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* mt-auto: on wide screens the panel is stretched to the map's
                    height, and the action belongs at the foot of it rather than
                    floating under the last rule. */}
                <a
                  href={MAP_DIRECTIONS}
                  target="_blank"
                  rel="noreferrer noopener"
                  /* Optical balance beats measured balance here. Centring the
                     label left 52px of bare white on one side against a filled
                     disc on the other, and the pill read as half empty. Label
                     left, arrow right — the same pill every other CTA on the
                     site uses. */
                  className="group mt-9 inline-flex w-fit items-center gap-3 self-start rounded-full bg-white py-2 pr-2 pl-6 text-[0.9375rem] font-medium text-ink transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_18px_36px_-18px_rgba(0,0,0,0.6)] active:scale-[0.98] motion-reduce:transition-none lg:mt-auto"
                >
                  Get directions
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/[0.07] transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:bg-brand-600 group-hover:text-white motion-reduce:transition-none motion-reduce:group-hover:transform-none"
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
                </a>
              </div>

              {/* Ground half. Ordered first on a phone — the map is what tells
                  you where this is; the panel is what you read once you know. */}
              <div className="relative isolate order-first h-[19rem] bg-ink/5 sm:h-[24rem] lg:order-none lg:h-[32rem]">
                {/* Google's own map is the noisiest thing we put on this site:
                    orange restaurant pins, blue shop icons, park green, four
                    scripts of label. Held to grey it becomes what we actually
                    want from it — the shape of the streets around the yard — and
                    it hands the only colour in the frame back to the reticle.
                    Colour returns the moment you ask for the live map, which is
                    what makes that state change visible rather than notional. */}
                <iframe
                  src={MAP_EMBED}
                  title={`Map showing ${siteConfig.name} at the ${siteConfig.mapPlace}, ${siteConfig.address}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className={cn(
                    'absolute inset-0 h-full w-full border-0 transition-[filter] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                    mapLive
                      ? '[filter:saturate(0.95)]'
                      : '[filter:grayscale(1)_contrast(1.06)_brightness(1.04)]',
                  )}
                />

                {/* The embed centres on the coordinates, so dead centre is the
                    yard — which lets us annotate it rather than mark it twice.
                    A ring around Google's pin, not another pin on top of it. */}
                <div
                  aria-hidden="true"
                  style={{ opacity: mapLive ? 0 : 1 }}
                  /* Nudged up 0.9rem off dead centre: the embed's pin is anchored
                     by its point, so its body sits above the coordinate. Centred
                     on the coordinate, the ring looked like it had slipped down
                     the pin — centred on the pin, it reads as aimed at it. */
                  className="pointer-events-none absolute inset-0 z-20 -translate-y-[0.9rem] transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                >
                  <span className="absolute top-1/2 left-1/2 block h-[7rem] w-[7rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/[0.07] ring-[1.5px] ring-brand-600/45" />
                  <span className="absolute top-1/2 left-1/2 block h-[1.25rem] w-px -translate-x-1/2 -translate-y-[4.75rem] bg-brand-600/45" />
                  <span className="absolute top-1/2 left-1/2 block h-[1.25rem] w-px -translate-x-1/2 translate-y-[3.5rem] bg-brand-600/45" />
                  <span className="absolute top-1/2 left-1/2 block h-px w-[1.25rem] -translate-x-[4.75rem] -translate-y-1/2 bg-brand-600/45" />
                  <span className="absolute top-1/2 left-1/2 block h-px w-[1.25rem] translate-x-[3.5rem] -translate-y-1/2 bg-brand-600/45" />
                </div>

                {/* Survey brackets, plus a vignette so the map's own greys settle
                    into the plate instead of stopping at a hard edge. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_70px_rgba(20,23,28,0.07)]"
                >
                  <span className="absolute top-4 left-4 h-5 w-5 border-t border-l border-ink/30" />
                  <span className="absolute top-4 right-4 h-5 w-5 border-t border-r border-ink/30" />
                  <span className="absolute bottom-4 left-4 h-5 w-5 border-b border-l border-ink/30" />
                  <span className="absolute right-4 bottom-4 h-5 w-5 border-r border-b border-ink/30" />
                </div>

                {/* One control, not two: the state readout is the affordance, and
                    the whole frame is the hit area behind it. The pill used to
                    sit bottom-left, on top of Google's satellite thumbnail. */}
                <p
                  aria-hidden="true"
                  className="pointer-events-none absolute top-4 right-4 z-30 flex items-center gap-2.5 rounded-full bg-white/90 px-3.5 py-2 font-mono text-[0.625rem] tracking-[0.22em] text-ink/70 uppercase ring-1 ring-ink/10 backdrop-blur-[2px]"
                >
                  <span
                    className={cn(
                      'block h-1.5 w-1.5 rounded-full transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
                      mapLive ? 'bg-brand-600' : 'bg-ink/25',
                    )}
                  />
                  {mapLive ? 'Live' : 'Static · tap for live map'}
                </p>

                {/* The iframe only takes the pointer once you ask it to, so the
                    page never traps a scroll on the way past. */}
                {!mapLive && (
                  <button
                    type="button"
                    onClick={() => setMapLive(true)}
                    onKeyDown={(e) => e.key === 'Enter' && setMapLive(true)}
                    className="group absolute inset-0 z-20 cursor-pointer"
                  >
                    <span className="sr-only">
                      Switch to the live map — enables panning, zooming and full
                      colour
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-white/25 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-0 motion-reduce:transition-none"
                    />
                  </button>
                )}
              </div>
            </div>
          </Rise>
        </div>
      </section>
    </>
  )
}
