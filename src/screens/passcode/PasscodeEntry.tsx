import { useEffect, useRef, useState } from 'react'
import BottomSheet from '../../components/BottomSheet'
import Collapse from '../../components/motion/Collapse'
import { PASSCODE_LENGTH as LENGTH, PasscodeDots, PasscodeKeypad, buzzError, shake } from '../../components/passcode/PasscodePad'
import IconCheck from '../../assets/figma/passcode/check.svg'
import BackArrow from '../../assets/figma/back-arrow.svg'

type Common = {
  title?: string
  subtitle?: string
  /** Shows the back button. */
  onBack?: () => void
}

type Props = Common &
  (
    | {
        mode: 'new'
        onComplete: (code: string) => void
        /** The passcode being replaced: the new one can't match it. */
        avoid?: string
      }
    | {
        mode: 'confirm'
        expected: string
        onDone: () => void
        doneTitle?: string
        doneBody?: string
        doneLabel?: string
      }
    | {
        /** Change Passcode, step 1: prove you know the current one. */
        mode: 'current'
        expected: string
        onVerified: () => void
        onForgot: () => void
      }
  )

/** Wrong tries allowed on the current passcode before the keypad locks. */
const CURRENT_TRIES = 5

/**
 * Why a new passcode is too easy to guess, or null when it's fine.
 * From the Figma error states 36385:24621 and 36395:25327.
 */
export function weakPasscodeReason(code: string): string | null {
  if (/^(\d)\1+$/.test(code)) return 'Avoid repeating the same digit'
  const steps = code.split('').map(Number)
  const diffs = steps.slice(1).map((n, i) => n - steps[i])
  if (diffs.every((d) => d === 1) || diffs.every((d) => d === -1)) return 'Avoid number sequences like 123456'
  return null
}

const DEFAULT_TITLE = { new: 'Enter New Passcode', confirm: 'Confirm Passcode', current: 'Enter Current Passcode' }
const DEFAULT_SUBTITLE = {
  new: 'Choose 6 digits to open the app',
  confirm: 'Choose 6 digits to open the app',
  current: 'Enter the 6 digits you use to open the app',
}

/**
 * Enter New Passcode (Figma 36385:24453) and Confirm Passcode (36385:24515),
 * the weak-passcode errors (36385:24621, 36395:25327) and the "created"
 * sheet (36385:24670) once the two match. The same screen asks for the
 * current passcode at the start of Change Passcode.
 */
export default function PasscodeEntry(props: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  // The last message stays in the slot while it collapses away.
  const [shownError, setShownError] = useState('')
  const [created, setCreated] = useState(false)
  const [misses, setMisses] = useState(0)
  const dotsRef = useRef<HTMLDivElement>(null)
  const { mode } = props
  const locked = mode === 'current' && misses >= CURRENT_TRIES

  const fail = (message: string) => {
    setError(message)
    setShownError(message)
    buzzError()
    shake(dotsRef.current)
    // Let the red fill read for a beat after the shake, then empty the dots.
    window.setTimeout(() => setCode(''), 520)
  }

  // Act once the sixth digit lands, after its dot has had a moment to fill.
  useEffect(() => {
    if (code.length !== LENGTH) return
    const t = window.setTimeout(() => {
      if (props.mode === 'new') {
        const reason = props.avoid && code === props.avoid ? 'New passcode can’t be your current one' : weakPasscodeReason(code)
        if (reason) fail(reason)
        else props.onComplete(code)
        return
      }
      if (props.mode === 'current') {
        if (code === props.expected) return props.onVerified()
        const n = misses + 1
        setMisses(n)
        const left = CURRENT_TRIES - n
        fail(
          left <= 0
            ? 'Too many tries. Reset your passcode instead.'
            : `Incorrect passcode. ${left} ${left === 1 ? 'attempt' : 'attempts'} left`,
        )
        return
      }
      if (code === props.expected) setCreated(true)
      else fail('Passcodes don’t match. Try again.')
    }, 220)
    return () => window.clearTimeout(t)
    // Props are stable for the life of this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const press = (d: string) => {
    if (code.length >= LENGTH || created || locked) return
    // Typing again clears the error; the rings go back to orange.
    if (error) setError(null)
    setCode((c) => c + d)
  }
  const back = () => setCode((c) => c.slice(0, -1))

  // The delete key appears once a digit is in, and stays until the field is empty.
  const showBackspace = code.length > 0 && !created && !locked

  return (
    <div className="relative h-full w-full bg-parkway-grey06 flex flex-col items-center">
      {props.onBack && (
        <button
          type="button"
          aria-label="Go back"
          onClick={props.onBack}
          disabled={created}
          className="absolute left-[10px] top-4 size-11 rounded-full flex items-center justify-center active:bg-black/5 active:scale-95 transition-[transform,background-color]"
        >
          <img src={BackArrow} alt="" className="size-5 rotate-90" />
        </button>
      )}

      {/* Title */}
      <div className="mt-[74px] flex flex-col items-center gap-1.5 text-center rise-in">
        <h1 className="font-display font-medium text-[22px] leading-normal text-parkway-grey01 whitespace-nowrap">
          {props.title ?? DEFAULT_TITLE[mode]}
        </h1>
        <p className="font-manrope font-normal text-[14px] leading-normal tracking-[-0.14px] text-parkway-grey09">
          {props.subtitle ?? DEFAULT_SUBTITLE[mode]}
        </p>
      </div>

      {/* Dots, and the error under them */}
      <div className="mt-8 py-8 flex flex-col items-center">
        <PasscodeDots count={code.length} error={!!error} dotsRef={dotsRef} />
        {/* The message opens its own room, so the keypad eases down instead of jumping. */}
        <Collapse open={!!error} duration={280}>
          <p
            className="pt-6 font-manrope font-semibold text-[11px] leading-normal tracking-[-0.11px] text-[#D94141] text-center whitespace-nowrap"
            aria-live="assertive"
          >
            {shownError}
          </p>
        </Collapse>
        {props.mode === 'current' && (
          <button
            type="button"
            onClick={props.onForgot}
            className="mt-6 font-manrope font-medium text-[12px] leading-normal tracking-[-0.24px] underline decoration-[5%] underline-offset-2 active:opacity-60 transition-colors duration-300"
            // Once the tries run out, the way forward is the reset.
            style={{ color: locked ? '#F9956B' : '#444444', fontWeight: locked ? 700 : 500 }}
          >
            Forgot passcode?
          </button>
        )}
      </div>

      {/* Keypad */}
      <div
        className="mt-4 rise-in transition-opacity duration-300"
        style={{ ['--d' as string]: '80ms', opacity: locked ? 0.4 : 1 }}
      >
        <PasscodeKeypad onDigit={press} onBackspace={back} showBackspace={showBackspace} disabled={locked} />
      </div>

      {props.mode === 'confirm' && (
        <BottomSheet
          open={created}
          onClose={() => {}}
          dismissOnBackdrop={false}
          showGrabber={false}
          padding="px-5 pt-5 pb-10"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1.5 pb-4">
              <CreatedMark />
              <p className="font-manrope font-bold text-[18px] leading-normal tracking-[-0.54px] text-[#1F2937] text-center">
                {props.doneTitle ?? 'Your Passcode has been created!'}
              </p>
              {props.doneBody && (
                <p className="max-w-[300px] font-manrope font-medium text-[12px] leading-[1.6] text-[#6B7280] text-center">
                  {props.doneBody}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={props.onDone}
              className="w-full h-12 rounded-[8px] bg-parkway-tangerine01 font-manrope font-semibold text-[14px] leading-[1.8] text-white active:scale-[0.98] transition-transform"
            >
              {props.doneLabel ?? 'Go to Dashboard'}
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}


/** The small green check from the "created" sheet: 40px disc in two halo rings. */
function CreatedMark() {
  return (
    <div className="relative size-20 shrink-0">
      <span
        className="absolute inset-0 rounded-full bg-[rgba(41,204,106,0.05)]"
        style={{ animation: 'markHalo 800ms var(--ease-arrive) 260ms both' }}
      />
      <span
        className="absolute left-[10px] top-[10px] size-[60px] rounded-full bg-[rgba(41,204,106,0.1)]"
        style={{ animation: 'markHalo 800ms var(--ease-arrive) 200ms both' }}
      />
      <span
        className="absolute left-5 top-5 size-10 rounded-full bg-[#29CC6A] flex items-center justify-center"
        style={{ filter: 'drop-shadow(0 4.8px 7px #29CC6A)', animation: 'markPop 560ms var(--ease-pop) 140ms both' }}
      >
        <img
          src={IconCheck}
          alt=""
          className="size-5"
          style={{ animation: 'iconReveal 380ms var(--ease-travel) 380ms both' }}
        />
      </span>
    </div>
  )
}
