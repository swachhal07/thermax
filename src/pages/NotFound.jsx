import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <Section>
      <div className="py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">404</p>
        <h1 className="mt-3 text-5xl tracking-tight">Page not found</h1>
        <p className="mt-4 text-muted">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Button to="/" className="mt-8">
          Back home
        </Button>
      </div>
    </Section>
  )
}
