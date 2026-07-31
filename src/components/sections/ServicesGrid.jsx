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
                {/* ── SHADOWS AND HOVER COST ───────────────────────────────────
                    ⚠ `shadow-[a,b]` DOES NOT WORK IN TAILWIND v4. Verified against
                    the generated stylesheet: no `.shadow-\[…\]` rule is emitted at
                    all for a multi-layer value, because the top-level comma between
                    the two shadow layers stops the utility's value from parsing. The
                    class silently does nothing, so this card has never had the
                    shadow it appears to ask for — and the `transition-shadow` on it
                    was animating a property that never changed.

                    Written as an arbitrary PROPERTY instead — `[box-shadow:…]` —
                    which does accept top-level commas. The blueprint ruling
                    elsewhere on the site relies on the same escape hatch for its
                    two stacked gradients, which is how we know the form is sound.

                    Kept as TWO STACKED LAYERS crossfading on opacity rather than one
                    element transitioning `box-shadow`. A box-shadow transition
                    re-rasterises the blurred shadow region on the main thread every
                    frame; opacity is composited, so the deepening is free. Now that
                    the shadow actually renders, that distinction starts to matter.

                    It is also why `overflow-hidden` moved off this <Link> and onto
                    the image wrapper below: a box-shadow draws OUTSIDE the border
                    box, so a clipping ancestor erases it. The clip is only ever
                    needed around the photograph that scales on hover. */}
                <Link
                  to={`/services#${service.slug}`}
                  className="group relative block h-full rounded-xl bg-ink"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl [box-shadow:0_1px_2px_rgba(20,23,28,0.06),0_12px_28px_-16px_rgba(20,23,28,0.35)]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 [box-shadow:0_1px_2px_rgba(20,23,28,0.08),0_22px_44px_-18px_rgba(20,23,28,0.45)] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                  />

                  {/* Aspect ratio governs the plate up to `lg`, where a fixed
                      row height takes over so the 7/5 pair lines up exactly.

                      The inner hairline — which catches the plate's own edge
                      against the grey field, since a photograph ends on a soft
                      crop and the corner is otherwise lost — is a `ring-inset`
                      on this element rather than the extra absolute overlay it
                      started as. Same pixels, one fewer full-plate layer to
                      paint and blend per card. */}
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
                        /* Scaled fractionally past the frame so the slow
                           push-in on hover never exposes an edge. */
                        className="absolute inset-0 h-full w-full scale-[1.02] object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-[1.02]"
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

                    {/* Legibility scrim. Deeper and taller than it was, because
                        the summary line below the title is permanent now rather
                        than something hover reveals. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-ink/95 via-ink/60 to-transparent"
                    />
                    {/* Full-frame wash on hover. The photograph steps back so
                        the spec row can come forward over it. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-ink/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                    />
                  </div>

                  {/* Catalogue reference. Was only ever visible on the fallback
                      tile; it belongs on the real plates too, and it's the one
                      mark that makes four photographs read as an index. */}
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-white/55 transition-colors duration-500 group-hover:text-white/85 motion-reduce:transition-none sm:left-6 sm:top-6"
                  >
                    {service.code}
                  </span>

                  {/* Arrow disc, matching the island CTA in How we work. Leans
                      out of its corner as the plate lifts.

                      ⚠ NO `backdrop-blur` HERE, and its absence is deliberate. A
                      backdrop-filter makes the browser read back the composited
                      pixels underneath the element and convolve them, and it
                      keeps a layer for that whether or not the element is
                      visible — so four of these were charging for a readback per
                      card while sitting at `opacity-0`. Over a photograph that
                      hover has already washed to 50% ink, the blur was doing
                      nothing a flat translucent fill doesn't do. */}
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:transform-none sm:right-6 sm:top-6"
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

                  {/* `contain-layout` on the overlay, because the block below
                      animates `grid-template-rows` — a LAYOUT animation, the one
                      genuinely expensive thing left on this hover. Containment tells
                      the browser the size change inside here cannot affect anything
                      outside, so each frame relayouts this subtree instead of
                      walking back up through the card, the grid and the section. */}
                  <div className="absolute inset-x-0 bottom-0 contain-layout p-5 sm:p-6">
                    <h3
                      className={cn(
                        'font-semibold leading-[1.15] tracking-[-0.01em] text-white text-balance',
                        wide ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
                      )}
                    >
                      {service.title}
                    </h3>

                    {/* Permanent, and the substantive change here: the plate used
                        to carry nothing but a title until a pointer arrived, so on
                        a phone — where there is no hover — these were four
                        photographs with four names on them. `summary` is the one
                        line written for exactly this position. */}
                    <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-white/75 text-pretty">
                      {service.summary}
                    </p>

                    {/* Hover now discloses the spec row instead of the basics —
                        four terms that were already in the data and unused on this
                        page. Expands from zero height rather than fading in place,
                        so the title lifts as the row arrives under it. The 0fr →
                        1fr grid row is the only way to transition to auto. */}
                    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none">
                      <div className="overflow-hidden">
                        <ul className="mt-4 flex list-none flex-wrap gap-1.5 p-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                          {service.spec.map((term) => (
                            <li
                              key={term}
                              className="rounded-[3px] bg-white/10 px-2 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-white/80 ring-1 ring-inset ring-white/15"
                            >
                              {term}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
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
