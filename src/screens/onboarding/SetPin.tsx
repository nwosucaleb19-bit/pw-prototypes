import { useEffect, useRef, useState } from 'react'
import IconBackspace from '../../assets/figma/icon-backspace.svg'
import { OnboardingHeader, ScreenTitle } from '../../onboarding/ui'
import { useOnlineGuard } from '../../onboarding/network'

type Props = {
  /** 'set' picks a PIN; 'confirm' re-enters it. */
  mode: 'set' | 'confirm'
  /** The PIN chosen on the set screen (confirm mode only). */
  expected?: string
  onBack?: () => void
  onDone: (pin: string) => void
}

/** Easy-to-guess PINs are refused on the set screen. */
const WEAK = new Set(['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321', '1212', '0123'])

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']
type Phase = 'entry' | 'checking' | 'success' | 'error'

export default function SetPin({ mode, expected, onBack, onDone }: Props) {
  const [pin, setPin] = useState('')
  const [phase, setPhase] = useState<Phase>('entry')
  const [error, setError] = useState('')
  const boxesRef = useRef<HTMLDivElement>(null)
  const net = useOnlineGuard()
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (pin.length !== 4) return
    // Confirming creates the account, so it needs a connection.
    if (mode === 'confirm' && !net.online) { net.guard(() => setAttempt((a) => a + 1)); return }
    setPhase('checking')
    let next: number | undefined
    const t = window.setTimeout(() => {
      const problem =
        mode === 'set' && WEAK.has(pin) ? 'That PIN is easy to guess. Try another.'
        : mode === 'confirm' && pin !== expected ? 'PINs don’t match. Try again.'
        : ''
      if (!problem) {
        setPhase('success')
        next = window.setTimeout(() => onDone(pin), mode === 'confirm' ? 650 : 320)
      } else {
        setError(problem)
        setPhase('error')
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
        if ('vibrate' in navigator) navigator.vibrate([35, 40, 35])
        next = window.setTimeout(() => { setPin(''); setPhase('entry') }, 1100)
      }
    }, 380)
    return () => { window.clearTimeout(t); if (next) window.clearTimeout(next) }
    // onDone is stable from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, attempt])

  const tap = (d: string) => {
    if (phase !== 'entry' || pin.length >= 4) return
    if (pin.length === 0) setError('')
    setPin(pin + d)
  }
  const back = () => { if (phase === 'entry') setPin(pin.slice(0, -1)) }

  // Physical keyboard support on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) tap(e.key)
      else if (e.key === 'Backspace') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const tone = phase === 'error' ? '#FC5555' : phase === 'success' ? '#29CC6A' : '#F9956B'
  const status =
    phase === 'error' ? { text: error, color: '#FC5555' }
    : phase === 'success' && mode === 'confirm' ? { text: 'PIN set successfully', color: '#1F9D55' }
    : null

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative overflow-hidden">
      <OnboardingHeader step={6} animateStep={mode === 'set'} onBack={onBack} />

      <div className="flex-1 flex flex-col items-center px-5 pt-[34px]">
        <ScreenTitle
          sub={
            <>
              This PIN will be used to authorize
              <br />
              transactions.
            </>
          }
        >
          {mode === 'set' ? 'Set Your PIN' : 'Confirm Your PIN'}
        </ScreenTitle>

        <div ref={boxesRef} className="mt-[30px] flex gap-[13px]">
          {[0, 1, 2, 3].map((i) => {
            const filled = i < pin.length
            return (
              <div
                key={i}
                className="size-11 rounded-[8px] border bg-white flex items-center justify-center"
                style={{
                  borderColor: filled || phase === 'error' ? tone : '#DDDDDD',
                  background: phase === 'success' ? 'rgba(41,204,106,0.06)' : '#fff',
                  transition: 'border-color 200ms ease, background-color 240ms ease',
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
              </div>
            )
          })}
        </div>

        <div className="mt-4 h-[18px] grid place-items-center" aria-live="polite">
          {status && (
            <p key={status.text} className="col-start-1 row-start-1 font-manrope font-medium text-[12px] animate-soft-in" style={{ color: status.color }}>
              {status.text}
            </p>
          )}
        </div>

        <div className="mt-[42px] grid grid-cols-3 gap-x-8 gap-y-8">
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
      </div>
      {net.sheet}
    </div>
  )
}
