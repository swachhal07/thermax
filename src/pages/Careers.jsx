import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CTA from '@/components/sections/CTA'

// Placeholder openings — replace with the client's real vacancies.
const openings = [
  { id: 'sales-exec', title: 'Sales Executive', location: 'Kathmandu', type: 'Full-time' },
  { id: 'service-eng', title: 'Service Engineer', location: 'Pokhara', type: 'Full-time' },
]

export default function Careers() {
  return (
    <>
      <Section
        eyebrow="Careers"
        title="Work with us"
        subtitle="Replace with the client's hiring pitch."
      >
        <div className="flex flex-col gap-4">
          {openings.map((job) => (
            <Card key={job.id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {job.location} · {job.type}
                </p>
              </div>
              <Button to="/contact" variant="outline" size="sm">
                Apply
              </Button>
            </Card>
          ))}
        </div>
      </Section>
      <CTA />
    </>
  )
}
