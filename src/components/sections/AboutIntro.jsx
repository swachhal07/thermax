import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { cn } from '@/lib/utils'

// Stock stand-ins — swap for real project photography when available.
// Downscaled to roughly 2× their rendered width.
//
// The second plate used to be a purple 3D blob render. Two problems: purple is
// nowhere in the palette, so the sheet fought the brand red sitting next to it,
// and a glossy CGI molecule says "technology company" rather than "chemistry on
// a Nepali site". The site photograph already in the repo — reused from the
// contact page, so it costs no extra bytes on a warm cache — says the second
// half of the argument the copy is making.
import plateLab from '@/assets/about-plate-lab.webp'
import plateSite from '@/assets/images/about-site.webp'

/**
 * Tab copy. Placeholder wording — replace with the client's own. Panel bodies no
 * longer need to be matched in length: all three still share one grid cell, so
 * the longest sets the height, but the labels are now sized to their own text
 * rather than to a third of the row, so short and long labels both sit right.
 */
const TABS = [
  {
    id: 'history',
    label: 'History',
    body: 'Thermax has spent decades formulating chemistry for industry. Through the MV Dugar Group, that catalogue now reaches Nepali contractors, plants, and project teams — with stock held locally and technical support on the ground.',
  },
  {
    id: 'mission',
    label: 'Mission',
    body: 'Put the right product on site at the right time — specified correctly, delivered on schedule, and backed by people who take the call when a pour is waiting, rather than a week later once the slab has gone down.',
  },
  {
    id: 'vision',
    label: 'Vision',
    body: 'A built environment in Nepal that lasts longer than its warranty — fewer repairs, less waste, and structures that hold against water, load, and weather for decades rather than a handful of monsoons.',
  },
]

/**
 * Spec ledger under the panel. Was three equal columns — directly under a tab
 * row that was also three equal columns, so the block read as one mechanical
 * grid repeated twice. It's a ruled datasheet now: mono key left, value right,
 * dotted leader carrying the eye across. Different rhythm, same information, and
 * it holds a long value without squeezing its neighbours.
 */
const LEDGER = [
  { term: 'Quality control', value: 'Tested at every batch' },
  { term: 'Technical support', value: 'On site, in person' },
  { term: 'Stock', value: 'Held in Kathmandu' },
]

export default function AboutIntro() {
  const [active, setActive] = useState(TABS[0].id)
  const activeIndex = TABS.findIndex((t) => t.id === active)
  const tabRefs = useRef([])
  const tablistRef = useRef(null)

  /* The indicator used to be a fixed `w-1/3` translated by `activeIndex * 100%`,
     which only worked because the tabs were equal thirds. They're sized to their
     labels now, so its position and length are measured off the live DOM.

     It's drawn as a 1px bar scaled on the x axis rather than a bar with a width:
     transform and opacity are the only two things that animate without asking
     the browser to re-lay-out the row, and this transition runs on every tab
     press. Measuring in a layout effect means the first paint already has the
     right numbers — there is no frame where the bar sits at zero length. */
  const [bar, setBar] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const list = tablistRef.current
    const tab = tabRefs.current[activeIndex]
    if (!list || !tab) return

    /* Sub-pixel width, so the bar ends exactly where the label does rather than
       a rounded pixel short of it. A zero measurement is dropped rather than
       written: an observer can be handed a collapsed box mid-reflow, and one
       frame of that would blank the indicator until the next tab press. */
    const measure = () => {
      const { width } = tab.getBoundingClientRect()
      if (width) setBar({ left: tab.offsetLeft, width })
    }
    measure()

    /* Both, deliberately. The list catches viewport changes; the tab itself
       catches the late web-font swap, which moves the label's width without
       moving the row's. */
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    ro.observe(tab)
    return () => ro.disconnect()
  }, [activeIndex])

  // Roving focus. The list runs horizontally, so Left/Right lead — Up/Down still
  // work for anyone who learned the vertical version.
  const onKeyDown = (e) => {
    const dir =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0
    if (!dir) return
    e.preventDefault()
    const next = TABS[(activeIndex + dir + TABS.length) % TABS.length]
    setActive(next.id)
    tabRefs.current[TABS.indexOf(next)]?.focus()
  }

  return (
    <section
      id="about"
      /* Bottom padding runs longer than the top. Matched padding measures equal
         and looks top-heavy, because the header rule reads as a lid and the
         section below it needs room to land. */
      className="relative isolate scroll-mt-24 overflow-hidden bg-white pt-24 pb-28 sm:pt-32 sm:pb-40"
    >
      {/* Blueprint ruling, faded out toward the bottom so it never competes with
          the copy sitting on top of it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(20,23,28,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,0.055)_1px,transparent_1px)] [background-size:5.5rem_5.5rem] [mask-image:radial-gradient(120%_75%_at_50%_0%,black,transparent_78%)]"
      />
      {/* Grain over the whole white field. Multiply at 3.5% is below the
          threshold where you'd call it a texture — it just stops a full page of
          white from reading as unpainted screen. */}
      <div
        aria-hidden="true"
        className="field-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.035] mix-blend-multiply"
      />
      {/* Faint warm bloom in the lower right. Kept very low on white — any more
          and it reads as a pink smudge rather than as warmth in the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(227,6,19,0.05),transparent_68%)]"
      />

      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
        {/* Sheet header. The mono labels either side of a hairline rule set the
            technical register for everything below. The right-hand datum is what
            makes the rule read as a rule rather than as an underline: with one
            label on the left, the space between them was just a gap. */}
        <div className="flex items-end justify-between gap-6 pb-4 font-mono text-[0.8125rem] tracking-[0.2em] text-muted uppercase">
          <span className="flex items-center gap-3 text-ink">
            {/* Two stacked ticks rather than a dot — the second one shorter and
                faded, so the mark echoes the hairline rule it sits above. */}
            <span aria-hidden="true" className="flex shrink-0 flex-col gap-[2px]">
              <span className="block h-[2px] w-3 bg-brand-600" />
              <span className="block h-[2px] w-1.5 bg-brand-600/40" />
            </span>
            About us
          </span>
          <span aria-hidden="true" className="hidden text-[0.6875rem] text-ink/35 sm:block">
            Thermax &times; MV Dugar Group
          </span>
        </div>
        <div aria-hidden="true" className="h-px w-full bg-ink/15" />

        {/* The row carries the space below the header rule, not the headline —
            that way both columns start on the same line. Six and six now rather
            than six and five with a dead column between them: the sheet is the
            other half of the argument, not an illustration beside it. */}
        <div className="mt-10 grid gap-y-14 lg:grid-cols-12 lg:gap-x-14">
          {/* ── Left: the argument ─────────────────────────────────────── */}
          {/* One reveal for the whole column, not one per paragraph. Staggering
              a heading against its own body copy makes the block read as
              assembling itself rather than as arriving. */}
          <Rise className="lg:col-span-6">
            <div>
              {/* Poppins, not the display serif — bold grotesque at a tight
                  measure, same voice as the hero. Only italic weights are
                  missing from the loaded family, so the accent on the last word
                  is carried by colour instead. Runs a size larger than it did:
                  at 3.25rem it was the same weight as the paragraph under it. */}
              <h2 className="max-w-[19ch] font-sans text-[2.75rem] leading-[0.98] font-bold tracking-[-0.03em] text-balance text-ink sm:text-6xl lg:text-[4rem]">
                Chemistry that holds Nepal{' '}
                <span className="text-brand-600">together.</span>
              </h2>
            </div>

            <div>
              <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-pretty text-muted">
                From foundations to finishes, we supply the admixtures, waterproofing, and
                repair systems that decide how long a structure lasts.
              </p>
            </div>

            <div aria-hidden="true" className="mt-12 h-px w-full bg-ink/12" />

            {/* Index over panel rather than beside it. Side by side, the rail
                stole a third of the column and squeezed the body copy into a
                narrow measure with a dead gap between them; stacked, the tabs
                read as a numbered register and the copy gets the full width. */}
            <div className="mt-8">
              <div
                ref={tablistRef}
                role="tablist"
                aria-label="About Thermax"
                onKeyDown={onKeyDown}
                /* Sized to their labels and set left, not stretched to equal
                   thirds. Equal thirds put the second label off-centre in its
                   own cell and left the third one adrift near the margin. */
                className="relative flex border-b border-ink/15"
              >
                {TABS.map((tab, i) => (
                  <button
                    key={tab.id}
                    ref={(el) => (tabRefs.current[i] = el)}
                    type="button"
                    role="tab"
                    id={`${tab.id}-tab`}
                    aria-selected={active === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    tabIndex={active === tab.id ? 0 : -1}
                    onClick={() => setActive(tab.id)}
                    className={cn(
                      'group flex flex-col gap-2 pt-1 pb-3.5 text-left',
                      // Pressed feedback. One pixel is all a flat control needs.
                      'transition-transform duration-150 active:translate-y-px',
                      i > 0 && 'ml-7 sm:ml-11',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'font-mono text-[0.625rem] tracking-[0.2em] tabular-nums transition-colors duration-300',
                        active === tab.id
                          ? 'text-brand-600'
                          : 'text-ink/30 group-hover:text-brand-600/60',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'text-[0.9375rem] transition-colors duration-300 sm:text-base',
                        active === tab.id
                          ? 'font-semibold text-ink'
                          : 'text-ink/55 group-hover:text-ink',
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                ))}

                {/* One bar sliding along the bottom rule, rather than a border
                    toggling on each button. Drawn 1px wide and stretched to the
                    measured tab width — see the layout effect above. */}
                <span
                  aria-hidden="true"
                  style={{ transform: `translateX(${bar.left}px) scaleX(${bar.width})` }}
                  className="absolute -bottom-px left-0 h-0.5 w-px origin-left bg-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </div>

              {/* All three panels share one grid cell, so the block is always as
                  tall as the longest one — switching tabs can't resize the row.
                  Inactive panels stay in the layout but are hidden from sight and
                  from AT, and the fade lives on each panel so a swap crossfades
                  rather than cutting. The incoming panel also settles a few
                  pixels upward, which is what stops the swap reading as a
                  lightbulb turning on; that part is motion-safe only, so reduced
                  motion gets the crossfade with nothing moving. */}
              <div className="mt-6 grid">
                {TABS.map((tab) => (
                  <p
                    key={tab.id}
                    role="tabpanel"
                    id={`${tab.id}-panel`}
                    aria-labelledby={`${tab.id}-tab`}
                    aria-hidden={active !== tab.id}
                    className={cn(
                      'col-start-1 row-start-1 max-w-[56ch] text-base leading-relaxed text-ink/75',
                      'transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      active === tab.id
                        ? 'opacity-100'
                        : 'pointer-events-none opacity-0 motion-safe:translate-y-1.5',
                    )}
                  >
                    {tab.body}
                  </p>
                ))}
              </div>
            </div>

            {/* Spec ledger — ruled rows, mono key over dotted leader over value.
                Reads as a datasheet entry rather than as three feature cards.

                Each row stacks on mobile and only becomes a leader row at `sm`.
                Held on one line, the longest key and its value together overrun
                a 375px viewport, and a leader that wraps is worse than none. */}
            <div>
              <dl className="mt-12 border-t border-ink/15">
                {LEDGER.map(({ term, value }) => (
                  <div
                    key={term}
                    className="flex flex-col gap-1 border-b border-ink/15 py-3.5 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <dt className="font-mono text-[0.625rem] tracking-[0.2em] whitespace-nowrap text-brand-600 uppercase">
                      {term}
                    </dt>
                    {/* The leader. Baseline-aligned and lifted by its own margin
                        so the dots run at x-height rather than under the text. */}
                    <span
                      aria-hidden="true"
                      className="hidden sm:mb-1.5 sm:block sm:min-w-6 sm:flex-1 sm:border-b sm:border-dotted sm:border-ink/25"
                    />
                    <dd className="text-[0.9375rem] text-ink/85 sm:text-right sm:whitespace-nowrap">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              {/* A drawn link rather than a pill — the rule under it extends on
                  hover, which suits the ruled-sheet language better than a
                  colour swap would. */}
              <Link
                to="/about"
                className="group mt-10 inline-flex items-center gap-3 font-mono text-[0.75rem] tracking-[0.2em] text-ink uppercase transition-transform duration-150 active:translate-y-px"
              >
                <span className="relative py-1">
                  Explore more
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left bg-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-[1.18]"
                  />
                </span>
                <svg
                  viewBox="0 0 22 10"
                  aria-hidden="true"
                  className="h-2.5 w-5.5 text-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2"
                >
                  <path
                    d="M0 5h20M16 1l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </Rise>

          {/* ── Right: the plates ──────────────────────────────────────────
              A contact sheet rather than a collage: every tile shares the same
              outer edges and a single hairline gutter, so nothing looks pasted
              on. Lab plate across the top, site plate and a solid brand tile
              below it.

              On desktop it runs past the right gutter and off the page. The
              section clips it, which is the point — a sheet that stops neatly
              inside the margin reads as a picture placed in a column; one that
              carries on reads as a sheet the page is a window onto. */}
          <Rise
            from="right"
            delay={140}
            className="lg:col-span-6 lg:col-start-7 lg:-mr-10 xl:-mr-16"
          >
            {/* Ink-tinted, wide and offset downward: one light source, from
                above, shared with the rest of the page. A neutral black shadow
                at the same opacity greys the white underneath it instead. */}
            <div className="grid grid-cols-5 gap-2.5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)] lg:h-full lg:grid-rows-[minmax(0,1fr)_14rem]">
              {/* Wrapped so the annotation has something to sit against. */}
              <figure className="relative col-span-5 h-72 overflow-hidden bg-ink/5 sm:h-96 lg:h-full">
                <img
                  src={plateLab}
                  width={1600}
                  height={1064}
                  decoding="async"
                  loading="lazy"
                  alt="Chemist in safety glasses drawing a sample from a separatory funnel in a fume hood"
                  /* Crop biased right of centre — that is where the chemist and
                     the funnel sit in the frame. */
                  className="h-full w-full object-cover object-[60%_50%]"
                />
                {/* Contact-sheet annotation. The scrim is only as tall as it
                    needs to be to carry the caption; a full-plate overlay would
                    dull the photograph to buy legibility it doesn't need. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
                />
                <figcaption className="absolute bottom-4 left-4 flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
                  <span className="block h-[2px] w-3 bg-brand-500" />
                  Plate 01 — batch QC
                </figcaption>
                {/* Hairline over the top of the image rather than a border on it:
                    the plates sit edge to edge with a 10px gutter, and a border
                    would push each one inward off that grid. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
                />
              </figure>

              <div className="relative col-span-3 h-40 overflow-hidden bg-ink/5 sm:h-56 lg:h-full">
                <img
                  src={plateSite}
                  width={1100}
                  height={728}
                  decoding="async"
                  loading="lazy"
                  alt="Reinforcement bar and steel formwork laid out on a concrete deck, two workers in high-visibility jackets cutting and tying steel"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-1 ring-ink/10 ring-inset"
                />
              </div>

              {/* Fourth quarter of the sheet, held by the brand instead of a
                  third photograph — the block needs one flat plane to stop the
                  images blurring into each other. Grained, because a saturated
                  red field at this size reads as an unpainted div without it. */}
              <div className="field-grain col-span-2 flex h-40 flex-col justify-between bg-brand-600 p-5 sm:h-56 lg:h-full">
                <svg viewBox="0 0 12 16" aria-hidden="true" className="h-5 w-4 fill-white">
                  <path d="M7 0L0 9h4l-1 7 8-10H7l1-6z" />
                </svg>
                <p className="font-mono text-[0.625rem] leading-[1.7] tracking-[0.16em] text-white uppercase">
                  Specified &amp; supported across Nepal
                </p>
              </div>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  )
}
