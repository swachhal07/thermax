import AboutHero from '@/components/sections/AboutHero'
import Rise from '@/components/ui/Rise'
import { cn } from '@/lib/utils'
import crewPlate from '@/assets/images/images.jpg'
import labPlate from '@/assets/images/30167718_1820318334680020_4472750120941663628_o.jpg'

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

const STORY_INTRO = [
  'Chandanbala International is the authorised distributor of Thermax Construction Chemicals in Nepal. We hold the range in Kathmandu, quote it, and specify it against the mix and the substrate in front of us — for residential, commercial, industrial and infrastructure work across the country.',
  'We also take on the work itself. Structural repair, concrete rehabilitation, waterproofing, protective coatings and specialised repair jobs are carried out by our own technical team. The people who specified the product are the people who apply it, and who answer for how the structure performs afterwards.',
]

const STORY_BODY = [
  'That is a distribution business and an applicator under one roof, which is only workable with stock and a warehouse behind it. Chandanbala International is a company of the MV Dugar Group, a Nepali business house headquartered in Kathmandu — the reason the range sits here on the shelf rather than being ordered in against each job.',
  'Behind the range sits Thermax: one of India’s leading manufacturers of construction chemicals, producing across multiple plants and backed by a group turning over more than INR 10,000 crore a year. That is the manufacturing depth and the technical support standing behind every drum that leaves the warehouse.',
  'What we commit to is narrow enough to hold us to. The right product for the substrate, dosage worked out against the conditions on the day, and someone who picks up the phone when site turns up something the drawing did not show.',
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

export default function About() {
  return (
    <>
      <AboutHero />

      <section
        id="story"
        className="scroll-mt-32 overflow-clip bg-[#f4f4f6] pt-12 pb-20 sm:pt-16 sm:pb-28"
      >
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10 xl:max-w-[92rem]">
          <Rise>
            <header className="mx-auto max-w-3xl text-center">
              <Kicker className="mx-auto">Our story</Kicker>
              <h2 className="font-sans text-[2.5rem] leading-[1.04] font-bold tracking-[-0.02em] text-balance text-ink sm:text-5xl lg:text-[3.25rem]">
                Two companies, one <span className="text-brand-600">chain of custody</span>
              </h2>
            </header>
          </Rise>

          <div className="mt-14 grid gap-y-10 lg:grid-cols-12 lg:gap-x-6">
            <Rise className="lg:col-span-6">
              <div className="border-t border-ink/15 pt-8">
                {STORY_INTRO.map((paragraph, i) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className={cn(
                      'max-w-[62ch] text-justify text-[1.0625rem] leading-relaxed text-ink/75 sm:text-[1.125rem]',
                      i === 0 ? 'text-ink' : 'mt-5',
                    )}
                  >
                    {paragraph}
                  </p>
                ))}

                <div aria-hidden="true" className="mt-9 h-px w-full bg-ink/12" />

                {STORY_BODY.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className="mt-6 max-w-[62ch] text-justify text-[1.0625rem] leading-relaxed text-ink/75 sm:text-[1.125rem]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Rise>

            <Rise
              from="right"
              delay={140}
              className="lg:col-span-6 lg:col-start-7 lg:h-full lg:pl-6"
            >
              <figure className="relative h-80 overflow-hidden bg-ink/5 shadow-[0_40px_80px_-52px_rgba(20,23,28,0.55)] sm:h-[28rem] lg:h-full">
                <img
                  src={crewPlate}
                  width={1600}
                  height={944}
                  loading="lazy"
                  decoding="async"
                  alt="A tunnel portal cut into a shotcrete-faced rock face, with a crew standing in the bore mouth"
                  className="absolute inset-0 h-full w-full object-cover object-[50%_45%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
                />
                <figcaption className="absolute bottom-4 left-5 flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
                  <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-500" />
                  Tunnel portal — excavation face
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
                  width={2048}
                  height={1536}
                  loading="lazy"
                  decoding="async"
                  alt="Site team measuring the slump of freshly mixed concrete with a tape against an inverted slump cone"
                  className="aspect-[4/5] w-full object-cover object-[58%_62%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
                />
                <figcaption className="absolute bottom-4 left-5 flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">
                  <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-500" />
                  Slump test — mix check
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

    </>
  )
}
