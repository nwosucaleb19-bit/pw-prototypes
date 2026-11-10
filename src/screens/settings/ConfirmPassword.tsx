import { useEffect, useRef, useState } from 'react'
import BottomSheet from '../../components/BottomSheet'
import Collapse from '../../components/motion/Collapse'
import { FlowHeader } from '../../components/settings/SettingsUI'
import { PrimaryButton, ScreenTitle, shake, useToast } from '../../onboarding/ui'
import IconEyeHidden from '../../assets/figma/login/eye-hidden.svg'

type Props = {
  /** The account's login password (a demo value in the prototype). */
  expected: string
  onBack: () => void
  onVerified: () => void
  /** Out of tries: the session ends and the user logs in again. */
  onLockedOut: () => void
}

/** Wrong passwords allowed before the user is logged out. */
const TRIES = 3
const CHECK_MS = 700

/**
 * Reset Passcode, step 2 of 2: the login password, so a code on an unlocked
 * phone isn't enough on its own to take over the app.
 */
export default function ConfirmPassword({ expected, onBack, onVerified, onLockedOut }: Props) {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [checking, setChecking] = useState(false)
  const [misses, setMisses] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [shownError, setShownError] = useState('')
  const fieldRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const lockedOut = misses >= TRIES

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = () => {
    setChecking(true)
    window.setTimeout(() => {
      setChecking(false)
      if (password === expected) return onVerified()
      const n = misses + 1
      setMisses(n)
      shake(fieldRef.current)
      const left = TRIES - n
      if (left <= 0) return
      const msg = `Incorrect password. ${left} ${left === 1 ? 'attempt' : 'attempts'} left`
      setError(msg)
      setShownError(msg)
      setPassword('')
      inputRef.current?.focus()
    }, CHECK_MS)
  }

  return (
    <div className="relative h-full w-full bg-parkway-bg flex flex-col overflow-hidden">
      <FlowHeader title="Reset Passcode" onBack={onBack} step={2} steps={2} />

      <form
        className="flex-1 flex flex-col px-5 pt-8"
        onSubmit={(e) => {
          e.preventDefault()
          if (password && !checking) submit()
        }}
      >
        <div className="rise-in">
          <ScreenTitle sub="To keep your account safe, confirm the password you use to log in.">Enter your password</ScreenTitle>
        </div>

        <div className="mt-8 flex flex-col gap-1.5 rise-in" style={{ ['--d' as string]: '60ms' }}>
          <label htmlFor="reset-password" className="font-manrope font-medium text-[12px] leading-[1.415] text-parkway-grey01">
            Password
          </label>
          <div ref={fieldRef} className="relative">
            <input
              ref={inputRef}
              id="reset-password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={checking || lockedOut}
              className="w-full rounded-[4px] border bg-white py-[14px] pl-4 pr-12 font-manrope font-normal text-[12px] leading-[1.415] text-parkway-grey01 placeholder:text-parkway-grey02 outline-none transition-colors"
              style={{ borderColor: error ? '#FC5555' : undefined }}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? 'Hide password' : 'Show password'}
              aria-pressed={show}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center rounded-full active:bg-black/5"
            >
              <img src={IconEyeHidden} alt="" className="size-5 transition-opacity duration-200" style={{ opacity: show ? 0.4 : 1 }} />
            </button>
          </div>
          <Collapse open={!!error} duration={260}>
            <p className="pt-0.5 font-manrope font-medium text-[11px] text-parkway-red" aria-live="assertive">
              {shownError}
            </p>
          </Collapse>
          <div className="pt-2.5 flex justify-end">
            <button
              type="button"
              onClick={() => toast.show('Password reset isn’t part of this prototype yet')}
              className="font-manrope font-bold text-[12px] leading-[1.2] tracking-[-0.5px] text-parkway-tangerine01 active:opacity-60"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="mt-auto pb-6 rise-in" style={{ ['--d' as string]: '120ms' }}>
          <PrimaryButton
            onClick={submit}
            disabled={!password || lockedOut}
            loading={checking}
            loadingText="Checking…"
            onBlockedPress={() => shake(fieldRef.current)}
          >
            Continue
          </PrimaryButton>
        </div>
      </form>

      {toast.el}

      <BottomSheet open={lockedOut} onClose={() => {}} dismissOnBackdrop={false} showGrabber={false} padding="px-6 pt-7 pb-8">
        <h2 className="font-manrope font-bold text-[20px] leading-[1.3] text-parkway-grey01">Too many attempts</h2>
        <p className="mt-2.5 font-manrope font-medium text-[12px] leading-[1.8] text-[#6B7280]">
          For your security, we’ve logged you out. Log in with your phone number or email and password to continue.
        </p>
        <div className="mt-6">
          <PrimaryButton onClick={onLockedOut}>Log In</PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  )
}
