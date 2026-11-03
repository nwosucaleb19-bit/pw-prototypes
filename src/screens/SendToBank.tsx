import { useEffect, useRef, useState } from 'react'
import HeaderBar from '../components/HeaderBar'
import BankPickerSheet from '../components/BankPickerSheet'
import WeakNetworkSheet from '../components/WeakNetworkSheet'
import BadNetworkSheet from '../components/BadNetworkSheet'
import ArrowTiny from '../assets/figma/arrow-tiny.svg'
import IconPaste from '../assets/figma/icon-paste.svg'
import IconBroadcast from '../assets/figma/icon-broadcast.svg'
import IconBroadcastWeak from '../assets/figma/icon-broadcast-weak.svg'
import IconBroadcastBad from '../assets/figma/icon-broadcast-bad.svg'
import IconWarningMini from '../assets/figma/icon-warning-circle-mini.svg'
import CaretRight from '../assets/figma/caret-right.svg'
import IconSpinner from '../assets/figma/icon-spinner.svg'
import IconUserCircle from '../assets/figma/icon-user-circle.svg'
import IconCheckCircle from '../assets/figma/icon-check-circle.svg'
import IconXCircle from '../assets/figma/icon-x-circle.svg'
import IconChangeArrow from '../assets/figma/icon-change-arrow.svg'
import ArrowSmall from '../assets/figma/arrow-small.svg'
import ParkwayLogoOrange from '../assets/figma/parkway-logo-orange.svg'
import {
  BANK_BY_CODE,
  RECENT_HISTORY,
  maskAccount,
  type Bank,
  type BankCode,
  type FullRecipient,
} from '../data/banks'
import type { Recipient } from './Transfer'

type Props = {
  onBack: () => void
  onConfirmRecipient: (r: Recipient) => void
  onOpenSuccessMonitor: () => void
  onOpenSeeAll: () => void
}

type VerifyPhase = 'idle' | 'matching-bank' | 'matched-bank' | 'verifying' | 'verified' | 'not-found'

const VERIFY_DELAY_MS = 1500
const MATCH_DELAY_MS  = 1200

// Banks whose network currently has issues (demo flags).
const WEAK_NETWORK_BANKS: ReadonlyArray<BankCode> = ['access']
const BAD_NETWORK_BANKS:  ReadonlyArray<BankCode> = ['kuda']

// When the user types a brand-new 10-digit account, these are the banks the
// system "guesses" could match — the top of the picker list.
const MATCHED_BANK_SUGGESTIONS: ReadonlyArray<BankCode> = ['zenith', 'wema']

export default function SendToBank({
  onBack,
  onConfirmRecipient,
  onOpenSuccessMonitor,
  onOpenSeeAll,
}: Props) {
  const [account, setAccount] = useState('')
  const [bank, setBank] = useState<Bank | null>(null)
  const [phase, setPhase] = useState<VerifyPhase>('idle')
  const [verifiedName, setVerifiedName] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [showWeakSheet, setShowWeakSheet] = useState(false)
  const [showBadSheet, setShowBadSheet] = useState(false)
  const verifyTimer = useRef<number | null>(null)

  const topRecents = RECENT_HISTORY.slice(0, 4)

  // Suggestions appear while typing (1-9 digits) and match the prefix
  const suggestions: FullRecipient[] =
    account.length > 0 && account.length < 10
      ? RECENT_HISTORY.filter((r) => r.fullAccount.startsWith(account))
      : []

  const clearTimer = () => {
    if (verifyTimer.current !== null) {
      window.clearTimeout(verifyTimer.current)
      verifyTimer.current = null
    }
  }

  const triggerVerify = (acc: string, _b: Bank) => {
    clearTimer()
    setPhase('verifying')
    setVerifiedName(null)
    verifyTimer.current = window.setTimeout(() => {
      if (acc.endsWith('0000') || acc.startsWith('99')) {
        setPhase('not-found')
      } else {
        const match = RECENT_HISTORY.find((r) => r.fullAccount === acc)
        setVerifiedName(match?.name ?? 'Adetula Mabel')
        setPhase('verified')
      }
    }, VERIFY_DELAY_MS)
  }

  useEffect(() => clearTimer, [])

  const handleAccountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    setAccount(digits)
    clearTimer()
    if (phase !== 'idle') {
      setPhase('idle')
      setVerifiedName(null)
    }
    if (digits.length === 10) {
      if (bank) {
        triggerVerify(digits, bank)
      } else {
        // No bank selected yet. First check if the number is in the known history;
        // if so, auto-fill the bank and verify. Otherwise show the "Matching Bank…"
        // loading state briefly, then expose the Matched Bank picker.
        const historyHit = RECENT_HISTORY.find((r) => r.fullAccount === digits)
        if (historyHit) {
          const b = BANK_BY_CODE[historyHit.bank]
          setBank(b)
          triggerVerify(digits, b)
        } else {
          setPhase('matching-bank')
          verifyTimer.current = window.setTimeout(() => {
            setPhase('matched-bank')
          }, MATCH_DELAY_MS)
        }
      }
    }
  }

  const handleSuggestionTap = (r: FullRecipient) => {
    const b = BANK_BY_CODE[r.bank]
    setAccount(r.fullAccount)
    setBank(b)
    triggerVerify(r.fullAccount, b)
  }

  const handleTopRecentTap = (r: FullRecipient) => {
    handleSuggestionTap(r)
  }

  const handlePickBank = (b: Bank) => {
    setBank(b)
    if (account.length === 10) triggerVerify(account, b)
  }

  const handleMatchedBankTap = (code: BankCode) => {
    const b = BANK_BY_CODE[code]
    setBank(b)
    triggerVerify(account, b)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const digits = text.replace(/\D/g, '').slice(0, 10)
      if (digits) handleAccountChange(digits)
    } catch {
      /* ignore */
    }
  }

  const confirmRecipient = () => {
    if (phase !== 'verified' || !bank || !verifiedName) return
    onConfirmRecipient({
      name: verifiedName,
      channel: bank.name,
      maskedAccount: maskAccount(account),
      fullAccount: account,
      bankCode: bank.code,
    })
  }

  const isWeak = !!bank && WEAK_NETWORK_BANKS.includes(bank.code)
  const isBad  = !!bank && BAD_NETWORK_BANKS.includes(bank.code)
  const verified = phase === 'verified' && !!bank && !!verifiedName
  // Weak banks can proceed (after confirming the sheet). Bad banks are blocked.
  const canContinue = verified && !isBad

  const handleNext = () => {
    if (!verified) return
    if (isBad)  { setShowBadSheet(true);  return }
    if (isWeak) { setShowWeakSheet(true); return }
    confirmRecipient()
  }

  // Picker's matched-codes = banks that share the typed prefix.
  const prefixMatchedCodes = Array.from(
    new Set(
      RECENT_HISTORY.filter((r) =>
        account.length > 0 ? r.fullAccount.startsWith(account.slice(0, 4)) : false,
      ).map((r) => r.bank),
    ),
  )

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative">
      <HeaderBar title="Send To Bank" onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 pt-5 pb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-manrope font-semibold text-[14px] text-parkway-grey01">
            Recents
          </h3>
          <button
            type="button"
            onClick={onOpenSeeAll}
            className="flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="font-manrope font-semibold text-[14px] text-[#c77756] tracking-[-0.14px]">
              See All
            </span>
            <img src={ArrowTiny} alt="" className="size-[14px] -rotate-90" />
          </button>
        </div>
        <div className="mt-4 flex items-start justify-between">
          {topRecents.map((r, i) => (
            <RecentAvatar key={i} r={r} onClick={() => handleTopRecentTap(r)} />
          ))}
        </div>

        {/* Account input + verification states */}
        <div className="mt-6 bg-white rounded-[12px] p-4 space-y-3">
          <p className="font-manrope font-semibold text-[14px] text-[#1e1e1e] tracking-[-0.28px]">
            Enter Recipient Account
          </p>

          {/* Input */}
          <div className="bg-parkway-grey06 border border-parkway-grey05 rounded-[4px] px-4 py-[14px] flex items-center justify-between">
            <input
              inputMode="numeric"
              maxLength={10}
              value={account}
              onChange={(e) => handleAccountChange(e.target.value)}
              placeholder="Enter Account Number"
              className="flex-1 bg-transparent outline-none font-manrope text-[14px] text-parkway-grey01 placeholder:text-[#999] placeholder:text-[11px] tabular-nums caret-parkway-tangerine01"
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

          {/* Matching Bank… spinner — plays briefly before the matched-bank list appears */}
          {phase === 'matching-bank' && (
            <div className="flex items-center gap-1 animate-soft-in">
              <img src={IconSpinner} alt="" className="size-[16px] animate-spin" />
              <p className="font-manrope font-medium text-[12px] text-[#868686]">
                Matching Bank...
              </p>
            </div>
          )}

          {/* Matched Bank selector (10 digits typed, no bank yet, not in history) */}
          {phase === 'matched-bank' && (
            <div className="space-y-2 animate-soft-in">
              <p className="font-manrope font-semibold text-[14px] text-[#1e1e1e] tracking-[-0.28px]">
                Matched Bank
              </p>
              {MATCHED_BANK_SUGGESTIONS.map((code) => (
                <MatchedBankRow
                  key={code}
                  bank={BANK_BY_CODE[code]}
                  onClick={() => handleMatchedBankTap(code)}
                />
              ))}
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-0.5 py-2 active:scale-95 transition-transform"
              >
                <span className="font-manrope font-semibold text-[14px] text-parkway-tangerine01 tracking-[-0.14px]">
                  Bank Not Listed
                </span>
                <img src={ArrowSmall} alt="" className="size-[14px] -rotate-90" />
              </button>
            </div>
          )}

          {/* Verifying */}
          {phase === 'verifying' && (
            <div className="flex items-center gap-1 animate-soft-in">
              <img src={IconSpinner} alt="" className="size-[16px] animate-spin" />
              <p className="font-manrope font-medium text-[12px] text-[#868686]">
                Verifying recipient...
              </p>
            </div>
          )}

          {/* Verified card */}
          {verified && (
            <>
              <div className="bg-parkway-grey06 rounded-[10px] p-3 space-y-3 animate-soft-in">
                <BankLine bank={bank!} onChange={() => setShowPicker(true)} />
                <div className="h-px bg-parkway-grey05" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <img src={IconUserCircle} alt="" className="size-[18px]" />
                    <p className="font-manrope font-bold text-[12px] text-parkway-grey09 uppercase">
                      {verifiedName}
                    </p>
                  </div>
                  <img src={IconCheckCircle} alt="" className="size-[18px]" />
                </div>
              </div>
              {isWeak && (
                <div className="flex items-center gap-1 pt-1.5 animate-soft-in">
                  <img src={IconBroadcastWeak} alt="" className="size-[18px]" />
                  <p className="font-manrope font-medium text-[11px] text-[#AA8500] tracking-[-0.22px]">
                    Weak Network from Bank
                  </p>
                </div>
              )}
              {isBad && (
                <button
                  type="button"
                  onClick={() => setShowBadSheet(true)}
                  className="flex items-center gap-2 pt-1.5 active:scale-95 transition-transform animate-soft-in"
                >
                  <div className="flex items-center gap-1">
                    <img src={IconBroadcastBad} alt="" className="size-[18px]" />
                    <p className="font-manrope font-medium text-[11px] text-parkway-red tracking-[-0.22px]">
                      Bad Network from Bank
                    </p>
                  </div>
                  <img src={IconWarningMini} alt="More info" className="size-[14px]" />
                </button>
              )}
            </>
          )}

          {/* Not found */}
          {phase === 'not-found' && bank && (
            <div className="bg-parkway-grey06 rounded-[10px] p-3 space-y-3 animate-soft-in">
              <BankLine bank={bank} onChange={() => setShowPicker(true)} />
              <div className="h-px bg-parkway-grey05" />
              <div className="flex items-center gap-1.5">
                <img src={IconXCircle} alt="" className="size-[18px]" />
                <p className="font-manrope font-semibold text-[12px] text-parkway-red">
                  No account was found
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions below input while typing (1-9 digits) */}
        {suggestions.length > 0 && phase === 'idle' && (
          <div className="mt-2 bg-[#f7f7f7] rounded-[12px] p-1.5 space-y-1 animate-soft-in">
            {suggestions.map((s, i) => (
              <SuggestionRow
                key={i}
                suggestion={s}
                prefix={account}
                onClick={() => handleSuggestionTap(s)}
              />
            ))}
          </div>
        )}

        {/* Success rate monitor */}
        <button
          type="button"
          onClick={onOpenSuccessMonitor}
          className="mt-3 w-full bg-white rounded-[12px] p-4 flex items-center justify-between hover:bg-[#fdfdfd] active:scale-[0.998] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <img src={IconBroadcast} alt="" className="size-5" />
            <span className="font-manrope font-medium text-[13px] text-[#1e1e1e] tracking-[-0.26px]">
              Transfer Success Rate Monitor
            </span>
          </div>
          <img src={CaretRight} alt="" className="size-[14px]" />
        </button>
      </div>

      {/* Next button */}
      <div className="shrink-0 px-5 pb-6 pt-3">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className={`w-full h-[48px] rounded-[8px] font-manrope font-semibold text-[14px] leading-[1.8] transition-all active:scale-[0.98] ${
            canContinue
              ? 'bg-parkway-tangerine01 text-white'
              : 'bg-parkway-tangerine06 text-parkway-grey03'
          }`}
        >
          Next
        </button>
      </div>

      <BankPickerSheet
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onPick={handlePickBank}
        matchedCodes={prefixMatchedCodes.length > 0 ? prefixMatchedCodes : [...MATCHED_BANK_SUGGESTIONS]}
      />

      <WeakNetworkSheet
        open={showWeakSheet}
        onClose={() => setShowWeakSheet(false)}
        bankName={bank?.name ?? ''}
        onProceed={() => {
          setShowWeakSheet(false)
          confirmRecipient()
        }}
      />

      <BadNetworkSheet
        open={showBadSheet}
        onClose={() => setShowBadSheet(false)}
        bankName={bank?.name ?? ''}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}

function BankLine({ bank, onChange }: { bank: Bank; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="size-[18px] rounded-full bg-white overflow-hidden flex items-center justify-center">
          <img src={bank.logo} alt="" className="size-full object-contain" />
        </div>
        <p className="font-manrope font-bold text-[12px] text-parkway-grey09 uppercase">
          {bank.name}
        </p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="flex items-center gap-0.5 active:scale-95 transition-transform"
      >
        <span className="font-manrope font-semibold text-[12px] text-parkway-tangerine01 tracking-[-0.12px]">
          Change
        </span>
        <img src={IconChangeArrow} alt="" className="size-[13px] -rotate-90" />
      </button>
    </div>
  )
}

function MatchedBankRow({ bank, onClick }: { bank: Bank; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-[#F6F6F6] rounded-[8px] px-4 py-3 flex items-center gap-3 hover:bg-[#f0f0f0] active:scale-[0.995] transition-all"
    >
      <div className="size-7 rounded-full bg-white border border-parkway-grey05 overflow-hidden flex items-center justify-center shrink-0">
        <img src={bank.logo} alt="" className="size-full object-contain p-0.5" />
      </div>
      <span className="font-manrope font-medium text-[13px] text-parkway-grey01">
        {bank.name}
      </span>
    </button>
  )
}

function RecentAvatar({ r, onClick }: { r: FullRecipient; onClick: () => void }) {
  const bank = BANK_BY_CODE[r.bank]
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 w-[60px] active:scale-95 transition-transform"
    >
      {r.bank === 'tajbank' ? (
        <div className="size-8 rounded-full bg-white overflow-hidden flex items-center justify-center border border-parkway-grey05">
          <img src={bank.logo} alt="" className="size-full object-contain p-0.5" />
        </div>
      ) : r.bank === 'zenith' || r.bank === 'wema' || r.bank === 'access' || r.bank === 'kuda' ? (
        <div className="size-8 rounded-full bg-white overflow-hidden flex items-center justify-center border border-parkway-grey05">
          <img src={bank.logo} alt="" className="size-full object-contain p-0.5" />
        </div>
      ) : (
        <div className="size-8 rounded-full bg-parkway-tangerine01/15 flex items-center justify-center">
          <img src={ParkwayLogoOrange} alt="" className="w-[16px] h-[15px]" />
        </div>
      )}
      <p className="font-manrope text-[11px] text-parkway-grey01 text-center truncate w-full">
        {r.name.split(' ')[0]}…
      </p>
    </button>
  )
}

function SuggestionRow({
  suggestion,
  prefix,
  onClick,
}: {
  suggestion: FullRecipient
  prefix: string
  onClick: () => void
}) {
  const bank = BANK_BY_CODE[suggestion.bank]
  const masked = maskAccount(suggestion.fullAccount)
  const highlightLen = Math.min(prefix.length, masked.length)
  const head = masked.slice(0, highlightLen)
  const tail = masked.slice(highlightLen)
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-[8px] px-4 py-3 flex items-center gap-3 active:scale-[0.995] hover:bg-[#fdfdfd] transition-all"
    >
      <div className="size-7 rounded-full bg-white overflow-hidden flex items-center justify-center border border-parkway-grey05 shrink-0">
        <img src={bank.logo} alt="" className="size-full object-contain p-0.5" />
      </div>
      <div className="text-left flex-1">
        <p className="font-manrope font-medium text-[13px] text-parkway-grey01">
          {suggestion.name}
        </p>
        <p className="font-manrope font-medium text-[12px] text-parkway-grey02 mt-0.5">
          {bank.name} ∙{' '}
          <span className="text-[#c77756]">{head}</span>
          <span>{tail}</span>
        </p>
      </div>
    </button>
  )
}
