import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { siteConfig, navLinks, OVERLAY_ROUTES } from '@/lib/siteConfig'
import { cn } from '@/lib/utils'
import dugarLogo from '@/assets/dugar-logo.png'
import thermaxLogo from '@/assets/thermax-logo.png'
import thermaxLogoLight from '@/assets/thermax-logo-light.png'

const BAR = 'flex w-full px-5 sm:px-8 lg:px-16'

function Chevron({ className }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={cn('h-3 w-3 transition-transform duration-200', className)}
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DesktopNavItem({ item, transparent }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)

  const show = () => {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const linkClass = ({ isActive }) =>
    cn(
      'relative inline-flex items-center gap-1.5 py-2 text-[1.0625rem] font-medium transition-colors duration-300',
      'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:transition-transform after:duration-200',
      transparent
        ? 'text-white/85 hover:text-white after:bg-white'
        : 'text-ink/75 hover:text-brand-600 after:bg-brand-600',
      isActive && (transparent ? 'text-white after:scale-x-100' : 'text-brand-600 after:scale-x-100'),
    )

  if (!item.children) {
    return (
      <NavLink to={item.to} end={item.to === '/'} className={linkClass}>
        {item.label}
      </NavLink>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      <NavLink to={item.to} className={linkClass} aria-expanded={open} aria-haspopup="true">
        {item.label}
        <Chevron className={open ? 'rotate-180' : ''} />
      </NavLink>

      <div
        className={cn(
          'absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-4 transition-[opacity,transform,visibility] duration-200',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <ul className="overflow-hidden rounded-xl border border-black/8 bg-white py-2 shadow-xl shadow-black/8">
          {item.children.map((child) => (
            <li key={child.to}>
              <Link
                to={child.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-ink/75 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const { pathname } = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    setOpenGroup(null)
  }, [pathname])

  const overlayRoute = OVERLAY_ROUTES.includes(pathname)

  useEffect(() => {
    if (!overlayRoute) return

    const onScroll = () => {
      const next = window.scrollY < 8
      setAtTop((prev) => (prev === next ? prev : next))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlayRoute])

  const transparent = overlayRoute && atTop && !hovered && !menuOpen

  return (
    <header
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
        transparent ? 'border-transparent bg-transparent' : 'border-black/8 bg-white',
      )}
    >
      <div className={cn(BAR, 'h-24 items-center justify-between gap-6')}>
        <Link to="/" className="flex shrink-0 items-center gap-4" aria-label={siteConfig.name}>
          <img src={dugarLogo} alt="MV Dugar Group" className="h-15 w-15 object-contain" />
          <span
            aria-hidden="true"
            className={cn(
              'h-12 w-px transition-colors duration-300',
              transparent ? 'bg-white/30' : 'bg-black/12',
            )}
          />
          <span className="relative block h-14 w-12 shrink-0">
            <img
              src={thermaxLogo}
              alt={`${siteConfig.name} logo`}
              className={cn(
                'absolute inset-0 h-14 w-auto object-contain transition-opacity duration-300',
                transparent ? 'opacity-0' : 'opacity-100',
              )}
            />
            <img
              src={thermaxLogoLight}
              alt=""
              aria-hidden="true"
              className={cn(
                'absolute inset-0 h-14 w-auto object-contain transition-opacity duration-300',
                transparent ? 'opacity-100' : 'opacity-0',
              )}
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((item) => (
            <DesktopNavItem key={item.label} item={item} transparent={transparent} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className={cn(
              'hidden h-12 items-center rounded-full border bg-transparent px-8 text-[1.0625rem] font-semibold transition-colors duration-300 sm:inline-flex',
              'hover:border-brand-600 hover:bg-brand-600 hover:text-white',
              transparent ? 'border-white/70 text-white' : 'border-brand-600 text-brand-600',
            )}
          >
            Contact Us
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg lg:hidden"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  'block h-0.5 w-6 transition-[opacity,transform,background-color] duration-200',
                  transparent ? 'bg-white' : 'bg-ink',
                  menuOpen && i === 0 && 'translate-y-2 rotate-45',
                  menuOpen && i === 1 && 'opacity-0',
                  menuOpen && i === 2 && '-translate-y-2 -rotate-45',
                )}
              />
            ))}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-black/8 bg-white lg:hidden">
          <div className={cn(BAR, 'flex-col py-3')}>
            {navLinks.map((item) =>
              item.children ? (
                <div key={item.label} className="border-b border-black/5 last:border-0">
                  <button
                    type="button"
                    onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                    aria-expanded={openGroup === item.label}
                    className="flex w-full items-center justify-between px-1 py-3.5 text-[1.0625rem] font-medium text-ink/80"
                  >
                    {item.label}
                    <Chevron className={openGroup === item.label ? 'rotate-180' : ''} />
                  </button>
                  {openGroup === item.label && (
                    <ul className="pb-2 pl-4">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <Link to={child.to} className="block py-2.5 text-sm text-muted">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'border-b border-black/5 px-1 py-3.5 text-[1.0625rem] font-medium last:border-0',
                      isActive ? 'text-brand-600' : 'text-ink/80',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}

            <Link
              to="/contact"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-brand-600 bg-transparent px-7 text-[1.0625rem] font-semibold text-brand-600 transition-colors hover:bg-brand-600 hover:text-white sm:hidden"
            >
              Contact Us
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
