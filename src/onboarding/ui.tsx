import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import StepProgressSheet from '../components/StepProgressSheet'
import { STEP_LABELS, TOTAL_STEPS } from './steps'
import ParkwayLogo from '../assets/figma/logo-parkway-wallet.png'
import IconSpinner from '../assets/figma/icon-spinner.svg'

export { STEP_LABELS, TOTAL_STEPS }

/** The cream arc that sweeps across the top of every onboarding screen. */
export function TopArc({ className = '', color = '#FAF1D2' }: { className?: string; color?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 393 120"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute left-0 top-0 w-full ${className}`}
      style={{ height: 120 }}
    >
      <path d="M-30 -2 C 90 -26, 250 -18, 430 70" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function BackButton({ onClick, tone = 'dark' }: { onClick: () => void; tone?: 'dark' | 'light' }) {
  const c = tone === 'dark' ? '#121212' : '#FFFFFF'
  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={onClick}
      className="size-[28px] rounded-md flex items-center justify-center active:scale-90 transition-transform"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M12.5 4.5 7 10l5.5 5.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

/**
 * Six-segment progress bar. Segments before `step` are full; the current
 * segment fills from the left on mount when `animate` is set (first screen
 * of a new step), so moving between steps reads as progress.
 * Tapping it opens the "Your sign-up progress" sheet.
 */
export function Stepper({ step, animate, tone = 'dark' }: { step: number; animate?: boolean; tone?: 'dark' | 'light' }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const show = () => {
    // The sheet covers the whole screen, not just the header.
    setHost((ref.current?.closest('.screen-layer') as HTMLElement | null) ?? null)
    setOpen(true)
  }
  return (
    <>
    <button
      ref={ref}
      type="button"
      onClick={show}
      aria-haspopup="dialog"
      aria-label={`Step ${step} of ${TOTAL_STEPS}, ${STEP_LABELS[step]}. Show sign-up progress`}
      className="block w-full px-5 text-left rounded-[6px] active:opacity-70 transition-opacity"
    >
      <div className="flex gap-[5px]" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-valuenow={step}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1
          const full = n <= step
          return (
            <div key={i} className="relative h-1 flex-1 rounded-full overflow-hidden" style={{ background: tone === 'dark' ? '#E3E3E8' : 'rgba(255,255,255,0.85)' }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-parkway-tangerine01"
                style={{
                  width: full ? '100%' : '0%',
                  animation: full && n === step && animate ? 'segFill 620ms var(--ease-travel) 180ms both' : undefined,
                }}
              />
            </div>
          )
        })}
      </div>
      <p
        className="mt-3 font-manrope font-medium text-[12px] leading-[1.8]"
        style={{ color: tone === 'dark' ? '#1F2937' : '#FFFFFF' }}
      >
        Step {step} of {TOTAL_STEPS} · {STEP_LABELS[step]}
      </p>
    </button>
    <StepProgressSheet open={open} step={step} onClose={() => setOpen(false)} host={host} />
    </>
  )
}

export function OnboardingHeader({
  step,
  animateStep,
  onBack,
}: {
  step: number
  animateStep?: boolean
  /** Omit on steps the user can't go back from. */
  onBack?: () => void
}) {
  return (
    <div className="relative shrink-0">
      <TopArc className="-top-[54px]" />
      <div className="relative h-[60px] flex items-center justify-center">
        {onBack && (
          <div className="absolute left-[14px] top-1/2 -translate-y-1/2">
            <BackButton onClick={onBack} />
          </div>
        )}
        <img src={ParkwayLogo} alt="Parkway" className="h-[19px] w-auto" />
      </div>
      <div className="pt-1.5">
        <Stepper step={step} animate={animateStep} />
      </div>
    </div>
  )
}

export function ScreenTitle({ children, sub, display }: { children: ReactNode; sub?: ReactNode; display?: boolean }) {
  return (
    <div className="text-center">
      <h1
        className={
          display
            ? 'font-display font-medium text-[22px] leading-[1.3] text-[#1F2937]'
            : 'font-manrope font-bold text-[18px] leading-[1.4] text-[#1F2937]'
        }
      >
        {children}
      </h1>
      {sub && (
        <p className="mt-2.5 font-manrope font-medium text-[12px] leading-[1.4] text-[#6B7280]">{sub}</p>
      )}
    </div>
  )
}

type FieldProps = {
  label: string
  error?: string | null
  children: ReactNode
  shakeKey?: number
}

/** Label + control + inline error. A bump of `shakeKey` shakes the control. */
export function Field({ label, error, children, shakeKey }: FieldProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!shakeKey) return
    shake(ref.current)
  }, [shakeKey])
  return (
    <div>
      <p className="font-manrope font-medium text-[12px] leading-[1.4] text-[#1F2937]">{label}</p>
      <div ref={ref} className="mt-1.5">
        {children}
      </div>
      <div className="grid" aria-live="polite">
        {error && (
          <p key={error} className="mt-1.5 font-manrope font-medium text-[11px] text-parkway-red animate-soft-in">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export function shake(el: HTMLElement | null) {
  el?.animate(
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
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([35, 40, 35])
}

export function boxClass({ focused, error, readOnly }: { focused?: boolean; error?: boolean; readOnly?: boolean }) {
  const border = error ? 'border-parkway-red' : focused ? 'border-parkway-tangerine01' : 'border-parkway-grey04'
  const bg = readOnly ? 'bg-parkway-grey05/60' : 'bg-white'
  return `h-[45px] w-full rounded-[4px] border ${border} ${bg} transition-colors duration-200`
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { error?: boolean; trailing?: ReactNode }

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { error, trailing, readOnly, className = '', onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false)
  return (
    <div className={`${boxClass({ focused: focused && !readOnly, error, readOnly })} flex items-center px-4 gap-2`}>
      <input
        ref={ref}
        readOnly={readOnly}
        onFocus={(e) => { setFocused(true); onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); onBlur?.(e) }}
        className={`flex-1 min-w-0 bg-transparent outline-none font-manrope font-medium text-[13px] text-parkway-grey01 placeholder:text-[#999] placeholder:text-[12px] caret-parkway-tangerine01 ${readOnly ? 'text-parkway-grey09' : ''} ${className}`}
        {...rest}
      />
      {trailing}
    </div>
  )
})

/** Dropdown-style field that opens a picker sheet. */
export function SelectBox({
  value,
  placeholder,
  disabled,
  onClick,
  error,
}: {
  value: string | null
  placeholder: string
  disabled?: boolean
  onClick: () => void
  error?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${boxClass({ error })} flex items-center justify-between px-4 text-left active:scale-[0.995] disabled:active:scale-100 transition-[transform,border-color] ${disabled ? 'opacity-60' : ''}`}
    >
      <span
        key={value ?? 'empty'}
        className={`font-manrope font-medium ${value ? 'text-[13px] text-parkway-grey01 animate-soft-in' : 'text-[12px] text-[#999]'}`}
      >
        {value ?? placeholder}
      </span>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M4 7.5 10 13l6-5.5" stroke="#121212" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
  loadingText,
  height = 48,
  onBlockedPress,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  height?: number
  /** Tapped while disabled: lets the screen point at what is missing. */
  onBlockedPress?: () => void
}) {
  const active = !disabled && !loading
  return (
    <button
      type="button"
      onClick={() => (active ? onClick() : !loading && onBlockedPress?.())}
      aria-disabled={!active}
      aria-busy={loading || undefined}
      className={`relative w-full rounded-[8px] font-manrope font-semibold text-[14px] leading-[1.8] transition-[background-color,color,transform] duration-200 ${
        active ? 'bg-parkway-tangerine01 text-white active:scale-[0.98]' : loading ? 'bg-parkway-tangerine01 text-white' : 'bg-parkway-tangerine06 text-parkway-grey03'
      }`}
      style={{ height }}
    >
      <span className="grid place-items-center">
        <span
          className="col-start-1 row-start-1 transition-[opacity,transform,filter] duration-200"
          style={{ opacity: loading ? 0 : 1, transform: loading ? 'translate3d(0,-4px,0)' : 'none', filter: loading ? 'blur(2px)' : 'none' }}
        >
          {children}
        </span>
        <span
          className="col-start-1 row-start-1 flex items-center gap-2 transition-[opacity,transform,filter] duration-200"
          style={{ opacity: loading ? 1 : 0, transform: loading ? 'none' : 'translate3d(0,4px,0)', filter: loading ? 'none' : 'blur(2px)' }}
          aria-hidden={!loading}
        >
          <img src={IconSpinner} alt="" className="size-4 animate-spin brightness-0 invert" />
          {loadingText}
        </span>
      </span>
    </button>
  )
}

/** Small transient message at the bottom of the screen. */
export function useToast() {
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null)
  useEffect(() => {
    if (!msg) return
    const t = window.setTimeout(() => setMsg(null), 2400)
    return () => window.clearTimeout(t)
  }, [msg])
  const show = (text: string) => setMsg({ text, id: Date.now() })
  const el = msg ? (
    <div key={msg.id} className="pointer-events-none absolute left-5 right-5 bottom-24 z-40 flex justify-center animate-soft-in">
      <p className="rounded-full bg-parkway-grey10/90 px-4 py-2 font-manrope font-medium text-[12px] text-white shadow-lg">
        {msg.text}
      </p>
    </div>
  ) : null
  return { show, el }
}
