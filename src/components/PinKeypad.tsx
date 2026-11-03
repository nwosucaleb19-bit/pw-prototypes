import { useEffect, useRef } from 'react'
import IconBackspace from '../assets/figma/icon-backspace.svg'

export type PinPhase = 'entry' | 'verifying' | 'success' | 'error'

type Props = {
  phase: PinPhase
  pin: string
  onPinChange: (next: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

const STATUS: Record<PinPhase, { text: string; color: string }> = {
  entry: { text: '', color: '#4B5563' },
  verifying: { text: 'Verifying…', color: '#4B5563' },
  success: { text: 'PIN confirmed', color: '#1F9D55' },
  error: { text: 'Incorrect PIN. Try again.', color: '#FC5555' },
}

/**
 * The 4-box PIN display + 3×4 numeric keypad used by every PIN-entry flow.
 * Pure UI — the parent owns the pin string + phase and decides when to verify.
 */
export default function PinKeypad({ phase, pin, onPinChange }: Props) {
  const boxesRef = useRef<HTMLDivElement>(null)

  // Shake on every entry into the error phase, without remounting the boxes
  // (a remount would re-pop every dot).
  useEffect(() => {
    if (phase !== 'error') return
    boxesRef.current?.animate(
      [
        { transform: 'translate3d(0,0,0)' },
        { transform: 'translate3d(-8px,0,0)' },
        { transform: 'translate3d(7px,0,0)' },
        { transform: 'translate3d(-5px,0,0)' },
        { transform: 'translate3d(3px,0,0)' },
        { transform: 'translate3d(0,0,0)' },
      ],
      { duration: 420, easing: 'cubic-bezier(.36,.07,.19,.97)' },
    )
  }, [phase])

  const tap = (d: string) => {
    if (phase !== 'entry') return
    if (pin.length >= 4) return
    onPinChange(pin + d)
  }
  const back = () => {
    if (phase !== 'entry') return
    onPinChange(pin.slice(0, -1))
  }

  const tone =
    phase === 'error' ? '#FC5555' : phase === 'success' ? '#29CC6A' : '#F9956B'

  return (
    <div className="flex-1 flex flex-col items-center pt-8 px-6">
      <h2 className="font-manrope font-bold text-[18px] text-[#1F2937]">
        Enter Your PIN
      </h2>
      <p className="mt-2 font-manrope font-medium text-[12px] text-[#4B5563] text-center max-w-[241px]">
        Please enter your transaction PIN for further verification.
      </p>

      {/* PIN boxes */}
      <div ref={boxesRef} className="mt-6 flex gap-3">
        {[0, 1, 2, 3].map((i) => {
          const filled = i < pin.length
          return (
            <div
              key={i}
              className="size-11 rounded-[8px] border flex items-center justify-center"
              style={{
                borderColor: filled || phase === 'error' ? tone : '#DDDDDD',
                background: phase === 'success' ? 'rgba(41,204,106,0.06)' : 'transparent',
                transition: 'border-color 200ms ease, background-color 240ms ease',
              }}
            >
              {/* Dots stay mounted and scale, so they leave as softly as they arrive. */}
              <span
                className="block size-3"
                style={{
                  animation:
                    phase === 'verifying' ? `pinWave 900ms var(--ease-travel) ${i * 90}ms infinite` : undefined,
                }}
              >
                <span
                  className="block size-3 rounded-full"
                  style={{
                    background: tone,
                    opacity: filled ? 1 : 0,
                    transform: filled ? 'scale(1)' : 'scale(0.3)',
                    transition: filled
                      ? 'opacity 140ms ease, transform 260ms var(--ease-pop), background-color 200ms ease'
                      : 'opacity 160ms ease, transform 200ms var(--ease-arrive), background-color 200ms ease',
                  }}
                />
              </span>
            </div>
          )
        })}
      </div>

      {/* One fixed slot for status text: messages crossfade, the keypad never jumps. */}
      <div className="mt-3 h-[18px] grid place-items-center" aria-live="polite">
        {(['verifying', 'success', 'error'] as const).map((p) => (
          <p
            key={p}
            className="col-start-1 row-start-1 font-manrope font-medium text-[12px] leading-[18px]"
            style={{
              color: STATUS[p].color,
              opacity: phase === p ? 1 : 0,
              transform: phase === p ? 'none' : 'translate3d(0,4px,0)',
              filter: phase === p ? 'blur(0)' : 'blur(2px)',
              transition: 'opacity 220ms var(--ease-arrive), transform 280ms var(--ease-arrive), filter 220ms ease',
            }}
            aria-hidden={phase !== p}
          >
            {STATUS[p].text}
          </p>
        ))}
      </div>

      {/* Keypad */}
      <div className="mt-5 grid grid-cols-3 gap-x-8 gap-y-5">
        {KEYS.map((k, i) => {
          if (k === '') return <div key={i} />
          if (k === 'back') {
            return (
              <button
                key={i}
                type="button"
                onClick={back}
                aria-label="Backspace"
                className="size-[59px] rounded-[8px] flex items-center justify-center active:bg-parkway-grey05/60 active:scale-95 transition-[transform,background-color] duration-150"
              >
                <img src={IconBackspace} alt="" className="size-8" />
              </button>
            )
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => tap(k)}
              className="size-[59px] rounded-[8px] bg-[#F0F0F0] font-manrope font-bold text-[20px] text-parkway-grey01 active:scale-[0.94] active:bg-[#e6e6e6] transition-[transform,background-color] duration-150"
            >
              {k}
            </button>
          )
        })}
      </div>

      <style>{`
        @keyframes pinWave {
          0%, 60%, 100% { transform: translate3d(0,0,0); }
          30%           { transform: translate3d(0,-5px,0); }
        }
      `}</style>
    </div>
  )
}
