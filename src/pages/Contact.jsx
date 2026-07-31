import { useRef, useState } from 'react'
import Rise from '@/components/ui/Rise'
import { siteConfig } from '@/lib/siteConfig'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
// 1100px WebP rather than the 1400px JPEG next to it — the plate renders at
// 432px on desktop and this never displays above ~640px. 362 kB → 140 kB.
import siteWork from '@/assets/images/about-site.webp'

/**
 * Contact — THE ENQUIRY SHEET.
 *
 * The page the whole site points at, so it has one job: turn "I have a pour
 * coming" into something the desk can actually answer. A three-field
 * name/email/message box can't do that — it produces "please send details",
 * which costs the visitor a day and the business a reply.
 *
 * So the form is written as the specification it wants to receive. The field
 * set asks for the mix, the substrate, the conditions and the date, and the
 * product-line chips let someone say what they're buying in one tap before
 * they've typed a word. The placeholder in the message field is the site's own
 * answer from the FAQ, turned into an instruction: tell us these five things
 * and you get a product, a dosage, and a data sheet back.
 *
 * The phone comes FIRST, above the form and set at display size. The home page
 * says out loud that some of this is "a phone call rather than a form" — a
 * contact page that buries the number in small grey type at the bottom of a
 * column contradicts it. Anyone with a pour waiting takes the top route; the
 * form is for everyone who'd rather write it down.
 *
 * Language is the one already shipping: the ruled mono sheet header from the
 * About block, the plate-in-tray enclosure from the process steps and the FAQ
 * rows, the ink island CTA, red spent only on labels and one phrase of the
 * headline. Inputs are recessed inside the white plate — the same inset the
 * numbered discs use — so the sheet reads as something to be filled in rather
 * than as a stack of outlined boxes.
 */

/** Short chip labels, keyed to the catalogue. Full titles run far too long here. */
const LINE_LABELS = {
  'ion-exchange-resins': 'Resins',
  'oil-field-chemicals': 'Oil field',
  'fuel-water-treatment': 'Fuel & water',
  'construction-chemicals': 'Construction',
}

const LINES = [
  ...services.map((s) => ({ value: s.slug, code: s.code, label: LINE_LABELS[s.slug] ?? s.title })),
  { value: 'unsure', code: '—', label: 'Not sure yet' },
]

/**
 * Answered before they're asked. Every line here is a promise the site already
 * makes in the FAQ, restated at the moment it's actually load-bearing: while
 * someone decides whether writing this out is worth their afternoon.
 */
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

const EMPTY = { name: '', company: '', email: '', phone: '', line: '', message: '' }

/* Keyless Google embeds — a search embed for the tiles, and the directions
   deep link for the button, both built off the one query in siteConfig so the
   pin and the route can never drift apart.

   Zoom 17: the query is now a coordinate pair rather than a city, so the frame
   can sit at building scale — close enough to read the street the gate is on
   without losing the junctions a driver navigates by. */
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(siteConfig.mapQuery)}&z=17&output=embed`
const MAP_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteConfig.mapQuery)}`

/**
 * The pin, restated for a human. Derived from `mapQuery` rather than typed out
 * again so the label on the tray can never disagree with the tiles behind it —
 * four decimals is roughly 11 metres, which is the gate.
 *
 * Falls back to the address if `mapQuery` is ever set back to a place name
 * instead of a coordinate pair; the bar reads as instrumentation either way.
 */
const MAP_COORDS = (() => {
  const [lat, lng] = siteConfig.mapQuery.split(',').map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return siteConfig.address
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`
})()

/**
 * Validated on submit rather than on every keystroke — errors that appear while
 * a half-typed address is still being typed read as nagging.
 */
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

/** Mono field label carrying the red tick the rest of the site uses. */
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

/* Recessed rather than outlined: the plate is white, so a white input with a
   border would be a box drawn on a box. Placeholder sits at 22% ink — a ghost
   prompt, deliberately far under the 4.5:1 text threshold, so nothing
   load-bearing lives in one: every field has a real label above it, and the
   hint under the message field is set in `muted`, which does clear the ratio. */
const FIELD = [
  'w-full rounded-xl bg-[#f4f4f6] px-4 py-3 text-[0.9375rem] text-ink',
  'shadow-[inset_0_1px_2px_rgba(20,23,28,0.07)] ring-1 ring-ink/[0.08]',
  'placeholder:text-ink/22 transition-[box-shadow,background-color] duration-300',
  'outline-none focus:bg-white focus:ring-2 focus:ring-brand-600',
].join(' ')

const FIELD_ERROR = 'ring-2 ring-brand-600 bg-brand-50/60'

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
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  // The map starts inert. An iframe that accepts touch immediately catches the
  // thumb of anyone scrolling past it and pans the city instead of the page.
  const [mapLive, setMapLive] = useState(false)
  const fields = useRef({})

  const set = (name) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear this field's error as soon as it's being addressed; leave the rest.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const found = validate(form)
    const firstBad = Object.keys(found).find((key) => found[key])
    if (firstBad) {
      setErrors(found)
      // Send focus to the first problem rather than announcing three at once.
      fields.current[firstBad]?.focus()
      return
    }

    setErrors({})
    setStatus('sending')

    try {
      // TODO: wire to the real endpoint (Formspree, Resend, own API, ...). The
      // payload below is the shape the desk needs; keep the field names.
      await new Promise((resolve) => setTimeout(resolve, 700))
      setStatus('sent')
      setForm(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  const tel = `tel:${siteConfig.phone.replace(/\s+/g, '')}`
  const sending = status === 'sending'

  return (
    <>
      {/* ── THE HEAD ────────────────────────────────────────────────────────
          Ruled mono header, headline, then the direct routes as a datasheet
          row. Nothing is enclosed up here: the routes are facts about the
          business, and boxing each one would turn four facts into four cards. */}
      <section className="relative isolate overflow-hidden bg-white pb-16 pt-6 sm:pb-20 sm:pt-10">
        {/* Same blueprint ruling as the About sheet, masked out before it
            reaches the routes so the hairlines below stay the only rules. */}
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

          {/* Direct routes. Uneven columns on purpose — the number is the
              fastest way to get an answer and is sized to say so. */}
          <Rise delay={200}>
            <dl className="mt-12 grid grid-cols-1 border-b border-ink/15 sm:mt-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1fr_0.9fr]">
              <div className="border-t border-ink/15 py-6 lg:pr-8">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand-600">
                  Phone
                </dt>
                <dd className="mt-2">
                  <a
                    href={tel}
                    className="group inline-flex items-baseline text-[1.5rem] font-semibold leading-none tracking-[-0.01em] text-ink transition-colors duration-300 hover:text-brand-600 sm:text-[1.75rem]"
                  >
                    {siteConfig.phone}
                    <span
                      aria-hidden="true"
                      className="ml-3 h-[1.5px] w-6 origin-left self-center bg-ink/20 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-x-[1.5] group-hover:bg-brand-600 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                    />
                  </a>
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

      {/* ── THE SHEET ───────────────────────────────────────────────────────
          Grey field so the white plate has something to sit on, matching the
          services grid and the certification row. */}
      <section className="bg-[#f4f4f6] pb-20 pt-14 sm:pb-28 sm:pt-16">
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-14 lg:gap-y-0">
            {/* Left: the form, or the receipt that replaces it. */}
            <Rise>
              <div className="rounded-[2rem] bg-ink/[0.04] p-1.5 ring-1 ring-ink/[0.06]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(20,23,28,0.04),0_18px_40px_-24px_rgba(20,23,28,0.28)] sm:p-9">
                  {status === 'sent' ? (
                    /* The form is gone rather than cleared. A blank set of
                       fields under a green line reads as though nothing was
                       sent; an empty plate with a receipt on it doesn't. */
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
                      <p className="font-mono text-[0.75rem] uppercase tracking-[0.22em] text-muted">
                        Enquiry
                      </p>
                      <h2 className="mt-4 max-w-[26ch] font-sans text-[1.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink text-balance sm:text-[2rem]">
                        Six lines and we can{' '}
                        <span className="text-brand-600">specify it.</span>
                      </h2>

                      {/* Product line first. It's one tap, it tells the desk
                          which shelf this lives on, and it sets the frame the
                          message gets written inside. */}
                      <fieldset className="mt-9 border-0 p-0">
                        <legend className="mb-4 flex items-baseline gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink">
                          <span
                            aria-hidden="true"
                            className="mt-[0.35em] block h-[2px] w-3 shrink-0 bg-brand-600"
                          />
                          Product line
                          <span className="text-ink/40">optional</span>
                        </legend>

                        <div className="flex flex-wrap gap-2.5">
                          {LINES.map((line) => (
                            <label key={line.value} className="cursor-pointer">
                              <input
                                type="radio"
                                name="line"
                                value={line.value}
                                checked={form.line === line.value}
                                onChange={set('line')}
                                className="peer sr-only"
                              />
                              <span
                                className={cn(
                                  'flex items-center gap-2.5 rounded-full py-2.5 pl-3.5 pr-4 text-[0.875rem] font-medium ring-1 transition-[background-color,color,box-shadow] duration-300',
                                  'bg-[#f4f4f6] text-ink/75 ring-ink/[0.08] hover:text-ink hover:ring-ink/20',
                                  'peer-checked:bg-ink peer-checked:text-white peer-checked:ring-ink',
                                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600',
                                )}
                              >
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    'font-mono text-[0.625rem] tracking-[0.14em] transition-colors duration-300',
                                    form.line === line.value ? 'text-white/55' : 'text-brand-600',
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

                      {/* Paired rows: who you are, then how to reach you. Two
                          columns from sm up — these are short values and a full
                          -width input for a phone number is a lie about how much
                          you're expected to write. */}
                      <div className="mt-8 grid gap-5 sm:grid-cols-2">
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
                            className={cn('mt-3', FIELD, errors.name && FIELD_ERROR)}
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
                            className={cn('mt-3', FIELD)}
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
                            className={cn('mt-3', FIELD, errors.email && FIELD_ERROR)}
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
                            className={cn('mt-3', FIELD)}
                          />
                        </div>
                      </div>

                      {/* The field that decides whether the reply is useful, so
                          the placeholder does the teaching rather than leaving
                          "Message" to mean whatever it means. */}
                      <div className="mt-6">
                        <FieldLabel htmlFor="message">What the job needs</FieldLabel>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
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
                            'mt-3 resize-y leading-relaxed',
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

                      <div className="mt-9 flex flex-col gap-5 border-t border-ink/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
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
                              /* Rotation only, and it stops the moment the
                                 state leaves 'sending'. */
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

                      {/* Live region sits after the controls so it isn't read as
                          part of the form, and it always exists — announcing an
                          error only works if the region was there beforehand. */}
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

            {/* Right: the questions someone asks themselves before deciding the
                form is worth their afternoon, answered up front. Sticks beside
                the plate on wide screens; on a phone it simply follows it. */}
            <Rise from="right" delay={140} className="lg:sticky lg:top-32 lg:self-start">
              <img
                src={siteWork}
                width={1100}
                height={728}
                loading="lazy"
                decoding="async"
                alt="Two steel fixers in orange vests kneeling over a rebar mat on a fresh slab, cutting gear and coiled hose around them"
                /* Not rounded to match the plate — it's a photograph on the
                   field, the same square-edged treatment the About contact
                   sheet gives its plates. */
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

      {/* ── THE PLACE ───────────────────────────────────────────────────────
          The map is the last thing on the page because it answers the last
          question — the stock is in a building, in this city, and someone can
          drive to it. That claim is the whole positioning ("held in Kathmandu,
          not on a ship"), so it gets a band of its own rather than a link in a
          column.

          ── REBUILT. WHAT THIS REPLACED, AND WHY ─────────────────────────────
          The previous version put the tiles in a machined tray — tinted shell,
          hairline ring, a mono instrumentation bar above and another below — in a
          7-column box beside a 5-column dossier. Every one of those decisions was
          defensible on its own and the sum was wrong: a light rectangle in a pale
          frame, roughly 4:3, with thin grey type on the rails top and bottom, is
          the silhouette of a device screenshot. The harder it was framed, the more
          it looked like a photograph OF a map rather than the place itself. And at
          7 columns the tiles were too small to read a route from, which is the only
          thing a map on a contact page is for.

          So the composition is inverted rather than adjusted:

            • THE MAP IS A HORIZON, not a panel. Full container width, bleeding
              past the right gutter the way the plates on /about do, at roughly
              3:1. A wide strip cannot read as a tablet — nothing is that shape —
              and at this width the junctions a driver actually navigates by are
              legible.
            • THE FRAME IS GONE. One hairline ring and a soft ambient drop, the
              treatment every photograph on this site gets. No tray, no rails: the
              readings that lived on them are now a single machined bar ABOVE the
              strip, which doubles as the rule that separates the strip from the
              heading.
            • THE FACTS ARE A ROW, not a column. Address, hours and desk run as
              three ruled cells across the full measure UNDER the strip — the same
              band grammar the /about hero closes with — so the section reads as
              heading → place → particulars, top to bottom, instead of as two
              unequal columns of unrelated things.

          What is kept, deliberately: the blueprint ruling behind it, the mono
          register, square corners, the `saturate-[0.94]` restraint on Google's
          palette, and the interaction shield — the one piece of the old version
          that was solving a real problem rather than a decorative one. */}
      <section
        aria-labelledby="place-heading"
        /* Top trimmed against the section above rather than matched to the
           bottom: that block ends on its own long padding and the two stack, so a
           full `pt-28` here left the Warehouse kicker sitting a long way below the
           last thing a reader had finished. Bottom stays long — the footer is
           next, and the ruled band needs air under it before the ink starts. */
        /* `overflow-clip`, NOT `overflow-hidden`. Both clip the strip's bleed, but
           `hidden` makes the section a SCROLL CONTAINER — it just refuses to draw
           scrollbars. Measured: the strip overflows by 40px, so any programmatic
           scroll (a hash link's scrollIntoView reaching an element inside, an
           assistive-tech scroll) shifts this whole section 40px left of every other
           block on the page and leaves it there. `clip` cannot be scrolled at all,
           so the overflow is unreachable rather than merely invisible. */
        className="relative isolate overflow-clip bg-white pt-12 pb-24 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-32"
      >
        {/* Blueprint ruling, anchored to the HEADING and dead before the strip.
            It used to be anchored bottom-left at `85% 75%`, which was right when
            the map sat in a tray inside seven columns — the ruling had a wide empty
            corner to itself. With the strip now running the full measure, that mask
            put faint 1px lines directly alongside the strip's left and bottom
            edges, a couple of pixels off parallel with them.

            THAT IS WHY THE MAP LOOKED SLANTED. Nothing here rotates — a near-
            parallel hairline beside a real edge is one of the oldest optical
            illusions there is; the eye reads the pair as converging and assigns the
            tilt to the solid object. Pulled up and in (`50% 26%` at `6% 8%`), the
            ruling now lives behind the kicker and heading and is gone well above the
            strip, so there is no false parallel anywhere near a real edge.

            If the strip ever still reads as off, check for a faint line beside it
            before looking for a transform — there isn't one to find. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(50%_26%_at_6%_8%,black,transparent_72%)]"
        />

        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          {/* ── The header. Kicker and heading only.
              The lead paragraph that stood beside it — "Which is why a delivery
              date is a delivery date…" — was removed on instruction, and the
              button went with it to below the map. So there is no second column to
              place and no grid to place it on: a heading on its own needs only a
              measure to wrap against. Same correction the /about page's headers
              carry, for the same reason. */}
          <Rise className="text-center">
            {/* Kicker set at the home page's "About us" scale — 0.8125rem at
                0.2em rather than the 0.625rem/0.22em used for instrumentation
                labels. The two sizes mean different things on this site: this one
                is a section's name, the small one is a reading on a bar. Matching
                the front page's makes /contact's closing block announce itself the
                same way the home page's about block does.

                `justify-center`, not `mx-auto`: the element is `flex`, so it
                already spans the measure and it is the CONTENT that has to move.
                `mx-auto` on a full-width flex box does nothing at all. */}
            <p className="flex items-center justify-center gap-3 font-mono text-[0.8125rem] tracking-[0.2em] text-ink uppercase">
              <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                <span className="block h-[2px] w-3 bg-brand-600" />
                <span className="block h-[2px] w-1.5 bg-brand-600/40" />
              </span>
              Warehouse
            </p>

            {/* Red on the closing phrase, "not on a ship".
                It was on "this city" and moved on instruction — which also fixes a
                real fault: centred at this measure the line broke between "this"
                and "city", so the accent was split across two lines and the second
                line opened with a red word and a black comma hanging off it. The
                closing phrase sits whole on the last line at every width the
                heading takes.

                It also puts this heading back on the site's device: the page's h1
                and the form heading both take their accent on the closing phrase
                too.

                `mx-auto` is needed as well as the inherited `text-center`: the
                measure cap makes this box narrower than its parent, and a narrow
                block does not centre itself just because its text is centred. */}
            <h2
              id="place-heading"
              className="mx-auto mt-6 max-w-[22ch] font-sans text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.025em] text-balance text-ink sm:text-[2.75rem] lg:text-[3rem]"
            >
              The stock is in this city,{' '}
              <span className="text-brand-600">not on a ship.</span>
            </h2>
          </Rise>

          {/* ── The strip. Bleeds past the right gutter and the section clips it,
              so the city runs off the page rather than stopping politely inside
              the measure — the device the /about plates use. */}
          <Rise delay={140} className="mt-14 lg:-mr-10 xl:-mr-20">
            {/* The machined bar, now the only one. It is also the rule under the
                header, which is why it carries a `border-t` and no frame: one
                hairline doing two jobs instead of a tray drawing four.

                Three readings, left to right: what the plate is showing, the pin
                it is centred on, and whether it will take a gesture. The
                coordinate hides below `sm` — it is the least useful of the three
                to someone holding a phone, and the first to force a second line. */}
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

            {/* The tiles. Square, hairline ring, diffused ambient drop — the
                photograph treatment, so the map is the same species of object as
                every other picture on the site.

                Panoramic on purpose: 3:1 at `lg`, taller on a phone where a wide
                strip would be a letterbox two streets deep. */}
            <div className="relative isolate h-[22rem] overflow-hidden bg-ink/5 shadow-[0_1px_2px_rgba(20,23,28,0.05),0_40px_80px_-52px_rgba(20,23,28,0.55)] ring-1 ring-ink/[0.09] ring-inset sm:h-[24rem] lg:h-[27rem]">
              <iframe
                src={MAP_EMBED}
                title={`Map showing ${siteConfig.name} at the ${siteConfig.mapPlace}, ${siteConfig.address}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                /* Only a hair off. Heavy grayscale existed to stop Google's
                   motorway ochres fighting a red card sitting on the tiles;
                   nothing sits on them, and pulling them further just made the one
                   honest picture of the place look dead. */
                className="absolute inset-0 h-full w-full border-0 saturate-[0.94]"
              />

              {/* Two brackets, not three, and only on the left. At 3:1 a bracket
                  in every corner turns the strip into a targeting reticle; the
                  pair on the leading edge is enough to say the frame was chosen.
                  The right side is left clear for Google's own controls. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
                <span className="absolute top-4 left-4 h-5 w-5 border-t border-l border-ink/25" />
                <span className="absolute bottom-4 left-4 h-5 w-5 border-b border-l border-ink/25" />
              </div>

              {/* Interaction shield, carried over intact — the one part of the old
                  design solving a real problem. An iframe that accepts touch on
                  sight catches the thumb of anyone scrolling past and pans the city
                  instead of the page, so the tiles start inert under a thin veil
                  and the first click, tap or tab hands them over for good.

                  The chip sits top-left, away from the pin at the centre and from
                  Google's controls at the bottom right. */}
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

          {/* ── The action, now directly under the strip on instruction — it used
              to sit beside the heading, above the map it refers to.

              CENTRED on instruction, which is what a pill can carry where a
              paragraph can't: a rounded shape with no ragged edge sits centred
              without looking unaligned, and it is the only object on this line, so
              there is nothing beside it for the centre axis to fight. `text-center`
              on the wrapper is what moves it — the anchor is `inline-flex`, so it
              is placed by its parent's text alignment rather than by a margin of
              its own.

              It also has the space to itself: this is the only interactive thing in
              the section apart from the tiles, and the ruled band underneath closes
              the block after it. */}
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

          {/* ── The particulars. Three ruled cells across the full measure, the
              band grammar the /about hero closes with — label over value, one
              hairline over the row, verticals between the cells. Ranged under the
              strip rather than stacked beside it: an address, an opening time and
              a phone number are three short facts about one building, and a column
              of three rows on the left made them look like three separate
              subjects.

              The band does NOT take the strip's bleed. A rule can run off the page
              (the /about hero's does); a phone number that runs off the page is a
              phone number someone can't read. */}
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
