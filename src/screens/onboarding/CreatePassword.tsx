import { useEffect, useRef, useState } from 'react'
import { useOnlineGuard } from '../../onboarding/network'
import { Field, OnboardingHeader, PrimaryButton, ScreenTitle, TextInput, shake, useToast } from '../../onboarding/ui'

type Props = {
  onCreated: () => void
}

const RULES: { id: string; label: string; test: (p: string) => boolean }[] = [
  { id: 'len', label: '8+ characters', test: (p) => p.length >= 8 },
  { id: 'case', label: 'Upper & lowercase', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: 'num', label: 'A number', test: (p) => /\d/.test(p) },
  { id: 'sym', label: 'A symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const SAVE_MS = 1000

export default function CreatePassword({ onCreated }: Props) {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const pwRef = useRef<HTMLDivElement>(null)
  const confirmRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | null>(null)
  const toast = useToast()
  const net = useOnlineGuard()
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  const passed = RULES.filter((r) => r.test(pw)).length
  const strong = passed === RULES.length
  const matches = confirm.length > 0 && confirm === pw
  const mismatch = confirmTouched && confirm.length > 0 && confirm !== pw
  const valid = strong && matches

  const blocked = () => {
    if (!strong) shake(pwRef.current)
    else { setConfirmTouched(true); shake(confirmRef.current) }
  }

  const submit = () => net.guard(() => {
    setSaving(true)
    timer.current = window.setTimeout(onCreated, SAVE_MS)
  })

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative overflow-hidden">
      <OnboardingHeader step={5} animateStep />

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 pt-[34px]">
        <ScreenTitle>Create Password</ScreenTitle>

        <div className="mt-6 space-y-6">
          <div ref={pwRef}>
            <Field label="Password">
              <TextInput
                type={showPw ? 'text' : 'password'}
                value={pw}
                disabled={saving}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Create password"
                autoComplete="new-password"
                trailing={<EyeToggle shown={showPw} onToggle={() => setShowPw(!showPw)} />}
              />
            </Field>
            {/* Rules appear once typing starts and tick off as they're met. */}
            {pw.length > 0 && (
              <div className="mt-2.5 animate-soft-in">
                <div className="flex gap-1">
                  {RULES.map((_, i) => (
                    <span
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors duration-300"
                      style={{ background: i < passed ? (strong ? '#44AC21' : passed >= 2 ? '#FFC700' : '#FC5555') : '#E3E3E8' }}
                    />
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                  {RULES.map((r) => {
                    const ok = r.test(pw)
                    return (
                      <span key={r.id} className="flex items-center gap-1.5 font-manrope font-medium text-[11px] transition-colors duration-200" style={{ color: ok ? '#2F8A16' : '#999' }}>
                        <span
                          className="size-3.5 rounded-full flex items-center justify-center transition-colors duration-200"
                          style={{ background: ok ? '#44AC21' : '#E3E3E8' }}
                        >
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                            <path d="M1.5 4.2 3.2 5.8 6.5 2.3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: ok ? 1 : 0, transition: 'opacity 160ms' }} />
                          </svg>
                        </span>
                        {r.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div ref={confirmRef}>
            <Field label="Confirm Password" error={mismatch ? 'Passwords don’t match' : null}>
              <TextInput
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                disabled={saving}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setConfirmTouched(true)}
                onKeyDown={(e) => e.key === 'Enter' && (valid ? submit() : blocked())}
                placeholder="Confirm password"
                autoComplete="new-password"
                error={mismatch}
                trailing={
                  <span className="flex items-center gap-2">
                    {matches && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Passwords match" className="animate-soft-in">
                        <circle cx="8" cy="8" r="8" fill="#44AC21" />
                        <path d="M4.5 8.2 7 10.5l4.5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <EyeToggle shown={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                  </span>
                }
              />
            </Field>
          </div>
        </div>

        <p className="mt-[42px] text-center font-manrope font-medium text-[14px] leading-[1.5] text-[#1F2937]">
          By Creating password, you agree to Parkway’s
          <br />
          <button type="button" onClick={() => toast.show('Terms & Conditions')} className="font-bold text-parkway-tangerine01">Terms &amp; Conditions</button>
          {' '}and{' '}
          <button type="button" onClick={() => toast.show('Privacy Policy')} className="font-bold text-parkway-tangerine01">Privacy Policy</button>
        </p>

        <div className="mt-8">
          <PrimaryButton onClick={submit} onBlockedPress={blocked} disabled={!valid} loading={saving} loadingText="Creating password…">
            Create Password
          </PrimaryButton>
        </div>
        <button
          type="button"
          onClick={() => toast.show('Login isn’t part of this prototype yet')}
          className="mt-[42px] w-full font-manrope font-bold text-[14px] text-parkway-tangerine01 active:opacity-60 transition-opacity"
        >
          Login to Parkway
        </button>
      </div>
      {toast.el}
      {net.sheet}
    </div>
  )
}

function EyeToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="size-6 -mr-1 flex items-center justify-center active:scale-90 transition-transform"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z" stroke="#121212" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="10" cy="10" r="2.6" stroke="#121212" strokeWidth="1.4" />
        <line
          x1="3.5" y1="16.5" x2="16.5" y2="3.5"
          stroke="#121212" strokeWidth="1.4" strokeLinecap="round"
          style={{ strokeDasharray: 19, strokeDashoffset: shown ? 19 : 0, transition: 'stroke-dashoffset 220ms var(--ease-arrive)' }}
        />
      </svg>
    </button>
  )
}
