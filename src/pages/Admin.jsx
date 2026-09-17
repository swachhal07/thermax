import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { api, auth } from '@/lib/api'
import AdminShell from '@/admin/AdminShell'
import SignIn from '@/admin/SignIn'

/* The panels are the bulk of the admin and no visitor to the public site will
   ever load them, so they are split out and fetched only once someone is
   through the sign-in. */
const ClientsPanel = lazy(() => import('@/admin/ClientsPanel'))
const ApplicationsPanel = lazy(() => import('@/admin/ApplicationsPanel'))

/* /admin is its own shell — no site header, no footer, nothing of the marketing
   pages. It sits outside Layout in the router for exactly that reason.

   A held token is not trusted on its face: it is checked against /auth/me
   before the panels render, so an expired or revoked session lands on the sign
   in rather than on a table that fails every request. */
export default function Admin() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(Boolean(auth.get()))

  useEffect(() => {
    if (!auth.get()) return

    let cancelled = false

    api
      .me()
      .then(({ data }) => !cancelled && setUser(data.user))
      // A 401 has already cleared the token inside the api client.
      .catch(() => !cancelled && auth.clear())
      .finally(() => !cancelled && setChecking(false))

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // The admin is not a page anyone should find in a search result.
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.append(meta)

    const title = document.title
    document.title = 'Thermax · back of house'

    return () => {
      meta.remove()
      document.title = title
    }
  }, [])

  if (checking) return <div className="min-h-dvh bg-white" />
  if (!user) return <SignIn onSignedIn={setUser} />

  return (
    <Routes>
      <Route element={<AdminShell user={user} onSignOut={() => setUser(null)} />}>
        {/* Landing on /admin goes straight to the ledger rather than to a
            dashboard of two links. */}
        <Route index element={<Navigate to="/admin/clients" replace />} />
        <Route
          path="clients"
          element={
            <Suspense fallback={<Loading />}>
              <ClientsPanel />
            </Suspense>
          }
        />
        <Route
          path="applications"
          element={
            <Suspense fallback={<Loading />}>
              <ApplicationsPanel />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/admin/clients" replace />} />
      </Route>
    </Routes>
  )
}

function Loading() {
  return <div className="min-h-[60vh]" />
}
