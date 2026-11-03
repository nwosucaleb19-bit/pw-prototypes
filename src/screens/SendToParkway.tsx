import { useEffect, useRef, useState } from 'react'
import HeaderBar from '../components/HeaderBar'
import ArrowTiny from '../assets/figma/arrow-tiny.svg'
import IconPaste from '../assets/figma/icon-paste.svg'
import IconSpinner from '../assets/figma/icon-spinner.svg'
import IconUserCircle from '../assets/figma/icon-user-circle.svg'
import IconCheckCircle from '../assets/figma/icon-check-circle.svg'
import IconXCircle from '../assets/figma/icon-x-circle.svg'
import ParkwayLogoOrange from '../assets/figma/parkway-logo-orange.svg'
import {
  PARKWAY_RECENTS,
  maskAccount,
  type ParkwayRecipient,
} from '../data/banks'
import type { Recipient } from './Transfer'

type Props = {
  onBack: () => void
  onConfirmRecipient: (r: Recipient) => void
  onOpenSeeAll?: () => void
}

type VerifyPhase = 'idle' | 'verifying' | 'verified' | 'not-found'

const VERIFY_DELAY_MS = 1200

export default function SendToParkway({
  onBack,
  onConfirmRecipient,
  onOpenSeeAll,
}: Props) {
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState<VerifyPhase>('idle')
  const [matched, setMatched] = useState<ParkwayRecipient | null>(null)
  const verifyTimer = useRef<number | null>(null)

  const topRecents = PARKWAY_RECENTS.slice(0, 4)

  // Suggestions appear while the user is still typing (phase is idle, meaning no verify
  // in progress / no result shown). The 10-digit "complete" case triggers verify immediately,
  // so suggestions never clash with that path; for @tag we debounce verify so the suggestions
  // still show for the typing window.
  const suggestions: ParkwayRecipient[] =
    phase === 'idle' && query.length > 0 && !/^\d{10}$/.test(query)
      ? PARKWAY_RECENTS.filter((r) => matchesPrefix(r, query))
      : []

  const clearTimer = () => {
    if (verifyTimer.current !== null) {
      window.clearTimeout(verifyTimer.current)
      verifyTimer.current = null
    }
  }

  useEffect(() => clearTimer, [])

  const triggerVerify = (q: string) => {
    clearTimer()
    setPhase('verifying')
    setMatched(null)
    verifyTimer.current = window.setTimeout(() => {
      const hit = PARKWAY_RECENTS.find((r) => isExactMatch(r, q))
      if (hit) {
        setMatched(hit)
        setPhase('verified')
      } else {
        setPhase('not-found')
      }
    }, VERIFY_DELAY_MS)
  }

  const handleChange = (raw: string) => {
    // Normalize: strip whitespace; keep "@" prefix intact.
    const next = raw.replace(/\s+/g, '').slice(0, 30)
    setQuery(next)
    clearTimer()
    if (phase !== 'idle') {
      setPhase('idle')
      setMatched(null)
    }

    if (/^\d{10}$/.test(next)) {
      // Account-number mode: verify as soon as we have 10 digits.
      triggerVerify(next)
    } else if (next.startsWith('@') && next.length >= 5) {
      // Tag mode: debounce — only verify after the user pauses for 700ms. This leaves room
      // for the suggestions list to show while they're still typing.
      verifyTimer.current = window.setTimeout(() => triggerVerify(next), 700)
    }
  }

  const handleSuggestionTap = (r: ParkwayRecipient) => {
    const token = query.startsWith('@') ? r.parkwayTag : r.fullAccount
    setQuery(token)
    setMatched(r)
    triggerVerify(token)
  }

  const handleTopRecentTap = (r: ParkwayRecipient) => {
    handleSuggestionTap(r)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) handleChange(text)
    } catch {
      /* ignore */
    }
  }

  const canContinue = phase === 'verified' && !!matched

  const handleNext = () => {
    if (!canContinue || !matched) return
    onConfirmRecipient({
      name: matched.name,
      channel: 'Parkway Projects',
      maskedAccount: maskAccount(matched.fullAccount),
      fullAccount: matched.fullAccount,
      bankCode: 'parkway',
    })
  }

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative">
      <HeaderBar title="Send To Parkway Wallet" onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 pt-5 pb-6">
        {/* Recents header */}
        <div className="flex items-center justify-between">
          <h3 className="font-manrope font-semibold text-[14px] text-parkway-grey01">
            Recents
          </h3>
          <button
            type="button"
            onClick={() => onOpenSeeAll?.()}
            className="flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="font-manrope font-semibold text-[14px] text-[#c77756] tracking-[-0.14px]">
              See All
            </span>
            <img src={ArrowTiny} alt="" className="size-[14px] -rotate-90" />
          </button>
        </div>

        {/* Recents row */}
        <div className="mt-4 flex items-start justify-between">
          {topRecents.map((r, i) => (
            <ParkwayAvatarButton key={i} r={r} onClick={() => handleTopRecentTap(r)} />
          ))}
        </div>

        {/* Enter Recipient Account card */}
        <div className="mt-6 bg-white rounded-[12px] p-4 space-y-3">
          <p className="font-manrope font-semibold text-[14px] text-[#1e1e1e] tracking-[-0.28px]">
            Enter Recipient Account
          </p>

          {/* Input */}
          <div className="bg-parkway-grey06 border border-parkway-grey05 rounded-[4px] px-4 py-[14px] flex items-center justify-between">
            <input
              inputMode="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Name, account number or Parkway tag"
              className="flex-1 bg-transparent outline-none font-manrope text-[14px] text-parkway-grey01 placeholder:text-[#C6C6C6] placeholder:text-[11px] caret-parkway-tangerine01"
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

          {/* Verifying */}
          {phase === 'verifying' && (
            <div className="flex items-center gap-1 animate-soft-in">
              <img src={IconSpinner} alt="" className="size-[16px] animate-spin" />
              <p className="font-manrope font-medium text-[12px] text-[#868686]">
                Verifying recipient...
              </p>
            </div>
          )}

          {/* Verified — Parkway uses a GREEN pill (not grey like Bank) */}
          {phase === 'verified' && matched && (
            <div className="bg-[#DCF5E3] rounded-[10px] p-2 flex items-center justify-between animate-soft-in">
              <div className="flex items-center gap-1.5">
                <img src={IconUserCircle} alt="" className="size-[18px]" />
                <p className="font-manrope font-bold text-[12px] text-[#379557] uppercase">
                  {matched.name}
                </p>
              </div>
              <img src={IconCheckCircle} alt="" className="size-[18px]" />
            </div>
          )}

          {/* Not found */}
          {phase === 'not-found' && (
            <div className="bg-[rgba(255,0,0,0.1)] rounded-[10px] p-2 flex items-center gap-1.5 animate-soft-in">
              <img src={IconXCircle} alt="" className="size-[18px]" />
              <p className="font-manrope font-semibold text-[12px] text-parkway-red">
                No account was found
              </p>
            </div>
          )}
        </div>

        {/* Suggestions overlapping below the card while typing */}
        {suggestions.length > 0 && (
          <div className="mt-2 bg-[#f7f7f7] rounded-[12px] p-1.5 space-y-1 animate-soft-in">
            {suggestions.map((s, i) => (
              <SuggestionRow
                key={i}
                suggestion={s}
                query={query}
                onClick={() => handleSuggestionTap(s)}
              />
            ))}
          </div>
        )}
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

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}

// --- helpers ---

function matchesPrefix(r: ParkwayRecipient, prefix: string): boolean {
  const p = prefix.toLowerCase()
  if (p.startsWith('@')) return r.parkwayTag.toLowerCase().startsWith(p)
  if (/^\d+$/.test(p))   return r.fullAccount.startsWith(p)
  return r.name.toLowerCase().startsWith(p)
}

function isExactMatch(r: ParkwayRecipient, v: string): boolean {
  const q = v.toLowerCase()
  return (
    r.fullAccount === q ||
    r.parkwayTag.toLowerCase() === q ||
    r.name.toLowerCase() === q
  )
}

// --- bits ---

function ParkwayAvatarButton({ r, onClick }: { r: ParkwayRecipient; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 w-[60px] active:scale-95 transition-transform"
    >
      <div className="size-8 rounded-full bg-parkway-tangerine01/10 flex items-center justify-center">
        <img src={ParkwayLogoOrange} alt="" className="w-[16px] h-[15px]" />
      </div>
      <p className="font-manrope text-[11px] text-parkway-grey01 text-center truncate w-full">
        {r.name.split(' ')[0]}…
      </p>
    </button>
  )
}

function SuggestionRow({
  suggestion,
  query,
  onClick,
}: {
  suggestion: ParkwayRecipient
  query: string
  onClick: () => void
}) {
  const isAccountMode = /^\d+$/.test(query)
  const isTagMode     = query.startsWith('@')
  const masked = maskAccount(suggestion.fullAccount)

  // Highlight the matched portion of the NAME when searching by name.
  const nameNode = !isAccountMode && !isTagMode
    ? highlightNodes(suggestion.name, query)
    : suggestion.name

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-[8px] px-4 py-3 flex items-center gap-3 active:scale-[0.995] hover:bg-[#fdfdfd] transition-all"
    >
      <div className="size-8 rounded-full bg-parkway-tangerine01/10 flex items-center justify-center shrink-0">
        <img src={ParkwayLogoOrange} alt="" className="w-[16px] h-[15px]" />
      </div>
      <div className="text-left flex-1">
        <p className="font-manrope font-medium text-[13px] text-parkway-grey01 uppercase">
          {nameNode}
        </p>
        <p className="font-manrope font-medium text-[12px] text-parkway-grey02 mt-0.5">
          Parkway Projects ∙ {isAccountMode ? highlightPrefix(masked, query) : masked}
        </p>
      </div>
    </button>
  )
}

function highlightPrefix(masked: string, prefix: string) {
  const len = Math.min(prefix.length, masked.length)
  const head = masked.slice(0, len)
  const tail = masked.slice(len)
  return (
    <>
      <span className="text-[#c77756]">{head}</span>
      <span>{tail}</span>
    </>
  )
}

function highlightNodes(name: string, prefix: string) {
  if (!prefix) return name
  const p = prefix.toLowerCase()
  const lower = name.toLowerCase()
  if (!lower.startsWith(p)) return name
  const head = name.slice(0, prefix.length)
  const tail = name.slice(prefix.length)
  return (
    <>
      <span className="text-[#c77756]">{head}</span>
      <span>{tail}</span>
    </>
  )
}
