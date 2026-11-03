import { useState } from 'react'
import BottomSheet from '../../components/BottomSheet'
import IdentityConfirmSheet from '../../components/IdentityConfirmSheet'
import type { IdentityRecord } from './IdentityVerification'
import ParkwayLogo from '../../assets/figma/logo-parkway-wallet.png'
import { BackButton, STEP_LABELS, TopArc } from '../../onboarding/ui'
import { StepList } from '../../onboarding/StepList'

type Props = {
  /** The step the user stopped on (1–6); earlier steps are done. */
  currentStep: number
  onBack: () => void
  onContinue: () => void
  /** What the identity step found, shown again on Review. */
  identity: { label: string; record: IdentityRecord }
  onEditAddress: () => void
  onStartAgain: () => void
}

export default function ResumeSignup({ currentStep, identity, onBack, onContinue, onEditAddress, onStartAgain }: Props) {
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  const action = (n: number): { label: string; onClick: () => void } | null => {
    if (n === 2) return { label: 'Review', onClick: () => setReviewing(true) }
    if (n === 3) return { label: 'Edit', onClick: onEditAddress }
    return null
  }

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative overflow-hidden">
      <div className="relative shrink-0 bg-white">
        <TopArc className="-top-[54px]" />
        <div className="relative h-[60px] flex items-center justify-center">
          <div className="absolute left-[14px] top-1/2 -translate-y-1/2">
            <BackButton onClick={onBack} />
          </div>
          <img src={ParkwayLogo} alt="Parkway" className="h-[19px] w-auto" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-6 pt-5 pb-6 flex flex-col">
        <div className="text-center rise-in">
          <h1 className="font-display font-medium text-[22px] leading-[1.35] text-[#1F2937]">Glad to have you back! 🤩</h1>
          <p className="mt-2 font-manrope font-medium text-[12px] text-[#6B7280]">Let’s pick up where you left off.</p>
        </div>

        <div className="mt-5">
          <StepList currentStep={currentStep} action={action} outlined stagger />
        </div>

        <div className="flex-1 min-h-6" />

        <button
          type="button"
          onClick={onContinue}
          className="w-full h-[54px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[15px] active:scale-[0.98] transition-transform"
        >
          Continue to {STEP_LABELS[currentStep]}
        </button>
        <button
          type="button"
          onClick={() => setConfirmRestart(true)}
          className="mt-4 w-full h-[54px] rounded-[8px] bg-white border border-parkway-grey04 text-parkway-grey01 font-manrope font-semibold text-[15px] active:scale-[0.98] transition-transform"
        >
          Start Again
        </button>
      </div>

      <IdentityConfirmSheet
        open={reviewing}
        label={identity.label}
        record={identity.record}
        onClose={() => setReviewing(false)}
        onConfirm={() => setReviewing(false)}
      />

      {/* Restarting discards progress, so it asks first. */}
      <BottomSheet open={confirmRestart} onClose={() => setConfirmRestart(false)} showGrabber={false} padding="px-6 pt-7 pb-6">
        <h2 className="font-manrope font-bold text-[20px] leading-[1.3] text-parkway-grey01">Start sign-up again?</h2>
        <p className="mt-5 font-manrope font-medium text-[12px] leading-[1.8] text-[#6B7280]">
          This clears your previous step details and starts again from BVN or NIN. Your phone stays verified.
        </p>
        <button
          type="button"
          onClick={() => { setConfirmRestart(false); onStartAgain() }}
          className="mt-5 w-full h-[54px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform"
        >
          Yes, Clear details and start again
        </button>
        <button
          type="button"
          onClick={() => setConfirmRestart(false)}
          className="mt-4 w-full h-[54px] rounded-[8px] bg-white border border-parkway-grey04 font-manrope font-semibold text-[14px] text-parkway-grey01 active:scale-[0.98] transition-transform"
        >
          Keep my Progress
        </button>
      </BottomSheet>
    </div>
  )
}
