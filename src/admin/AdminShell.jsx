import { NavLink, Outlet } from 'react-router-dom'
import { api, auth } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button, Eyebrow } from './fields'

const TABS = [
  { to: '/admin/clients', label: 'Clients' },
  { to: '/admin/applications', label: 'Applications' },
]

export default function AdminShell({ user, onSignOut }) {
  const signOut = () => {
    auth.clear()
    onSignOut()
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[84rem] flex-wrap items-center gap-x-8 gap-y-4 px-5 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-5 w-[3px] bg-brand-600" />
            <span className="font-sans text-[0.9375rem] font-extrabold tracking-[-0.02em] text-ink">
              Thermax
            </span>
            <Eyebrow className="hidden sm:block">Back of house</Eyebrow>
          </div>

          {/* The two collections this API owns. Tabs rather than a sidebar:
              there are two of them, and a rail for two links is furniture. */}
          <nav className="-mb-4 flex items-end gap-6 self-end">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    'border-b-2 pb-3.5 font-mono text-[0.625rem] uppercase tracking-[0.2em] transition-colors duration-300 motion-reduce:transition-none',
                    isActive
                      ? 'border-brand-600 text-ink'
                      : 'border-transparent text-muted hover:text-ink',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <span className="hidden font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-ink/35 sm:block">
              {user?.email}
            </span>
            <Button size="sm" tone="ghost" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[84rem] flex-1 px-5 pb-24 pt-10 sm:px-10">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 px-5 py-4 sm:px-10">
        <p className="mx-auto w-full max-w-[84rem] font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ink/25">
          {api.baseUrl}
        </p>
      </footer>
    </div>
  )
}
