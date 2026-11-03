import { useEffect, useMemo, useState } from 'react'
import BottomSheet from './BottomSheet'
import MagnifyingGlass from '../assets/figma/magnifying-glass.svg'

type Props = {
  open: boolean
  title: string
  searchPlaceholder: string
  options: string[]
  selected: string | null
  onClose: () => void
  onPick: (value: string) => void
}

/** Searchable single-choice list in a bottom sheet (same shape as the bank picker). */
export default function OptionPickerSheet({ open, title, searchPlaceholder, options, selected, onClose, onPick }: Props) {
  const [query, setQuery] = useState('')
  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(() => setQuery(''), 320)
      return () => window.clearTimeout(t)
    }
  }, [open])

  const shown = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  )

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="78%">
      <h2 className="font-display font-medium text-[20px] text-parkway-grey01 text-center shrink-0">{title}</h2>

      <div className="mt-4 bg-parkway-grey06 border border-parkway-grey04 rounded-[4px] px-4 py-[14px] flex items-center gap-2.5 shrink-0 focus-within:border-parkway-tangerine01 transition-colors">
        <img src={MagnifyingGlass} alt="" className="size-[14px]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent outline-none font-manrope text-[13px] text-parkway-grey01 placeholder:text-[#999]"
        />
      </div>

      <div className="mt-4 flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2">
        {shown.map((o) => {
          const on = o === selected
          return (
            <button
              key={o}
              type="button"
              onClick={() => { onPick(o); onClose() }}
              className="w-full bg-white border rounded-[8px] px-4 py-3 flex items-center justify-between hover:border-parkway-tangerine01/40 active:scale-[0.995] transition-all"
              style={{ borderColor: on ? '#F9956B' : '#EDEEF2', background: on ? '#FEF5F1' : '#fff' }}
            >
              <span className="font-manrope font-medium text-[14px] text-parkway-grey01 text-left">{o}</span>
              {on && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="animate-soft-in">
                  <path d="M3.5 8.3 6.5 11l6-6.5" stroke="#F9956B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )
        })}
        {shown.length === 0 && (
          <p className="text-center font-manrope text-[13px] text-parkway-grey02 mt-6">No results for “{query}”.</p>
        )}
      </div>
    </BottomSheet>
  )
}
