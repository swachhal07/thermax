import AboutHero from '@/components/sections/AboutHero'
import Rise from '@/components/ui/Rise'
import Counter from '@/components/ui/Counter'
import { services } from '@/data/services'
import { cn } from '@/lib/utils'
import crewPlate from '@/assets/images/service-bridges.webp'
import labPlate from '@/assets/about-plate-lab.webp'

function Kicker({ className, children }) {
  return (
    <p
      className={cn(
        'mb-6 flex w-fit items-center gap-3 font-mono text-[0.8125rem] tracking-[0.2em] text-ink uppercase',
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

const NEPAL_SINCE = 1998
const yearsInNepal = new Date().getFullYear() - NEPAL_SINCE

const STATS = [
  { term: 'Projects completed', value: 247 },
  { term: 'Years in Nepal', value: yearsInNepal },
  { term: 'Districts reached', value: 38 },
  { term: 'Sectors supplied', value: services.length },
]

const SHOWN_STATS = STATS.filter((stat) => Number.isFinite(stat.value))

export default function About() {
  return (
    <>
      <AboutHero />

      <section
        id="story"
        className="scroll-mt-32 overflow-clip bg-[#f4f4f6] pt-12 pb-20 sm:pt-16 sm:pb-28"
      >
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <Rise>
            <header className="mx-auto max-w-3xl text-center">
              <Kicker className="mx-auto">Our story</Kicker>
              <h2 className="font-sans text-[2.5rem] leading-[1.04] font-bold tracking-[-0.02em] text-balance text-ink sm:text-5xl lg:text-[3.25rem]">
                Two companies, one <span className="text-brand-600">chain of custody</span>
              </h2>
            </header>
          </Rise>

          <div className="mt-14 grid gap-y-10 lg:grid-cols-12 lg:gap-x-16">
            <Rise className="lg:col-span-7">
              <ol className="grid list-none grid-cols-1 gap-0 border-t border-ink/15 p-0">
                {CHAIN.map((link, i) => (
                  <li
                    key={link.id}
                    className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-5 border-b border-ink/15 py-8 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-x-8"
                  >
                    <span
                      aria-hidden="true"
                      className="font-mono text-[1.75rem] leading-none tabular-nums text-ink/20 sm:text-[2.5rem]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
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

            <Rise
              from="right"
              delay={140}
              className="lg:col-span-5 lg:col-start-8 lg:h-full lg:-mr-10 xl:-mr-16"
            >
              <figure className="relative h-80 overflow-hidden bg-ink/5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)] sm:h-[28rem] lg:h-full">
                <img
                  src={crewPlate}
                  width={1600}
                  height={1066}
                  loading="lazy"
                  decoding="async"
                  alt="A cable-stayed bridge under construction, two deck sections reaching towards each other"
                  className="absolute inset-0 h-full w-full object-cover object-[42%_55%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
                />
                <figcaption className="absolute bottom-4 left-5 flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
                  <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-500" />
                  Bridge deck — under construction
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

      <section
        id="quality"
        className="scroll-mt-32 bg-white pt-12 pb-20 sm:pt-16 sm:pb-28"
      >
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">
          <Rise>
            <header className="mx-auto max-w-3xl text-center">
              <Kicker className="mx-auto">Quality &amp; testing</Kicker>
              <h2 className="font-sans text-[2.5rem] leading-[1.04] font-bold tracking-[-0.02em] text-balance text-ink sm:text-5xl lg:text-[3.25rem]">
                Tested at the batch,{' '}
                <span className="text-brand-600">traceable at the drum</span>
              </h2>
            </header>
          </Rise>

          <div className="mt-14 grid gap-y-12 lg:grid-cols-12 lg:gap-x-16">
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

            <Rise delay={140} className="lg:col-span-7 lg:col-start-6">
              <dl className="grid border-t border-ink/15">
                {CHECKS.map(({ term, body }) => (
                  <div key={term} className="border-b border-ink/15 py-6">
                    <dt className="flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.2em] text-ink uppercase">
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

          <Rise delay={120}>
            <ul
              className={cn(
                'mt-12 grid list-none grid-cols-2 gap-x-6 gap-y-12 p-0 sm:gap-x-10',
                SHOWN_STATS.length > 2 && 'lg:grid-cols-4',
              )}
            >
              {SHOWN_STATS.map(({ term, value, from, group }) => (
                <li key={term} className="border-t border-ink/15 pt-6 text-center">

                  <Counter
                    value={value}
                    from={from}
                    group={group}
                    className="bg-clip-text font-mono text-[2.75rem] leading-none tracking-[-0.02em] text-transparent [-webkit-background-clip:text] [background-image:linear-gradient(135deg,var(--color-brand-800)_0%,var(--color-brand-700)_38%,var(--color-brand-600)_68%,var(--color-brand-500)_88%,var(--color-brand-400)_100%)] sm:text-[3.5rem]"
                  />

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
