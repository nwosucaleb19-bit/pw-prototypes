import { useEffect, useRef, useState } from 'react'
import OptionPickerSheet from '../../components/OptionPickerSheet'
import { useOnlineGuard } from '../../onboarding/network'
import IdentityConfirmSheet from '../../components/IdentityConfirmSheet'
import type { IdentityRecord } from './IdentityVerification'
import { STATES, STATE_NAMES } from '../../data/states'
import { Field, OnboardingHeader, PrimaryButton, ScreenTitle, SelectBox, TextInput, shake } from '../../onboarding/ui'

export type Address = { street: string; state: string; lga: string; city: string }

type Props = {
  /** BVN or NIN */
  label: string
  record: IdentityRecord
  onBack: () => void
  onContinue: (a: Address) => void
  /** Pre-fill when editing a saved address. */
  initial?: Address | null
}

type Key = 'street' | 'state' | 'lga' | 'city'

const SAVE_MS = 900

export default function AddressDetails({ label, record, onBack, onContinue, initial }: Props) {
  const [street, setStreet] = useState(initial?.street ?? '')
  const [state, setState] = useState<string | null>(initial?.state ?? null)
  const [lga, setLga] = useState<string | null>(initial?.lga ?? null)
  const [city, setCity] = useState(initial?.city ?? '')
  const [picker, setPicker] = useState<'state' | 'lga' | null>(null)
  const [missing, setMissing] = useState<Set<Key>>(new Set())
  const [saving, setSaving] = useState(false)
  const [lgaCleared, setLgaCleared] = useState(false)
  const refs = { street: useRef<HTMLDivElement>(null), state: useRef<HTMLDivElement>(null), lga: useRef<HTMLDivElement>(null), city: useRef<HTMLDivElement>(null) }
  const timer = useRef<number | null>(null)
  const net = useOnlineGuard()
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  // After the address is saved, the looked-up details are shown for confirmation.
  const [reviewing, setReviewing] = useState(false)

  const check: Record<Key, boolean> = {
    street: street.trim().length >= 5,
    state: !!state,
    lga: !!lga,
    city: city.trim().length >= 2,
  }
  const valid = Object.values(check).every(Boolean)

  const unmark = (k: Key) => setMissing((m) => { if (!m.has(k)) return m; const n = new Set(m); n.delete(k); return n })

  const blocked = () => {
    const keys = (Object.keys(check) as Key[]).filter((k) => !check[k])
    setMissing(new Set(keys))
    shake(refs[keys[0]].current)
  }

  const submit = () => net.guard(() => {
    setSaving(true)
    timer.current = window.setTimeout(() => { setSaving(false); setReviewing(true) }, SAVE_MS)
  })

  const pickState = (s: string) => {
    if (s !== state && lga) { setLga(null); setLgaCleared(true) }
    setState(s)
    unmark('state')
  }

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative overflow-hidden">
      <OnboardingHeader step={3} animateStep onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 pt-[22px] flex flex-col">
        <ScreenTitle display sub="Provide your address details to continue">{label} Verification</ScreenTitle>

        <div className="mt-[15px] space-y-3">
          <Field label="Phone Number">
            <TextInput value={record.maskedPhone} readOnly aria-readonly className="tabular-nums" />
          </Field>

          <div ref={refs.street}>
            <Field label="Residential Address" error={missing.has('street') ? 'Enter your house number and street' : null}>
              <TextInput
                value={street}
                onChange={(e) => { setStreet(e.target.value); unmark('street') }}
                placeholder="Enter Residential Address"
                autoComplete="street-address"
                error={missing.has('street')}
              />
            </Field>
          </div>

          <div ref={refs.state}>
            <Field label="State of Residence" error={missing.has('state') ? 'Select your state' : null}>
              <SelectBox value={state} placeholder="Select State" onClick={() => setPicker('state')} error={missing.has('state')} />
            </Field>
          </div>

          <div ref={refs.lga}>
            <Field
              label="LGA of Residence"
              error={missing.has('lga') ? (state ? 'Select your LGA' : 'Select a state first') : null}
            >
              <SelectBox
                value={lga}
                placeholder={state ? 'Select LGA' : 'Select LGA'}
                onClick={() => {
                  if (!state) { setMissing((m) => new Set(m).add('state').add('lga')); shake(refs.state.current); return }
                  setLgaCleared(false)
                  setPicker('lga')
                }}
                error={missing.has('lga')}
              />
            </Field>
            {lgaCleared && !lga && (
              <p className="mt-1.5 font-manrope font-medium text-[11px] text-[#AA8500] animate-soft-in">
                State changed, so pick an LGA in {state}.
              </p>
            )}
          </div>

          <div ref={refs.city}>
            <Field label="City" error={missing.has('city') ? 'Enter your city' : null}>
              <TextInput
                value={city}
                onChange={(e) => { setCity(e.target.value); unmark('city') }}
                placeholder="Enter City"
                autoComplete="address-level2"
                error={missing.has('city')}
              />
            </Field>
          </div>
        </div>

        <div className="flex-1 min-h-6" />

        <div className="pt-6">
          <PrimaryButton onClick={submit} onBlockedPress={blocked} disabled={!valid} loading={saving} loadingText="Saving address…">
            Continue
          </PrimaryButton>
        </div>
        <div className="flex justify-center pt-[18px] pb-4">
          <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#FDF8EA] px-2 h-[26px]">
            <span className="font-manrope font-medium text-[12px] text-parkway-grey02">Powered by</span>
            <span className="font-display font-medium text-[13px] text-parkway-grey01">Parkway Rails</span>
          </span>
        </div>
      </div>

      <IdentityConfirmSheet
        open={reviewing}
        label={label}
        record={record}
        onClose={() => setReviewing(false)}
        onConfirm={() => onContinue({ street: street.trim(), state: state!, lga: lga!, city: city.trim() })}
      />
      <OptionPickerSheet
        open={picker === 'state'}
        title="Select State"
        searchPlaceholder="Search state"
        options={STATE_NAMES}
        selected={state}
        onClose={() => setPicker(null)}
        onPick={pickState}
      />
      <OptionPickerSheet
        open={picker === 'lga'}
        title="Select LGA"
        searchPlaceholder={`Search LGAs in ${state ?? ''}`}
        options={state ? STATES[state] : []}
        selected={lga}
        onClose={() => setPicker(null)}
        onPick={(v) => { setLga(v); unmark('lga') }}
      />
      {net.sheet}
    </div>
  )
}
