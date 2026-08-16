import { useRef, useState } from 'react'
import Rise from '@/components/ui/Rise'
import { siteConfig } from '@/lib/siteConfig'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
import siteWork from '@/assets/images/about-site.webp'

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

export default function Contact() {
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
              Contact
            </span>
            <span className="hidden sm:block">Kathmandu</span>
          </div>
          <div aria-hidden="true" className="h-px w-full bg-ink/15" />

          <div className="mt-10 grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
            <Rise className="lg:col-span-7">
              <h1 className="max-w-[22ch] font-sans text-[2.75rem] font-extrabold leading-[1.0] tracking-[-0.025em] text-ink text-balance sm:text-[3.5rem] lg:text-[4.25rem]">
                Tell us what the <span className="text-brand-600">job needs.</span>
              </h1>
            </Rise>

            <Rise delay={120} className="lg:col-span-5 lg:self-end">
              <p className="max-w-[46ch] text-lg leading-relaxed text-muted text-pretty">
                Not a brochure request. Send the mix, the substrate and the date it
                has to be on site, and what comes back is a product, a dosage, and
                the data sheet the recommendation rests on.
              </p>
            </Rise>
          </div>

          <Rise delay={200}>
            <dl className="mt-12 grid grid-cols-1 border-b border-ink/15 sm:mt-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1fr_0.9fr]">
              <div className="border-t border-ink/15 py-6 lg:pr-8">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Phone
                </dt>
                <dd className="mt-2">
                  <div className="flex flex-col gap-1.5">
                    {[
                      { number: siteConfig.phone, href: tel },
                      { number: siteConfig.phoneAlt, href: telAlt },
                    ].map(({ number, href }) => (
                      <a
                        key={number}
                        href={href}
                        className="group inline-flex w-fit items-baseline text-[1.375rem] font-semibold leading-none tracking-[-0.01em] text-ink transition-colors duration-300 hover:text-brand-600 sm:text-[1.5rem]"
                      >
                        {number}
                        <span
                          aria-hidden="true"
                          className="ml-3 h-[1.5px] w-6 origin-left self-center bg-ink/20 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-x-[1.5] group-hover:bg-brand-600 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                        />
                      </a>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[0.875rem] leading-snug text-muted">
                    Quickest route if a pour is already scheduled.
                  </p>
                </dd>
              </div>

              <div className="border-t border-ink/15 py-6 lg:border-l lg:border-ink/15 lg:px-8">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Email
                </dt>
                <dd className="mt-2">
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-[1.0625rem] text-ink transition-colors duration-300 hover:text-brand-600"
                  >
                    {siteConfig.email}
                  </a>
                </dd>
              </div>

              <div className="border-t border-ink/15 py-6 lg:border-l lg:border-ink/15 lg:px-8">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Warehouse
                </dt>
                <dd className="mt-2 text-[1.0625rem] leading-snug text-ink">
                  {siteConfig.address}
                </dd>
              </div>

              <div className="border-t border-ink/15 py-6 lg:border-l lg:border-ink/15 lg:pl-8">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Hours
                </dt>
                <dd className="mt-2 text-[1.0625rem] leading-snug text-ink">
                  {siteConfig.hours}
                </dd>
              </div>
            </dl>
          </Rise>
        </div>
      </section>

      <section className="bg-[#f4f4f6] pb-20 pt-14 sm:pb-28 sm:pt-16">
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
                            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
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

      <section
        aria-labelledby="place-heading"
        className="relative isolate overflow-clip bg-white pt-12 pb-24 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-32"
      >

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(50%_26%_at_6%_8%,black,transparent_72%)]"
        />

        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <Rise className="text-center">

            <p className="flex items-center justify-center gap-3 font-mono text-[0.8125rem] tracking-[0.2em] text-ink uppercase">
              <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                <span className="block h-[2px] w-3 bg-brand-600" />
                <span className="block h-[2px] w-1.5 bg-brand-600/40" />
              </span>
              Warehouse
            </p>

            <h2
              id="place-heading"
              className="mx-auto mt-6 max-w-[22ch] font-sans text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.025em] text-balance text-ink sm:text-[2.75rem] lg:text-[3rem]"
            >
              The stock is in this city,{' '}
              <span className="text-brand-600">not on a ship.</span>
            </h2>
          </Rise>

          <Rise delay={140} className="mt-14 lg:-mr-10 xl:-mr-20">

            <div className="flex items-center justify-between gap-4 border-t border-ink/15 pt-4 pb-4">
              <p className="flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.22em] text-ink uppercase">
                <span aria-hidden="true" className="block h-[2px] w-3 shrink-0 bg-brand-600" />
                {siteConfig.mapPlace}
              </p>
              <div className="flex items-center gap-6">
                <p className="hidden font-mono text-[0.625rem] tracking-[0.22em] text-ink/40 uppercase sm:block">
                  {MAP_COORDS}
                </p>
                <p
                  aria-hidden="true"
                  className="flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.22em] text-ink/40 uppercase"
                >
                  <span
                    className={cn(
                      'block h-1.5 w-1.5 rounded-full transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
                      mapLive ? 'bg-brand-600' : 'bg-ink/20',
                    )}
                  />
                  {mapLive ? 'Live' : 'Static'}
                </p>
              </div>
            </div>

            <div className="relative isolate h-[22rem] overflow-hidden bg-ink/5 shadow-[0_1px_2px_rgba(20,23,28,0.05),0_40px_80px_-52px_rgba(20,23,28,0.55)] ring-1 ring-ink/[0.09] ring-inset sm:h-[24rem] lg:h-[27rem]">
              <iframe
                src={MAP_EMBED}
                title={`Map showing ${siteConfig.name} at the ${siteConfig.mapPlace}, ${siteConfig.address}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 saturate-[0.94]"
              />

              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
                <span className="absolute top-4 left-4 h-5 w-5 border-t border-l border-ink/25" />
                <span className="absolute bottom-4 left-4 h-5 w-5 border-b border-l border-ink/25" />
              </div>

              {!mapLive && (
                <button
                  type="button"
                  onClick={() => setMapLive(true)}
                  className="group absolute inset-0 z-10 flex cursor-pointer items-start justify-start p-4 pl-12 sm:p-5 sm:pl-14"
                >
                  <span className="sr-only">Enable map panning and zooming</span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-ink/[0.07] transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-0 motion-reduce:transition-none"
                  />
                  <span
                    aria-hidden="true"
                    className="relative flex items-center gap-2.5 rounded-full bg-white/92 px-4 py-2 font-mono text-[0.625rem] tracking-[0.22em] text-ink uppercase ring-1 ring-ink/10 shadow-[0_1px_2px_rgba(20,23,28,0.12),0_14px_30px_-16px_rgba(20,23,28,0.5)] transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white group-hover:ring-ink/20 group-active:scale-[0.98] motion-reduce:transition-none"
                  >
                    <span className="block h-1.5 w-1.5 rounded-full bg-brand-600" />
                    Tap to move the map
                  </span>
                </button>
              )}
            </div>
          </Rise>

          <Rise delay={160} className="text-center">
            <a
              href={MAP_DIRECTIONS}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-9 inline-flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-6 text-[0.9375rem] font-medium text-white shadow-[0_1px_2px_rgba(20,23,28,0.08),0_14px_30px_-18px_rgba(20,23,28,0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_1px_2px_rgba(20,23,28,0.1),0_22px_40px_-18px_rgba(20,23,28,0.55)] active:scale-[0.98] motion-reduce:transition-none"
            >
              Get directions
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
            </a>
          </Rise>

          <Rise delay={180}>
            <dl className="mt-10 divide-y divide-ink/10 border-t border-ink/15 sm:grid sm:grid-cols-3 sm:divide-y-0">
              {[
                { term: 'Address', value: siteConfig.address },
                { term: 'Open', value: siteConfig.hours },
                { term: 'Desk', value: siteConfig.phone, href: tel },
              ].map(({ term, value, href }, i) => (
                <div
                  key={term}
                  className={cn('py-6', i > 0 && 'sm:border-l sm:border-ink/12 sm:pl-8')}
                >
                  <dt className="font-mono text-[0.625rem] tracking-[0.22em] text-brand-600 uppercase">
                    {term}
                  </dt>
                  <dd className="mt-3 text-[1.0625rem] leading-snug text-pretty text-ink">
                    {href ? (
                      <a
                        href={href}
                        className="underline decoration-ink/20 decoration-1 underline-offset-4 transition-colors duration-300 hover:text-brand-600 hover:decoration-brand-600"
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
          </Rise>
        </div>
      </section>
    </>
  )
}
