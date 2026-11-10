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
import VerifyOtp from './screens/onboarding/VerifyOtp'
import IdentityChoice, { type IdMethod } from './screens/onboarding/IdentityChoice'
import IdentityVerification, { DEMO_IDENTITY, type IdentityRecord } from './screens/onboarding/IdentityVerification'
import AddressDetails, { type Address } from './screens/onboarding/AddressDetails'
import ResumeSignup from './screens/onboarding/ResumeSignup'
import { OnboardingProgressContext } from './onboarding/StepList'
import { SimulationContext, type Simulation } from './onboarding/network'
import FaceVerification from './screens/onboarding/FaceVerification'
import CreatePassword from './screens/onboarding/CreatePassword'
import SetPin from './screens/onboarding/SetPin'
import PasscodePrompt from './screens/passcode/PasscodePrompt'
import PasscodeEntry from './screens/passcode/PasscodeEntry'
import PasscodeLogin from './screens/login/PasscodeLogin'
import PasswordLogin from './screens/login/PasswordLogin'
import More from './screens/settings/More'
import Security from './screens/settings/Security'
import ConfirmPassword from './screens/settings/ConfirmPassword'
import { FlowHeader } from './components/settings/SettingsUI'

type Screen =
  | 'home' | 'transfer'
  | 'sendToBank' | 'sendToParkway' | 'sendToInvoice'
  | 'send' | 'pin' | 'invoicePin'
  | 'successMonitor' | 'recentsBeneficiaries'
  | 'success'
  // Onboarding
  | 'welcome' | 'obPhone' | 'obOtp' | 'obIdChoice' | 'obIdVerify' | 'obAddress' | 'obFace' | 'obPassword' | 'obPin' | 'obPinConfirm' | 'obResume'
  // Passcode setup, offered on the dashboard right after onboarding
  | 'passcodePrompt' | 'passcodeNew' | 'passcodeConfirm'
  // Returning user: passcode login, and the password login after logging out
  | 'login' | 'loginPassword'
  // Settings: the More tab and its Security page
  | 'more' | 'security'
  // Security → Change Passcode, and its Forgot passcode? reset (code + password)
  | 'changeCurrent' | 'changeNew' | 'changeConfirm' | 'changeOtp' | 'resetPassword'

/** Chrome colours around the screen (status bar + home indicator) per screen. */
const CHROME: Partial<Record<Screen, { top: string; bottom: string; dark?: boolean }>> = {
  welcome: { top: '#F5F5F5', bottom: '#FFFFFF' },
  obResume: { top: '#FFFFFF', bottom: '#FAFAFA' },
  obFace: { top: '#525252', bottom: '#525252', dark: true },
  home: { top: '#FAFAFA', bottom: '#FFFFFF' },
  passcodePrompt: { top: '#FFFFFF', bottom: '#FFFFFF' },
  passcodeNew: { top: '#FBFBFB', bottom: '#FBFBFB' },
  passcodeConfirm: { top: '#FBFBFB', bottom: '#FBFBFB' },
  login: { top: '#FBFBFB', bottom: '#FBFBFB' },
  loginPassword: { top: '#FFFFFF', bottom: '#FBFBFB' },
  more: { top: '#FFFFFF', bottom: '#FFFFFF' },
  security: { top: '#FFFFFF', bottom: '#FBFBFB' },
  changeCurrent: { top: '#FBFBFB', bottom: '#FBFBFB' },
  changeNew: { top: '#FBFBFB', bottom: '#FBFBFB' },
  changeConfirm: { top: '#FBFBFB', bottom: '#FBFBFB' },
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

/** Screens the Flow menu files under Settings. */
const SETTINGS_SCREENS: Screen[] = ['more', 'security', 'changeCurrent', 'changeNew', 'changeConfirm', 'changeOtp', 'resetPassword']

/** The returning user on the passcode login screen. */
const LOGIN_USER = {
  firstName: 'Caleb',
  maskedPhone: '0801 *** **67',
  maskedEmail: 'ca****@gmail.com',
  passcode: '135790',
  password: 'Parkway@123',
}

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
    // Review shortcut: the passcode prompt over the dashboard.
    if (p.get('start') === 'passcode') return ['home', 'passcodePrompt']
    if (p.get('start') === 'login') return ['login']
    if (p.get('start') === 'settings') return ['more']
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
 * tab: a bottom-nav switch; the new tab fades in over the old.
 */
type Direction = 'forward' | 'back' | 'present' | 'dismiss' | 'tab'

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
  const [variant] = useState<SuccessVariant>(initialVariant)
  // Where the last transfer ended up; drives which result screen shows.
  const [outcome, setOutcome] = useState<Outcome>('success')
  // Outcome used by the side panel's preview buttons.
  const [previewOutcome] = useState<Outcome>(initialOutcome)
  const [recentsScope, setRecentsScope] = useState<'bank' | 'parkway'>('bank')
  const [direction, setDirection] = useState<Direction>('forward')
  const [phone, setPhone] = useState(SAVED?.phone ?? DEMO_PHONE)
  const [idMethod, setIdMethod] = useState<IdMethod>(SAVED?.idMethod ?? 'bvn')
  const [address, setAddress] = useState<Address | null>(SAVED?.address ?? null)
  const [savedStep, setSavedStep] = useState(SAVED?.step ?? 0)
  // Set while the "already have an account" sheet is up, so nothing is saved for resume.
  const [existingAccount, setExistingAccount] = useState(false)
  const [sim] = useState<Simulation>({ offline: false, faceFails: false })
  const [newPin, setNewPin] = useState('2580')
  // Set when onboarding finishes; the passcode prompt follows on the dashboard.
  const [passcodeDue, setPasscodeDue] = useState(false)
  const [newPasscode, setNewPasscode] = useState('')
  // The account's passcode: what login and Change Passcode check against.
  const [passcode, setPasscode] = useState(LOGIN_USER.passcode)
  // Change Passcode: the new one awaiting confirmation, and whether the user
  // got here by knowing the old one ('change') or via Forgot passcode? ('reset').
  const [draftPasscode, setDraftPasscode] = useState('')
  const [changeKind, setChangeKind] = useState<'change' | 'reset'>('change')
  // Security → Face or Touch ID (off, as drawn in Figma).
  const [faceIdOn, setFaceIdOn] = useState(false)
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

  // After onboarding, the passcode prompt rises over the dashboard 1.5s in.
  // Leaving the dashboard first cancels the timer; it runs again on return.
  useEffect(() => {
    if (!passcodeDue || current !== 'home') return
    const t = window.setTimeout(() => {
      setPasscodeDue(false)
      present('passcodePrompt')
    }, 1500)
    return () => window.clearTimeout(t)
  }, [passcodeDue, current, present])
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
        return <SetPin key="confirm" mode="confirm" expected={newPin} onBack={pop} onDone={() => { clearProgress(); setPasscodeDue(true); navigate('present', () => ['home']) }} />
      case 'passcodePrompt':
        return <PasscodePrompt onSetPasscode={() => push('passcodeNew')} />
      case 'passcodeNew':
        return <PasscodeEntry mode="new" onComplete={(code) => { setNewPasscode(code); push('passcodeConfirm') }} />
      case 'login':
        return (
          <PasscodeLogin
            firstName={LOGIN_USER.firstName}
            maskedPhone={LOGIN_USER.maskedPhone}
            passcode={passcode}
            onSuccess={() => navigate('present', () => ['home'])}
            onLogout={() => navigate('forward', () => ['loginPassword'])}
            onPasswordLogin={() => navigate('forward', () => ['loginPassword'])}
            onLockedGoBack={() => navigate('forward', () => ['loginPassword'])}
          />
        )
      case 'loginPassword':
        return (
          <PasswordLogin
            onLogin={() => navigate('present', () => ['home'])}
            onCreateAccount={() => { clearProgress(); navigate('forward', () => ['welcome', 'obPhone']) }}
          />
        )
      case 'passcodeConfirm':
        return <PasscodeEntry mode="confirm" expected={newPasscode} onBack={pop} onDone={() => { setPasscode(newPasscode); navigate('dismiss', () => ['home']) }} />
      case 'home':
        return <Home onOpenTransfer={() => push('transfer')} onOpenMore={() => navigate('tab', () => ['more'])} />
      case 'more':
        return (
          <More
            onSelectTab={(t) => { if (t === 'home') navigate('tab', () => ['home']) }}
            onOpenSecurity={() => push('security')}
            onLogout={() => navigate('dismiss', () => ['login'])}
          />
        )
      case 'security':
        return (
          <Security
            onBack={pop}
            faceIdOn={faceIdOn}
            onToggleFaceId={() => setFaceIdOn((v) => !v)}
            onChangePasscode={() => { setChangeKind('change'); push('changeCurrent') }}
          />
        )
      case 'changeCurrent':
        return (
          <PasscodeEntry
            mode="current"
            expected={passcode}
            onBack={pop}
            onVerified={() => push('changeOtp')}
            onForgot={() => { setChangeKind('reset'); push('changeOtp') }}
          />
        )
      // A one-time code to the phone and email, on both paths: after the
      // current passcode (change), or as the first check of a reset.
      case 'changeOtp':
        return (
          <VerifyOtp
            phone={LOGIN_USER.maskedPhone}
            onBack={pop}
            onVerified={() => push(changeKind === 'reset' ? 'resetPassword' : 'changeNew')}
            header={
              changeKind === 'reset'
                ? <FlowHeader title="Reset Passcode" onBack={pop} step={1} steps={2} />
                : <FlowHeader title="Change Passcode" onBack={pop} />
            }
            title="Verify it’s you"
            sub={<>Enter the 4-digit code we sent to<br />{LOGIN_USER.maskedPhone} and {LOGIN_USER.maskedEmail}.</>}
            verifiedText="Code verified"
            sentTo={`${LOGIN_USER.maskedPhone} and ${LOGIN_USER.maskedEmail}`}
          />
        )
      case 'resetPassword':
        return (
          <ConfirmPassword
            expected={LOGIN_USER.password}
            onBack={pop}
            onVerified={() => push('changeNew')}
            onLockedOut={() => navigate('dismiss', () => ['loginPassword'])}
          />
        )
      case 'changeNew':
        return (
          <PasscodeEntry
            mode="new"
            avoid={passcode}
            subtitle="Choose 6 digits you haven’t used before"
            onBack={pop}
            onComplete={(code) => { setDraftPasscode(code); push('changeConfirm') }}
          />
        )
      case 'changeConfirm':
        return (
          <PasscodeEntry
            mode="confirm"
            expected={draftPasscode}
            subtitle="Enter your new passcode again"
            onBack={pop}
            doneTitle={changeKind === 'reset' ? 'Your Passcode has been reset!' : 'Your Passcode has been changed!'}
            doneBody={`Use it the next time you open the app. We’ve sent a security alert to ${LOGIN_USER.maskedPhone} and your email.`}
            doneLabel="Back to Security"
            onDone={() => { setPasscode(draftPasscode); navigate('back', () => ['more', 'security']) }}
          />
        )
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
            onTryAgain={tryAgain}
          />
        ) : null
    }
  }

  const flow: Flow = current === 'login' || current === 'loginPassword'
    ? 'login'
    : SETTINGS_SCREENS.includes(current)
    ? 'settings'
    : current.startsWith('passcode')
    ? 'passcode'
    : current === 'welcome' || current === 'obResume' || ONBOARDING_ORDER.some((o) => o.screen === current)
      ? 'onboarding'
      : 'transfer'

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
      <FlowMenu
        active={flow}
        onSelect={(f) => {
          if (f === flow) return
          if (f === 'onboarding') navigate('dismiss', () => ['welcome'])
          else if (f === 'passcode') navigate('present', () => ['home', 'passcodePrompt'])
          else if (f === 'login') navigate('dismiss', () => ['login'])
          else if (f === 'settings') navigate('tab', () => ['more'])
          else finish()
        }}
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

/* ────────────────────────────────────────────────────────────
   Prototype controls (outside the phone)
   A dropdown of flows. Picking one jumps to the start of that flow.
   ──────────────────────────────────────────────────────────── */

type Flow = 'onboarding' | 'transfer' | 'passcode' | 'login' | 'settings'

const FLOWS: { id: Flow; label: string; hint: string }[] = [
  { id: 'onboarding', label: 'Onboarding', hint: 'Sign-up, from Welcome' },
  { id: 'transfer', label: 'Transfer', hint: 'Send money, from Home' },
  { id: 'passcode', label: 'Passcode', hint: 'Set up a passcode' },
  { id: 'login', label: 'Login', hint: 'Passcode 135790, or the one you set' },
  { id: 'settings', label: 'Settings', hint: 'Change or reset passcode · password Parkway@123' },
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

function FlowMenu({ active, onSelect }: { active: Flow; onSelect: (f: Flow) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = FLOWS.find((f) => f.id === active) ?? FLOWS[0]

  // Close on a click outside or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="hidden min-[960px]:flex fixed left-6 top-1/2 -translate-y-1/2 w-[232px] flex-col gap-2 font-manrope">
      <p className="pl-1 font-bold text-[11px] uppercase tracking-[0.06em] text-parkway-grey02">Flow</p>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="w-full h-11 pl-3.5 pr-3 rounded-[12px] bg-white/90 backdrop-blur border border-black/5 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.25)] flex items-center justify-between gap-2 active:scale-[0.99] transition-transform"
        >
          <span className="font-bold text-[13px] text-parkway-grey10">{current.label}</span>
          <svg
            viewBox="0 0 16 16"
            className="size-4 text-parkway-grey02"
            fill="none"
            aria-hidden
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 260ms var(--ease-travel)' }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* The list stays mounted and drops from the button's edge. */}
        <div
          role="listbox"
          aria-label="Prototype flow"
          inert={!open}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 rounded-[12px] bg-white border border-black/5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.28)] p-1"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? 'none' : 'translate3d(0,-6px,0) scale(0.98)',
            transformOrigin: 'top center',
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity 180ms ease, transform 260ms var(--ease-arrive)',
          }}
        >
          {FLOWS.map((f) => {
            const on = f.id === active
            return (
              <button
                key={f.id}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => {
                  setOpen(false)
                  onSelect(f.id)
                }}
                className="w-full rounded-[9px] px-3 py-2 flex items-center justify-between gap-3 text-left hover:bg-parkway-grey06 transition-colors"
                style={{ background: on ? '#FEF5F1' : undefined }}
              >
                <span className="flex flex-col">
                  <span className="font-bold text-[13px] leading-[1.35]" style={{ color: on ? '#C77756' : '#1F1F1F' }}>
                    {f.label}
                  </span>
                  <span className="font-medium text-[11px] leading-[1.4] text-parkway-grey02">{f.hint}</span>
                </span>
                {on && (
                  <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-[#C77756]" fill="none" aria-hidden>
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
