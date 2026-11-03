import { useEffect, useRef, useState } from 'react'
import IconQuestion from '../../assets/figma/icon-question-mark.svg'
import StatusSheet from '../../components/StatusSheet'
import { useOnlineGuard } from '../../onboarding/network'
import { Field, OnboardingHeader, PrimaryButton, ScreenTitle, TextInput, shake, useToast } from '../../onboarding/ui'
import type { IdMethod } from './IdentityChoice'

/** Details returned by the BVN/NIN lookup, already masked for display. */
export type IdentityRecord = { name: string; maskedPhone: string; maskedEmail: string }

type Props = {
  method: IdMethod
  onBack: () => void
  onVerified: (r: IdentityRecord) => void
}

const META: Record<IdMethod, { label: string; ussd: string }> = {
  bvn: { label: 'BVN', ussd: '*565*0#' },
  nin: { label: 'NIN', ussd: '*346*3#' },
}

/** Prototype rule: numbers starting 000 have no record. */
export const ID_NOT_FOUND_PREFIX = '000'
const LOOKUP_MS = 1500

export const DEMO_IDENTITY: IdentityRecord = {
  name: 'Olusegun Ka**de A*****',
  maskedPhone: '0803****2213',
  maskedEmail: 'Olu****u@gmail.com',
}

export default function IdentityVerification({ method, onBack, onVerified }: Props) {
  const { label, ussd } = META[method]
  const [id, setId] = useState('')
  const [referral, setReferral] = useState('')
  const [agreed, setAgreed] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [termsNudge, setTermsNudge] = useState(false)
  const fieldRef = useRef<HTMLDivElement>(null)
  const termsRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | null>(null)
  const toast = useToast()
  const net = useOnlineGuard()
  const [failed, setFailed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  const complete = id.length === 11
  const ready = complete && agreed && !notFound

  const confirm = () => net.guard(() => {
    setVerifying(true)
    timer.current = window.setTimeout(() => {
      setVerifying(false)
      if (id.startsWith(ID_NOT_FOUND_PREFIX)) {
        setNotFound(true)
        setFailed(true)
      } else {
        onVerified(DEMO_IDENTITY)
      }
    }, LOOKUP_MS)
  })

  // Retry: clear the number so it can be typed again.
  const retryAfterFailure = () => {
    setFailed(false)
    setNotFound(false)
    setId('')
    window.setTimeout(() => inputRef.current?.focus(), 340)
  }

  const blocked = () => {
    if (!complete || notFound) { shake(fieldRef.current); return }
    if (!agreed) { setTermsNudge(true); shake(termsRef.current) }
  }

  const copyUssd = async () => {
    try { await navigator.clipboard.writeText(ussd) } catch { /* not allowed: still show the hint */ }
    toast.show(`${ussd} copied. Dial it to get your ${label}.`)
  }

  // The failure sheet explains what went wrong; the field just stays outlined.
  const error = null

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative overflow-hidden">
      <OnboardingHeader step={2} onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 pt-4 flex flex-col">
        <ScreenTitle display sub={`Kindly input your ${label} to verify your identity`}>
          {label} Verification
        </ScreenTitle>

        <div className="mt-[30px] space-y-4">
          <div ref={fieldRef}>
            <Field label={label} error={error}>
              <TextInput
                ref={inputRef}
                inputMode="numeric"
                value={id}
                disabled={verifying}
                onChange={(e) => { setId(e.target.value.replace(/\D/g, '').slice(0, 11)); setNotFound(false) }}
                onKeyDown={(e) => e.key === 'Enter' && (ready ? confirm() : blocked())}
                placeholder={`Enter your ${label}`}
                error={notFound}
                className="tabular-nums tracking-[0.04em] placeholder:tracking-normal"
                trailing={
                  <span className="font-manrope font-medium text-[11px] text-parkway-grey03 tabular-nums">{id.length}/11</span>
                }
              />
            </Field>
          </div>

          <Field label="Referral Code (Optional)">
            <TextInput
              value={referral}
              disabled={verifying}
              onChange={(e) => setReferral(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              placeholder="Enter code"
              className="tracking-[0.04em] placeholder:tracking-normal"
            />
          </Field>
        </div>

        <div className="mt-[54px] flex flex-col items-center">
          <span className="size-7 rounded-full bg-parkway-tangerine05 flex items-center justify-center">
            <img src={IconQuestion} alt="" className="size-[17px]" />
          </span>
          <p className="mt-2 font-manrope font-medium text-[14px] text-[#1F2937]">Don’t know your {label}?</p>
          <button
            type="button"
            onClick={copyUssd}
            className="mt-2 font-manrope font-bold text-[14px] text-parkway-tangerine01 active:scale-95 transition-transform"
          >
            Dial {ussd}
          </button>
        </div>

        <div className="flex-1 min-h-6" />

        <div ref={termsRef} className="flex items-start gap-2">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            onClick={() => { setAgreed(!agreed); setTermsNudge(false) }}
            className="mt-[1px] size-5 shrink-0 rounded-[5px] border flex items-center justify-center transition-colors duration-200 active:scale-90"
            style={{
              background: agreed ? '#F9956B' : '#fff',
              borderColor: agreed ? '#F9956B' : termsNudge ? '#FC5555' : '#C6C6C6',
              boxShadow: agreed ? 'inset 0 2px 2px rgba(22,38,100,0.12)' : 'none',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2.5 6.2 5 8.5l4.5-5"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: 12, strokeDashoffset: agreed ? 0 : 12, transition: 'stroke-dashoffset 260ms var(--ease-arrive)' }}
              />
            </svg>
          </button>
          <p className="font-manrope font-medium text-[12px] leading-[1.75] text-[#1F2937]">
            By clicking, I accept the{' '}
            <button type="button" onClick={() => toast.show('Terms & Conditions')} className="text-parkway-tangerine01">Terms &amp; Conditions</button>{' '}
            and{' '}
            <button type="button" onClick={() => toast.show('Privacy Policy')} className="text-parkway-tangerine01">Privacy Policy.</button>
          </p>
        </div>

        <div className="pt-[34px] pb-6">
          <PrimaryButton
            onClick={confirm}
            onBlockedPress={blocked}
            disabled={!ready}
            loading={verifying}
            loadingText={`Verifying ${label}…`}
          >
            Confirm
          </PrimaryButton>
        </div>
      </div>
      {toast.el}
      {net.sheet}
      <StatusSheet
        open={failed}
        tone="warning"
        title={`${label} Verification Failed`}
        body={'Number not found.\nKindly provide accurate data to proceed.'}
        onRetry={retryAfterFailure}
        onBack={() => { setFailed(false); onBack() }}
      />
    </div>
  )
}
