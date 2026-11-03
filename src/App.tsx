import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import PhoneFrame, { StatusBar, HomeIndicator } from './components/PhoneFrame'
import Home from './screens/Home'
import Transfer, { type Recipient } from './screens/Transfer'
import SendToBank from './screens/SendToBank'
import Send from './screens/Send'
import TransferSuccessRateMonitor from './screens/TransferSuccessRateMonitor'
import RecentsBeneficiaries from './screens/RecentsBeneficiaries'
import PinEntry from './screens/PinEntry'
import SendToParkway from './screens/SendToParkway'
import SendToInvoice from './screens/SendToInvoice'
import InvoicePinEntry from './screens/InvoicePinEntry'
import Success, {
  SUCCESS_VARIANTS,
  invoiceSuccessData,
  makeReceiptMeta,
  transferSuccessData,
  type SuccessData,
  type SuccessVariant,
} from './screens/Success'
import { INVOICES, type Invoice } from './data/invoices'
import type { Outcome } from './components/OutcomeMark'
import Welcome from './screens/onboarding/Welcome'
import PhoneNumber from './screens/onboarding/PhoneNumber'
import VerifyOtp, { OTP_REJECT } from './screens/onboarding/VerifyOtp'
import IdentityChoice, { type IdMethod } from './screens/onboarding/IdentityChoice'
import IdentityVerification, { DEMO_IDENTITY, ID_NOT_FOUND_PREFIX, type IdentityRecord } from './screens/onboarding/IdentityVerification'
import AddressDetails, { type Address } from './screens/onboarding/AddressDetails'
import ResumeSignup from './screens/onboarding/ResumeSignup'
import { OnboardingProgressContext } from './onboarding/StepList'
import { SimulationContext, type Simulation } from './onboarding/network'
import FaceVerification from './screens/onboarding/FaceVerification'
import CreatePassword from './screens/onboarding/CreatePassword'
import SetPin from './screens/onboarding/SetPin'

type Screen =
  | 'home' | 'transfer'
  | 'sendToBank' | 'sendToParkway' | 'sendToInvoice'
  | 'send' | 'pin' | 'invoicePin'
  | 'successMonitor' | 'recentsBeneficiaries'
  | 'success'
  // Onboarding
  | 'welcome' | 'obPhone' | 'obOtp' | 'obIdChoice' | 'obIdVerify' | 'obAddress' | 'obFace' | 'obPassword' | 'obPin' | 'obPinConfirm' | 'obResume'

/** Chrome colours around the screen (status bar + home indicator) per screen. */
const CHROME: Partial<Record<Screen, { top: string; bottom: string; dark?: boolean }>> = {
  welcome: { top: '#F4F4F4', bottom: '#FFFFFF' },
  obResume: { top: '#FFFFFF', bottom: '#FAFAFA' },
  obFace: { top: '#525252', bottom: '#525252', dark: true },
  home: { top: '#FAFAFA', bottom: '#FFFFFF' },
}
const DEFAULT_CHROME = { top: '#FAFAFA', bottom: '#FAFAFA', dark: false }

const ONBOARDING_ORDER: { screen: Screen; label: string }[] = [
  { screen: 'welcome', label: 'Welcome' },
  { screen: 'obPhone', label: '1 · Phone number' },
  { screen: 'obOtp', label: '1 · Verify code' },
  { screen: 'obIdChoice', label: '2 · Choose BVN / NIN' },
  { screen: 'obIdVerify', label: '2 · BVN verification' },
  { screen: 'obAddress', label: '3 · Address + details sheet' },
  { screen: 'obFace', label: '4 · Face verification' },
  { screen: 'obPassword', label: '5 · Create password' },
  { screen: 'obPin', label: '6 · Set PIN' },
  { screen: 'obPinConfirm', label: '6 · Confirm PIN' },
]

const DEMO_PHONE = '08123456698'

/** Which onboarding step each screen belongs to. */
const STEP_OF: Partial<Record<Screen, number>> = {
  obPhone: 1, obOtp: 1, obIdChoice: 2, obIdVerify: 2, obAddress: 3, obFace: 4, obPassword: 5, obPin: 6, obPinConfirm: 6,
}
/** Where "Continue to …" lands for each step. */
const STEP_ENTRY: Record<number, Screen> = { 1: 'obPhone', 2: 'obIdChoice', 3: 'obAddress', 4: 'obFace', 5: 'obPassword', 6: 'obPin' }

/** Onboarding progress kept on the device so a returning user can resume. */
type Progress = { step: number; phone: string; idMethod: IdMethod; idRecord: IdentityRecord; address: Address | null }
const PROGRESS_KEY = 'pw.onboardingProgress'

function loadProgress(): Progress | null {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY)
    const p = raw ? (JSON.parse(raw) as Progress) : null
    return p && p.step >= 1 && p.step <= 6 ? p : null
  } catch {
    return null
  }
}
function saveProgress(p: Progress | null) {
  try {
    if (p) window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
    else window.localStorage.removeItem(PROGRESS_KEY)
  } catch {
    /* storage unavailable: resume just won't be offered */
  }
}

const SAVED = loadProgress()

function initialStack(): Screen[] {
  try {
    const p = new URLSearchParams(window.location.search)
    if (p.get('start') === 'home' || p.get('preview')) return ['home']
  } catch {
    /* ignore */
  }
  // Someone who left mid-signup comes back to the resume screen.
  return SAVED ? ['welcome', 'obResume'] : ['welcome']
}

/**
 * forward / back: a UIKit push and pop.
 * present: the success page rises over the flow.
 * dismiss: the success page leaves and reveals where the user lands.
 */
type Direction = 'forward' | 'back' | 'present' | 'dismiss'

type PendingTxn = { amount: number; description: string }

const DEVICE_W = 415
const DEVICE_H = 874
const PAD = 32

const DEMO_RECIPIENT: Recipient = {
  name: 'Adetula Mabel',
  channel: 'Zenith Bank',
  maskedAccount: '0015***018',
  fullAccount: '0015478018',
  bankCode: 'zenith',
}

function useFitScale() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const recompute = () => {
      // Figma captures need the screen at its true size.
      if (window.location.hash.includes('figmacapture')) return setScale(1)
      const s = Math.min(
        1,
        (window.innerHeight - PAD) / DEVICE_H,
        (window.innerWidth - PAD) / DEVICE_W,
      )
      setScale(s)
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [])
  return scale
}

const VARIANT_KEY = 'pw.successVariant'

function initialVariant(): SuccessVariant {
  const ids = SUCCESS_VARIANTS.map((v) => v.id)
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('success') as SuccessVariant | null
    if (fromUrl && ids.includes(fromUrl)) return fromUrl
    const stored = window.localStorage.getItem(VARIANT_KEY) as SuccessVariant | null
    if (stored && ids.includes(stored)) return stored
  } catch {
    /* storage unavailable: fall through to the default */
  }
  return 'receipt'
}

export default function App() {
  const scale = useFitScale()
  const [stack, setStack] = useState<Screen[]>(initialStack)
  const [recipient, setRecipient] = useState<Recipient | null>(null)
  const [pendingTxn, setPendingTxn] = useState<PendingTxn | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [variant, setVariant] = useState<SuccessVariant>(initialVariant)
  // Where the last transfer ended up; drives which result screen shows.
  const [outcome, setOutcome] = useState<Outcome>('success')
  // Outcome used by the side panel's preview buttons.
  const [previewOutcome, setPreviewOutcome] = useState<Outcome>(initialOutcome)
  const [recentsScope, setRecentsScope] = useState<'bank' | 'parkway'>('bank')
  const [direction, setDirection] = useState<Direction>('forward')
  const [phone, setPhone] = useState(SAVED?.phone ?? DEMO_PHONE)
  const [idMethod, setIdMethod] = useState<IdMethod>(SAVED?.idMethod ?? 'bvn')
  const [address, setAddress] = useState<Address | null>(SAVED?.address ?? null)
  const [savedStep, setSavedStep] = useState(SAVED?.step ?? 0)
  // Set while the "already have an account" sheet is up, so nothing is saved for resume.
  const [existingAccount, setExistingAccount] = useState(false)
  const [sim, setSim] = useState<Simulation>({ offline: false, faceFails: false })
  const [newPin, setNewPin] = useState('2580')
  const [idRecord, setIdRecord] = useState<IdentityRecord>(SAVED?.idRecord ?? DEMO_IDENTITY)
  const hasNavigated = useRef(false)
  const current = stack[stack.length - 1]

  useEffect(() => {
    try {
      window.localStorage.setItem(VARIANT_KEY, variant)
    } catch {
      /* ignore */
    }
  }, [variant])

  const navigate = useCallback((dir: Direction, next: (s: Screen[]) => Screen[]) => {
    hasNavigated.current = true
    setDirection(dir)
    setStack(next)
  }, [])

  const push = useCallback((screen: Screen) => navigate('forward', (s) => [...s, screen]), [navigate])
  const present = useCallback((screen: Screen) => navigate('present', (s) => [...s, screen]), [navigate])
  const pop = useCallback(
    () => navigate('back', (s) => (s.length > 1 ? s.slice(0, -1) : s)),
    [navigate],
  )

  const finish = useCallback(() => {
    navigate('dismiss', () => ['home'])
    setRecipient(null)
    setPendingTxn(null)
    setInvoice(null)
  }, [navigate])

  const sendAgain = useCallback(() => {
    // Back to the amount step with the same recipient.
    navigate('dismiss', () => ['home', 'transfer', 'send'])
    setPendingTxn(null)
  }, [navigate])

  const handleProceedToPin = useCallback(
    (txn: PendingTxn) => {
      setPendingTxn(txn)
      push('pin')
    },
    [push],
  )

  const handleConfirmInvoice = useCallback(
    (inv: Invoice) => {
      setInvoice(inv)
      push('invoicePin')
    },
    [push],
  )

  const handlePickRecipient = useCallback(
    (r: Recipient) => {
      setRecipient(r)
      push('send')
    },
    [push],
  )

  const handleTransferPinSuccess = (result: Outcome) => {
    if (!recipient || !pendingTxn) return
    setOutcome(result)
    setSuccessData(transferSuccessData(recipient, pendingTxn.amount, pendingTxn.description, makeReceiptMeta()))
    present('success')
  }

  const handleInvoicePinSuccess = (result: Outcome) => {
    if (!invoice) return
    setOutcome(result)
    setSuccessData(invoiceSuccessData(invoice, makeReceiptMeta()))
    present('success')
  }

  // A failed transfer goes back to the PIN step with the same details.
  const tryAgain = useCallback(() => {
    if (successData?.kind === 'invoice') {
      navigate('dismiss', () => ['home', 'transfer', 'sendToInvoice', 'invoicePin'])
    } else {
      navigate('dismiss', () => ['home', 'transfer', 'send', 'pin'])
    }
  }, [navigate, successData?.kind])

  const previewSuccess = (kind: 'transfer' | 'invoice', result: Outcome = previewOutcome) => {
    const meta = makeReceiptMeta()
    setOutcome(result)
    if (kind === 'transfer') {
      setRecipient(DEMO_RECIPIENT)
      setPendingTxn({ amount: 5000, description: 'For Food' })
      setSuccessData(transferSuccessData(DEMO_RECIPIENT, 5000, 'For Food', meta))
    } else {
      const inv = INVOICES[0]
      setInvoice(inv)
      setRecipient(null)
      setSuccessData(invoiceSuccessData(inv, meta))
    }
    navigate('present', () => ['home', 'success'])
  }

  // `?preview=transfer|invoice` opens straight on the success page (used for Figma captures).
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('preview')
      if (p === 'transfer' || p === 'invoice') previewSuccess(p)
    } catch {
      /* ignore */
    }
    // Run once on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prototype panel: jump to any onboarding screen with the stack it would have.
  const jumpTo = (target: Screen) => {
    const idx = ONBOARDING_ORDER.findIndex((o) => o.screen === target)
    const currentIdx = ONBOARDING_ORDER.findIndex((o) => o.screen === current)
    if (target === 'obPinConfirm') setNewPin('2580')
    navigate(currentIdx >= 0 && idx < currentIdx ? 'back' : 'forward', () => ONBOARDING_ORDER.slice(0, idx + 1).map((o) => o.screen))
  }

  // Record the furthest step reached whenever an onboarding screen is shown.
  useEffect(() => {
    if (current !== 'obOtp') setExistingAccount(false)
  }, [current])
  useEffect(() => {
    const step = STEP_OF[current]
    if (!step || existingAccount) return
    const next = Math.max(savedStep, step)
    if (next !== savedStep) setSavedStep(next)
    saveProgress({ step: next, phone, idMethod, idRecord, address })
  }, [current, savedStep, phone, idMethod, idRecord, address, existingAccount])

  const clearProgress = () => {
    saveProgress(null)
    setSavedStep(0)
    setAddress(null)
  }

  // Start Again keeps the verified phone and restarts from BVN / NIN.
  const startAgain = () => {
    setAddress(null)
    setIdMethod('bvn')
    setIdRecord(DEMO_IDENTITY)
    setSavedStep(2)
    saveProgress({ step: 2, phone, idMethod: 'bvn', idRecord: DEMO_IDENTITY, address: null })
    navigate('forward', () => ['welcome', 'obIdChoice'])
  }

  // Prototype panel: pretend the user left during liveness and came back.
  const simulateReturn = () => {
    setSavedStep(4)
    setAddress({ street: '12 Admiralty Way', state: 'Lagos', lga: 'Eti-Osa', city: 'Lekki' })
    saveProgress({ step: 4, phone, idMethod, idRecord, address: { street: '12 Admiralty Way', state: 'Lagos', lga: 'Eti-Osa', city: 'Lekki' } })
    navigate('dismiss', () => ['welcome', 'obResume'])
  }

  const renderScreen = (screen: Screen): ReactNode => {
    switch (screen) {
      case 'welcome':
        return <Welcome onCreateAccount={() => { clearProgress(); push('obPhone') }} />
      case 'obResume':
        return (
          <ResumeSignup
            currentStep={Math.max(1, savedStep)}
            identity={{ label: idMethod.toUpperCase(), record: idRecord }}
            onBack={pop}
            onContinue={() => jumpTo(STEP_ENTRY[Math.max(1, savedStep)])}
            onEditAddress={() => jumpTo('obAddress')}
            onStartAgain={startAgain}
          />
        )
      case 'obPhone':
        return (
          <PhoneNumber
            onBack={pop}
            onCodeSent={(n) => { setPhone(n); push('obOtp') }}
          />
        )
      case 'obOtp':
        return (
          <VerifyOtp
            phone={phone}
            onBack={pop}
            onVerified={() => push('obIdChoice')}
            onExistingAccount={() => { setExistingAccount(true); clearProgress() }}
          />
        )
      case 'obIdChoice':
        return <IdentityChoice onBack={pop} onPick={(m) => { setIdMethod(m); push('obIdVerify') }} />
      case 'obIdVerify':
        return (
          <IdentityVerification
            key={idMethod}
            method={idMethod}
            onBack={pop}
            onVerified={(r) => { setIdRecord(r); push('obAddress') }}
          />
        )
      case 'obAddress':
        return (
          <AddressDetails
            label={idMethod.toUpperCase()}
            record={idRecord}
            onBack={pop}
            initial={address}
            onContinue={(a) => { setAddress(a); push('obFace') }}
          />
        )
      case 'obFace':
        return <FaceVerification onBack={pop} onComplete={() => push('obPassword')} />
      case 'obPassword':
        return <CreatePassword onCreated={() => push('obPin')} />
      case 'obPin':
        return <SetPin key="set" mode="set" onDone={(p) => { setNewPin(p); push('obPinConfirm') }} />
      case 'obPinConfirm':
        // Account is ready: the wallet rises in like a result page.
        return <SetPin key="confirm" mode="confirm" expected={newPin} onBack={pop} onDone={() => { clearProgress(); navigate('present', () => ['home']) }} />
      case 'home':
        return <Home onOpenTransfer={() => push('transfer')} />
      case 'transfer':
        return (
          <Transfer
            onBack={pop}
            onPickRecipient={handlePickRecipient}
            onOpenToBank={() => push('sendToBank')}
            onOpenToParkway={() => push('sendToParkway')}
            onOpenToInvoice={() => push('sendToInvoice')}
          />
        )
      case 'sendToBank':
        return (
          <SendToBank
            onBack={pop}
            onConfirmRecipient={handlePickRecipient}
            onOpenSuccessMonitor={() => push('successMonitor')}
            onOpenSeeAll={() => { setRecentsScope('bank'); push('recentsBeneficiaries') }}
          />
        )
      case 'sendToParkway':
        return (
          <SendToParkway
            onBack={pop}
            onConfirmRecipient={handlePickRecipient}
            onOpenSeeAll={() => { setRecentsScope('parkway'); push('recentsBeneficiaries') }}
          />
        )
      case 'sendToInvoice':
        return <SendToInvoice onBack={pop} onConfirm={handleConfirmInvoice} />
      case 'invoicePin':
        return invoice ? <InvoicePinEntry onBack={pop} onSuccess={handleInvoicePinSuccess} /> : null
      case 'successMonitor':
        return <TransferSuccessRateMonitor onBack={pop} />
      case 'recentsBeneficiaries':
        return (
          <RecentsBeneficiaries onBack={pop} onPickRecipient={handlePickRecipient} scope={recentsScope} />
        )
      case 'send':
        return recipient ? (
          <Send recipient={recipient} onBack={pop} onProceedToPin={handleProceedToPin} />
        ) : null
      case 'pin':
        return recipient && pendingTxn ? (
          <PinEntry
            title="Send Money"
            onBack={pop}
            onSuccess={handleTransferPinSuccess}
          />
        ) : null
      case 'success':
        return successData ? (
          <Success
            // A new receipt or a variant switch replays the entrance.
            key={`${successData.reference}-${variant}-${outcome}`}
            data={successData}
            variant={variant}
            outcome={outcome}
            onDone={finish}
            onSendAgain={successData.kind === 'transfer' && recipient ? sendAgain : undefined}
            onTryAgain={tryAgain}
          />
        ) : null
    }
  }

  const screenKey = `${current}-${stack.length}`
  const currentEl = renderScreen(current)

  // ── Keep the previous screen on stage while the next one arrives ──
  // The leaving screen keeps its key, so React keeps the same instance
  // (its state, e.g. a green PIN, stays visible while it recedes).
  const prevRef = useRef<{ key: string; el: ReactNode } | null>(null)
  const [leaving, setLeaving] = useState<{ key: string; el: ReactNode; dir: Direction } | null>(null)
  const prev = prevRef.current
  if (prev && prev.key !== screenKey && leaving?.key !== prev.key) {
    setLeaving({ key: prev.key, el: prev.el, dir: direction })
  }
  useLayoutEffect(() => {
    prevRef.current = { key: screenKey, el: currentEl }
  })

  // Safety net in case an animationend never fires (e.g. a hidden tab).
  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(() => setLeaving(null), 900)
    return () => window.clearTimeout(t)
  }, [leaving])

  const enterClass = hasNavigated.current ? `enter-${direction}` : ''
  const chrome = { ...DEFAULT_CHROME, ...CHROME[current] }
  const chromeTransition = 'background-color 420ms var(--ease-nav)'

  const layers: { key: string; el: ReactNode; className: string; isLeaving: boolean }[] = []
  if (leaving && leaving.key !== screenKey) {
    layers.push({ key: leaving.key, el: leaving.el, className: `leave-${leaving.dir} screen-leaving`, isLeaving: true })
  }
  layers.push({ key: screenKey, el: currentEl, className: enterClass, isLeaving: false })

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden no-tap-highlight p-4">
      <OnboardingPanel current={current} sim={sim} onSim={setSim} onJump={jumpTo} onSimulateReturn={simulateReturn} onStartOver={() => { clearProgress(); navigate('dismiss', () => ['welcome']) }} />
      <VariantPanel
        variant={variant}
        onVariant={setVariant}
        outcome={previewOutcome}
        onOutcome={setPreviewOutcome}
        onPreview={(kind) => previewSuccess(kind)}
        onSuccessScreen={current === 'success'}
      />
      <div
        style={{
          width: DEVICE_W * scale,
          height: DEVICE_H * scale,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: DEVICE_W,
            height: DEVICE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <PhoneFrame>
            <div id="phone-screen" className="h-full w-full flex flex-col">
              <div style={{ background: chrome.top, transition: chromeTransition }}>
                <StatusBar theme={chrome.dark ? 'dark' : 'light'} />
              </div>
              <SimulationContext.Provider value={sim}>
              <OnboardingProgressContext.Provider
                value={{ identity: { label: idMethod.toUpperCase(), record: idRecord }, onEditAddress: () => jumpTo('obAddress') }}
              >
              <div className="relative flex-1 overflow-hidden bg-parkway-bg">
                {layers.map((l) => (
                  <div
                    key={l.key}
                    className={`screen-layer ${l.className}`}
                    aria-hidden={l.isLeaving || undefined}
                    inert={l.isLeaving}
                    onAnimationEnd={
                      l.isLeaving
                        ? (e) => {
                            if (e.target === e.currentTarget) setLeaving(null)
                          }
                        : undefined
                    }
                  >
                    {l.el}
                  </div>
                ))}
              </div>
              </OnboardingProgressContext.Provider>
              </SimulationContext.Provider>
              <div style={{ background: chrome.bottom, transition: chromeTransition }}>
                <HomeIndicator theme={chrome.dark ? 'dark' : 'light'} />
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>
    </div>
  )
}

/**
 * Prototype-only control, outside the phone: pick a success-screen variant
 * and jump straight to it without walking the whole flow.
 */
const OUTCOMES: { id: Outcome; label: string; pin: string }[] = [
  { id: 'success', label: 'Success', pin: '0000' },
  { id: 'pending', label: 'Pending', pin: '1111' },
  { id: 'failed', label: 'Failed', pin: '2222' },
]

function initialOutcome(): Outcome {
  try {
    const o = new URLSearchParams(window.location.search).get('outcome')
    if (o === 'success' || o === 'pending' || o === 'failed') return o
  } catch {
    /* ignore */
  }
  return 'success'
}

function VariantPanel({
  variant,
  onVariant,
  outcome,
  onOutcome,
  onPreview,
  onSuccessScreen,
}: {
  variant: SuccessVariant
  onVariant: (v: SuccessVariant) => void
  outcome: Outcome
  onOutcome: (o: Outcome) => void
  onPreview: (kind: 'transfer' | 'invoice') => void
  onSuccessScreen: boolean
}) {
  return (
    <div className="hidden min-[960px]:flex fixed left-6 top-1/2 -translate-y-1/2 w-[232px] flex-col gap-3 rounded-[18px] bg-white/90 backdrop-blur p-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)] border border-black/5 font-manrope">
      <div>
        <p className="font-bold text-[13px] text-parkway-grey10">Success screen</p>
        <p className="mt-0.5 font-medium text-[11px] leading-[1.4] text-parkway-grey02">
          {onSuccessScreen ? 'Switching replays the page.' : 'Applies to transfers and invoices.'}
        </p>
      </div>
      <div className="flex flex-col gap-1" role="radiogroup" aria-label="Success screen variant">
        {SUCCESS_VARIANTS.map((v) => {
          const on = v.id === variant
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onVariant(v.id)}
              className="text-left rounded-[10px] px-3 py-2 transition-colors"
              style={{ background: on ? '#FEF5F1' : 'transparent' }}
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-3.5 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={{ borderColor: on ? '#F9956B' : '#C6C6C6' }}
                >
                  <span
                    className="size-1.5 rounded-full bg-parkway-tangerine01 transition-transform duration-200"
                    style={{ transform: on ? 'scale(1)' : 'scale(0)' }}
                  />
                </span>
                <span className="font-bold text-[13px] text-parkway-grey10">{v.label}</span>
              </span>
              <span className="mt-0.5 block pl-[22px] font-medium text-[11px] leading-[1.4] text-parkway-grey02">
                {v.hint}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex flex-col gap-1.5 pt-1">
        <p className="font-bold text-[13px] text-parkway-grey10">Outcome</p>
        <div className="grid grid-cols-3 gap-1 rounded-[10px] bg-parkway-grey06 p-1" role="radiogroup" aria-label="Preview outcome">
          {OUTCOMES.map((o) => {
            const on = o.id === outcome
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onOutcome(o.id)}
                className="h-7 rounded-[7px] font-semibold text-[12px] transition-colors"
                style={{ background: on ? '#fff' : 'transparent', color: on ? '#1F1F1F' : '#999', boxShadow: on ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}
              >
                {o.label}
              </button>
            )
          })}
        </div>
        <p className="font-medium text-[11px] leading-[1.4] text-parkway-grey02">
          In the flow, PIN {OUTCOMES.map((o) => `${o.pin} ${o.label.toLowerCase()}`).join(', ')}.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => onPreview('transfer')}
          className="h-9 rounded-[8px] bg-parkway-tangerine01 text-white font-semibold text-[12px] active:scale-[0.97] transition-transform"
        >
          Preview transfer
        </button>
        <button
          type="button"
          onClick={() => onPreview('invoice')}
          className="h-9 rounded-[8px] bg-parkway-grey05 text-parkway-grey10 font-semibold text-[12px] active:scale-[0.97] transition-transform"
        >
          Preview invoice
        </button>
      </div>
    </div>
  )
}

/** Prototype-only control on the right: jump between onboarding screens. */
function OnboardingPanel({
  current,
  sim,
  onSim,
  onJump,
  onSimulateReturn,
  onStartOver,
}: {
  current: Screen
  sim: Simulation
  onSim: (s: Simulation) => void
  onJump: (s: Screen) => void
  onSimulateReturn: () => void
  onStartOver: () => void
}) {
  return (
    <div className="hidden min-[1200px]:flex fixed right-6 top-1/2 -translate-y-1/2 w-[232px] max-h-[calc(100vh-32px)] overflow-y-auto hide-scrollbar flex-col gap-3 rounded-[18px] bg-white/90 backdrop-blur p-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)] border border-black/5 font-manrope">
      <div>
        <p className="font-bold text-[13px] text-parkway-grey10">Onboarding</p>
        <p className="mt-0.5 font-medium text-[11px] leading-[1.4] text-parkway-grey02">Jump to any screen.</p>
      </div>
      <div className="flex flex-col gap-0.5">
        {ONBOARDING_ORDER.map((o) => {
          const on = o.screen === current
          return (
            <button
              key={o.screen}
              type="button"
              onClick={() => onJump(o.screen)}
              className="text-left rounded-[10px] px-3 py-2 font-semibold text-[12px] transition-colors"
              style={{ background: on ? '#FEF5F1' : 'transparent', color: on ? '#C77756' : '#1F1F1F' }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      <div className="rounded-[10px] bg-parkway-grey06 p-3 font-medium text-[11px] leading-[1.5] text-parkway-grey09 space-y-1">
        <p className="font-bold text-parkway-grey10">Test inputs</p>
        <p>Code <b>{OTP_REJECT}</b> is rejected; any other code works.</p>
        <p>A phone ending <b>0000</b> (e.g. 0803 000 0000) already has an account.</p>
        <p>A BVN/NIN starting <b>{ID_NOT_FOUND_PREFIX}</b> has no record.</p>
        <p>Face check uses your camera, or simulates one if blocked.</p>
        <p>Easy PINs (1234, 0000…) are refused. Jumping to Confirm PIN expects <b>2580</b>.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Toggle label="Simulate offline" on={sim.offline} onChange={(v) => onSim({ ...sim, offline: v })} />
        <Toggle label="Face check fails" on={sim.faceFails} onChange={(v) => onSim({ ...sim, faceFails: v })} />
      </div>
      <button
        type="button"
        onClick={onSimulateReturn}
        className="h-9 rounded-[8px] font-semibold text-[12px] active:scale-[0.97] transition-[transform,background-color]"
        style={{ background: current === 'obResume' ? '#FEF5F1' : '#FFF', color: '#C77756', border: '1px solid #FDD5C4' }}
      >
        Returning user (resume)
      </button>
      <button
        type="button"
        onClick={onStartOver}
        className="h-9 rounded-[8px] bg-parkway-grey05 text-parkway-grey10 font-semibold text-[12px] active:scale-[0.97] transition-transform"
      >
        Start over
      </button>
    </div>
  )
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center justify-between rounded-[10px] px-3 py-2 hover:bg-parkway-grey06 transition-colors"
    >
      <span className="font-semibold text-[12px] text-parkway-grey10">{label}</span>
      <span className="relative h-5 w-9 rounded-full transition-colors duration-200" style={{ background: on ? '#F9956B' : '#DDDDDD' }}>
        <span
          className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: on ? 'translateX(16px)' : 'none' }}
        />
      </span>
    </button>
  )
}
