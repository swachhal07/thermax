import { useLayoutEffect, useRef, useState } from 'react'
import Rise from '@/components/ui/Rise'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { siteConfig } from '@/lib/siteConfig'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
/* A test cylinder under callipers rather than another site photograph: the
   column beside it promises a product, a dosage and the data sheet the
   recommendation rests on, and this is where that comes from. It is also the
   only picture on the site that shows the desk instead of the ground. */
import labTest from '@/assets/images/concrete_testing_2024_blog2.webp'
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

/* Web3Forms takes the enquiry and mails it to the address the key is registered
   to. The key is a public identifier by design — it names an inbox, it does not
   authorise anything, and any client-side integration ships it in the bundle —
   so it sits in source and the site needs no environment setup to send mail.
   VITE_WEB3FORMS_ACCESS_KEY overrides it when one deploy should mail somewhere
   else; Vite inlines that at build time, so changing it needs a rebuild. */
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const ACCESS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? '6d299c7c-2d5b-4ba3-b701-9f44dc17dc5e'

/* Web3Forms treats any non-empty field of this name as a bot and drops the
   submission. We check it ourselves as well, so an obvious bot costs no
   request at all. */
const HONEYPOT = 'botcheck'

// What lands in the inbox. Slugs are resolved to the labels the sender actually
// clicked, and the subject carries the name and company so a full inbox can be
// read down the subject column alone.
function payloadFor(form) {
  const company = form.company.trim()
  const lines = form.lines
    .map((value) => LINES.find((line) => line.value === value)?.label ?? value)
    .join(', ')

  return {
    access_key: ACCESS_KEY,
    subject: `Enquiry — ${form.name.trim()}${company ? ` · ${company}` : ''}`,
    from_name: `${siteConfig.name} website`,
    // Web3Forms replies to this address, so the desk can answer the mail
    // directly rather than copying the address out of the body.
    email: form.email.trim(),
    name: form.name.trim(),
    company: company || 'Not given',
    phone: form.phone.trim() || 'Not given',
    product_lines: lines || 'None selected',
    message: form.message.trim(),
  }
}

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

    // Read before the first await: `currentTarget` is null by the time the
    // fetch resolves.
    const filled = new FormData(e.currentTarget).get(HONEYPOT)

    setErrors({})
    setStatus('sending')

    // A bot filled the field no human can see. Report success and post nothing
    // — telling a scraper it failed just invites the retry.
    if (filled) {
      setStatus('sent')
      setForm(EMPTY)
      return
    }

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payloadFor(form)),
      })

      // Web3Forms answers 200 with `success: false` for a rejected key or a
      // spam verdict, so the status code alone is not the answer.
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? `Web3Forms returned ${response.status}`)
      }

      setStatus('sent')
      setForm(EMPTY)
    } catch (error) {
      console.error('Enquiry not sent:', error)
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
              {/* Nepal first, India second, separated by a comma rather than by
                  a gap: this is a Kathmandu supplier, so the local line is the
                  one to try first, and two numbers set apart by whitespace read
                  as two separate facts rather than one list. Inline text, not a
                  flex row, so the comma stays welded to the number in front of
                  it and the pair wraps as a sentence would. */}
              <dd className="mt-2.5 text-[1.1875rem] leading-snug text-ink">
                {[
                  { number: siteConfig.phoneAlt, href: telAlt },
                  { number: siteConfig.phone, href: tel },
                ].map(({ number, href }, i) => (
                  <span key={number}>
                    {/* Equal air either side, so the comma reads as sitting
                        between the two numbers rather than hanging off the first.
                        The margins carry the spacing instead of a literal space,
                        and a zero-width space keeps a line break possible on a
                        narrow phone. */}
                    {i > 0 && (
                      <>
                        <span className="mx-[0.3em] text-ink/40">,</span>
                        {'​'}
                      </>
                    )}
                    <a
                      href={href}
                      className="whitespace-nowrap tabular-nums transition-colors duration-300 hover:text-brand-600"
                    >
                      {number}
                    </a>
                  </span>
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
                Head Office
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
                      {/* Honeypot, the field Web3Forms itself looks for. Hidden
                          from sight, from the accessibility tree and from the
                          tab order, so nothing that reads or keyboards this
                          form can reach it — only something filling every input
                          it finds in the DOM. sr-only would have read it out. */}
                      <input
                        type="text"
                        name={HONEYPOT}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="hidden"
                      />

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
                src={labTest}
                width={1082}
                height={822}
                loading="lazy"
                decoding="async"
                alt="A gloved technician measuring a cast concrete test cylinder with callipers beside a compression testing machine"
                className="h-56 w-full bg-ink/5 object-cover object-[55%_50%] sm:h-72 lg:h-64"
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
    </>
  )
}
