import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '@/lib/api'

/* The state both panels sit on: the rows, whatever is being edited, and the one
   status line. Every mutation goes through `run`, so a save, a delete, a
   reorder and an upload all report the same way and all end with the list
   reloaded from the API rather than patched locally — the server owns `order`
   and `slug`, and guessing at them here is how a table drifts from its data. */
export function useCollection(resource, { params = {} } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  // Serialised so the effect below re-runs when a filter changes without
  // depending on a fresh object identity each render.
  const key = JSON.stringify(params)

  const load = useCallback(
    async (signal) => {
      setLoading(true)
      try {
        const payload = await resource.list(JSON.parse(key), signal)
        setRows(payload.data)
        return payload
      } catch (error) {
        if (error.name === 'AbortError') return null
        setNote({ tone: 'error', text: error.message })
        return null
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [resource, key],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  /* A cleared note after a moment, so the panel does not accumulate stale
     confirmations. Errors stay until the next action replaces them. */
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const say = useCallback((tone, text) => {
    clearTimeout(timer.current)
    setNote({ tone, text })
    if (tone !== 'error') timer.current = setTimeout(() => setNote(null), 4000)
  }, [])

  const run = useCallback(
    async (action, successText) => {
      setBusy(true)
      setFieldErrors({})

      try {
        const result = await action()
        await load()
        if (successText) say('info', successText)
        return result
      } catch (error) {
        if (error instanceof ApiError && error.details) setFieldErrors(error.details)
        say('error', error.message)
        return null
      } finally {
        setBusy(false)
      }
    },
    [load, say],
  )

  return { rows, loading, busy, note, fieldErrors, setFieldErrors, run, reload: load, say }
}

/* Moving a row is a whole-list reorder — the API renumbers in one write, so the
   table is never left half-sorted. */
export function movedOrder(slugs, slug, direction) {
  const from = slugs.indexOf(slug)
  const to = from + direction

  if (from === -1 || to < 0 || to >= slugs.length) return null

  const next = [...slugs]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}
