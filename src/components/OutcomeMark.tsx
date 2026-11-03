import { useEffect } from 'react'
import ConfettiBurst from './ConfettiBurst'
import IconCheck from '../assets/figma/outcome/check.svg'
import PendingDisc from '../assets/figma/outcome/pending-disc.svg'
import PendingLine from '../assets/figma/outcome/pending-line.svg'
import PendingDot from '../assets/figma/outcome/pending-dot.svg'
import FailedMark from '../assets/figma/outcome/failed-mark.svg'

export type Outcome = 'success' | 'pending' | 'failed'

/** RGB of each outcome's colour, used for the two halo rings and the ripple. */
const TONE: Record<Outcome, string> = {
  success: '41, 204, 106',
  pending: '255, 163, 0',
  failed: '255, 0, 0',
}

const HAPTIC: Record<Outcome, number[]> = {
  success: [12, 50, 18],
  pending: [20],
  failed: [35, 40, 35],
}

/**
 * The transfer outcome mark from the Figma designs: a 76px disc inside two
 * tinted halo rings (114px and 152px). The disc pops in, its glyph arrives
 * once the disc is nearly full size, one ripple leaves, then it holds still.
 */
export default function OutcomeMark({ outcome, delay = 0 }: { outcome: Outcome; delay?: number }) {
  const tone = TONE[outcome]

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC[outcome])
    }, delay + 420)
    return () => window.clearTimeout(t)
  }, [delay, outcome])

  return (
    <div className="relative size-[152px] shrink-0">
      {outcome === 'success' && <ConfettiBurst spread={76 / 60} delay={delay + 260} />}

      <span
        className="absolute inset-0 rounded-full"
        style={{ background: `rgba(${tone}, 0.05)`, animation: `markHalo 900ms var(--ease-arrive) ${delay + 160}ms both` }}
      />
      <span
        className="absolute left-[19px] top-[19px] size-[114px] rounded-full"
        style={{ background: `rgba(${tone}, 0.1)`, animation: `markHalo 900ms var(--ease-arrive) ${delay + 80}ms both` }}
      />
      {/* One ripple, once. */}
      <span
        className="absolute left-[38px] top-[38px] size-[76px] rounded-full"
        style={{ border: `2px solid rgb(${tone})`, animation: `markRipple 1100ms var(--ease-arrive) ${delay + 300}ms both` }}
      />

      <div
        className="absolute left-[38px] top-[38px] size-[76px]"
        style={{ animation: `markPop 620ms var(--ease-pop) ${delay}ms both` }}
      >
        {outcome === 'success' && (
          <div
            className="size-full rounded-full bg-[#29CC6A] flex items-center justify-center"
            style={{ filter: 'drop-shadow(0 9.12px 13.3px #29CC6A)' }}
          >
            <img
              src={IconCheck}
              alt=""
              className="size-[38px]"
              style={{ animation: `iconReveal 420ms var(--ease-travel) ${delay + 260}ms both` }}
            />
          </div>
        )}

        {outcome === 'pending' && (
          <div className="relative size-full" style={{ filter: 'drop-shadow(0 9.12px 13.3px #FFA300)' }}>
            <img src={PendingDisc} alt="" className="absolute inset-0 size-[76px]" />
            <img
              src={PendingLine}
              alt=""
              className="absolute left-[36.23px] top-[21.04px] h-[23.796px] w-[3.529px]"
              style={{ animation: `markPartIn 360ms var(--ease-arrive) ${delay + 260}ms both` }}
            />
            <img
              src={PendingDot}
              alt=""
              className="absolute left-[33.78px] top-[48.2px] size-[7.917px]"
              style={{ animation: `markPartIn 360ms var(--ease-arrive) ${delay + 360}ms both` }}
            />
          </div>
        )}

        {outcome === 'failed' && (
          // The asset carries its own red glow, so it overhangs the 76px disc.
          <img
            src={FailedMark}
            alt=""
            className="absolute left-[-20.08px] top-[-10.96px] size-[116.16px] max-w-none"
          />
        )}
      </div>
    </div>
  )
}
