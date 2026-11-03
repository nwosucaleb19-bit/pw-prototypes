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

type Screen =
  | 'home' | 'transfer'
  | 'sendToBank' | 'sendToParkway' | 'sendToInvoice'
  | 'send' | 'pin' | 'invoicePin'
  | 'successMonitor' | 'recentsBeneficiaries'
  | 'success'

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
  const [stack, setStack] = useState<Screen[]>(['home'])
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

  const renderScreen = (screen: Screen): ReactNode => {
    switch (screen) {
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

  const layers: { key: string; el: ReactNode; className: string; isLeaving: boolean }[] = []
  if (leaving && leaving.key !== screenKey) {
    layers.push({ key: leaving.key, el: leaving.el, className: `leave-${leaving.dir} screen-leaving`, isLeaving: true })
  }
  layers.push({ key: screenKey, el: currentEl, className: enterClass, isLeaving: false })

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden no-tap-highlight p-4">
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
              <StatusBar theme="light" />
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
              <HomeIndicator theme="light" />
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
