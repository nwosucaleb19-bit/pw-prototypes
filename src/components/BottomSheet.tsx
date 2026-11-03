import { useEffect, useState, type ReactNode } from 'react'

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
const DURATION_MS = 320

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  maxHeight?: string
  dismissOnBackdrop?: boolean
  showGrabber?: boolean
  padding?: string
}

export default function BottomSheet({
  open,
  onClose,
  children,
  maxHeight = '90%',
  dismissOnBackdrop = true,
  showGrabber = true,
  padding = 'px-5 pt-3 pb-10',
}: Props) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setShown(true))
        return () => cancelAnimationFrame(r2)
      })
      return () => cancelAnimationFrame(r1)
    } else if (mounted) {
      setShown(false)
      const t = window.setTimeout(() => setMounted(false), DURATION_MS)
      return () => window.clearTimeout(t)
    }
  }, [open, mounted])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 z-30">
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: shown ? 0.6 : 0,
          transition: `opacity ${DURATION_MS}ms ${EASE}`,
        }}
        onClick={() => dismissOnBackdrop && onClose()}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] ${padding} flex flex-col will-change-transform`}
        style={{
          maxHeight,
          transform: shown ? 'translate3d(0,0,0)' : 'translate3d(0,100%,0)',
          transition: `transform ${DURATION_MS}ms ${EASE}`,
          boxShadow: '0 -10px 20px rgba(0,0,0,0.15)',
        }}
      >
        {showGrabber && (
          <div className="mx-auto h-[5px] w-[36px] rounded-full bg-parkway-grey05 mb-3 shrink-0" />
        )}
        {children}
      </div>
    </div>
  )
}
