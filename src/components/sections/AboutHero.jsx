import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
// Only for the stamp in the top right of the sheet header. Address lives in one
// place; the footer and contact page print the same string.
import { siteConfig } from '@/lib/siteConfig'
// Reused rather than a fifth photograph commissioned for the top of the page:
// the same frame opens the home page's about block and the contact page. That
// repetition is deliberate — it is the one picture on the site of the work the
// product actually goes into, and the About page is where it belongs most.
import platePeople from '@/assets/images/about-site.webp'

/**
 * AboutHero — THE OPENING BLOCK OF /about.
 *
 * The page spent a while with no opening headline at all: the masthead that used
 * to stand here was cut, and the largest type a visitor met was the story
 * section's heading. This fills that gap without bringing the old masthead back.
 *
 * WHAT IT IS NOT: a second copy of the home page's hero. That one is a
 * full-bleed video with centred white type at 8xl, and it owns the site's one
 * cinematic moment. Repeating it here would spend the same gesture twice and
 * make /about read as a second landing page. This is the editorial split
 * instead — type on the left, one plate crossing the right gutter — in the
 * register the rest of the site already speaks in: ruled mono kickers,
 * square-cornered plates, red spent only on labels and one phrase of a heading.
 *
 * ── THE FIELD IS WHITE, AND THAT IS A DECISION WITH CONSEQUENCES ───────────
 * A hero on white cannot carry the header's white lockup, so `/about` stays OFF
 * OVERLAY_ROUTES: the bar remains solid and Layout keeps padding the page down
 * past its 6rem. The padding here is therefore ordinary section padding, not the
 * bar-clearing kind the home hero needs — if this block is ever darkened, both
 * of those have to change together.
 *
 * White also costs the seam at the bottom edge. Everywhere else on this page the
 * field tone changes at a section boundary and that change IS the division, so no
 * rule is drawn. White above grey still reads, which is why the story section
 * below needs nothing added — but if the grey there is ever taken to white, this
 * block loses its only bottom edge.
 *
 * ── ONE MORE THING ELSEWHERE DEPENDS ON THIS FILE ─────────────────────────
 * The story section below carries an h2 again. Its h1 was a stand-in for the
 * missing masthead; the page's first-rank heading is the one in this file now,
 * and two h1s on one document is worse than the gap was.
 *
 * Every claim in the copy is one the site already publishes elsewhere — the
 * manufacturer, the group, stock held in Kathmandu, the number of lines (counted
 * from data/services.js, so it can never contradict the catalogue). No founding
 * year, no headcount, no project count: those are the figures at the bottom of
 * the page that still need the desk's confirmation, and a hero is the worst
 * place to put a number nobody has checked.
 */

/**
 * The three facts in the spec line under the paragraph. Not statistics — a
 * credit line: who makes it, who holds it, how much of it there is. The counted
 * figures live at the foot of the page where they can be read slowly.
 *
 * EVERY LABEL IS TWO WORDS OR FEWER, and that is a layout constraint rather than
 * a style preference. The three pairs have to sit on ONE line inside a column
 * half the page wide; at "Manufacturer" and "Lines in stock" they did not, and
 * the third pair wrapped alone onto a second line — an orphan under a row that
 * had looked deliberate. Keep any replacement label this short, or the line
 * breaks again.
 *
 * The count carries its own unit ("4 lines") instead of putting it in the label.
 * A bare "4" needs its label to mean anything, which makes the label the content
 * and defeats the point of setting labels quietly.
 *
 * "Kathmandu" is deliberately NOT appended to the second value: the sheet header
 * above already stamps the city in the top right corner.
 */
const FACTS = [
  { term: 'Made by', value: 'Thermax' },
  { term: 'Held by', value: 'MV Dugar Group' },
  { term: 'In stock', value: `${services.length} lines` },
]

/**
 * The load-time entrance.
 *
 * The second and last place on the site that animates on load rather than on
 * scroll — the home hero is the other. A block sitting in the first viewport has
 * no scroll to trigger on, and <Rise /> playing immediately at that position is
 * a reveal nobody sees; this is choreographed instead.
 *
 * Cadence deliberately matches the home hero's: heavy overlaps, so the sheet
 * header, the headline, the paragraph, the fact strip and the footer band read as
 * one gesture settling rather than five cues firing. The plate comes in on the
 * same timeline rather than its own, so it can never arrive out of step with the
 * type beside it.
 *
 * The parallax is scrubbed with a half-second catch-up (`scrub: 0.5`) rather than
 * the raw `scrub: true` it used to be. Raw scrub writes a transform on every
 * scroll event the browser emits, which on a trackpad or a high-resolution wheel
 * is far more often than there are frames to show them in; the smoothed form
 * lets GSAP interpolate toward the target on its own ticker instead, so the work
 * happens once per frame and no more. The catch-up is short enough that the plate
 * still reads as tracking the finger rather than trailing it.
 */
function useAboutHeroMotion(sectionRef) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    /* Scoped, so the selector strings resolve inside this section only and one
       revert() tears down both the timeline and the trigger. */
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { duration: 1.05, ease: 'power3.out' } })
        .from('[data-about-hero="kicker"]', { opacity: 0, y: 14, duration: 0.7 })
        .from('[data-about-hero="headline"]', { opacity: 0, y: 32 }, '-=0.45')
        .from('[data-about-hero="sub"]', { opacity: 0, y: 22 }, '-=0.8')
        .from('[data-about-hero="facts"] > *', { opacity: 0, y: 18, stagger: 0.08 }, '-=0.85')
        /* The footer band arrives last and as one object, not four staggered
           cells. It sits below the fold on most laptops, and a stagger nobody is
           looking at is a stagger that has finished by the time they scroll to
           it — while its cells would still be mid-flight if they happened to be
           on screen. One movement is correct either way. */
        .from('[data-about-hero="lines"]', { opacity: 0, y: 20, duration: 0.95 }, '-=0.7')
        /* The plate starts a touch after the headline and travels further, so it
           settles last. `x`, not `width` or `left` — nothing here touches a
           property that costs layout. */
        .from('[data-about-hero="plate"]', { opacity: 0, x: 48, duration: 1.3 }, 0.25)

      gsap.to('[data-about-hero="plate-inner"]', {
        yPercent: -9,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [sectionRef])
}

export default function AboutHero() {
  const sectionRef = useRef(null)
  useAboutHeroMotion(sectionRef)

  return (
    <section
      ref={sectionRef}
      /* `min-h-dvh` is deliberately NOT used. This block is type and one plate,
         not a cinematic frame — forced to the full viewport on a laptop it
         becomes a field of empty white, and on a phone it pushes the story
         section entirely below a second scroll. It takes the height its content
         asks for and the padding does the breathing.

         Top padding matches the blog head's exactly (`pt-6 sm:pt-10`) so the
         sheet's hairline lands at the same height on both pages — the two open on
         the same device and a rule sitting lower here would read as a slip. It
         can be this tight because the bar is solid over /about and Layout has
         already padded the page down by its 6rem.

         Bottom is shorter than the site's usual `pb-28`, and it was tuned by eye
         against the seam rather than picked off the scale. The block does not end
         on a rule or a heading that needs air under it — it ends on the footer
         band's four names, and the grey field below is what closes it. `pb-14` put
         the last name almost on the seam and the band read as cut off by the next
         section; `pb-28` left an empty stripe between them. `pb-24` is where the
         names hold as a row of their own and the grey still arrives without a wait.
         The story section adds its own padding on the other side, so the break at
         the boundary is shared rather than paid for twice.

         `overflow-clip` clips the plate and the two rules where they cross the
         right gutter — without any clipping the document gains a horizontal
         scrollbar. `clip` rather than `hidden` on purpose: `hidden` would clip
         identically but also make this section a scroll container, and a section
         that overflows by 40px can then be shifted bodily sideways by any
         programmatic scroll that lands inside it. `clip` makes the overflow
         unreachable instead of merely invisible. */
      className="relative isolate overflow-clip bg-white pt-6 pb-16 sm:pt-10 sm:pb-24"
    >
      {/* The blueprint sheet the blog page opens with — a 5.5rem grid of ink
          hairlines at 5.5% alpha, radially masked so it is present behind the
          kicker and gone by the time it reaches the fact strip. Copied verbatim
          from Blog.jsx rather than re-tuned: it is one device shared across the
          pages that open on white, and two nearly-identical grids at different
          pitches would read as a mistake. Change it in both places or neither.

          Replaces a soft red radial that used to sit in this corner. The grid
          does the same job — stopping a white field from reading as an unpainted
          one — without spending the page's single accent colour on a background. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(110%_70%_at_50%_0%,black,transparent_75%)]"
      />

      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        {/* ── The sheet header ───────────────────────────────────────────────
            The ruled mono bar the blog page opens with: the two-tick label hard
            left, a stamp hard right, one hairline across the full measure under
            both. It runs the whole container rather than sitting inside the type
            column, which is the point of it — the rule is what turns the grid
            behind it into a sheet with a top edge instead of a texture.

            It also REPLACES the kicker that used to stand inside the left column.
            The bar is that kicker, promoted to full width; keeping both would put
            the same mark and the same two words on the page twice, eight rems
            apart. The h1 lost its top margin with it — spacing below the rule is
            set by the grid's `mt-10`, exactly as on the blog head.

            The right-hand stamp is the address from siteConfig rather than a
            second copy of a fact from the strip below, and it is `hidden sm:block`
            for the same reason the blog's note count is: at phone width the label
            and the stamp fight over one line and the stamp loses. */}
        <div data-about-hero="kicker">
          <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] tracking-[0.2em] text-muted uppercase">
            <span className="flex items-center gap-3 text-ink">
              <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
                <span className="block h-[2px] w-3 bg-brand-600" />
                <span className="block h-[2px] w-1.5 bg-brand-600/40" />
              </span>
              About us
            </span>
            <span className="hidden sm:block">{siteConfig.address}</span>
          </div>
          {/* The rule runs past the right gutter to the plate's own right edge —
              the same `-mr` the plate carries, so the two share one edge and the
              section clips both. Held to the container's width it stopped a long
              way short of the photograph below it, and a rule that ends before
              the widest thing under it reads as a rule that ran out rather than
              one that was drawn.

              Only the rule extends. The stamp stays inside the gutter with the
              rest of the type, because past `-mr-20` it would be the first thing
              the section's `overflow-hidden` cuts on a viewport narrower than the
              container — a clipped hairline reads as running off the page, clipped
              words read as broken.

              NO `w-full` HERE, and that is the whole trick. A block at
              `width: 100%` is already exactly its container's width, so adding a
              negative right margin over-constrains the box and the browser
              resolves it by throwing the margin away — the rule stayed put and
              looked untouched. Left to `width: auto` a block fills its container
              anyway, and the negative margin then genuinely extends it. The plate
              below works because a stretched grid item is `auto` too. */}
          <div aria-hidden="true" className="h-px bg-ink/15 lg:-mr-10 xl:-mr-20" />
        </div>

        {/* `items-start`, not `items-center`: both columns begin on the same
            line, so the plate's top edge and the headline's cap height start
            together and no corner is left over. Centred, the photograph floated
            a good 50px below the H of "Made" and the two columns agreed at no
            point at all. Same reasoning as the story section below, which starts
            its chain and its plate on one line for the same reason. */}
        <div className="mt-10 grid items-start gap-y-14 lg:grid-cols-12 lg:gap-x-16">
          {/* ── Left: the type ─────────────────────────────────────────────── */}
          <div className="lg:col-span-6">
            {/* Bold grotesque, not the display serif — the same override every
                heading on this page uses. Runs larger than any h2 below because
                it is the page's title; short enough that it can. No top margin:
                the sheet header's rule above sets that distance through the
                grid's `mt-10`. */}
            <h1
              data-about-hero="headline"
              className="font-sans text-[2.75rem] leading-[0.98] font-extrabold tracking-[-0.025em] text-balance text-ink sm:text-6xl lg:text-[4.25rem]"
            >
              Made for industry.
              <br className="hidden sm:block" />{' '}
              <span className="text-brand-600">Held in Kathmandu.</span>
            </h1>

            <p
              data-about-hero="sub"
              className="mt-7 max-w-[52ch] text-base leading-relaxed text-pretty text-ink/75 sm:text-lg"
            >
              Thermax makes chemistry for industry. The MV Dugar Group holds it
              here, quotes it, specifies it against your mix, and goes to site
              when the substrate turns out not to match the drawing.
            </p>

            {/* ── The fact strip ─────────────────────────────────────────────
                Three inline pairs on one line. NOT a ruled band, and that is the
                whole point of this version.

                It was a ruled band: one hairline top and bottom, cells divided by
                verticals, mono label stacked over a semibold value. Then the
                footer band at the bottom of this section was built the same way —
                correctly, it is a grid of four — and the section ended up carrying
                the same object twice, forty rems apart, one holding three facts
                and the other four names. Two identical constructions read as one
                component rendered twice by mistake.

                So the two are told apart by SHAPE rather than by content, which is
                the only way that survives someone changing the copy:

                  the strip  — inline, on one line, ENCLOSED BY NOTHING. A caption
                               to the paragraph above it.
                  the band   — a grid, ruled and divided, its own block.

                ONE red tick, at the head of the line, not one per pair. Three
                ticks across a wrapping row put three accents at three unrelated
                heights and turned an annotation into a scatter of marks — and red
                repeated three times in the same corner as a red headline spends
                the colour until it stops meaning anything. A single mark starts
                the line; the eye needs telling where a line begins, not where each
                of its parts does.

                The pairs are separated by HAIRLINE VERTICALS rather than by gaps.
                Whitespace alone left "Thermax" and "HELD BY" reading as one
                phrase, because a label is quiet enough to bind to the value on
                its left. A rule is unambiguous, costs no width, and is the device
                the rest of the page already divides things with.

                Values dominate, labels recede: the value in the body sans at
                semibold, the label in mono at 10px and 40% ink. The line should be
                readable as "Thermax · MV Dugar Group · 4 lines" at a glance, with
                the labels available underneath that reading rather than competing
                with it.

                `whitespace-nowrap` per pair, so if the row does wrap it breaks
                BETWEEN pairs and never inside one. No rules above or below the
                line: this belongs to the paragraph it sits under, and enclosing it
                would cut it off from what it annotates — which is also what keeps
                it a different object from the ruled band at the foot of the
                section. */}
            <dl data-about-hero="facts" className="mt-10 flex flex-wrap items-center">
              <span
                aria-hidden="true"
                className="mr-4 block h-[2px] w-3 shrink-0 bg-brand-600"
              />
              {FACTS.map(({ term, value }, i) => (
                <div
                  key={term}
                  className={cn(
                    'flex items-baseline gap-2.5 py-1 whitespace-nowrap',
                    /* The divider belongs to the pair on its right, so the line
                       opens with the tick and never with a rule. */
                    i > 0 && 'ml-5 border-l border-ink/15 pl-5',
                  )}
                >
                  <dt className="font-mono text-[0.625rem] tracking-[0.18em] text-ink/40 uppercase">
                    {term}
                  </dt>
                  {/* `tabular-nums` on all three rather than only on the count:
                      it costs nothing on a word and means the figure never has to
                      be special-cased if a value gains a number later. */}
                  <dd className="text-[0.9375rem] leading-snug font-semibold text-ink tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* NO BUTTON HERE, on instruction. A "Read our story" pill stood
                under the strip and pointed at #story — it was removed so the
                footer band below could come up, and because the section it pointed
                at is the very next thing on the page: a button whose whole job is
                to scroll one screen is a button the scroll already does.

                The block is therefore not a dead end. The footer band's "Full
                catalogue" link is the one route out of it, and the header carries
                the rest. Nothing else in this section is interactive. */}
          </div>

          {/* ── Right: the plate ───────────────────────────────────────────────
              Square corners, hairline ring, annotation in the corner — the
              treatment every photograph on this page gets, and the only thing in
              this block that carries any weight, which is what stops a white
              field from reading as an empty one. It runs past the right gutter on
              wide screens and the section clips it, so the block reads as a
              spread continuing off the page rather than a two-column box.

              The negative margins are dropped below `lg`, where the grid is a
              single column: an image bleeding off the edge of a phone leaves the
              caption half cut.

              ON WIDE SCREENS THE PLATE TAKES THE HEIGHT OF THE TYPE BESIDE IT
              rather than a height of its own. It was a fixed `32rem`, which was
              ~3rem taller than the column of type — and since the footer band
              hangs below the taller of the two, that difference became a stripe of
              empty white under the spec line that read as a missing block. Sized
              off the row instead, both columns end on one line and the gap can
              only ever be the band's own top margin.

              Three classes make that work, and all three are needed:
                • `lg:self-stretch` — the grid is `items-start`, so without it this
                  item is start-aligned and has no row height to inherit.
                • `lg:h-full` on the wrapper AND the figure — a percentage height
                  resolves against a definite one, and the figure's parent only has
                  a definite height once the stretched item claims the row's.
                • `lg:absolute lg:inset-0` on the inner layer — in flow it reports
                  the image's own 1100×728 ratio as content height, the row grows to
                  fit it, and `h-full` then has nothing left to shrink to. Taken out
                  of flow it contributes no intrinsic height and the row is set by
                  the type. Same fix, same reason, as the crew plate on this page. */}
          <div
            data-about-hero="plate"
            className="lg:col-span-6 lg:h-full lg:-mr-10 lg:self-stretch xl:-mr-20"
          >
            <figure className="relative overflow-hidden bg-ink/5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)] lg:h-full">
              {/* The drifting layer is the image, inside a figure that stays put,
                  so the ring and the caption never leave the frame. Cut taller
                  than its box for the same reason the home hero's backdrop is:
                  the parallax lifts it, and the extra height is what keeps a band
                  of bare background from appearing under the bottom edge.

                  Below `lg` it keeps an explicit height, because there the grid is
                  one column and there is no type beside it to take a height from. */}
              <div
                data-about-hero="plate-inner"
                className="relative h-[19rem] will-change-transform sm:h-[26rem] lg:absolute lg:inset-0 lg:h-full"
              >
                <img
                  src={platePeople}
                  width={1100}
                  height={728}
                  fetchPriority="high"
                  decoding="async"
                  alt="Reinforcement bar and steel formwork laid out on a concrete deck, two workers in high-visibility jackets cutting and tying steel"
                  /* Not lazy and high priority: this is the largest thing in the
                     first viewport and therefore the LCP element. `loading="lazy"`
                     on an above-the-fold image delays the very paint the page is
                     measured on. */
                  className="absolute inset-0 h-[112%] w-full object-cover object-[50%_42%]"
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
              />
              <figcaption className="absolute bottom-4 left-5 flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
                <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-500" />
                Deck steel — Kathmandu
              </figcaption>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
              />
            </figure>
          </div>
        </div>

        {/* ── The sheet footer ─────────────────────────────────────────────────
            WHAT THIS IS FOR: the plate is shorter than the type column beside it,
            so the block used to end with a wide band of empty white under the
            photograph and to the right of the button — a gap wide enough to read
            as something that failed to load rather than as breathing room. The
            options were to stretch the plate until the columns ended level, cut
            the section's bottom padding until the gap closed, or give the width
            something to do. This is the third: the same full-measure rule that
            opens the block, closing it, with the four lines listed under it.

            It also answers the question that follows the headline. "Made for
            industry, held in Kathmandu" invites "held in Kathmandu — what is?",
            and the four lines are the answer the catalogue already publishes.
            Counted from data/services.js, so it can never disagree with the
            /services page or with the figure in the strip above.

            Sits outside the two-column grid, at the container's full width and
            with the same `-mr` bleed as the top rule and the plate — so all three
            right edges land on one line and the section clips them together.

            Small type on purpose. This is a footer to a hero, not a second
            section: at 0.9375rem the four names are a list you can scan on the
            way past, and anything larger would start competing with the h1 four
            rems above it. */}
        {/* Top margin is the whole distance between the grid above and this band,
            now that the plate ends level with the type: nothing else contributes to
            it, so this one value is the seam between the hero proper and its
            footer. `mt-9/11` had the band sitting close enough to read as a fourth
            row of the block above; `mt-18/20` is a clear break, and about as far as
            it can travel before the space starts reading as the empty stripe this
            band was added to fill in the first place. */}
        <div data-about-hero="lines" className="mt-18 lg:-mr-10 xl:-mr-20 lg:mt-20">
          {/* NO LABEL ON THIS BAND, on instruction — the two-tick "What we hold"
              kicker that stood at the left of this row is gone, so the row holds
              the catalogue link alone and is `justify-end` rather than
              `justify-between`.

              What that costs, noted rather than argued: the band now opens with a
              rule and four names and nothing that says what the names are. It
              reads because the cells carry catalogue codes and the link beside
              them says "catalogue" — but it is the one place in this section where
              the visitor has to infer the heading instead of being given it. */}
          <div className="flex items-end justify-end gap-6 pb-4 font-mono text-[0.8125rem] tracking-[0.2em] text-muted uppercase">
            {/* The one route out of this block, and now the only type in this row.
                Kept as a quiet mono link rather than a pill: this is a footer to a
                hero, and a second button here would compete with the header's. */}
            {/* Visible at every width now. It was `hidden sm:flex` while the
                label held the left of the row — the two fought over one line on a
                phone and the link was the one to drop. Alone, hiding it would
                leave an empty row with its own bottom padding above the rule, and
                the band would lose its only link on mobile. */}
            <Link
              to="/services"
              className="flex items-center gap-2 transition-colors duration-300 hover:text-brand-600"
            >
              Full catalogue
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {/* Same `width: auto` block as the header's rule — see the note there
              before adding `w-full` to it. */}
          <div aria-hidden="true" className="h-px bg-ink/15" />

          {/* Four cells, divided by verticals on wide screens and by horizontals
              when they stack — the fact strip's construction, one row lower and
              one column wider, so the two bands read as the same object rather
              than as two different kinds of list.

              `items-stretch` and `h-full` on the link are what make the whole cell
              the target rather than just the words in it. */}
          <ul className="grid list-none grid-cols-1 divide-y divide-ink/10 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0">
            {services.map(({ slug, code, title }, i) => (
              <li
                key={slug}
                className={cn(
                  /* A vertical only where the cell actually has a neighbour to
                     its left, which depends on how many columns there are:
                     at two across that is every odd cell, at four it is every
                     cell but the first. The odd cells' `sm:` rule carries up to
                     `lg` unchanged, so only the even ones need the wider case.
                     Cell 2 must NOT be ruled at `sm` — it opens the second row. */
                  i % 2 === 1 && 'sm:border-l sm:border-ink/12',
                  i > 0 && 'lg:border-l lg:border-ink/12',
                )}
              >
                <Link
                  to={`/services#${slug}`}
                  className={cn(
                    'group/line flex h-full flex-col gap-2.5 py-5 transition-colors duration-300',
                    /* Inset matches the rule above it, cell for cell and
                       breakpoint for breakpoint. */
                    i % 2 === 1 && 'sm:pl-6',
                    i > 0 && 'lg:pl-6',
                  )}
                >
                  <span className="font-mono text-[0.625rem] tracking-[0.2em] text-ink/45 uppercase">
                    {code}
                  </span>
                  <span className="flex items-start justify-between gap-3 text-[0.9375rem] leading-snug font-semibold text-pretty text-ink transition-colors duration-300 group-hover/line:text-brand-600">
                    {title}
                    {/* Travels on hover rather than appearing — an arrow that
                        fades in on a row of four adds four things that flicker as
                        the pointer crosses the band. */}
                    <span
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-ink/30 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/line:translate-x-1 group-hover/line:text-brand-600"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
