import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import SuccessMark from '../components/SuccessMark'
import OutcomeMark, { type Outcome } from '../components/OutcomeMark'
import OutcomeShare from '../assets/figma/outcome/share.svg'
import OutcomeDownload from '../assets/figma/outcome/download.svg'
import OutcomeRefresh from '../assets/figma/outcome/refresh.svg'
import OutcomeHeadset from '../assets/figma/outcome/headset.svg'
import OutcomeCaretDown from '../assets/figma/outcome/caret-down.svg'
import OutcomeCopy from '../assets/figma/outcome/copy.svg'
import PerforationLine from '../assets/figma/outcome/perforation-line.svg'
import RollingNumber from '../components/motion/RollingNumber'
import Collapse from '../components/motion/Collapse'
import BottomSheet from '../components/BottomSheet'
import { RecipientAvatar, type Recipient } from './Transfer'
import { BANK_BY_CODE } from '../data/banks'
import type { Invoice } from '../data/invoices'
import IconDownload from '../assets/figma/icon-download.svg'
import IconUserCircle from '../assets/figma/icon-user-circle.svg'
import IconCaretDown from '../assets/figma/icon-caret-down.svg'
import TileBank from '../assets/figma/tile-bank.svg'
import TileInvoice from '../assets/figma/tile-invoice.svg'
import TileParkway from '../assets/figma/tile-parkway.svg'

/* ────────────────────────────────────────────────────────────
   Variants
   ──────────────────────────────────────────────────────────── */

export type SuccessVariant = 'receipt' | 'spotlight' | 'bold'

export const SUCCESS_VARIANTS: { id: SuccessVariant; label: string; hint: string }[] = [
  { id: 'receipt', label: 'Receipt', hint: 'Details up front on a tear-off receipt' },
  { id: 'spotlight', label: 'Spotlight', hint: 'Amount in focus, then things to do next' },
  { id: 'bold', label: 'Bold', hint: 'One big brand moment, details on demand' },
]

/* ────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────── */

type Row = { label: string; value: ReactNode }

export type SuccessData = {
  kind: 'transfer' | 'invoice'
  amount: number
  headline: string
  recipientName: string
  recipientFirstName: string
  recipientSub: string
  avatar: ReactNode
  /** One sentence for the spotlight variant. */
  summary: ReactNode
  /** Short line above the amount on the bold variant. */
  toLine: string
  /** Receipt variant's line under the amount: a grey prefix, then the bold recipient. */
  toPrefix: string
  toBold: string
  /** Title over the amount for each outcome. */
  titles: Record<Outcome, string>
  /** Full receipt rows, shown for a successful transfer. */
  rows: Row[]
  /** The shorter receipt shown while pending or after a failure. */
  briefRows: Row[]
  reference: string
  date: string
  /** Where the recipient's money lives, used to pick a relevant next step. */
  isParkwayRecipient: boolean
}

export type ReceiptMeta = { reference: string; date: string }

export function makeReceiptMeta(): ReceiptMeta {
  const now = new Date()
  const reference = `PWY${now.getTime().toString().slice(-10)}`
  const date = now.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return { reference, date }
}

export function transferSuccessData(
  recipient: Recipient,
  amount: number,
  description: string,
  meta: ReceiptMeta,
): SuccessData {
  const code = recipient.bankCode
  const isParkway = code === 'parkway'
  const bankName = code === 'parkway' ? 'Parkway Wallet' : BANK_BY_CODE[code].name
  const name = titleCase(recipient.name)
  return {
    kind: 'transfer',
    amount,
    headline: 'Transfer successful',
    recipientName: name,
    recipientFirstName: name.split(' ')[0],
    recipientSub: `${bankName} • ${recipient.fullAccount}`,
    avatar: <RecipientAvatar bankCode={recipient.bankCode} size={40} />,
    summary: (
      <>
        Your money is on its way to <Strong>{name}</Strong> at {bankName}.
      </>
    ),
    toLine: `Sent to ${name}`,
    toPrefix: 'Sent to',
    toBold: `${recipient.name} • ${bankName}`.toUpperCase(),
    titles: { success: 'Transfer Successful', pending: 'Transfer Pending', failed: 'Transfer Failed' },
    rows: [
      { label: 'Transaction fee', value: <FreeFee /> },
      // Description is optional; leave the row out when none was given.
      ...(description ? [{ label: 'Description', value: description }] : []),
      { label: 'Date', value: meta.date },
    ],
    briefRows: [
      ...(description ? [{ label: 'Description', value: description }] : []),
      { label: 'Date', value: meta.date },
    ],
    reference: meta.reference,
    date: meta.date,
    isParkwayRecipient: isParkway,
  }
}

export function invoiceSuccessData(invoice: Invoice, meta: ReceiptMeta): SuccessData {
  const name = titleCase(invoice.payeeName)
  return {
    kind: 'invoice',
    amount: invoice.amount,
    headline: 'Invoice paid',
    recipientName: name,
    recipientFirstName: name.split(' ')[0],
    recipientSub: `Invoice ${invoice.number}`,
    avatar: (
      <div className="size-10 rounded-full bg-parkway-tangerine06 flex items-center justify-center shrink-0">
        <img src={TileInvoice} alt="" className="size-[18px]" />
      </div>
    ),
    summary: (
      <>
        Invoice <Strong>{invoice.number}</Strong> for {name} has been paid.
      </>
    ),
    toLine: `Paid to ${name}`,
    toPrefix: 'Paid to',
    toBold: `${invoice.payeeName} • ${invoice.serviceProvider}`.toUpperCase(),
    titles: { success: 'Payment Successful', pending: 'Payment Pending', failed: 'Payment Failed' },
    rows: [
      { label: 'Service provider', value: invoice.serviceProvider },
      { label: 'Transaction fee', value: <FreeFee /> },
      { label: 'Date', value: meta.date },
    ],
    briefRows: [
      { label: 'Service provider', value: invoice.serviceProvider },
      { label: 'Date', value: meta.date },
    ],
    reference: meta.reference,
    date: meta.date,
    isParkwayRecipient: false,
  }
}

/* ────────────────────────────────────────────────────────────
   Screen
   ──────────────────────────────────────────────────────────── */

type Props = {
  data: SuccessData
  variant: SuccessVariant
  /** Where the transfer ended up. Pending and failed always use the receipt layout. */
  outcome?: Outcome
  onDone: () => void
  onSendAgain?: () => void
  onTryAgain?: () => void
}

export default function Success({ data, variant, outcome = 'success', onDone, onSendAgain, onTryAgain }: Props) {
  const toast = useToast()
  const page =
    variant === 'receipt' || outcome !== 'success' ? (
      <ReceiptOutcome
        data={data}
        outcome={outcome}
        onDone={onDone}
        onSendAgain={onSendAgain}
        onTryAgain={onTryAgain}
        toast={toast.show}
      />
    ) : variant === 'spotlight' ? (
      <SpotlightVariant data={data} onDone={onDone} toast={toast.show} />
    ) : (
      <BoldVariant data={data} onDone={onDone} toast={toast.show} />
    )

  return (
    <div className="relative h-full w-full">
      <p role="status" className="sr-only">
        {`${data.titles[outcome]}, ₦${formatMoney(data.amount)}`}
      </p>
      {page}
      <Toast state={toast.state} />
    </div>
  )
}

/* ── Receipt (from the Figma outcome screens) ──────────────────
   One layout for all three outcomes. The mark and amount lead;
   "View details" swaps itself for the tear-off receipt. Success
   ends on Done; pending and failed offer support and Close. */

function ReceiptOutcome({
  data,
  outcome,
  onDone,
  onSendAgain,
  onTryAgain,
  toast,
}: {
  data: SuccessData
  outcome: Outcome
  onDone: () => void
  onSendAgain?: () => void
  onTryAgain?: () => void
  toast: (msg: string) => void
}) {
  // `?details=open` starts with the receipt expanded (used for Figma captures).
  const [detailsOpen, setDetailsOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('details') === 'open'
    } catch {
      return false
    }
  })
  const isSuccess = outcome === 'success'
  const rows = isSuccess ? data.rows : data.briefRows

  return (
    <div className="h-full flex flex-col bg-[#FBFBFB]">
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pt-6 pb-4">
        <div className="mx-auto w-full max-w-[335px] flex flex-col items-center">
          <OutcomeMark outcome={outcome} delay={140} />

          <div className="mt-6 w-[258px] flex flex-col items-center gap-[9px] text-center">
            <p
              className="rise-in font-manrope font-medium text-[14px] tracking-[-0.28px] text-[#868686]"
              style={d(500)}
            >
              {data.titles[outcome]}
            </p>
            <div className="rise-in" style={d(560)}>
              <Amount value={data.amount} size={28} delay={660} color="#1E1E1E" signClass="text-[16px] tracking-[-0.8px] text-[#999999]" />
            </div>
          </div>

          {/* "Sent to" belongs to the collapsed success state only; it gives way to the receipt. */}
          {isSuccess && (
            <Collapse open={!detailsOpen} duration={340} className="w-full">
              <p
                className="rise-in pt-[9px] text-center font-manrope font-medium text-[12px] tracking-[-0.24px] text-[#868686]"
                style={d(620)}
              >
                {data.toPrefix} <span className="font-bold text-[#1E1E1E]">{data.toBold}</span>
              </p>
            </Collapse>
          )}

          {/* The toggle swaps itself for the receipt as one motion. */}
          <Collapse open={!detailsOpen} duration={340}>
            <div className={isSuccess ? 'pt-10' : 'pt-[31px]'}>
              <ViewDetailsButton onClick={() => setDetailsOpen(true)} style={d(720)} />
            </div>
          </Collapse>

          <Collapse open={detailsOpen} duration={380} className="w-full">
            <div className="pt-[31px]">
              <ReceiptCard
                data={data}
                rows={rows}
                showReference={isSuccess}
                onClose={() => setDetailsOpen(false)}
              />
            </div>
          </Collapse>

          <div className="rise-in mt-10 flex items-start justify-center gap-8" style={d(840)}>
            <RoundAction icon={OutcomeShare} label="Share" onClick={() => toast('Receipt ready to share')} />
            <RoundAction icon={OutcomeDownload} label="Download" onClick={() => toast('Receipt saved to Files')} />
            {isSuccess && onSendAgain && <RoundAction icon={OutcomeRefresh} label="Send again" onClick={onSendAgain} />}
            {outcome === 'failed' && onTryAgain && (
              <RoundAction icon={OutcomeRefresh} label="Try again" onClick={onTryAgain} />
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 pt-2 pb-4">
        <div className="rise-in mx-auto w-full max-w-[335px] flex flex-col gap-4" style={d(920)}>
          {!isSuccess && (
            <button
              type="button"
              onClick={() => toast('Connecting you to support')}
              className="w-full h-[48px] rounded-[8px] bg-[#EFEFEF] flex items-center justify-center gap-[10px] font-manrope font-semibold text-[14px] leading-[1.8] text-parkway-grey01 active:scale-[0.98] transition-transform"
            >
              <img src={OutcomeHeadset} alt="" className="size-5" />
              Contact Support
            </button>
          )}
          <PrimaryButton onClick={onDone}>{isSuccess ? 'Done' : 'Close'}</PrimaryButton>
        </div>
      </div>
    </div>
  )
}

function ViewDetailsButton({ onClick, style }: { onClick: () => void; style?: CSSProperties }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={false}
      className="rise-in h-11 pl-5 pr-4 rounded-full bg-white border border-[#EDEDED] flex items-center gap-1.5 font-manrope font-semibold text-[14px] leading-[22.5px] text-parkway-grey10 active:scale-[0.97] transition-transform"
      style={style}
    >
      View details
      <img src={OutcomeCaretDown} alt="" className="size-[18px]" />
    </button>
  )
}

/** The tear-off receipt card from the outcome designs. */
function ReceiptCard({
  data,
  rows,
  showReference,
  onClose,
}: {
  data: SuccessData
  rows: Row[]
  showReference: boolean
  /** Folds the receipt back into the "View details" button. */
  onClose: () => void
}) {
  return (
    <div className="relative w-[334px] mx-auto bg-white rounded-[16px] border border-[#EFEFEF]">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex items-center gap-3">
          {data.avatar}
          <div className="min-w-0 flex flex-col gap-1">
            <p className="font-manrope font-bold text-[15px] leading-[19.5px] uppercase text-parkway-grey10 truncate">
              {data.recipientName}
            </p>
            <p className="font-manrope font-medium text-[12px] leading-[15.6px] text-[#8A8A8A] truncate">
              {data.recipientSub}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close receipt"
          className="shrink-0 px-[14px] py-1 rounded-full bg-white border border-[#EDEDED] font-manrope font-semibold text-[12px] leading-[22.5px] text-parkway-grey10 active:scale-[0.96] transition-transform"
        >
          Close
        </button>
      </div>

      <Perforation />

      <div className="p-4 flex flex-col gap-3">
        {rows.map((r, i) => (
          <DetailRow key={r.label} row={r} style={d(120 + i * 50)} />
        ))}
        {showReference && <ReferenceRow reference={data.reference} style={d(120 + rows.length * 50)} />}
      </div>
    </div>
  )
}

/** "🎉  FREE" in the success green, as in the design. */
function FreeFee() {
  return (
    <span className="font-bold text-[#1F9D55] whitespace-pre">
      <span className="font-semibold">{'🎉  '}</span>FREE
    </span>
  )
}

/* ── Variant 2: Spotlight ─────────────────────────────────────
   Inspired by the exchange-style confirmation: a calm white page,
   the amount as the headline, one sentence, then a carousel of
   relevant next steps. Details live one tap away. */

function SpotlightVariant({
  data,
  onDone,
  toast,
}: {
  data: SuccessData
  onDone: () => void
  toast: (msg: string) => void
}) {
  const [receiptOpen, setReceiptOpen] = useState(false)
  const cards = nextSteps(data)

  return (
    <div className="relative h-full flex flex-col bg-white">
      <div className="shrink-0 flex justify-end px-3 pt-1">
        <button
          type="button"
          aria-label="Close"
          onClick={onDone}
          className="size-11 rounded-full flex items-center justify-center active:bg-black/5 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="#121212" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pb-8">
        <div className="flex flex-col items-center px-8">
          <SuccessMark size={76} halo delay={140} />

          <div className="rise-in mt-5" style={d(520)}>
            <Amount value={data.amount} size={42} delay={620} />
          </div>
          <p
            className="rise-in mt-4 max-w-[300px] text-center font-manrope font-medium text-[15px] leading-[1.5] text-[#555]"
            style={d(640)}
          >
            {data.summary}
          </p>
          <button
            type="button"
            onClick={() => setReceiptOpen(true)}
            className="rise-in mt-4 h-9 px-4 rounded-full bg-parkway-grey06 border border-[#EFEFEF] font-manrope font-semibold text-[13px] text-parkway-grey10 active:scale-[0.97] transition-transform"
            style={d(720)}
          >
            View receipt
          </button>
        </div>

        <p
          className="rise-in mt-9 text-center font-manrope font-bold text-[17px] text-parkway-grey10"
          style={d(860)}
        >
          Do more with Parkway
        </p>
        <Carousel cards={cards} toast={toast} delay={940} />
      </div>

      <BottomSheet open={receiptOpen} onClose={() => setReceiptOpen(false)}>
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex items-center gap-3">
            {data.avatar}
            <div className="min-w-0 flex flex-col gap-1">
              <p className="font-manrope font-bold text-[15px] leading-[1.3] text-parkway-grey10 truncate">
                {data.recipientName}
              </p>
              <p className="font-manrope font-medium text-[12px] leading-[1.3] text-[#8A8A8A] truncate">
                {data.recipientSub}
              </p>
            </div>
          </div>
          <div className="rounded-[12px] bg-parkway-grey06 border border-[#F2F2F2] p-4 flex flex-col gap-3">
            <DetailRow row={{ label: 'Amount', value: `₦${formatMoney(data.amount)}` }} />
            {data.rows.map((r) => (
              <DetailRow key={r.label} row={r} />
            ))}
            <ReferenceRow reference={data.reference} />
          </div>
          <PrimaryButton
            onClick={() => {
              setReceiptOpen(false)
              toast('Receipt saved to Files')
            }}
          >
            <img src={IconDownload} alt="" className="size-5" />
            Download receipt
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  )
}

/* ── Variant 3: Bold ──────────────────────────────────────────
   Inspired by the big-circle wallet confirmation: one confident
   brand moment, the amount in the accent, details on demand,
   a single promo and one clear way out. */

function BoldVariant({
  data,
  onDone,
  toast,
}: {
  data: SuccessData
  onDone: () => void
  toast: (msg: string) => void
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const promo = boldPromo(data)

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-6 pt-12 pb-4 flex flex-col items-center">
        <SuccessMark size={128} tone="tangerine" confetti delay={140} />

        <p className="rise-in mt-9 font-manrope font-bold text-[17px] text-parkway-grey10 text-center" style={d(540)}>
          {data.toLine}
        </p>
        <div className="rise-in mt-2 text-[#E8703E]" style={d(600)}>
          <Amount value={data.amount} size={44} delay={680} signClass="text-[0.55em] text-[#E8703E]/70" color="#E8703E" />
        </div>

        <DetailsToggle open={detailsOpen} onToggle={() => setDetailsOpen((o) => !o)} surface="grey" style={d(720)} />

        <Collapse open={detailsOpen} duration={360} className="w-full">
          <div className="mt-4 rounded-[20px] bg-[#F5F5F5] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 pb-1">
              {data.avatar}
              <div className="min-w-0 flex flex-col gap-1">
                <p className="font-manrope font-bold text-[14px] leading-[1.3] text-parkway-grey10 truncate">
                  {data.recipientName}
                </p>
                <p className="font-manrope font-medium text-[12px] leading-[1.3] text-[#8A8A8A] truncate">
                  {data.recipientSub}
                </p>
              </div>
            </div>
            {data.rows.map((r) => (
              <DetailRow key={r.label} row={r} />
            ))}
            <ReferenceRow reference={data.reference} />
          </div>
        </Collapse>
      </div>

      <div className="shrink-0 px-5 pt-2 pb-4 flex flex-col gap-3">
        <div className="rise-in rounded-[20px] bg-[#F3F3F3] pl-5 pr-4 py-5 flex items-center gap-4" style={d(860)}>
          <div className="flex-1 min-w-0">
            <p className="font-manrope font-bold text-[16px] leading-[1.3] text-parkway-grey10">{promo.title}</p>
            <p className="mt-1.5 font-manrope font-medium text-[14px] leading-[1.45] text-[#555]">{promo.body}</p>
            <button
              type="button"
              onClick={() => toast(promo.toast)}
              className="mt-3 font-manrope font-bold text-[15px] text-[#E8703E] active:opacity-70 transition-opacity"
            >
              Tell me more
            </button>
          </div>
          <div className="size-16 rounded-[18px] bg-white flex items-center justify-center shrink-0">
            <img src={promo.icon} alt="" className="size-7" />
          </div>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="rise-in h-[52px] w-full rounded-full bg-parkway-tangerine01 font-manrope font-bold text-[16px] text-white active:scale-[0.98] transition-transform"
          style={d(940)}
        >
          Done
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Shared parts
   ──────────────────────────────────────────────────────────── */

/** Stagger helper: `style={d(480)}` delays a `.rise-in` by 480ms. */
function d(ms: number): CSSProperties {
  return { ['--d' as string]: `${ms}ms` }
}

function Strong({ children }: { children: ReactNode }) {
  return <span className="font-bold text-parkway-grey10">{children}</span>
}

/**
 * The amount centers on its digits; the ₦ hangs off the left so the number
 * reads centered to the eye. Only the digits roll.
 */
function Amount({
  value,
  size,
  delay,
  signClass = 'text-[0.55em] text-parkway-grey02',
  color = '#1F1F1F',
}: {
  value: number
  size: number
  delay: number
  signClass?: string
  color?: string
}) {
  return (
    <div
      className="relative inline-flex font-display font-bold leading-none"
      style={{ fontSize: size, letterSpacing: '-0.02em', color }}
    >
      <span
        aria-hidden
        className={`absolute right-full top-1/2 -translate-y-1/2 pr-[0.12em] font-manrope font-bold ${signClass}`}
      >
        ₦
      </span>
      <RollingNumber value={formatMoney(value)} delay={delay} />
    </div>
  )
}

/**
 * "View details" pill. The two labels share one slot and crossfade so the
 * pill never changes width; the caret turns to point the way it will move.
 */
function DetailsToggle({
  open,
  onToggle,
  surface,
  style,
}: {
  open: boolean
  onToggle: () => void
  /** 'white' on the grey page, 'grey' on a white page. */
  surface: 'white' | 'grey'
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={`rise-in mt-5 h-11 pl-5 pr-4 rounded-full flex items-center gap-1.5 font-manrope font-bold text-[15px] text-parkway-grey10 active:scale-[0.97] transition-transform ${
        surface === 'white' ? 'bg-white border border-[#EDEDED]' : 'bg-[#F2F2F2]'
      }`}
      style={style}
    >
      <span className="grid">
        {(['View details', 'Hide details'] as const).map((label, i) => {
          const on = (i === 1) === open
          return (
            <span
              key={label}
              className="col-start-1 row-start-1 text-center"
              aria-hidden={!on}
              style={{
                opacity: on ? 1 : 0,
                transform: on ? 'none' : `translate3d(0,${i === 1 ? 6 : -6}px,0)`,
                transition: 'opacity 200ms ease, transform 280ms var(--ease-arrive)',
              }}
            >
              {label}
            </span>
          )
        })}
      </span>
      <img
        src={IconCaretDown}
        alt=""
        className="size-4"
        style={{
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 320ms var(--ease-travel)',
        }}
      />
    </button>
  )
}

function DetailRow({ row, style }: { row: Row; style?: CSSProperties }) {
  return (
    <div className={`flex items-start justify-between gap-6 ${style ? 'rise-in' : ''}`} style={style}>
      <span className="font-manrope font-medium text-[13px] leading-[1.4] text-[#8A8A8A] shrink-0">{row.label}</span>
      <span className="font-manrope font-semibold text-[13px] leading-[1.4] text-parkway-grey10 text-right">
        {row.value}
      </span>
    </div>
  )
}

function ReferenceRow({ reference, style }: { reference: string; style?: CSSProperties }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(t)
  }, [copied])

  const copy = () => {
    navigator.clipboard?.writeText(reference).catch(() => {})
    setCopied(true)
  }

  return (
    <div className={`flex items-center justify-between gap-6 ${style ? 'rise-in' : ''}`} style={style}>
      <span className="font-manrope font-medium text-[13px] leading-[1.4] text-[#8A8A8A]">Reference</span>
      <button
        type="button"
        onClick={copy}
        className="flex items-center gap-1.5 font-manrope font-semibold text-[13px] leading-[1.4] text-parkway-grey10 tabular-nums active:opacity-70"
        aria-label={copied ? 'Reference copied' : `Copy reference ${reference}`}
      >
        {reference}
        {/* Icon and "Copied" share one slot and crossfade. */}
        <span className="relative grid size-4 place-items-center">
          <img
            src={OutcomeCopy}
            alt=""
            className="size-4 col-start-1 row-start-1 transition-all duration-200"
            style={{ opacity: copied ? 0 : 1, transform: copied ? 'scale(0.6)' : 'none' }}
          />
          <svg
            viewBox="0 0 24 24"
            className="size-4 col-start-1 row-start-1 transition-all duration-200"
            style={{ opacity: copied ? 1 : 0, transform: copied ? 'none' : 'scale(0.6)' }}
            fill="none"
            aria-hidden
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#1F9D55" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  )
}

/** Dashed tear line with two notches cut into the receipt's sides. */
function Perforation() {
  return (
    <div className="relative h-5">
      <div className="absolute left-0 top-1/2 h-5 w-[11px] -translate-y-1/2 -ml-px overflow-hidden">
        <div className="absolute -left-[10px] top-0 size-5 rounded-full bg-[#FAFAFA] border border-[#EFEFEF]" />
      </div>
      <div className="absolute right-0 top-1/2 h-5 w-[11px] -translate-y-1/2 -mr-px overflow-hidden">
        <div className="absolute -right-[10px] top-0 size-5 rounded-full bg-[#FAFAFA] border border-[#EFEFEF]" />
      </div>
      <img src={PerforationLine} alt="" className="absolute left-4 top-1/2 -translate-y-1/2" />
    </div>
  )
}

function RoundAction({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-2 w-[64px]">
      <span className="size-12 rounded-full bg-white border border-[#EDEDED] flex items-center justify-center transition-transform duration-150 group-active:scale-90">
        <img src={icon} alt="" className="size-[18px]" />
      </span>
      <span className="font-manrope font-semibold text-[12px] leading-[15.6px] text-parkway-grey09">{label}</span>
    </button>
  )
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-[48px] rounded-[8px] bg-parkway-tangerine01 flex items-center justify-center gap-2 font-manrope font-semibold text-[14px] text-white active:scale-[0.98] transition-transform"
    >
      {children}
    </button>
  )
}

/* ── Next steps (spotlight carousel) ─────────────────────────── */

type Card = {
  id: string
  tag?: string
  title: string
  body: string
  icon: string
  cta: string
  doneCta?: string
  toast?: string
}

function nextSteps(data: SuccessData): Card[] {
  const save: Card = {
    id: 'save',
    tag: 'Faster next time',
    title: `Save ${data.recipientFirstName} as a beneficiary`,
    body: 'Skip the account number the next time you send to them.',
    icon: IconUserCircle,
    cta: 'Save beneficiary',
    doneCta: 'Saved',
  }
  const fund: Card = {
    id: 'fund',
    tag: 'New',
    title: 'Fund from your bank accounts',
    body: 'Move money into your Parkway wallet without opening your bank app.',
    icon: TileBank,
    cta: 'Get started',
    toast: 'Bank accounts is coming to this prototype',
  }
  const invoice: Card = {
    id: 'invoice',
    title: 'Pay invoices in seconds',
    body: 'Settle any invoice from your wallet with just its number.',
    icon: TileInvoice,
    cta: 'Try it',
    toast: 'Find it under Transfer, then Invoice',
  }
  const free: Card = {
    id: 'free',
    tag: 'Free',
    title: 'Send to Parkway wallets for free',
    body: 'Instant transfers to any Parkway wallet, with no fees.',
    icon: TileParkway,
    cta: 'Send money',
    toast: 'Find it under Transfer, then Parkway',
  }
  return data.kind === 'invoice' ? [free, fund, invoice] : [save, fund, invoice]
}

function Carousel({ cards, toast, delay }: { cards: Card[]; toast: (m: string) => void; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [done, setDone] = useState<Record<string, boolean>>({})

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    if (!card) return
    const pitch = card.offsetWidth + 12
    setActive(Math.min(cards.length - 1, Math.round(el.scrollLeft / pitch)))
  }

  return (
    <div className="mt-4">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-5 scroll-px-5"
      >
        {cards.map((c, i) => {
          const isDone = !!done[c.id]
          return (
            <div
              key={c.id}
              className="rise-in snap-start shrink-0 w-[296px] rounded-[16px] border border-[#EAEAEA] bg-white p-5 flex flex-col"
              style={d(delay + i * 90)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {c.tag && (
                    <span className="inline-flex h-6 items-center rounded-[6px] bg-parkway-buff04 px-2 font-manrope font-bold text-[11px] text-parkway-tangerine08">
                      {c.tag}
                    </span>
                  )}
                  <p className={`${c.tag ? 'mt-2.5' : ''} font-manrope font-bold text-[17px] leading-[1.3] text-parkway-grey10`}>
                    {c.title}
                  </p>
                </div>
                <div className="size-12 rounded-[14px] bg-parkway-tangerine06 flex items-center justify-center shrink-0">
                  <img src={c.icon} alt="" className="size-6" />
                </div>
              </div>
              <p className="mt-2 font-manrope font-medium text-[14px] leading-[1.45] text-[#666]">{c.body}</p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    if (c.doneCta) setDone((s) => ({ ...s, [c.id]: true }))
                    else if (c.toast) toast(c.toast)
                  }}
                  disabled={isDone}
                  className="relative h-10 min-w-[148px] px-5 rounded-full font-manrope font-bold text-[14px] text-white active:scale-[0.97]"
                  style={{
                    background: isDone ? '#1F9D55' : '#121212',
                    transition: 'background-color 200ms ease, transform 150ms ease',
                  }}
                >
                  {/* Both labels share one slot so the button never changes size. */}
                  <span className="grid place-items-center">
                    <span
                      className="col-start-1 row-start-1 transition-all duration-300"
                      style={{ opacity: isDone ? 0 : 1, transform: isDone ? 'translateY(-6px)' : 'none' }}
                    >
                      {c.cta}
                    </span>
                    <span
                      className="col-start-1 row-start-1 flex items-center gap-1.5 transition-all duration-300"
                      style={{ opacity: isDone ? 1 : 0, transform: isDone ? 'none' : 'translateY(6px)' }}
                      aria-hidden={!isDone}
                    >
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
                        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {c.doneCta}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          )
        })}
        {/* Trailing spacer so the last card can snap with the same inset. */}
        <div className="shrink-0 w-2" aria-hidden />
      </div>
      <div className="rise-in mt-4 flex justify-center gap-1.5" style={d(delay + 300)}>
        {cards.map((c, i) => (
          <span
            key={c.id}
            className="h-1.5 rounded-full"
            style={{
              width: i === active ? 18 : 6,
              background: i === active ? '#121212' : '#D9D9D9',
              transition: 'width 320ms var(--ease-travel), background-color 200ms ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function boldPromo(data: SuccessData) {
  if (data.kind === 'transfer' && !data.isParkwayRecipient) {
    return {
      title: 'Send to Parkway for free',
      body: 'Instant transfers to any Parkway wallet, with no fees.',
      icon: TileParkway,
      toast: 'Find it under Transfer, then Parkway',
    }
  }
  return {
    title: 'Fund from your bank',
    body: 'Top up your wallet without opening your bank app.',
    icon: TileBank,
    toast: 'Bank accounts is coming to this prototype',
  }
}

/* ── Toast ───────────────────────────────────────────────────── */

type ToastState = { msg: string; visible: boolean; id: number }

function useToast() {
  const [state, setState] = useState<ToastState>({ msg: '', visible: false, id: 0 })
  useEffect(() => {
    if (!state.visible) return
    const t = window.setTimeout(() => setState((s) => ({ ...s, visible: false })), 1800)
    return () => window.clearTimeout(t)
  }, [state.visible, state.id])
  return {
    state,
    show: (msg: string) => setState((s) => ({ msg, visible: true, id: s.id + 1 })),
  }
}

function Toast({ state }: { state: ToastState }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-40 flex justify-center px-6" aria-live="polite">
      <div
        className="rounded-full bg-parkway-grey10 px-4 py-2.5 font-manrope font-semibold text-[13px] text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]"
        style={{
          opacity: state.visible ? 1 : 0,
          transform: state.visible ? 'none' : 'translate3d(0,-10px,0) scale(0.96)',
          transition: 'opacity 260ms var(--ease-arrive), transform 360ms var(--ease-arrive)',
        }}
      >
        {state.msg || ' '}
      </div>
    </div>
  )
}

/* ── Formatting ──────────────────────────────────────────────── */

function formatMoney(n: number) {
  return n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}
