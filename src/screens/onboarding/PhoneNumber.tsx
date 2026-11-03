import { useEffect, useRef, useState } from 'react'
import { useOnlineGuard } from '../../onboarding/network'
import { Field, OnboardingHeader, PrimaryButton, ScreenTitle, boxClass, shake } from '../../onboarding/ui'

type Props = {
  onBack: () => void
  /** Receives the number in local format, e.g. 08123456698. */
  onCodeSent: (localNumber: string) => void
  initial?: string
}

const SEND_DELAY_MS = 1100

/** Strips formatting and the trunk 0, leaving the 10 national digits. */
function national(raw: string) {
  const d = raw.replace(/\D/g, '')
  return d.startsWith('0') ? d.slice(1, 11) : d.slice(0, 10)
}

function format(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  // 0812 345 6698 / 812 345 6698
  const lead = d.startsWith('0') ? 4 : 3
  const parts = [d.slice(0, lead), d.slice(lead, lead + 3), d.slice(lead + 3)].filter(Boolean)
  return parts.join(' ')
}

export default function PhoneNumber({ onBack, onCodeSent, initial = '' }: Props) {
  const [value, setValue] = useState(format(initial))
  const [focused, setFocused] = useState(false)
  const [sending, setSending] = useState(false)
  const [touched, setTouched] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)
  const net = useOnlineGuard()

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  const n = national(value)
  const complete = n.length === 10
  const badPrefix = n.length > 0 && !/^[789]/.test(n)
  const error = badPrefix
    ? 'Nigerian mobile numbers start with 07, 08 or 09'
    : touched && !focused && n.length > 0 && !complete
      ? 'Phone number should be 11 digits'
      : null
  const valid = complete && !badPrefix

  const submit = () => {
    if (!valid) {
      setTouched(true)
      shake(boxRef.current)
      return
    }
    inputRef.current?.blur()
    net.guard(() => {
      setSending(true)
      timer.current = window.setTimeout(() => onCodeSent('0' + n), SEND_DELAY_MS)
    })
  }

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative overflow-hidden">
      <OnboardingHeader step={1} animateStep onBack={onBack} />

      <div className="flex-1 px-5 pt-8">
        <ScreenTitle sub="We’ll send you a code to verify your phone.">Enter phone number</ScreenTitle>

        <div className="mt-[30px]">
          <Field label="Phone Number" error={error}>
            <div
              ref={boxRef}
              className={`${boxClass({ focused, error: !!error })} flex items-center`}
              onClick={() => inputRef.current?.focus()}
            >
              <span className="pl-[14px] pr-[14px] font-manrope font-medium text-[13px] text-parkway-grey01">+234</span>
              <span className="h-6 w-px bg-parkway-grey04" />
              <input
                ref={inputRef}
                inputMode="numeric"
                autoComplete="tel-national"
                value={value}
                disabled={sending}
                onChange={(e) => setValue(format(e.target.value))}
                onFocus={() => setFocused(true)}
                onBlur={() => { setFocused(false); setTouched(true) }}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Enter phone number"
                className="flex-1 min-w-0 h-full bg-transparent outline-none pl-[14px] pr-4 font-manrope font-medium text-[13px] tracking-[0.02em] text-parkway-grey01 placeholder:text-[#999] placeholder:text-[12px] placeholder:tracking-normal tabular-nums caret-parkway-tangerine01"
              />
            </div>
          </Field>
        </div>

        <div className="mt-14">
          <PrimaryButton onClick={submit} onBlockedPress={submit} disabled={!valid} loading={sending} loadingText="Sending code…">
            Send Code
          </PrimaryButton>
        </div>
      </div>
      {net.sheet}
    </div>
  )
}
