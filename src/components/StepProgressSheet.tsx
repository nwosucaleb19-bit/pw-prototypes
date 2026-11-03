import { useState } from 'react'
import { createPortal } from 'react-dom'
import BottomSheet from './BottomSheet'
import IdentityConfirmSheet from './IdentityConfirmSheet'
import { StepList, useOnboardingProgress } from '../onboarding/StepList'
import { STEP_LABELS } from '../onboarding/steps'

type Props = {
  open: boolean
  step: number
  onClose: () => void
  /** The element the sheets cover (the current screen). */
  host: HTMLElement | null
}

/** "Your sign-up progress": opened by tapping the stepper on any onboarding screen. */
export default function StepProgressSheet({ open, step, onClose, host }: Props) {
  const progress = useOnboardingProgress()
  const [reviewing, setReviewing] = useState(false)
  if (!host) return null

  const action = (n: number) => {
    if (!progress) return null
    if (n === 2) return { label: 'Review', onClick: () => { onClose(); setReviewing(true) } }
    if (n === 3) return { label: 'Edit', onClick: () => { onClose(); progress.onEditAddress() } }
    return null
  }

  return createPortal(
    <>
      <BottomSheet open={open} onClose={onClose} padding="px-6 pt-3 pb-6" maxHeight="92%">
        <h2 className="mt-3 font-manrope font-bold text-[20px] leading-[1.3] text-parkway-grey01">Your sign-up progress</h2>
        <p className="mt-4 font-manrope font-medium text-[12px] leading-[1.6] text-[#6B7280]">
          One step at a time. Your completed steps are saved.
        </p>
        <div className="mt-4 -mx-0">
          <StepList currentStep={step} action={action} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full h-[54px] rounded-[8px] bg-white border border-parkway-grey04 font-manrope font-semibold text-[14px] text-parkway-grey01 active:scale-[0.98] transition-transform"
        >
          Back to {STEP_LABELS[step].toLowerCase()}
        </button>
      </BottomSheet>
      {progress && (
        <IdentityConfirmSheet
          open={reviewing}
          label={progress.identity.label}
          record={progress.identity.record}
          onClose={() => setReviewing(false)}
          onConfirm={() => setReviewing(false)}
        />
      )}
    </>,
    host,
  )
}
