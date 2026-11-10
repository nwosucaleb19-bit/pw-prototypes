import { useEffect, useRef, useState, type ReactNode } from 'react'
import IconBackspace from '../../assets/figma/icon-backspace.svg'
import BottomSheet from '../../components/BottomSheet'
import { useOnlineGuard } from '../../onboarding/network'
import { OnboardingHeader, ScreenTitle, useToast } from '../../onboarding/ui'

type Props = {
  phone: string
  onBack: () => void
  onVerified: () => void
  /** The verified number already has a wallet: no sign-up is in progress. */
  onExistingAccount?: () => void
  /** Reuse outside sign-up (e.g. passcode reset): replaces the logo + stepper header. */
  header?: ReactNode
  title?: string
  sub?: ReactNode
  verifiedText?: string
  /** Where a resent code goes, if not just the phone. */
  sentTo?: string
}

/** Prototype rule: numbers ending 0000 already have a Parkway Wallet account. */
export const isRegisteredNumber = (localNumber: string) => localNumber.endsWith('0000')

/** 08030000000 → +234 803 000 0000 */
function international(localNumber: string) {
  const n = localNumber.replace(/^0/, '')
  return `+234 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`
}

/** Prototype rule: any code verifies except 0000, which is rejected. */
export const OTP_REJECT = '0000'
/** 2:00 by default; `?otpTimer=5` shortens it for demos. */
const RESEND_AFTER_S = (() => {
  try {
    const v = Number(new URLSearchParams(window.location.search).get('otpTimer'))
    return v > 0 ? v : 120
  } catch {
    return 120
  }
})()
const VERIFY_DELAY_MS = 800
const CONFIRM_HOLD_MS = 450

type Phase = 'entry' | 'verifying' | 'success' | 'error'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

export default function VerifyOtp({ phone, onBack, onVerified, onExistingAccount, header, title, sub, verifiedText, sentTo }: Props) {
  const [code, setCode] = useState('')
  const [phase, setPhase] = useState<Phase>('entry')
  const [left, setLeft] = useState(RESEND_AFTER_S - 1)
  const [existing, setExisting] = useState(false)
  const [calling, setCalling] = useState(false)
  const net = useOnlineGuard()
  // Bumped by the offline sheet's Retry to run the check again.
  const [attempt, setAttempt] = useState(0)
  const boxesRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  // Countdown to resend.
  useEffect(() => {
    if (left <= 0) return
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left])

  // Verify once four digits are in.
  useEffect(() => {
    if (code.length !== 4) return
    if (!net.online) { net.guard(() => setAttempt((a) => a + 1)); return }
    setPhase('verifying')
    let next: number | undefined
    const t = window.setTimeout(() => {
      if (code !== OTP_REJECT) {
        setPhase('success')
        // The number is verified; only then is it checked against existing wallets.
        next = window.setTimeout(() => {
          if (isRegisteredNumber(phone)) { setExisting(true); onExistingAccount?.() }
          else onVerified()
        }, CONFIRM_HOLD_MS)
      } else {
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
        next = window.setTimeout(() => {
          setCode('')
          setPhase('entry')
        }, 900)
      }
    }, VERIFY_DELAY_MS)
    return () => {
      window.clearTimeout(t)
      if (next) window.clearTimeout(next)
    }
    // onVerified is stable from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, attempt])

  // Physical keyboard support on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) tap(e.key)
      else if (e.key === 'Backspace') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const tap = (d: string) => {
    if (phase !== 'entry' || code.length >= 4) return
    setCode(code + d)
  }
  const back = () => {
    if (phase !== 'entry') return
    setCode(code.slice(0, -1))
  }

  const resend = () => {
    if (left > 0) return
    setLeft(RESEND_AFTER_S - 1)
    setCode('')
    setPhase('entry')
    setCalling(false)
    toast.show(`A new code was sent to ${sentTo ?? phone}`)
  }

  const voiceCall = () => {
    if (left > 0) return
    setLeft(RESEND_AFTER_S - 1)
    setCode('')
    setPhase('entry')
    setCalling(true)
  }

  const closeExisting = () => {
    setExisting(false)
    setCode('')
    setPhase('entry')
  }

  const tone = phase === 'error' ? '#FC5555' : phase === 'success' ? '#29CC6A' : '#F9956B'
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const canResend = left <= 0

  const status =
    phase === 'verifying' ? { text: 'Verifying…', color: '#4B5563' }
    : phase === 'success' ? { text: verifiedText ?? 'Phone number verified', color: '#1F9D55' }
    : phase === 'error' ? { text: 'Incorrect code. Try again.', color: '#FC5555' }
    : calling && phase === 'entry' ? { text: `Calling +234 ${phone} with your code…`, color: '#4B5563' }
    : null

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative overflow-hidden">
      {header ?? <OnboardingHeader step={1} onBack={onBack} />}

      <div className="flex-1 flex flex-col items-center px-5 pt-8">
        <ScreenTitle
          sub={
            sub ?? (
              <>
                Please enter the verification code sent to
                <br />
                +234 {phone}.
              </>
            )
          }
        >
          {title ?? 'Enter 4 digits code'}
        </ScreenTitle>

        <div ref={boxesRef} className="mt-[23px] flex gap-[13px]">
          {[0, 1, 2, 3].map((i) => {
            const ch = code[i]
            const isCursor = phase === 'entry' && i === code.length
            return (
              <div
                key={i}
                className="relative size-11 rounded-[8px] border bg-white flex items-center justify-center"
                style={{
                  borderColor: ch || phase === 'error' ? tone : isCursor ? '#F9956B80' : '#DDDDDD',
                  background: phase === 'success' ? 'rgba(41,204,106,0.06)' : '#fff',
                  transition: 'border-color 200ms ease, background-color 240ms ease',
                }}
              >
                <span
                  className="font-manrope font-bold text-[18px] tabular-nums"
                  style={{
                    color: phase === 'error' ? tone : '#121212',
                    opacity: ch ? 1 : 0,
                    transform: ch ? 'scale(1)' : 'scale(0.5)',
                    filter: ch ? 'blur(0)' : 'blur(3px)',
                    transition: 'opacity 160ms ease, transform 260ms var(--ease-pop), filter 200ms ease, color 200ms ease',
                    animation: phase === 'verifying' ? `otpWave 900ms var(--ease-travel) ${i * 90}ms infinite` : undefined,
                  }}
                >
                  {ch ?? ''}
                </span>
                {isCursor && <span className="absolute h-5 w-[1.5px] rounded bg-parkway-tangerine01 animate-[otpCaret_1s_steps(1)_infinite]" />}
              </div>
            )
          })}
        </div>

        {/* Timer / status share a slot so nothing below jumps. */}
        <div className="mt-[23px] h-4 grid place-items-center" aria-live="polite">
          <p
            className="col-start-1 row-start-1 font-manrope font-medium text-[12px] text-[#1F2937] tabular-nums transition-opacity duration-200"
            style={{ opacity: status ? 0 : 1 }}
          >
            ({mm}:{ss}s)
          </p>
          {status && (
            <p key={status.text} className="col-start-1 row-start-1 font-manrope font-medium text-[12px] animate-soft-in" style={{ color: status.color }}>
              {status.text}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={resend}
          disabled={!canResend}
          className="mt-[7px] h-[25px] font-manrope font-semibold text-[14px] transition-colors duration-300 enabled:active:scale-95"
          style={{ color: canResend ? '#F9956B' : '#999999' }}
        >
          Resend OTP
        </button>
        {/* When the timer runs out, a voice call is offered as a fallback. */}
        <div className="h-[25px] mt-1.5 grid place-items-center">
          {canResend && (
            <button
              type="button"
              onClick={voiceCall}
              className="font-manrope font-bold text-[14px] text-parkway-grey01 active:scale-95 transition-transform animate-soft-in"
            >
              Get a voice call
            </button>
          )}
        </div>

        {/* Keypad */}
        <div className="mt-6 grid grid-cols-3 gap-x-8 gap-y-8">
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
      {toast.el}
      {net.sheet}

      <BottomSheet open={existing} onClose={closeExisting} showGrabber={false} padding="px-6 pt-7 pb-6">
        <h2 className="font-manrope font-bold text-[20px] leading-[1.3] text-parkway-grey01">
          You already have a Parkway Wallet account
        </h2>
        <p className="mt-5 font-manrope font-bold text-[14px] text-parkway-grey01 tabular-nums">
          {international(phone)} · Verified
        </p>
        <p className="mt-1.5 font-manrope font-medium text-[12px] leading-[1.8] text-[#6B7280]">
          Your phone number has been verified. There’s no need to create another account. We haven’t started a new sign-up.
        </p>
        <button
          type="button"
          onClick={() => toast.show('Login isn’t part of this prototype yet')}
          className="mt-5 w-full h-[54px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[15px] active:scale-[0.98] transition-transform"
        >
          Log in to Parkway
        </button>
        <button
          type="button"
          onClick={() => toast.show('Help isn’t part of this prototype yet')}
          className="mt-4 w-full font-manrope font-bold text-[14px] text-parkway-tangerine01 active:opacity-60 transition-opacity"
        >
          Need help logging in?
        </button>
      </BottomSheet>

      <style>{`
        @keyframes otpWave { 0%, 60%, 100% { transform: translate3d(0,0,0); } 30% { transform: translate3d(0,-4px,0); } }
        @keyframes otpCaret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  )
}
