import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import HeaderBar from '../components/HeaderBar'
import StampDutySheet from '../components/StampDutySheet'
import ConfirmationSheet from '../components/ConfirmationSheet'
import NumericKeypad from '../components/NumericKeypad'
import Collapse from '../components/motion/Collapse'
import SoftText from '../components/motion/SoftText'
import { RecipientAvatar, type Recipient } from './Transfer'
import IconInfo from '../assets/figma/icon-info-outline.svg'
import CheckGroup from '../assets/check-group.svg'
import { BANK_BY_CODE } from '../data/banks'

const WALLET_BALANCE = 4000
const DAILY_LIMIT_REMAINING = 200000
const STAMP_DUTY_THRESHOLD = 10000
const STAMP_DUTY_AMOUNT = 50
const SOURCE_ACCOUNT_NO = '0123456789'

const PRESETS = [500, 1000, 2000, 5000, 10000, 20000]
const REASONS = ['Transfer', 'For Food', 'For Bills'] as const

type Reason = (typeof REASONS)[number]

function formatNaira(value: number) {
  return value.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Add thousands commas to the integer part of a raw numeric string ("10000" → "10,000",
// "10000.5" → "10,000.5"). Leaves an unfinished decimal ("10.") intact.
function formatRawWithCommas(raw: string): string {
  if (raw === '') return ''
  const [intPart, decPart] = raw.split('.')
  const int = intPart === '' ? '0' : intPart
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (decPart === undefined) return withCommas
  return `${withCommas}.${decPart}`
}

type Props = {
  recipient: Recipient
  onBack: () => void
  onProceedToPin: (txn: { amount: number; description: string }) => void
}

export default function Send({ recipient, onBack, onProceedToPin }: Props) {
  // Raw digits/decimal the user typed. Display is derived with commas added for the integer part.
  const [amountRaw, setAmountRaw] = useState<string>('')
  // Which preset the user explicitly tapped. Null when they typed anything.
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  // Description is optional and starts empty, so no reason pill is selected by default.
  // A pill is active only while the field text matches it exactly.
  const [description, setDescription] = useState<string>('')
  const [shakeAmount, setShakeAmount] = useState<number>(0)
  const [showStampDuty, setShowStampDuty] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showKeypad, setShowKeypad] = useState(true)
  const [amountInputWidth, setAmountInputWidth] = useState<number>(72)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const amountMirrorRef = useRef<HTMLSpanElement>(null)
  const amountBlockRef = useRef<HTMLDivElement>(null)

  const numericAmount = useMemo(() => {
    const n = parseFloat(amountRaw)
    return Number.isFinite(n) ? n : 0
  }, [amountRaw])

  // What the input/display shows — thousands commas on the integer part.
  const displayAmount = useMemo(() => formatRawWithCommas(amountRaw), [amountRaw])

  // Font size shrinks as the amount gets longer so it keeps fitting the card.
  // "1,000" (5 chars) stays prominent; "10,000" (6) shrinks a notch; six-figure amounts shrink again.
  const amountFontSize = useMemo(() => {
    const chars = (displayAmount || '0.00').length
    if (chars <= 5)  return 36
    if (chars <= 7)  return 30
    if (chars <= 10) return 26
    if (chars <= 13) return 22
    return 20
  }, [displayAmount])

  // Pill is active only when its reason equals the current description text.
  const activeReason = (REASONS as readonly string[]).includes(description)
    ? (description as Reason)
    : null

  const overBalance = numericAmount > WALLET_BALANCE
  const stampDutyActive = numericAmount >= STAMP_DUTY_THRESHOLD
  const canSubmit = numericAmount > 0 && !overBalance

  useEffect(() => {
    if (!overBalance) return
    setShakeAmount((n) => n + 1)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([35, 40, 35, 40, 35])
    }
  }, [numericAmount, overBalance])

  // Replay the shake on the same element (no remount, so typed characters
  // keep their identity and the input keeps focus).
  useEffect(() => {
    if (shakeAmount === 0) return
    amountBlockRef.current?.animate(
      [
        { transform: 'translate3d(0,0,0)' },
        { transform: 'translate3d(-8px,0,0)', offset: 0.1 },
        { transform: 'translate3d(7px,0,0)', offset: 0.25 },
        { transform: 'translate3d(-6px,0,0)', offset: 0.4 },
        { transform: 'translate3d(4px,0,0)', offset: 0.55 },
        { transform: 'translate3d(-3px,0,0)', offset: 0.7 },
        { transform: 'translate3d(2px,0,0)', offset: 0.85 },
        { transform: 'translate3d(0,0,0)' },
      ],
      { duration: 520, easing: 'cubic-bezier(.36,.07,.19,.97)' },
    )
  }, [shakeAmount])

  // Autofocus the amount input on mount so the keypad is "active by default".
  useEffect(() => {
    const t = window.setTimeout(() => {
      amountInputRef.current?.focus()
    }, 50)
    return () => window.clearTimeout(t)
  }, [])

  // Measure the current amount text so the input width hugs its content and the ₦ sign
  // sits flush next to the digits instead of across a wide, half-empty box.
  // IMPORTANT: use offsetWidth (layout box, pre-transform) rather than
  // getBoundingClientRect().width — the phone frame applies a CSS transform scale, and
  // rect dimensions come back post-transform. With the scaled value we'd set a too-small
  // width in content pixels and the right-hand digits would clip when the browser is small.
  useLayoutEffect(() => {
    if (amountMirrorRef.current) {
      const w = amountMirrorRef.current.offsetWidth
      // +12px safety margin: leaves room for the caret and avoids subpixel-rounded clipping
      // of the right digit (webkit occasionally rounds down).
      setAmountInputWidth(Math.max(42, Math.ceil(w) + 12))
    }
  }, [displayAmount, amountFontSize])

  const commitAmountFromKeypad = (nextRaw: string) => {
    setAmountRaw(nextRaw)
    setSelectedPreset(null)
    amountInputRef.current?.focus()
  }

  const handleKeypadDigit = (d: string) => {
    // Strip a leading zero when the user types a non-zero digit next (so "0" + "5" becomes "5").
    const base = amountRaw === '0' && d !== '.' ? '' : amountRaw
    const next = (base + d).slice(0, 15)
    commitAmountFromKeypad(next)
  }

  const handleKeypadDecimal = () => {
    if (amountRaw.includes('.')) return
    commitAmountFromKeypad(amountRaw === '' ? '0.' : amountRaw + '.')
  }

  const handleKeypadBackspace = () => {
    commitAmountFromKeypad(amountRaw.slice(0, -1))
  }

  const handlePresetTap = (p: number) => {
    setAmountRaw(String(p))
    setSelectedPreset(p)
  }

  const handleReasonTap = (r: Reason) => {
    setDescription(r)
  }

  // Click-outside dismiss. Any pointerdown outside the input or the keypad
  // closes the keypad; the keypad buttons prevent the input blur themselves.
  useEffect(() => {
    if (!showKeypad) return
    const handler = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      const input = amountInputRef.current
      const keypad = document.getElementById('amount-keypad')
      if (input?.contains(target)) return
      if (keypad?.contains(target)) return
      // The Confirm button acts on the first tap. Closing the keypad on its
      // pointerdown would slide the button away mid-press and swallow the click.
      if (document.getElementById('amount-confirm')?.contains(target)) return
      setShowKeypad(false)
      amountInputRef.current?.blur()
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [showKeypad])

  const handleConfirm = () => {
    if (!canSubmit) return
    setShowConfirmation(true)
  }

  const handleProceed = (_saveAsBeneficiary: boolean) => {
    setShowConfirmation(false)
    onProceedToPin({
      amount: numericAmount,
      description: description.trim(),
    })
  }

  const headerTitle =
    recipient.bankCode === 'parkway' ? 'Send To Parkway Wallet' : 'Send To Bank'

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative">
      <HeaderBar title={headerTitle} onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 pt-4 pb-3 flex flex-col gap-3">
        {/* Recipient Card */}
        <section className="bg-white rounded-[12px] px-5 py-4 flex flex-col gap-[11px]">
          <p className="font-jakarta font-semibold text-[14px] leading-none text-[#979797] tracking-[-0.14px]">
            Sending money to
          </p>
          <div className="flex items-center gap-[11px]">
            <RecipientAvatar bankCode={recipient.bankCode} size={24} />
            <div className="flex flex-col gap-1">
              <p className="font-manrope font-semibold text-[14px] text-parkway-grey10 tracking-[-0.14px] uppercase leading-none">
                {recipient.name}
              </p>
              <p className="font-manrope font-medium text-[12px] text-[#979797] tracking-[-0.12px] leading-none">
                {recipient.fullAccount} • {bankDisplayName(recipient)}
              </p>
            </div>
          </div>
        </section>

        {/* Amount Card */}
        <section className="bg-white rounded-[12px] pt-[14px] pb-5 px-7 flex flex-col items-center">
          <div className="w-full flex flex-col items-center gap-[23px]">
            <div className="flex flex-col items-center gap-4">
              <div
                className="flex items-center px-2 py-1 rounded-[4px] bg-[#FFC700]/10"
                aria-live="polite"
              >
                <span className="font-manrope font-medium text-[11px] leading-[1.415] whitespace-nowrap text-parkway-tangerine08">
                  Wallet Balance: ₦{WALLET_BALANCE.toLocaleString('en-NG')}
                </span>
              </div>
              <div
                ref={amountBlockRef}
                className="flex flex-col items-center w-full relative"
                style={{ transformOrigin: 'center' }}
              >
                <p className="mb-2 font-manrope font-medium text-[11px] text-[#979797] text-center tracking-[-0.11px]">
                  Amount to send
                </p>
                {/* The digits are the centered box; the ₦ hangs off their left edge
                    so the amount reads centered to the eye. */}
                <div
                  className="relative inline-flex items-center font-display font-bold tracking-[-1.2px]"
                  style={{
                    fontSize: amountFontSize,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    color: overBalance ? '#D94141' : numericAmount === 0 ? '#979797' : '#444444',
                    transition: 'font-size 260ms var(--ease-arrive), color 200ms ease',
                  }}
                >
                  <span
                    aria-hidden
                    className={`absolute right-full top-1/2 -translate-y-1/2 pr-1 font-manrope font-bold text-[16px] tracking-[-0.48px] transition-colors ${
                      overBalance ? 'text-[#D94141]/70' : 'text-[#979797]'
                    }`}
                  >
                    ₦
                  </span>
                  {/* Mirror span used only to measure text width so the input hugs its content */}
                  <span
                    ref={amountMirrorRef}
                    aria-hidden
                    className="invisible absolute left-[-9999px] whitespace-pre font-display font-bold tracking-[-1.2px]"
                    style={{
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: amountFontSize,
                      lineHeight: 1,
                    }}
                  >
                    {displayAmount || '0.00'}
                  </span>
                  <input
                    ref={amountInputRef}
                    inputMode="decimal"
                    value={displayAmount}
                    onFocus={() => setShowKeypad(true)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9.]/g, '')
                      setAmountRaw(raw)
                      setSelectedPreset(null)
                    }}
                    aria-label="Amount to send"
                    aria-invalid={overBalance}
                    aria-describedby={overBalance ? 'amount-error' : undefined}
                    // The real input keeps focus, caret and native typing; its text is
                    // transparent and the soft characters below draw the value.
                    className="bg-transparent outline-none text-left caret-parkway-tangerine01 selection:bg-parkway-tangerine01/20"
                    style={{
                      lineHeight: 1,
                      // Inputs reset font-variant; match the soft characters so the caret lines up.
                      fontVariantNumeric: 'tabular-nums',
                      width: amountInputWidth,
                      color: 'transparent',
                      transition: 'width 260ms var(--ease-arrive)',
                    }}
                  />
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                    <SoftText value={displayAmount} />
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre text-[#979797]"
                    style={{
                      opacity: displayAmount ? 0 : 1,
                      filter: displayAmount ? 'blur(4px)' : 'blur(0)',
                      transform: displayAmount ? 'translate3d(0,-0.12em,0)' : 'none',
                      transition: 'opacity 200ms var(--ease-arrive), filter 200ms ease, transform 260ms var(--ease-arrive)',
                    }}
                  >
                    0.00
                  </span>
                </div>
                <Collapse open={overBalance} duration={260}>
                  <p
                    id="amount-error"
                    className="pt-2 font-manrope font-medium text-[11px] text-[#D94141] text-center tracking-[-0.11px] whitespace-nowrap"
                  >
                    Amount entered exceeds balance
                  </p>
                </Collapse>
              </div>
            </div>
            <div className="w-full h-px bg-[#EFEFEF]" />

            {/* Preset grid */}
            <div className="w-full grid grid-cols-3 gap-[13px]">
              {PRESETS.map((p) => {
                const selected = selectedPreset === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePresetTap(p)}
                    className={`relative h-[33px] rounded-[10px] border font-manrope font-bold text-[12px] tracking-[-0.12px] overflow-hidden transition-all active:scale-[0.97] ${
                      selected
                        ? 'border-parkway-tangerine01/40 bg-[#F9956B]/10 text-[#464646]'
                        : 'border-[#9797974D] bg-white text-[#464646] hover:border-parkway-tangerine01/60'
                    }`}
                  >
                    ₦{p.toLocaleString('en-NG')}
                    <ChipCheck on={selected} />
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
            Description <span className="text-[#ABABAB]">(Optional)</span>
          </label>
          <input
            id="desc"
            value={description}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#FBFBFB] border border-[#EFEFEF] rounded-[4px] px-4 py-[14px] font-manrope font-medium text-[12px] text-[#1F1F1F] leading-[1.415] outline-none focus:border-parkway-tangerine01/60 transition-colors"
            placeholder="Enter description"
          />
          <div className="flex gap-[13px] h-[33px]">
            {REASONS.map((r) => {
              const selected = activeReason === r
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleReasonTap(r)}
                  className={`relative flex-1 h-[33px] rounded-[10px] border font-manrope font-medium text-[12px] tracking-[-0.12px] overflow-hidden transition-all active:scale-[0.97] ${
                    selected
                      ? 'border-parkway-tangerine01/40 bg-[#F9956B]/10 text-[#464646]'
                      : 'border-[#9797974D] bg-white text-[#464646] hover:border-parkway-tangerine01/60'
                  }`}
                >
                  {r}
                  <ChipCheck on={selected} />
                </button>
              )
            })}
          </div>
        </section>

        {/* Info bar: stamp duty (conditional) + daily limit */}
        <div className="bg-[#FFC700]/10 rounded-[8px] p-2 flex flex-col">
          <Collapse open={stampDutyActive} duration={280}>
            <div className="flex items-start gap-1 pb-1.5">
              <img src={IconInfo} alt="" className="size-[14px] shrink-0 mt-px" />
              <p className="text-[10px] leading-[1.415] font-manrope">
                <span className="text-[#808080] font-normal">
                  Stamp Duty (Government Levy) is{' '}
                </span>
                <span className="text-[#121212] font-semibold">
                  ₦{STAMP_DUTY_AMOUNT.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowStampDuty(true)}
                  className="ml-1 text-parkway-tangerine01 font-semibold underline underline-offset-2"
                >
                  Why?
                </button>
              </p>
            </div>
          </Collapse>
          <div className="flex items-start gap-1">
            <img src={IconInfo} alt="" className="size-[14px] shrink-0 mt-px" />
            <p className="text-[10px] leading-[1.415] font-manrope">
              <span className="text-[#808080] font-normal">
                Your remaining daily transfer limit is{' '}
              </span>
              <span className="text-[#121212] font-semibold">
                ₦{formatNaira(DAILY_LIMIT_REMAINING)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <div className="shrink-0 px-5 pb-4 pt-3">
        <button
          id="amount-confirm"
          type="button"
          aria-disabled={!canSubmit}
          onClick={handleConfirm}
          onMouseDown={(e) => e.preventDefault()}
          className={`w-full h-[48px] rounded-[8px] font-manrope font-semibold text-[14px] leading-[1.8] transition-all active:scale-[0.98] ${
            canSubmit
              ? 'bg-parkway-tangerine01 text-white hover:brightness-105'
              : 'bg-[#FEF5F1] text-parkway-grey03'
          }`}
        >
          Confirm
        </button>
      </div>

      {/* Numeric keypad — visible by default; click-outside dismisses it */}
      {/* Stays mounted: it slides down and gives its room back as one motion,
          and rises the same way when the amount is tapped again. */}
      <div
        className="grid shrink-0"
        style={{
          gridTemplateRows: showKeypad ? '1fr' : '0fr',
          transition: 'grid-template-rows 380ms var(--ease-nav)',
        }}
        inert={!showKeypad}
        aria-hidden={!showKeypad}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            id="amount-keypad"
            style={{
              transform: showKeypad ? 'none' : 'translate3d(0,40%,0)',
              opacity: showKeypad ? 1 : 0.6,
              transition: 'transform 380ms var(--ease-nav), opacity 300ms ease',
            }}
          >
            <NumericKeypad
              onDigit={handleKeypadDigit}
              onDecimal={handleKeypadDecimal}
              onBackspace={handleKeypadBackspace}
            />
          </div>
        </div>
      </div>

      <StampDutySheet
        open={showStampDuty}
        onClose={() => setShowStampDuty(false)}
      />

      <ConfirmationSheet
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        recipient={recipient}
        amount={numericAmount}
        description={description.trim()}
        fullAccount={recipient.fullAccount}
        bankCode={recipient.bankCode}
        sourceAccountNo={SOURCE_ACCOUNT_NO}
        onConfirm={handleProceed}
      />

    </div>
  )
}

/** The corner check on a selected chip: grows from its corner, leaves the same way. */
function ChipCheck({ on }: { on: boolean }) {
  return (
    <img
      src={CheckGroup}
      alt=""
      aria-hidden
      className="pointer-events-none absolute top-0 right-0 h-[20.8px] w-[28.5px]"
      style={{
        opacity: on ? 1 : 0,
        transform: on ? 'scale(1)' : 'scale(0.4)',
        transformOrigin: 'top right',
        transition: on
          ? 'opacity 160ms ease, transform 320ms var(--ease-pop)'
          : 'opacity 140ms ease, transform 200ms var(--ease-arrive)',
      }}
    />
  )
}

function bankDisplayName(r: Recipient): string {
  if (r.bankCode === 'parkway') return 'Parkway Projects'
  return BANK_BY_CODE[r.bankCode].name + (r.bankCode === 'zenith' ? ' PLC' : '')
}
