import { useEffect, useMemo, useState } from 'react'
import ArrowDown from './assets/arrow-down.svg'
import HeaderVector from './assets/header-vector.svg'
import UserVector from './assets/user-vector.svg'
import WarningCircle from './assets/warning-circle.svg'
import CheckGroup from './assets/check-group.svg'
import Info from './assets/info.svg'

const WALLET_BALANCE = 2000
const DAILY_LIMIT_REMAINING = 200000
const PRESETS = [500, 1000, 1500, 5000, 10000, 20000]
const REASONS = ['Transfer', 'For Food', 'For Bills'] as const

type Reason = (typeof REASONS)[number]

function formatNaira(value: number) {
  return value.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatLimit(value: number) {
  return value.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function App() {
  const [amount, setAmount] = useState<string>('5000')
  const [amountFocused, setAmountFocused] = useState<boolean>(false)
  const [reason, setReason] = useState<Reason>('Transfer')
  const [description, setDescription] = useState<string>('Transfer')
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [shakePill, setShakePill] = useState<number>(0)
  const [showWarningIcon, setShowWarningIcon] = useState<boolean>(false)

  const numericAmount = useMemo(() => {
    const n = parseFloat(amount.replace(/,/g, ''))
    return Number.isFinite(n) ? n : 0
  }, [amount])

  const overBalance = numericAmount > WALLET_BALANCE
  const canSubmit = numericAmount > 0 && !overBalance

  useEffect(() => {
    if (!overBalance) setShowWarningIcon(false)
  }, [overBalance])

  const triggerLowBalanceFeedback = () => {
    setShowWarningIcon(true)
    setShakePill((n) => n + 1)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([35, 40, 35, 40, 35])
    }
  }

  const handleConfirm = () => {
    if (overBalance) {
      triggerLowBalanceFeedback()
      return
    }
    if (!canSubmit) return
    setSubmitted(true)
  }

  const displayAmount =
    amount === ''
      ? '0.00'
      : formatNaira(numericAmount)

  const amountFieldValue = amountFocused
    ? amount
    : amount === ''
      ? ''
      : formatNaira(numericAmount)

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 no-tap-highlight">
      <div className="relative w-[375px] h-[812px] bg-parkway-bg rounded-[40px] shadow-phone overflow-hidden ring-1 ring-black/5">
        {/* Header */}
        <div className="relative h-[110px] w-full bg-white border-b border-[#E6E6E6] overflow-hidden">
          <img
            src={HeaderVector}
            alt=""
            aria-hidden
            className="pointer-events-none select-none absolute -top-6 -right-10 w-[260px] opacity-80"
          />
          <button
            type="button"
            aria-label="Go back"
            className="absolute left-[10px] top-[61px] size-[28px] rounded-md bg-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <img src={ArrowDown} alt="" className="size-5 rotate-90" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 top-[58px] text-[20px] leading-[1.52] font-display font-semibold text-parkway-grey10 tracking-tightish whitespace-nowrap">
            Send To Parkway Wallet
          </h1>
        </div>

        {/* Body */}
        <div className="absolute left-[20px] top-[142px] w-[335px] flex flex-col gap-[13px]">
          {/* Recipient Card */}
          <section className="bg-white rounded-[12px] px-5 py-4 flex flex-col gap-[11px]">
            <p className="font-jakarta font-semibold text-[14px] leading-none text-[#979797] tracking-[-0.14px]">
              Sending money to
            </p>
            <div className="flex items-center gap-[11px]">
              <div className="relative size-8 rounded-full bg-[#F9956B]/10 flex items-center justify-center">
                <img src={UserVector} alt="" className="w-4 h-[15px]" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-manrope font-semibold text-[14px] text-parkway-grey10 tracking-[-0.14px] uppercase leading-none">
                  Adetula Mabel
                </p>
                <p className="font-manrope font-medium text-[12px] text-[#979797] tracking-[-0.12px] leading-none">
                  2262890261 | Parkway Projects
                </p>
              </div>
            </div>
          </section>

          {/* Amount Card */}
          <section className="bg-white rounded-[12px] pt-[14px] pb-5 px-7 flex flex-col items-center">
            <div className="w-full flex flex-col items-center gap-[23px]">
              <div className="flex flex-col items-center gap-4 w-[148px]">
                <div
                  key={shakePill}
                  className={`flex gap-[6px] items-center px-2 py-1 rounded-[4px] transition-colors ${
                    showWarningIcon ? 'bg-[#FEF5F1]' : 'bg-[#FFC700]/10'
                  } ${shakePill > 0 ? 'animate-balance-shake' : ''}`}
                  style={{ transformOrigin: 'center' }}
                  aria-live="polite"
                >
                  <span className="font-manrope font-medium text-[11px] leading-[1.415] whitespace-nowrap text-parkway-tangerine08">
                    Wallet Balance: ₦{WALLET_BALANCE.toLocaleString('en-NG')}
                  </span>
                  {showWarningIcon && (
                    <img
                      src={WarningCircle}
                      alt=""
                      className="size-[14px] animate-warning-pop"
                    />
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 w-full relative">
                  <p className="font-manrope font-medium text-[11px] text-[#979797] text-center tracking-[-0.11px]">
                    Amount to send
                  </p>
                  <div className="relative flex items-end justify-center">
                    <span className="font-manrope font-bold text-[16px] text-[#979797] tracking-[-0.48px] self-center pr-1">
                      ₦
                    </span>
                    <input
                      inputMode="decimal"
                      value={amountFieldValue}
                      onFocus={() => setAmountFocused(true)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '')
                        setAmount(raw)
                      }}
                      onBlur={() => {
                        setAmountFocused(false)
                        if (amount && !isNaN(Number(amount))) {
                          setAmount(String(Number(amount)))
                        }
                      }}
                      aria-label="Amount to send"
                      className="font-display font-semibold text-[30px] text-parkway-grey09 tracking-[-1.2px] bg-transparent outline-none text-center w-[150px] caret-parkway-tangerine01"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-[#EFEFEF]" />

              {/* Preset grid */}
              <div className="w-full grid grid-cols-3 gap-[13px]">
                {PRESETS.map((p) => {
                  const selected = numericAmount === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(String(p))}
                      className={`h-[33px] rounded-[10px] border font-manrope font-bold text-[12px] tracking-[-0.12px] transition-all active:scale-[0.97] ${
                        selected
                          ? 'border-parkway-tangerine01/60 bg-[#F9956B]/10 text-parkway-tangerine08'
                          : 'border-[#9797974D] bg-white text-[#464646] hover:border-parkway-tangerine01/60'
                      }`}
                    >
                      ₦{p.toLocaleString('en-NG')}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Description Card */}
          <section className="bg-white rounded-[12px] px-4 py-3 flex flex-col gap-2">
            <label
              htmlFor="desc"
              className="font-manrope font-medium text-[12px] text-parkway-grey09 leading-[1.415]"
            >
              Description
            </label>
            <input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#FBFBFB] border border-[#EFEFEF] rounded-[4px] px-4 py-[14px] font-manrope font-medium text-[12px] text-[#1F1F1F] leading-[1.415] outline-none focus:border-parkway-tangerine01/60 transition-colors"
              placeholder="Add a note…"
            />
            <div className="flex gap-[13px] h-[33px]">
              {REASONS.map((r) => {
                const selected = reason === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setReason(r)
                      setDescription(r)
                    }}
                    className={`relative flex-1 h-[33px] rounded-[10px] border font-manrope text-[12px] tracking-[-0.12px] overflow-hidden transition-all active:scale-[0.97] ${
                      selected
                        ? 'border-parkway-tangerine01/40 bg-[#F9956B]/10 text-[#464646] font-medium'
                        : 'border-[#9797974D] bg-white text-[#464646] font-medium hover:border-parkway-tangerine01/60'
                    }`}
                  >
                    {r}
                    {selected && (
                      <img
                        src={CheckGroup}
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute right-0 top-0 h-[21px] w-[28px]"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Info bar */}
          <div className="bg-[#FFC700]/10 rounded-[4px] p-2 flex items-start gap-1">
            <img src={Info} alt="" className="size-[14px] shrink-0 mt-px" />
            <p className="text-[10px] leading-[1.415] font-manrope">
              <span className="text-[#808080] font-normal">
                Your remaining daily transfer limit is{' '}
              </span>
              <span className="text-[#121212] font-semibold">
                ₦{formatLimit(DAILY_LIMIT_REMAINING)}
              </span>
            </p>
          </div>
        </div>

        {/* Confirm button */}
        <button
          type="button"
          aria-disabled={!canSubmit}
          onClick={handleConfirm}
          className={`absolute left-[20px] bottom-[21px] w-[335px] h-[48px] rounded-[8px] font-manrope font-semibold text-[14px] leading-[1.8] transition-all active:scale-[0.98] ${
            canSubmit
              ? 'bg-parkway-tangerine01 text-white shadow-[0_8px_20px_-8px_rgba(249,149,107,0.6)] hover:brightness-105'
              : 'bg-[#FEF5F1] text-parkway-grey03'
          }`}
        >
          {submitted ? 'Sent ✓' : 'Confirm'}
        </button>

        {/* Confirmation flash */}
        {submitted && (
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setSubmitted(false)}
          >
            <div className="bg-white rounded-2xl px-6 py-5 w-[280px] text-center shadow-xl animate-[popIn_0.25s_cubic-bezier(.2,.9,.3,1.2)]">
              <div className="mx-auto mb-3 size-14 rounded-full bg-parkway-tangerine01/15 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-7 text-parkway-tangerine01" fill="none">
                  <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-display font-semibold text-[18px] text-parkway-grey10">
                Transfer confirmed
              </p>
              <p className="font-manrope text-[12px] text-[#979797] mt-1">
                ₦{displayAmount} sent to Adetula Mabel
              </p>
              <button
                className="mt-4 w-full h-10 rounded-lg bg-parkway-tangerine01 text-white font-manrope font-semibold text-[13px]"
                onClick={() => setSubmitted(false)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn {
          0% { transform: scale(.9); opacity: 0 }
          100% { transform: scale(1); opacity: 1 }
        }
        @keyframes balanceShake {
          0%   { transform: translate3d(0,0,0) scale(1); }
          10%  { transform: translate3d(-6px,0,0) scale(1.03); }
          25%  { transform: translate3d(5px,0,0) scale(1.04); }
          40%  { transform: translate3d(-4px,0,0) scale(1.03); }
          55%  { transform: translate3d(3px,0,0) scale(1.02); }
          70%  { transform: translate3d(-2px,0,0) scale(1.01); }
          85%  { transform: translate3d(1px,0,0) scale(1.005); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        .animate-balance-shake {
          animation: balanceShake 520ms cubic-bezier(.36,.07,.19,.97) both;
          will-change: transform;
        }
        @keyframes warningPop {
          0%   { transform: scale(0.4); opacity: 0; }
          55%  { transform: scale(1.25); opacity: 1; filter: drop-shadow(0 0 6px rgba(252,85,85,0.55)); }
          100% { transform: scale(1); opacity: 1; filter: none; }
        }
        .animate-warning-pop {
          animation: warningPop 420ms cubic-bezier(.2,.9,.3,1.2) both;
          transform-origin: center;
        }
      `}</style>
    </div>
  )
}
