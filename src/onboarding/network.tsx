import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import StatusSheet from '../components/StatusSheet'

/** Prototype switches set from the side panel. */
export type Simulation = { offline: boolean; faceFails: boolean }
export const SimulationContext = createContext<Simulation>({ offline: false, faceFails: false })
export const useSimulation = () => useContext(SimulationContext)

/** True when the browser reports no connection, or the panel simulates it. */
export function useOnline() {
  const { offline } = useSimulation()
  const [browserOnline, setBrowserOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const up = () => setBrowserOnline(true)
    const down = () => setBrowserOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])
  return browserOnline && !offline
}

/**
 * Wraps a submit so it only runs online. Offline, it shows the
 * "You're offline" sheet; Retry re-runs the submit once back online
 * (and shakes if still offline), Go Back closes the sheet with every
 * field left as it was.
 */
export function useOnlineGuard() {
  const online = useOnline()
  const onlineRef = useRef(online)
  onlineRef.current = online
  const pending = useRef<(() => void) | null>(null)
  const [open, setOpen] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  const guard = useCallback((submit: () => void) => {
    if (onlineRef.current) { submit(); return true }
    pending.current = submit
    setOpen(true)
    return false
  }, [])

  const retry = () => {
    if (!onlineRef.current) { setShakeKey((k) => k + 1); return }
    setOpen(false)
    const run = pending.current
    pending.current = null
    // Let the sheet start leaving before the submit's own feedback begins.
    if (run) window.setTimeout(run, 180)
  }

  const sheet: ReactNode = (
    <StatusSheet
      open={open}
      tone="error"
      title="You’re offline — we’ll keep your details"
      body="Reconnect, then retry. Your details haven’t been submitted yet."
      onRetry={retry}
      onBack={() => { pending.current = null; setOpen(false) }}
      shakeKey={shakeKey}
    />
  )
  return { guard, sheet, online }
}
