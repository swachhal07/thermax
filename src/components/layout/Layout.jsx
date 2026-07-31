import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import useScrollToTop from '@/hooks/useScrollToTop'
import { OVERLAY_ROUTES } from '@/lib/siteConfig'
import { cn } from '@/lib/utils'

/** Shell shared by every page. Child routes render into <Outlet />. */
export default function Layout() {
  useScrollToTop()
  const { pathname } = useLocation()

  // The header is fixed, so it takes up no space in the flow. Overlay routes
  // want the hero to run underneath it; every other page pads down by its
  // height (h-24) so content doesn't start behind the bar.
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
