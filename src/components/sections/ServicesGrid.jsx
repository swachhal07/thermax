import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { cn } from '@/lib/utils'
import { services } from '@/data/services'

/**
 * Product-line plates: four photographs, name burned into the lower left.
 *
 * Images resolve by filename so they can be dropped in without touching this
 * file — save each as `src/assets/images/service-<slug>.jpg` (or .png / .webp)
 * and it appears. Until one lands, that plate falls back to an ink field
 * carrying the catalogue code, which is a deliberate tile rather than a hole.
 */
const PHOTOS = import.meta.glob('../../assets/images/service-*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

/** `../../assets/images/service-oil-field-chemicals.jpg` → `oil-field-chemicals` */
const bySlug = Object.fromEntries(
  Object.entries(PHOTOS).map(([path, src]) => [
    path.replace(/^.*\/service-/, '').replace(/\.\w+$/, ''),
    src,
  ]),
)

/* ── NO BLUR TWIN ─────────────────────────────────────────────────────────────
   These plates used to cross-fade to a second copy of each photograph with a
   gaussian blur baked into the file (`blur-<slug>.webp`), so the image went soft
   under the type on hover. It has been taken out deliberately.

   What it cost: a second decoded image per card, and a permanently promoted
   compositor layer per card to hold it — the promotion was load-bearing, because
   without it the first hover of each card paid the decode mid-transition and
   stuttered. Four large always-resident textures for a softening most visitors
   never noticed.

   The hover still reads: the photograph pushes in, and a full-frame wash drops
   it back so the spec row can come forward. If the softening is ever wanted
   again, bring back the baked twin rather than a CSS `filter: blur()` — a CSS
   blur convolves the composited area every frame, which on a plate this size is
   far worse than the layer this removal just reclaimed.

   The `blur-*.webp` files are still in `src/assets/images/` and are now
   unreferenced, so nothing bundles them. */
const photoFor = (slug) => bySlug[slug] ?? null

/**
 * ── PLATE WIDTHS ────────────────────────────────────────────────────────────
 * Four equal tiles read as a menu of interchangeable options. These are four
 * different businesses, so the grid alternates 7/5 and 5/7 across a twelve
 * column field — a zig-zag that makes the eye travel rather than scan.
 *
 * Heights stay locked per row (`lg:h-[...]` on the plate, identical for both
 * items) so the widths are the only thing that varies. Asymmetric width with
 * aligned baselines reads as composed; asymmetry in both directions reads as
 * broken.
 *
 * The wide plate of each pair also carries the larger title — scale variance
 * follows the layout instead of being decoration on top of it.
 */
const LAYOUT = [
  { span: 'lg:col-span-7', wide: true },
  { span: 'lg:col-span-5', wide: false },
  { span: 'lg:col-span-5', wide: false },
  { span: 'lg:col-span-7', wide: true },
]

export default function ServicesGrid() {
  return (
    /* Lighter on top than the bottom — the About sheet above already ends on
       its own generous padding, so a full py-28 here doubled the gap. */
    /* ── GRAIN ────────────────────────────────────────────────────────────────
       The texture over the flat grey is a background on the section ITSELF, not
       an absolutely positioned overlay. An overlay spanning a section this tall
       is a second full-section paint the compositor has to blend on every
       scroll repaint; as a background it's part of the section's own paint and
       costs nothing extra. That also removes the need for `isolate` and the
       `-z-10` it was there to contain. */
    <section
      id="services"
      className="sheet-grain relative bg-[#f4f4f6] pb-16 pt-12 sm:pb-24 sm:pt-16"
    >
      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        {/* ── HEADER ─────────────────────────────────────────────────────────
            Centred, and now the heading alone — the supporting paragraph is
            gone, so the eyebrow, the claim and the count rule are the whole
            frame. With nothing to qualify it the heading gets the full width of
            its measure and the plates start sooner. */}
        <Rise as="header" className="mb-12 text-center sm:mb-16">
          {/* Same mark as the About sheet — the red is an accent here too, not
              a headline colour. */}
          <p className="mx-auto mb-6 flex w-fit items-center gap-3 font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-ink">
            <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
              <span className="block h-[2px] w-3 bg-brand-600" />
              <span className="block h-[2px] w-1.5 bg-brand-600/40" />
            </span>
            What we offer
          </p>
          <h2
            /* Sans, not the display serif the base layer puts on h2 — this
               section leads with the photographic grid, so the heading sits in
               the same family as the plate titles under it. Same treatment as
               the About sheet's h2 so the two section headings sit at one
               rank. */
            className="mx-auto max-w-3xl text-balance font-sans text-[2.5rem] font-bold leading-[1.04] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.25rem]"
          >
            {/* Red carries the closing phrase only — the same accent the About
                sheet puts on `together.` */}
            Four lines out of <span className="text-brand-600">one warehouse</span>
          </h2>

          {/* Rule with the count sitting on it. Symmetrical fades either side of
              the mark, so a centred heading resolves onto a centred line rather
              than onto a border that has a direction. */}
          <div className="mt-9 flex items-center gap-5 sm:mt-11">
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/8 to-ink/15"
            />
            <span className="shrink-0 font-mono text-[0.75rem] uppercase tracking-[0.18em] tabular-nums text-muted">
              {String(services.length).padStart(2, '0')} product lines
            </span>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-l from-transparent via-ink/8 to-ink/15"
            />
          </div>
        </Rise>

        <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-12">
          {services.map((service, i) => {
            const photo = photoFor(service.slug)
            const { span, wide } = LAYOUT[i % LAYOUT.length]

            return (
              <Rise as="li" key={service.slug} delay={i * 90} className={span}>
                {/* ── NO HOVER STATE ON THESE PLATES ───────────────────────────
                    Everything hover used to do here is gone: the photograph's
                    push-in, the full-frame wash, the deepening shadow, the spec
                    row expanding from zero height, and the arrow's lean. The
                    section read as laggy and this was the whole of the cost.

                    Four plates this size mean four simultaneous large-area
                    animations whenever the pointer crosses one, and one of them —
                    the spec row's `grid-template-rows` — was a real layout
                    animation, relayed out every frame. `contain-layout` bounded
                    that but could not make it cheap.

                    ⚠ Do not reintroduce a hover effect here without profiling it
                    at this scale first. A treatment that costs nothing on a
                    240px card is not the same treatment on a 780×430 plate; area
                    is what the compositor charges for.

                    The card still has affordance: the cursor, the permanently
                    visible arrow mark, and the focus outline the base layer draws
                    on `:focus-visible`. Nothing about the link is now hidden
                    behind a pointer.

                    ⚠ SHADOW SYNTAX — `shadow-[a,b]` DOES NOT WORK IN TAILWIND
                    v4. Verified against the generated stylesheet: no
                    `.shadow-\[…\]` rule is emitted for a multi-layer value,
                    because the top-level comma stops the utility's value from
                    parsing. Written as an arbitrary PROPERTY instead —
                    `[box-shadow:…]` — which does accept top-level commas. It is
                    also why `overflow-hidden` sits on the image wrapper rather
                    than on this <Link>: a box-shadow draws OUTSIDE the border
                    box, so a clipping ancestor erases it. */}
                <Link
                  to={`/services#${service.slug}`}
                  className="group relative block h-full rounded-xl bg-ink"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl [box-shadow:0_1px_2px_rgba(20,23,28,0.06),0_12px_28px_-16px_rgba(20,23,28,0.35)]"
                  />

                  {/* Aspect ratio governs the plate up to `lg`, where a fixed
                      row height takes over so the 7/5 pair lines up exactly.

                      The inner hairline catches the plate's own edge against the
                      grey field, since a photograph ends on a soft crop and the
                      corner is otherwise lost. */}
                  <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl ring-1 ring-inset ring-white/10 sm:aspect-[16/10] lg:aspect-auto lg:h-[clamp(21rem,30vw,27rem)]">
                    {photo ? (
                      <img
                        src={photo}
                        loading="lazy"
                        decoding="async"
                        alt={service.imageAlt}
                        /* Crop is per-photo — see `focus` in the data. Inline
                           because Tailwind can't generate classes from data. */
                        style={{ objectPosition: service.focus }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="field-grain flex h-full w-full items-center justify-center bg-ink">
                        <span
                          aria-hidden="true"
                          className="font-mono text-[clamp(3rem,8vw,5rem)] uppercase leading-none tracking-[0.08em] text-white/[0.07]"
                        >
                          {service.code}
                        </span>
                      </div>
                    )}

                    {/* Legibility scrim, sized to the type block. It carries the
                        title and the summary line on its own now — there is no
                        hover wash behind them to help. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-ink/95 via-ink/60 to-transparent"
                    />
                  </div>

                  {/* Catalogue reference. Was only ever visible on the fallback
                      tile; it belongs on the real plates too, and it's the one
                      mark that makes four photographs read as an index. */}
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-white/60 sm:left-6 sm:top-6"
                  >
                    {service.code}
                  </span>

                  {/* Arrow mark, matching the island CTA in How we work. Now
                      permanently visible rather than something hover fades in —
                      with the hover state gone this is what tells a visitor the
                      plate is a link, so it cannot be conditional on a pointer
                      that a touch device doesn't have.

                      ⚠ NO `backdrop-blur` HERE. A backdrop-filter makes the
                      browser read back the composited pixels underneath and
                      convolve them, and it holds a layer to do that whether or
                      not the element is visible. Over a photograph, a flat
                      translucent fill is indistinguishable and free. */}
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white sm:right-6 sm:top-6"
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

                  {/* The type block. `contain-layout` used to be here to bound
                      the spec row's `grid-template-rows` animation; nothing in
                      this subtree changes size anymore, so there is nothing left
                      to contain. */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <h3
                      className={cn(
                        'font-semibold leading-[1.15] tracking-[-0.01em] text-white text-balance',
                        wide ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
                      )}
                    >
                      {service.title}
                    </h3>

                    {/* The plate used to carry nothing but a title until a
                        pointer arrived — so on a phone these were four
                        photographs with four names on them. `summary` is the one
                        line written for exactly this position, and it stays
                        put.

                        The `spec` terms are NOT here. They were the thing hover
                        disclosed, and the disclosure was the expensive part; four
                        chips per plate shown permanently would crowd the type
                        block and push the scrim past the point where the
                        photograph still reads. They live on the /services detail
                        page, which is where this link goes. */}
                    <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-white/75 text-pretty">
                      {service.summary}
                    </p>
                  </div>
                </Link>
              </Rise>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
