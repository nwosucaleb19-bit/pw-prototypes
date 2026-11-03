import { useEffect, useMemo, useState } from 'react'
import MagnifyingGlass from '../assets/figma/magnifying-glass.svg'
import { BANKS, type Bank } from '../data/banks'

type Props = {
  open: boolean
  onClose: () => void
  onPick: (bank: Bank) => void
  matchedCodes?: Bank['code'][]
}

// iOS-ish sheet easing
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
const DURATION_MS = 320

export default function BankPickerSheet({ open, onClose, onPick, matchedCodes = [] }: Props) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Next frame → trigger slide-in. Two rAFs for Safari to commit the initial state first.
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setShown(true))
        return () => cancelAnimationFrame(r2)
      })
      return () => cancelAnimationFrame(r1)
    } else if (mounted) {
      setShown(false)
      const t = window.setTimeout(() => {
        setMounted(false)
        setQuery('')
      }, DURATION_MS)
      return () => window.clearTimeout(t)
    }
  }, [open, mounted])

  const matched = useMemo(
    () => BANKS.filter((b) => matchedCodes.includes(b.code)),
    [matchedCodes],
  )
  const all = useMemo(
    () =>
      BANKS
        .filter((b) => !matchedCodes.includes(b.code))
        .filter((b) => b.name.toLowerCase().includes(query.toLowerCase())),
    [query, matchedCodes],
  )

  if (!mounted) return null

  return (
    <div className="absolute inset-0 z-30">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: shown ? 0.6 : 0,
          transition: `opacity ${DURATION_MS}ms ${EASE}`,
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] px-5 pt-3 pb-10 flex flex-col items-stretch max-h-[75%] will-change-transform"
        style={{
          transform: shown ? 'translate3d(0, 0, 0)' : 'translate3d(0, 100%, 0)',
          transition: `transform ${DURATION_MS}ms ${EASE}`,
          boxShadow: '0 -10px 20px rgba(0,0,0,0.15)',
        }}
      >
        {/* Grabber */}
        <div className="mx-auto h-[5px] w-[36px] rounded-full bg-parkway-grey05 mb-3 shrink-0" />

        <h2 className="font-display font-medium text-[20px] text-parkway-grey01 text-center">
          Select Bank
        </h2>

        <div className="mt-4 bg-parkway-grey06 border border-parkway-grey04 rounded-[4px] px-4 py-[14px] flex items-center gap-2.5 shrink-0">
          <img src={MagnifyingGlass} alt="" className="size-[14px]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter bank name"
            className="flex-1 bg-transparent outline-none font-manrope text-[13px] text-parkway-grey01 placeholder:text-[#999]"
          />
        </div>

        <div className="mt-4 flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2">
          {matched.length > 0 && (
            <>
              <p className="font-manrope font-semibold text-[14px] text-[#1e1e1e] tracking-[-0.28px] mb-2">
                Matched Bank
              </p>
              <div className="space-y-2">
                {matched.map((b) => (
                  <BankRow key={b.code} bank={b} onClick={() => { onPick(b); onClose() }} />
                ))}
              </div>
              <p className="font-manrope font-semibold text-[14px] text-[#1e1e1e] tracking-[-0.28px] mt-4 mb-2">
                All Banks
              </p>
            </>
          )}
          <div className="space-y-2">
            {all.map((b) => (
              <BankRow key={b.code} bank={b} onClick={() => { onPick(b); onClose() }} />
            ))}
          </div>
          {all.length === 0 && matched.length === 0 && (
            <p className="text-center font-manrope text-[13px] text-parkway-grey02 mt-6">
              No banks match “{query}”.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function BankRow({ bank, onClick }: { bank: Bank; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white border border-[#edeef2] rounded-[8px] px-4 py-3 flex items-center gap-4 hover:border-parkway-tangerine01/40 active:scale-[0.995] transition-all"
    >
      <div className="size-8 rounded-full bg-white overflow-hidden flex items-center justify-center border border-parkway-grey05 shrink-0">
        <img src={bank.logo} alt="" className="size-full object-contain p-0.5" />
      </div>
      <span className="font-manrope font-medium text-[14px] text-parkway-grey01 text-left truncate">
        {bank.name}
      </span>
    </button>
  )
}
