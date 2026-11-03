import { useEffect, useRef, useState } from 'react'
import HeaderBar from '../components/HeaderBar'
import IconPaste from '../assets/figma/icon-paste.svg'
import IconSpinner from '../assets/figma/icon-spinner.svg'
import IconCheckCircle from '../assets/figma/icon-check-circle.svg'
import IconXCircle from '../assets/figma/icon-x-circle.svg'
import IconBill from '../assets/figma/icon-bill-regular.svg'
import { findInvoice, type Invoice } from '../data/invoices'

type Phase = 'idle' | 'verifying' | 'verified' | 'not-found' | 'already-paid'

const VERIFY_DELAY_MS = 1200
const WALLET_BALANCE = 4000

type Props = {
  onBack: () => void
  onConfirm: (invoice: Invoice) => void
}

export default function SendToInvoice({ onBack, onConfirm }: Props) {
  const [number, setNumber] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const timer = useRef<number | null>(null)

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  useEffect(() => clearTimer, [])

  const triggerVerify = (num: string) => {
    clearTimer()
    setPhase('verifying')
    setInvoice(null)
    timer.current = window.setTimeout(() => {
      const hit = findInvoice(num)
      if (!hit) {
        setPhase('not-found')
      } else if (hit.status === 'paid') {
        setInvoice(hit)
        setPhase('already-paid')
      } else {
        setInvoice(hit)
        setPhase('verified')
      }
    }, VERIFY_DELAY_MS)
  }

  const handleChange = (raw: string) => {
    // Invoice numbers are digit-only, usually 10 characters.
    const next = raw.replace(/\D/g, '').slice(0, 12)
    setNumber(next)
    clearTimer()
    if (phase !== 'idle') {
      setPhase('idle')
      setInvoice(null)
    }
    if (next.length === 10) triggerVerify(next)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const digits = text.replace(/\D/g, '').slice(0, 12)
      if (digits) handleChange(digits)
    } catch {
      /* ignore */
    }
  }

  const canConfirm = phase === 'verified' && !!invoice

  const handleConfirm = () => {
    if (!canConfirm || !invoice) return
    onConfirm(invoice)
  }

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative">
      <HeaderBar title="Send To Invoice" onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 pt-5 pb-6 space-y-5">
        {/* Enter invoice card */}
        <div className="bg-white rounded-[12px] p-4 space-y-3">
          <p className="font-manrope font-semibold text-[14px] text-[#1e1e1e] tracking-[-0.28px]">
            Enter Invoice Number
          </p>
          <div className="bg-parkway-grey06 border border-parkway-grey05 rounded-[4px] px-4 py-[14px] flex items-center justify-between">
            <input
              inputMode="numeric"
              value={number}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Input invoice number"
              className="flex-1 bg-transparent outline-none font-manrope font-medium text-[14px] text-[#1F1F1F] placeholder:text-[#999] placeholder:text-[11px] tabular-nums caret-parkway-tangerine01"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1 shrink-0 ml-2 active:scale-95 transition-transform"
            >
              <img src={IconPaste} alt="" className="size-[16px]" />
              <span className="font-manrope text-[12px] text-parkway-grey02">Paste</span>
            </button>
          </div>

          {phase === 'verifying' && (
            <div className="flex items-center gap-1 animate-soft-in">
              <img src={IconSpinner} alt="" className="size-[16px] animate-spin" />
              <p className="font-manrope font-medium text-[12px] text-[#868686]">
                Verifying Invoice Number
              </p>
            </div>
          )}

          {phase === 'not-found' && (
            <div className="bg-[rgba(255,0,0,0.1)] rounded-[10px] p-2 flex items-center gap-1.5 animate-soft-in">
              <img src={IconXCircle} alt="" className="size-[18px]" />
              <p className="font-manrope font-semibold text-[12px] text-parkway-red">
                No invoice was found
              </p>
            </div>
          )}

          {phase === 'already-paid' && (
            <div className="bg-[#DCF5E3] rounded-[10px] p-2 flex items-center gap-1.5 animate-soft-in">
              <img src={IconCheckCircle} alt="" className="size-[18px]" />
              <p className="font-manrope font-semibold text-[12px] text-[#379557]">
                This invoice has already been paid
              </p>
            </div>
          )}
        </div>

        {/* Verified → amount + service + buff receipt. Otherwise placeholder info card. */}
        {phase === 'verified' && invoice ? (
          <>
            {/* Amount card */}
            <section className="bg-white rounded-[12px] pt-[14px] pb-5 px-7 flex flex-col items-center animate-soft-in">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center px-2 py-1 rounded-[4px] bg-[#FFC700]/10">
                  <span className="font-manrope font-medium text-[11px] leading-[1.415] whitespace-nowrap text-parkway-tangerine08">
                    Wallet Balance: ₦{WALLET_BALANCE.toLocaleString('en-NG')}
                  </span>
                </div>
                <p className="font-manrope font-medium text-[11px] text-[#979797] text-center tracking-[-0.11px]">
                  Amount to send
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-manrope font-bold text-[16px] tracking-[-0.48px] text-[#979797] self-center">
                    ₦
                  </span>
                  <span className="font-display font-bold text-[30px] tracking-[-1.2px] text-parkway-grey09 tabular-nums">
                    {formatMoney(invoice.amount)}
                  </span>
                </div>
              </div>
            </section>

            {/* Service */}
            <section className="bg-white rounded-[12px] pt-[14px] pb-5 px-4 flex flex-col gap-2 animate-soft-in">
              <p className="font-manrope font-semibold text-[12px] text-[#1F1F1F]">
                Service
              </p>
              <p className="font-manrope font-medium text-[13px] text-[#444] tracking-[-0.13px]">
                {invoice.serviceLabel}
              </p>
            </section>

            {/* Receipt summary */}
            <section className="bg-[#FCF8E8] border border-[#f5f5f5] rounded-[8px] p-4 space-y-2.5 animate-soft-in">
              <Row label="Invoice Number" value={invoice.number} valueClass="text-[#1F2937]" />
              <Row label="Payee Name" value={invoice.payeeName.toUpperCase()} />
              <Row label="Transaction Fee" value="FREE" valueClass="text-[#29CC6A]" />
              <Row label="Service Provider" value={invoice.serviceProvider} />
            </section>
          </>
        ) : (
          <div className="bg-white rounded-[12px] p-4 flex items-center gap-2.5">
            <img src={IconBill} alt="" className="size-5 shrink-0" />
            <p className="font-manrope font-medium text-[13px] text-[#1e1e1e] tracking-[-0.26px]">
              Invoice details appear here once the number is verified. The amount is set by the invoice.
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 px-5 pb-6 pt-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`w-full h-[48px] rounded-[8px] font-manrope font-semibold text-[14px] leading-[1.8] transition-all active:scale-[0.98] ${
            canConfirm
              ? 'bg-parkway-tangerine01 text-white'
              : 'bg-parkway-tangerine06 text-parkway-grey03'
          }`}
        >
          Confirm
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}

function Row({ label, value, valueClass = 'text-parkway-grey01' }: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-manrope font-medium text-[14px] text-[#727272]">
        {label}
      </span>
      <span className={`font-manrope font-bold text-[14px] text-right ${valueClass}`}>
        {value}
      </span>
    </div>
  )
}

function formatMoney(n: number): string {
  return n.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
