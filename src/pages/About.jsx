import AboutHero from '@/components/sections/AboutHero'
import Rise from '@/components/ui/Rise'
import Counter from '@/components/ui/Counter'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
// The one plate on this page that is still a JPEG. It's a noisy outdoor frame at
// 900×1150 and re-encoding it to WebP at matching quality gained nothing worth
// the second file — same reasoning as the hero poster.
import crewPlate from '@/assets/images/about-crew.jpg'
// Shared with the home-page about block, same as the site plate above.
import labPlate from '@/assets/about-plate-lab.webp'

/**
 * About — THE COMPANY SHEET.
 *
 * Was four stacked `<Section>` calls of scaffolding: "Paragraph one", "Name
 * One", "Certification A". It's one argument now, in the language the rest of
 * the site already speaks — the ruled mono kicker, the plate in a tray, red
 * spent only on labels and one phrase of a heading, and the field tone changing
 * grey → white so the seam needs no rule drawn across it.
 *
 * Leadership and the certification grid were both cut on the client's
 * instruction, as was a project ledger that briefly stood where the figures are
 * now, and the shared <CTA /> island that used to close the page. The
 * certification marks still have a home on the front page, where they run past on
 * the marquee. There is no leadership block anywhere on the site now, and the
 * About dropdown in siteConfig lost its second entry with it.
 *
 * NOTE the page now ends without a call to action, so nothing on it routes to
 * /contact. That is deliberate on instruction, not an omission — but it does mean
 * the only way out of this page is the header.
 *
 * Three blocks: the story opens the page on grey, quality and the figures close
 * on white. The plates alternate sides — the story's on the right, the quality
 * block's on the left — so no two consecutive sections resolve the same way.
 *
 * THE PAGE HAS AN OPENING BLOCK AGAIN: components/sections/AboutHero. Not the
 * old masthead, which was cut on instruction and stays deleted — an editorial
 * split on WHITE, in the register the sections below already use. Three
 * consequences worth knowing before touching it:
 *   • The field is white on instruction, so /about stays OFF OVERLAY_ROUTES: the
 *     header bar remains solid and Layout keeps padding this page down by its
 *     height. Darkening that block means changing both.
 *   • The story section's heading is an h2 again — the page's h1 lives in
 *     AboutHero now.
 *   • The hero animates on load; every block below it still reveals on scroll
 *     through <Rise />.
 *   • Field tone now runs white → grey → white → white down the page. The hero's
 *     bottom edge is carried by the grey below it, same as every other seam here.
 *
 * ONE THING HERE IS NOT SAFE TO SHIP: three of the four figures in the last
 * block are invented. See the note above `STATS`.
 *
 * What the page deliberately does NOT invent: dates, headcounts, revenue, or
 * names. A founding year here gets quoted back, and a fabricated one is worse
 * than an absent one. Every factual claim is one the site already publishes
 * elsewhere — the manufacturer, the group, the four lines, stock held in
 * Kathmandu — so the pages agree with each other.
 */

/**
 * Section kicker — the two-tick mark and mono caps that open the services grid,
 * the process, and the certification row.
 */
function Kicker({ className, children }) {
  return (
    <p
      className={cn(
        'mb-6 flex w-fit items-center gap-3 font-mono text-[0.8125rem] tracking-[0.2em] text-ink uppercase',
        // `w-fit` above is what makes the mark hug its label; a centred kicker
        // therefore needs `mx-auto` passed in, not `text-center` inherited.
        className,
      )}
    >
      <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
        <span className="block h-[2px] w-3 bg-brand-600" />
        <span className="block h-[2px] w-1.5 bg-brand-600/40" />
      </span>
      {children}
    </p>
  )
}

/**
 * The chain of custody, which is the actual answer to "who are you" for a
 * distributor: three links, and the page's job is to show that none of them is
 * a handoff to someone who stops caring. Numbered because the order is the
 * content — the same reason the process steps are numbered.
 */
const CHAIN = [
  {
    id: 'formulated',
    term: 'Formulated',
    body: 'Thermax has spent decades making chemistry for industry — resins, treatment chemicals, oil field and construction lines, produced under audited management systems and sold into plants worldwide.',
  },
  {
    id: 'held',
    term: 'Held',
    body: 'Through the MV Dugar Group the catalogue is stocked in Kathmandu rather than ordered in against each job. A product that has to be imported after the specification is agreed is a product that arrives after the pour.',
  },
  {
    id: 'supported',
    term: 'Supported',
    body: 'The same desk that quotes the product specifies it, and goes to site when the substrate turns out not to match the drawing. Nothing is handed to a call centre once the invoice is out.',
  },
]

/**
 * Quality and testing — the four checks between a batch being made and a drum
 * going down on site.
 *
 * ── CONFIRM BEFORE LAUNCH ─────────────────────────────────────────────────
 * These are commitments, not description. "Documented" and "Traceable" in
 * particular promise paperwork on request, and the site is only allowed to
 * promise it if the desk can actually produce it. Same standard as the desk
 * hours in siteConfig, which carry the same note.
 */
const CHECKS = [
  {
    term: 'Tested',
    body: 'Every batch is checked against its specification before release, under the manufacturer’s audited quality management system rather than against a house standard.',
  },
  {
    term: 'Documented',
    body: 'The technical data sheet goes out with the quotation rather than after it, and a certificate of analysis can be requested against the batch you were sent.',
  },
  {
    term: 'Specified',
    body: 'Dosage is worked out against your mix, your substrate, and the conditions on the day. The figure on the tin is where that starts, not where it ends.',
  },
  {
    term: 'Traceable',
    body: 'Batch records sit with the stock in Kathmandu, so a drum standing on site can be tied back to the batch that was tested.',
  },
]

/**
 * ── CLIENT FIGURE REQUIRED ────────────────────────────────────────────────
 * The year the group started supplying in Nepal. A placeholder, and the one to
 * get right first, because the figure derived from it is a claim about how long
 * the business has been trading.
 *
 * Held as the start year rather than as the elapsed count on purpose: a hard
 * `28` in the array is correct for one year and quietly wrong every year after.
 * This subtracts, so the figure is right for as long as the site is up and
 * nobody has to remember to bump it.
 */
const NEPAL_SINCE = 1998
const yearsInNepal = new Date().getFullYear() - NEPAL_SINCE

/**
 * The figures, counted up as the row scrolls in. See components/ui/Counter.
 *
 * ██ TWO OF THESE FOUR FIGURES ARE INVENTED ████████████████████████████████
 *
 * Real, and self-maintaining:
 *   Years in Nepal        — derived from NEPAL_SINCE above (whose year is still
 *                           a placeholder, but the arithmetic on top of it isn't)
 *   Product lines         — counts data/services.js, so adding a fifth range
 *                           moves the figure and it can never contradict the
 *                           catalogue
 *
 * Placeholders, and they must be replaced before launch:
 *   Projects completed, Districts reached
 *
 * A number on an About page is the most quotable thing on a website — it gets
 * repeated in tenders, and it is the first claim anyone checks. Get the real ones
 * from the desk, or drop the cell: `value: null` removes it cleanly and the row
 * closes up to whatever is left.
 *
 * Every figure here is now a count, which is why none of them pass `from` or
 * `group`. Both still exist on Counter for a figure that needs them — a year
 * printed as a year wants `group: false`, or it renders as `1,998`.
 */
const STATS = [
  { term: 'Projects completed', value: 247 },
  { term: 'Years in Nepal', value: yearsInNepal },
  { term: 'Districts reached', value: 38 },
  { term: 'Product lines in stock', value: services.length },
]

/** A cell with no figure is dropped rather than printed as a blank. */
const SHOWN_STATS = STATS.filter((stat) => Number.isFinite(stat.value))

export default function About() {
  return (
    <>
      <AboutHero />

      {/* ── Our story ───────────────────────────────────────────────────────
          Grey field, directly under the hero's dark ink. The tone change carries
          the seam — ink to grey to white down the page — so no rule is drawn
          across it; the same device the home page uses between its services grid
          and the process. */}
      {/* Clipping here is load-bearing, not tidiness: the plate runs past the
          right gutter and the section is what clips it. Without it the page gains a
          horizontal scrollbar.

          `overflow-clip`, not `overflow-hidden`. This section is the target of
          `/about#story`, and useScrollToTop reaches it with `scrollIntoView` —
          which scrolls EVERY scrollable ancestor, horizontally included. Under
          `hidden` this section is such an ancestor (it overflows by the width of
          the plate's bleed), so arriving via the hash shifted the whole block
          sideways of every other section on the page and left it there. `clip`
          clips identically but is not a scroll container, so there is nothing to
          shift. */}
      {/* Top padding trimmed against the hero rather than matched to the bottom,
          the same correction the figures section carries. The hero ends on its own
          long `pb-28` and the two stack, so a full `py-28` here put the better
          part of a viewport of empty grey between the fact strip and the kicker
          that follows it. Bottom padding stays long — the quality block below
          starts its own. */}
      <section
        id="story"
        className="scroll-mt-32 overflow-clip bg-[#f4f4f6] pt-12 pb-20 sm:pt-16 sm:pb-28"
      >
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          {/* Kicker and heading only. This was a two-column header holding the
              heading on the left and a lead paragraph across the gutter; with the
              lead cut, the twelve-column grid had nothing to place and the empty
              right half was back. A heading on its own needs no grid — just a
              measure to wrap against. */}
          <Rise>
            {/* Centred on instruction. The kicker needs `mx-auto` passed in to
                come with it — it is `w-fit` so that its two-tick mark hugs the
                label, and a `w-fit` box is not moved by the `text-center` it
                inherits. */}
            <header className="mx-auto max-w-3xl text-center">
              <Kicker className="mx-auto">Our story</Kicker>
              {/* Back to an h2, which is the rank it was always set to look
                  like. It was promoted to h1 while the page had no opening
                  headline of its own and nothing to announce itself with;
                  <AboutHero /> carries the page's h1 now, and two first-rank
                  headings on one document is a worse outcome than the gap was.
                  Visually unchanged either way — the `font-sans font-bold`
                  classes here override the display serif the base layer gives h1
                  and h2 alike. */}
              <h2 className="font-sans text-[2.5rem] leading-[1.04] font-bold tracking-[-0.02em] text-balance text-ink sm:text-5xl lg:text-[3.25rem]">
                Two companies, one <span className="text-brand-600">chain of custody</span>
              </h2>
            </header>
          </Rise>

          {/* Both columns start on this line, so the plate's top edge and the
              first link of the chain begin together and no corner is left over. */}
          <div className="mt-14 grid gap-y-10 lg:grid-cols-12 lg:gap-x-16">
            {/* Left: the chain. Ruled rows rather than three cards side by side —
                a sequence read left to right looks like three alternatives to
                choose between. */}
            <Rise className="lg:col-span-7">
              <ol className="grid list-none grid-cols-1 gap-0 border-t border-ink/15 p-0">
                {CHAIN.map((link, i) => (
                  <li
                    key={link.id}
                    className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-5 border-b border-ink/15 py-8 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-x-8"
                  >
                    {/* Ghosted numeral in the gutter rather than a pale disc. The
                        disc-and-hairline sequence belongs to the process steps on
                        the home page; borrowing it here made two near-identical
                        blocks on one site, and at 11px on grey the discs were too
                        faint to carry the numbers anyway. Set large and low in
                        contrast, the figures order the rows without competing
                        with the headings. */}
                    <span
                      aria-hidden="true"
                      className="font-mono text-[1.75rem] leading-none tabular-nums text-ink/20 sm:text-[2.5rem]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      {/* At heading rank now. As mono micro-caps the term was
                          smaller than its own body copy, so every row led with
                          the paragraph and the label read as a tag on it. */}
                      <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink sm:text-xl">
                        {link.term}
                      </h3>
                      <p className="mt-3 max-w-[56ch] text-base leading-relaxed text-pretty text-ink/75">
                        {link.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Rise>

            {/* Right: the crew plate. Square-cornered, hairline ring, annotation
                in the corner — the same plate the masthead uses. It was in a
                rounded tray, which made it the only soft-cornered object on a
                page of square ones. On wide screens it takes the full height of
                the row, so its bottom edge lands on the chain's last rule
                instead of stopping somewhere arbitrary. */}
            <Rise
              from="right"
              delay={140}
              /* `lg:h-full` here as well as on the figure, and both are needed:
                 a percentage height resolves against a definite one, and the
                 figure's parent only has a definite height once the stretched
                 grid item claims the row's. Without it the figure falls back to
                 the photograph's own 900×1150 ratio and overshoots the column. */
              className="lg:col-span-5 lg:col-start-8 lg:h-full lg:-mr-10 xl:-mr-16"
            >
              <figure className="relative h-80 overflow-hidden bg-ink/5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)] sm:h-[28rem] lg:h-full">
                <img
                  src={crewPlate}
                  width={900}
                  height={1150}
                  loading="lazy"
                  decoding="async"
                  alt="Steel fixers in red helmets and harnesses tying vertical reinforcement cages high on a column above a building deck"
                  /* Taken out of flow on purpose. In flow the image reports its
                     own 900×1150 ratio as the figure's content height, the grid
                     row sizes itself to that, and the `h-full` above then has
                     nothing left to shrink to — the column overshot the chain by
                     90px. Positioned, the figure contributes no intrinsic height
                     and the row is set by the text beside it. */
                  className="absolute inset-0 h-full w-full object-cover object-[55%_35%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
                />
                <figcaption className="absolute bottom-4 left-5 flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
                  <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-500" />
                  Column cages — in progress
                </figcaption>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
                />
              </figure>
            </Rise>
          </div>
        </div>
      </section>

      {/* ── Quality & testing ───────────────────────────────────────────────
          Back to white, and the plate crosses to the left — the story block
          above puts its photograph on the right, so the two sections read as a
          zig-zag down the page rather than as the same layout twice. */}
      {/* Top trimmed against the story block above, same as that one is against
          the hero and the figures are against this. Every section on the page
          opens tight and closes long now, so the space between two blocks is one
          section's bottom padding rather than two paddings added together. */}
      <section
        id="quality"
        className="scroll-mt-32 bg-white pt-12 pb-20 sm:pt-16 sm:pb-28"
      >
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          {/* Kicker and heading only, same as the story header above — both lost
              their lead paragraph, so neither needs the two-column grid that was
              there to hold one. */}
          <Rise>
            {/* Centred to match the story header above, same as it — `mx-auto` on
                the kicker because it is `w-fit` and inherits no alignment. All
                three headers on this page are centred now; the bodies under them
                stay ranged left, which is the only arrangement that works when a
                heading is a phrase and the copy beneath it is a paragraph. */}
            <header className="mx-auto max-w-3xl text-center">
              <Kicker className="mx-auto">Quality &amp; testing</Kicker>
              <h2 className="font-sans text-[2.5rem] leading-[1.04] font-bold tracking-[-0.02em] text-balance text-ink sm:text-5xl lg:text-[3.25rem]">
                Tested at the batch,{' '}
                <span className="text-brand-600">traceable at the drum</span>
              </h2>
            </header>
          </Rise>

          <div className="mt-14 grid gap-y-12 lg:grid-cols-12 lg:gap-x-16">
            {/* Plate left. Bare rather than in a tray — the crew photograph in
                the section above is trayed, and giving this one the masthead's
                plain-plate treatment instead keeps the two from reading as the
                same object moved across the page. */}
            <Rise from="left" className="lg:col-span-5">
              <figure className="relative overflow-hidden bg-ink/5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)]">
                <img
                  src={labPlate}
                  width={1600}
                  height={1064}
                  loading="lazy"
                  decoding="async"
                  alt="Chemist in safety glasses drawing a sample from a separatory funnel inside a fume hood"
                  className="aspect-[4/5] w-full object-cover object-[62%_50%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
                />
                <figcaption className="absolute bottom-4 left-5 flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
                  <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-500" />
                  Sample draw — batch check
                </figcaption>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
                />
              </figure>
            </Rise>

            {/* Checks right. A ruled datasheet, not four cards: these are the
                stages of one procedure, and cards would offer them as four
                separate features to pick from. */}
            <Rise delay={140} className="lg:col-span-7 lg:col-start-6">
              <dl className="grid border-t border-ink/15">
                {CHECKS.map(({ term, body }) => (
                  <div key={term} className="border-b border-ink/15 py-6">
                    <dt className="flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.2em] text-ink uppercase">
                      {/* One tick rather than the kicker's two — this is an item
                          in a list, not the head of a section. */}
                      <span aria-hidden="true" className="block h-[2px] w-3 shrink-0 bg-brand-600" />
                      {term}
                    </dt>
                    <dd className="mt-3 max-w-[62ch] text-base leading-relaxed text-pretty text-ink/75">
                      {body}
                    </dd>
                  </div>
                ))}
              </dl>
            </Rise>
          </div>
        </div>
      </section>

      {/* ── The figures ─────────────────────────────────────────────────────
          Last before the CTA. Four numbers that count up as the row arrives —
          the one moment of motion on the page that is the content rather than an
          entrance, so it earns being noticed.

          Centred, and so are the two headers above it now, on instruction — all
          three section headers on this page share that alignment, so it is the
          page's rhythm rather than one block behaving differently.

          What a figure row can carry and a paragraph can't is the centring of its
          BODY as well as its heading: four short labels under four numerals have
          no ragged edge to expose. The chain, the checks and every paragraph on
          the page stay ranged left underneath their centred headings.

          White, on the client's instruction — which costs the seam. Everywhere
          else on this page the field tone changes at a section boundary and that
          change IS the division, so no rule is drawn. Two white sections running
          together have nothing to divide them, so the hairline below is doing the
          work the tone change used to. Remove it only if the grey comes back. */}
      {/* Top padding trimmed against the section above rather than matched to
          the bottom. The quality block ends on its own generous padding and the
          two stack, so a full py-28 here left the heading sitting a long way
          below the rule that introduces it. Bottom padding stays long — it is the
          last thing before the footer. */}
      <section
        id="figures"
        className="scroll-mt-32 border-t border-ink/10 bg-white pt-12 pb-20 sm:pt-16 sm:pb-28"
      >
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <Rise>
            <header className="mx-auto max-w-3xl text-center">
              <Kicker className="mx-auto">By the numbers</Kicker>
              <h2 className="font-sans text-[2.5rem] leading-[1.04] font-bold tracking-[-0.02em] text-balance text-ink sm:text-5xl lg:text-[3.25rem]">
                Long enough to have <span className="text-brand-600">a record</span>
              </h2>
            </header>
          </Rise>

          {/* Two lines per cell: the figure, then what it counts. Nothing else.
              This block went through two worse versions. The first ran the label
              ABOVE the figure as 11px mono micro-caps, so the eye landed on the
              number and had to travel back up to the faintest text in the cell to
              learn what had been counted. The second kept the corrected order but
              hung a third line underneath — "rafts, decks, plant rooms, repairs" —
              and a fragment list at a third size turned a figure anyone could read
              at a glance into a paragraph to work through.

              A number needs one label. If a figure can't be understood from the
              phrase directly beneath it, the fix is the phrase, not another line.

              A `ul`, not a `dl`: a description list requires its `dt` before its
              `dd`, which forces the label above the figure — the arrangement being
              corrected here. A screen reader reads each cell as one phrase either
              way: "247, projects completed."

              Hairline across the top of every cell rather than a short red tick.
              A gap alone let four columns of type run together; a rule per cell
              draws the column it belongs to and holds the datasheet register. */}
          <Rise delay={120}>
            <ul
              className={cn(
                'mt-12 grid list-none grid-cols-2 gap-x-6 gap-y-12 p-0 sm:gap-x-10',
                SHOWN_STATS.length > 2 && 'lg:grid-cols-4',
              )}
            >
              {SHOWN_STATS.map(({ term, value, from, group }) => (
                /* Centred within the cell. `text-center` is what does it for the
                   figure too: the counter is an inline-block, so it is centred by
                   its container's text alignment rather than by a margin of its
                   own — and it has to stay inline-block, because the reserved
                   width that stops the digits shunting the layout as they arrive
                   only applies to a box that isn't inline. */
                <li key={term} className="border-t border-ink/15 pt-6 text-center">
                  {/* Brand red, deep at the top corner and brightening down
                      across the glyph — 135° rather than straight down, which is
                      what gives a wide figure like 5,000+ a diagonal sweep
                      instead of four identically shaded digits.

                      Written as an explicit gradient rather than
                      `from-brand-700 to-brand-400`, because where the light end
                      lands matters: brand-400 on this grey field is about 2.7:1,
                      under the 3:1 that even large text needs. The stops hold the
                      dark end through the first half and reach 400 only at the
                      very corner, so the sweep reads while the body of every
                      figure stays legible.

                      `-webkit-background-clip` is spelled out beside the standard
                      property on purpose: without the prefixed version Safari
                      paints the box rather than the glyphs, and since the text
                      itself is transparent, the figure would vanish. */}
                  <Counter
                    value={value}
                    from={from}
                    group={group}
                    className="bg-clip-text font-mono text-[2.75rem] leading-none tracking-[-0.02em] text-transparent [-webkit-background-clip:text] [background-image:linear-gradient(135deg,var(--color-brand-800)_0%,var(--color-brand-700)_38%,var(--color-brand-600)_68%,var(--color-brand-500)_88%,var(--color-brand-400)_100%)] sm:text-[3.5rem]"
                  />
                  {/* Sentence case at reading size. Mono caps at 11px is the least
                      legible setting on the page and the worst possible place to
                      put the one phrase the figure depends on.

                      No measure cap. It was held to 16ch, which is narrower than
                      the cell and broke "Product lines in stock" onto a second
                      line for no reason — the full column fits it. On a phone, at
                      two cells across, the longest labels still wrap; that one is
                      the viewport's decision rather than a limit set here, and
                      `text-pretty` is what keeps the break sensible when it
                      happens. */}
                  <p className="mt-5 text-[1.0625rem] leading-snug font-semibold text-pretty text-ink">
                    {term}
                  </p>
                </li>
              ))}
            </ul>
          </Rise>
        </div>
      </section>

    </>
  )
}
