import { useEffect } from 'react'
import ConfettiBurst from './ConfettiBurst'

type Props = {
  /** Diameter of the solid disc in px. */
  size: number
  tone?: 'green' | 'tangerine'
  /** ms before the disc starts to arrive. */
  delay?: number
  /** Two quiet concentric rings that settle around the disc and stay. */
  halo?: boolean
  confetti?: boolean
}

const TONES = {
  green: { disc: '#29CC6A', ring: 'rgba(41, 204, 106, 0.10)', ring2: 'rgba(41, 204, 106, 0.05)' },
  tangerine: { disc: '#F9956B', ring: 'rgba(249, 149, 107, 0.14)', ring2: 'rgba(249, 149, 107, 0.07)' },
}

/**
 * The success moment: the disc pops in with a small overshoot, the check
 * draws itself once the disc is nearly full size, and a single ripple leaves.
 * Then it holds still: no looping pulse on a finished result.
 */
export default function SuccessMark({ size, tone = 'green', delay = 0, halo = false, confetti = false }: Props) {
  const c = TONES[tone]

  // A light double tap as the check lands.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([12, 50, 18])
    }, delay + 420)
    return () => window.clearTimeout(t)
  }, [delay])

  const box = halo ? size * 2 : size
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: box, height: box }}>
      {confetti && <ConfettiBurst spread={size / 60} delay={delay + 260} />}

      {halo && (
        <>
          <span
            className="absolute rounded-full"
            style={{
              width: size * 2,
              height: size * 2,
              background: c.ring2,
              animation: `markHalo 900ms var(--ease-arrive) ${delay + 160}ms both`,
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: size * 1.5,
              height: size * 1.5,
              background: c.ring,
              animation: `markHalo 900ms var(--ease-arrive) ${delay + 80}ms both`,
            }}
          />
        </>
      )}

      {/* One ripple, once. */}
      <span
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          border: `2px solid ${c.disc}`,
          animation: `markRipple 1100ms var(--ease-arrive) ${delay + 300}ms both`,
        }}
      />

      <span
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: c.disc,
          boxShadow: `0 ${size * 0.12}px ${size * 0.35}px -${size * 0.12}px ${c.disc}`,
          animation: `markPop 620ms var(--ease-pop) ${delay}ms both`,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.5, height: size * 0.5 }} aria-hidden>
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            pathLength={1}
            stroke="#fff"
            strokeWidth={size > 90 ? 2.2 : 2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: 1,
              animation: `checkDraw 420ms var(--ease-travel) ${delay + 260}ms forwards`,
            }}
          />
        </svg>
      </span>
    </div>
  )
}
