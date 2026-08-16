import { Link } from 'react-router-dom'
import Rise from '@/components/ui/Rise'
import { siteConfig, footerLinks } from '@/lib/siteConfig'
import { cn } from '@/lib/utils'
import dugarLogo from '@/assets/dugar-logo.png'
import thermaxLogoLight from '@/assets/thermax-logo-light.png'

const SHELL =
  'group/link relative w-fit text-white/70 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white'

function Sweep() {
  return (
    <span
      aria-hidden="true"
      className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/link:scale-x-100 motion-reduce:transition-none"
    />
  )
}

function Trail({ to, href, className, children }) {
  const shell = cn(SHELL, className)

  return to ? (
    <Link to={to} className={shell}>
      {children}
      <Sweep />
    </Link>
  ) : (
    <a href={href} className={shell}>
      {children}
      <Sweep />
    </a>
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
        <div className="grid gap-x-10 gap-y-12 pt-20 pb-14 sm:pt-24 lg:grid-cols-12 lg:items-baseline">
          <Rise className="lg:col-span-8">
            <h2 className="font-sans text-[clamp(2rem,3.8vw,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-white">
              <span className="block">Tell us what you&rsquo;re pouring.</span>
              <span className="block text-brand-600">We&rsquo;ll specify the rest.</span>
            </h2>

            <Link
              to="/contact"
              className="group/cta mt-9 inline-flex w-fit items-center gap-4 rounded-full py-2 pr-2 pl-6 text-[0.9375rem] font-medium text-white ring-1 ring-white/15 transition-[transform,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] hover:ring-white/30 active:scale-[0.98] motion-reduce:transition-none"
            >
              Talk to us
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/cta:translate-x-1 group-hover/cta:-translate-y-[3px] group-hover/cta:scale-105 motion-reduce:transition-none motion-reduce:group-hover/cta:transform-none"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M6.5 17.5 17.5 6.5M9 6.5h8.5V15"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </Rise>

          <Rise delay={120} className="lg:col-span-4 lg:justify-self-end lg:text-right">
            <div className="grid gap-3">
              {[siteConfig.phone, siteConfig.phoneAlt].map((number) => (
                <Trail
                  key={number}
                  href={`tel:${number.replace(/\s+/g, '')}`}
                  className="text-[1.375rem] leading-none tracking-[-0.01em] sm:text-[1.625rem] lg:justify-self-end"
                >
                  {number}
                </Trail>
              ))}
              <Trail
                href={`mailto:${siteConfig.email}`}
                className="text-[1.375rem] leading-none tracking-[-0.01em] sm:text-[1.625rem] lg:justify-self-end"
              >
                {siteConfig.email}
              </Trail>
            </div>

            <p className="mt-7 text-[0.9375rem] leading-relaxed text-white/60">
              {siteConfig.address}
              <span aria-hidden="true" className="mx-2.5 text-white/20">
                &middot;
              </span>
              {siteConfig.hours}
            </p>
          </Rise>
        </div>

        <Rise
          delay={80}
          className="flex flex-col gap-8 border-t border-white/[0.09] py-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <img
              src={dugarLogo}
              alt="MV Dugar Group"
              loading="lazy"
              className="h-10 w-10 object-contain"
            />
            <span aria-hidden="true" className="block h-7 w-px bg-white/15" />
            <img
              src={thermaxLogoLight}
              alt={`${siteConfig.name} logo`}
              loading="lazy"
              className="h-10 w-auto object-contain"
            />
            <p className="ml-2 max-w-[16ch] text-[0.875rem] leading-snug text-white/55">
              {siteConfig.name} in Nepal, through the MV Dugar Group.
            </p>
          </div>

          <nav>
            <ul className="flex list-none flex-wrap items-center gap-x-8 gap-y-3 p-0 text-[1rem]">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Trail to={link.to}>{link.label}</Trail>
                </li>
              ))}
            </ul>
          </nav>
        </Rise>

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
                    className="grid h-9 w-9 place-items-center rounded-[4px] font-mono text-[0.75rem] text-white/60 uppercase ring-1 ring-white/10 transition-[transform,background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-[2px] hover:bg-brand-600 hover:text-white hover:ring-brand-600 motion-reduce:transition-none motion-reduce:hover:transform-none"
                  >
                    <span aria-hidden="true">{name.charAt(0)}</span>
                  </a>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={toTop}
              className="group/top inline-flex w-fit items-center gap-3 rounded-full py-2 pr-2 pl-5 text-[0.875rem] font-medium text-white ring-1 ring-white/15 transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.07] hover:ring-white/30 active:scale-[0.98] motion-reduce:transition-none"
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
