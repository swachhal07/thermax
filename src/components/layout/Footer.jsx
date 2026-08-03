import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { siteConfig, footerLinks } from '@/lib/siteConfig'
import { services } from '@/data/services'
import dugarLogo from '@/assets/dugar-logo.png'
import thermaxLogoLight from '@/assets/thermax-logo-light.png'

function Label({ children }) {
  return (
    <p className="flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-white/50">
      <span aria-hidden="true" className="block h-[2px] w-3 bg-brand-600" />
      {children}
    </p>
  )
}

function Row({ to, href, children }) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="mt-[0.7em] block h-px w-3.5 shrink-0 origin-left bg-white/25 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/row:scale-x-[1.6] group-hover/row:bg-brand-600 motion-reduce:transition-none motion-reduce:group-hover/row:transform-none"
      />
      <span className="transition-[transform,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/row:translate-x-1 group-hover/row:text-white motion-reduce:transition-none motion-reduce:group-hover/row:transform-none">
        {children}
      </span>
    </>
  )

  const shell =
    'group/row flex items-start gap-3.5 text-[1rem] leading-snug text-white/65'

  return to ? (
    <Link to={to} className={shell}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={shell}>
      {inner}
    </a>
  )
}

function FieldName({ children }) {
  return (
    <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.22em] text-white/30">
      {children}
    </dt>
  )
}

export default function Footer() {
  const socials = Object.entries(siteConfig.social).filter(([, href]) => href && href !== '#')

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <footer className="relative isolate bg-black pb-8 text-white">
      <div
        aria-hidden="true"
        className="field-grain-on-black pointer-events-none absolute inset-0 -z-10"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2)_35%,rgba(255,255,255,0.2)_65%,transparent)]"
      />

      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-10">

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 pb-14 pt-24 sm:grid-cols-2 lg:grid-cols-[1fr_0.8fr_1.3fr_1fr] lg:gap-y-0">
          <Rise>
            <Label>Group</Label>
            <div className="mt-8 flex items-center gap-4">
              <img
                src={dugarLogo}
                alt="MV Dugar Group"
                loading="lazy"
                className="h-11 w-11 object-contain"
              />
              <span aria-hidden="true" className="block h-8 w-px bg-white/15" />
              <img
                src={thermaxLogoLight}
                alt={`${siteConfig.name} logo`}
                loading="lazy"
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="mt-6 max-w-[15rem] text-[1rem] leading-relaxed text-white/55 text-pretty">
              {siteConfig.name} in Nepal, through the MV Dugar Group.
            </p>
          </Rise>

          <Rise delay={80} className="lg:border-l lg:border-white/[0.09] lg:pl-8">
            <Label>Pages</Label>
            <nav className="mt-8">
              <ul className="grid list-none gap-3 p-0">
                {footerLinks.map((link) => (
                  <li key={link.to}>
                    <Row to={link.to}>{link.label}</Row>
                  </li>
                ))}
              </ul>
            </nav>
          </Rise>

          <Rise delay={160} className="lg:border-l lg:border-white/[0.09] lg:pl-8">
            <Label>Range</Label>
            <ul className="mt-8 grid list-none gap-3 p-0">
              {services.map((service) => (
                <li key={service.slug}>
                  <Row to="/services">{service.title}</Row>
                </li>
              ))}
            </ul>
          </Rise>

          <Rise delay={240} className="lg:border-l lg:border-white/[0.09] lg:pl-8">
            <Label>Reach</Label>
            <dl className="mt-8 grid gap-7">
              <div>
                <FieldName>Phone</FieldName>
                <dd className="mt-2.5 grid gap-2">
                  {[siteConfig.phone, siteConfig.phoneAlt].map((number) => (
                    <Row key={number} href={`tel:${number.replace(/\s+/g, '')}`}>
                      {number}
                    </Row>
                  ))}
                </dd>
              </div>
              <div>
                <FieldName>Email</FieldName>
                <dd className="mt-2.5">
                  <Row href={`mailto:${siteConfig.email}`}>{siteConfig.email}</Row>
                </dd>
              </div>
              <div>
                <FieldName>Warehouse</FieldName>
                <dd className="mt-2.5 text-[1rem] leading-snug text-white/65">
                  {siteConfig.address}
                </dd>
              </div>
            </dl>
          </Rise>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/[0.09] pt-6 sm:flex-row sm:items-center sm:justify-between">

          <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-white/35 uppercase">
            &copy; {new Date().getFullYear()} {siteConfig.name}
            <span aria-hidden="true" className="mx-2 text-white/15">
              /
            </span>
            All rights reserved
            <span aria-hidden="true" className="mx-2 text-white/15">
              /
            </span>
            Developed by Swachhal Lamsal
          </p>

          <div className="flex items-center gap-5">
            {socials.length > 0 && (
              <div className="flex items-center gap-2">
                {socials.map(([name, href]) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${siteConfig.name} on ${name}`}
                    className="grid h-9 w-9 place-items-center rounded-[4px] font-mono text-[0.75rem] uppercase text-white/60 ring-1 ring-white/10 transition-[transform,background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-[2px] hover:bg-brand-600 hover:text-white hover:ring-brand-600 motion-reduce:transition-none motion-reduce:hover:transform-none"
                  >
                    <span aria-hidden="true">{name.charAt(0)}</span>
                  </a>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={toTop}
              className="group/top inline-flex w-fit items-center gap-3 rounded-full py-2 pl-5 pr-2 text-[0.875rem] font-medium text-white ring-1 ring-white/15 transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.07] hover:ring-white/30 active:scale-[0.98] motion-reduce:transition-none"
            >
              Back to top
              <span
                aria-hidden="true"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/top:-translate-y-[3px] group-hover/top:scale-105 motion-reduce:transition-none motion-reduce:group-hover/top:transform-none"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M12 18.5V6m0 0-5 5m5-5 5 5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
