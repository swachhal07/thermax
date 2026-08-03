import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import useScrollToTop from '@/hooks/useScrollToTop'
import { OVERLAY_ROUTES } from '@/lib/siteConfig'
import { cn } from '@/lib/utils'

export default function Layout() {
  useScrollToTop()
  const { pathname } = useLocation()

  const overlay = OVERLAY_ROUTES.includes(pathname)

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className={cn('flex-1', !overlay && 'pt-24')}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
