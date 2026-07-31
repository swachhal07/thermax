import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Rise from '@/components/ui/Rise'

export default function CTA() {
  return (
    <section className="py-20">
      <Container>
        <Rise className="rounded-3xl bg-ink px-8 py-16 text-center sm:px-16">
          <h2 className="text-4xl tracking-tight text-white sm:text-5xl">
            Ready to start a project?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/70">
            A short line that nudges the visitor toward the contact form.
          </p>
          <Button to="/contact" size="lg" className="mt-8 bg-white text-ink hover:bg-white/90">
            Contact us
          </Button>
        </Rise>
      </Container>
    </section>
  )
}
