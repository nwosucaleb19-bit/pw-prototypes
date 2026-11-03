import { createContext, useContext } from 'react'
import type { IdentityRecord } from '../screens/onboarding/IdentityVerification'
import { STEP_LABELS, TOTAL_STEPS } from './steps'

export type StepState = 'done' | 'current' | 'locked'
export type StepAction = { label: string; onClick: () => void }

/**
 * What the progress views need from the app: the identity found in step 2
 * (for Review) and a way to jump back to the address step (for Edit).
 */
export type OnboardingProgress = {
  identity: { label: string; record: IdentityRecord }
  onEditAddress: () => void
}
export const OnboardingProgressContext = createContext<OnboardingProgress | null>(null)
export const useOnboardingProgress = () => useContext(OnboardingProgressContext)

/**
 * The six onboarding steps as done / current / locked rows.
 * `outlined` boxes every row (resume screen); otherwise only the current
 * row is boxed (progress sheet).
 */
export function StepList({
  currentStep,
  action,
  outlined,
  stagger,
}: {
  currentStep: number
  action?: (step: number) => StepAction | null
  outlined?: boolean
  stagger?: boolean
}) {
  const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1)
  return (
    <ol className={outlined ? 'space-y-[9px]' : 'space-y-2'}>
      {steps.map((n, i) => {
        const state: StepState = n < currentStep ? 'done' : n === currentStep ? 'current' : 'locked'
        const act = state === 'done' ? action?.(n) : null
        const sub = state === 'done' ? 'Done' : state === 'current' ? 'Current' : 'Up next · Locked'
        const boxed = outlined || state === 'current'
        return (
          <li
            key={n}
            className={stagger ? 'rise-in' : undefined}
            style={stagger ? { ['--d' as string]: `${80 + i * 55}ms` } : undefined}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <div
              className="rounded-[8px] border h-[60px] pl-4 pr-4 flex items-center gap-3"
              style={{
                borderColor: state === 'current' ? '#F9956B' : boxed ? '#F0F0F0' : 'transparent',
                background: state === 'current' ? '#FFFCFA' : boxed ? '#fff' : 'transparent',
              }}
            >
              <StatusIcon state={state} />
              <div className="flex-1 min-w-0">
                <p className="font-manrope font-bold text-[14px] leading-[19px] text-parkway-grey01">{STEP_LABELS[n]}</p>
                <p className="mt-0.5 font-manrope font-medium text-[12px] leading-4 text-[#6B7280]">{sub}</p>
              </div>
              {act && (
                <button
                  type="button"
                  onClick={act.onClick}
                  className="px-2 py-1 -mr-2 font-manrope font-medium text-[14px] text-parkway-tangerine01 active:scale-95 transition-transform"
                >
                  {act.label}
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function StatusIcon({ state }: { state: StepState }) {
  if (state === 'done') {
    return (
      <span className="size-5 shrink-0 rounded-[5px] bg-parkway-tangerine01 flex items-center justify-center" style={{ boxShadow: 'inset 0 2px 2px rgba(22,38,100,0.12)' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Done">
          <path d="M2.5 6.2 5 8.5l4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (state === 'current') {
    return (
      <span className="relative size-5 shrink-0 flex items-center justify-center" aria-label="Current">
        <span className="absolute inset-0 rounded-full border-[1.6px] border-parkway-tangerine01" />
        <span className="absolute inset-0 rounded-full bg-parkway-tangerine01/25 animate-[stepPulse_1.8s_var(--ease-arrive)_infinite]" />
        <span className="size-1.5 rounded-full bg-parkway-tangerine01" />
        <style>{`@keyframes stepPulse { 0% { transform: scale(1); opacity: .6 } 100% { transform: scale(1.9); opacity: 0 } }`}</style>
      </span>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-label="Locked" className="shrink-0">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="#4B5563" strokeWidth="1.7" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#4B5563" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.3" fill="#4B5563" />
    </svg>
  )
}
