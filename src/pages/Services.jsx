import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import CTA from '@/components/sections/CTA'
import { services } from '@/data/services'

export default function Services() {
  return (
    <>
      <Section
        eyebrow="Services"
        title="What we offer"
        subtitle="Four Thermax product lines, held in stock in Kathmandu and specified against the job."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            // Anchored so the home-page index can link straight to a line. The
            // offset clears the fixed header.
            <div key={service.slug} id={service.slug} className="scroll-mt-32">
              <Card className="h-full">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-brand-600">
                  {service.code}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm text-muted">{service.body}</p>
              </Card>
            </div>
          ))}
        </div>
      </Section>
      <CTA />
    </>
  )
}
