import { useEffect, useState } from 'react'
import HeaderBar from '../components/HeaderBar'
import PinKeypad, { type PinPhase } from '../components/PinKeypad'
import type { Outcome } from '../components/OutcomeMark'

/**
 * Prototype PINs. Each accepted PIN drives a different transfer outcome so
 * every result screen can be reached: 0000 succeeds, 1111 stays pending,
 * 2222 fails. Anything else is an incorrect PIN.
 */
export const PIN_OUTCOMES: Record<string, Outcome> = {
  '0000': 'success',
  '1111': 'pending',
  '2222': 'failed',
}

const VERIFY_DELAY_MS = 700
/** How long the confirmed (green) PIN holds before the result page arrives. */
const CONFIRM_HOLD_MS = 420

type Props = {
  title: string
  onBack: () => void
  /** Called once the PIN is verified; the parent presents the result page. */
  onSuccess: (outcome: Outcome) => void
}

export default function PinEntry({ title, onBack, onSuccess }: Props) {
  const [pin, setPin] = useState('')
  const [phase, setPhase] = useState<PinPhase>('entry')

  useEffect(() => {
    if (pin.length !== 4) return
    setPhase('verifying')
    let reset: number | undefined
    const t = window.setTimeout(() => {
      const outcome = PIN_OUTCOMES[pin]
      if (outcome) {
        setPhase('success')
        reset = window.setTimeout(() => onSuccess(outcome), CONFIRM_HOLD_MS)
      } else {
        setPhase('error')
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([35, 40, 35])
        }
        reset = window.setTimeout(() => {
          setPin('')
          setPhase('entry')
        }, 650)
      }
    }, VERIFY_DELAY_MS)
    return () => {
      window.clearTimeout(t)
      if (reset) window.clearTimeout(reset)
    }
    // onSuccess is stable from the parent; re-running on it would restart verification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  return (
    <div className="h-full w-full bg-parkway-grey06 flex flex-col relative">
      <HeaderBar title={title} onBack={onBack} />
      <PinKeypad phase={phase} pin={pin} onPinChange={setPin} />
    </div>
  )
}
