import Hero from '@/components/sections/Hero'
import AboutIntro from '@/components/sections/AboutIntro'
import ServicesGrid from '@/components/sections/ServicesGrid'
import Certifications from '@/components/sections/Certifications'
import Faqs from '@/components/sections/Faqs'
import HowWeWork from '@/components/sections/HowWeWork'

export default function Home() {
  return (
    <>
      <Hero />
      <AboutIntro />
      <ServicesGrid />
      <HowWeWork />
      <Certifications />
      <Faqs />
    </>
  )
}
