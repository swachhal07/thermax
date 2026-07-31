import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'

/**
 * Home is imported directly — it's the landing route for almost every visitor,
 * and splitting it would only add a round trip before the hero can paint.
 *
 * Every other page is split out. They were riding in the initial bundle, so a
 * first-time visitor was downloading and parsing the contact form, the careers
 * page and the blog before seeing the hero. Add new pages the same way.
 */
const About = lazy(() => import('@/pages/About'))
const Services = lazy(() => import('@/pages/Services'))
const Blog = lazy(() => import('@/pages/Blog'))
const Post = lazy(() => import('@/pages/Post'))
const Careers = lazy(() => import('@/pages/Careers'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/**
 * Holds the header's height so the footer doesn't jump up the viewport during
 * the chunk fetch. No spinner: on any usable connection these chunks arrive in
 * well under the time it takes a spinner to stop reading as a glitch.
 */
function RouteFallback() {
  return <div className="min-h-[60vh]" />
}

/** Add new pages here — one <Route> per page. */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="about"
          element={
            <Suspense fallback={<RouteFallback />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="services"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Services />
            </Suspense>
          }
        />
        <Route
          path="blog"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Blog />
            </Suspense>
          }
        />
        {/* One note per address. Separate from the index rather than nested with
            an <Outlet>, because a note replaces the index rather than rendering
            inside it. Post.jsx handles an unknown slug itself — someone on a
            stale journal link wants another note, not the 404. */}
        <Route
          path="blog/:slug"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Post />
            </Suspense>
          }
        />
        <Route
          path="careers"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Careers />
            </Suspense>
          }
        />
        <Route
          path="contact"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Contact />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NotFound />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
