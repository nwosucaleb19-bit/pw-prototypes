import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import BottomSheet from './BottomSheet'

export type StatusTone = 'warning' | 'error'

type Props = {
  open: boolean
  tone: StatusTone
  title: string
  body: string
  retryLabel?: string
  backLabel?: string
  onRetry: () => void
  onBack: () => void
  /** Bump to shake the sheet (e.g. a retry that failed again). */
  shakeKey?: number
  /** Render into this element instead of in place (to cover the whole screen). */
  host?: HTMLElement | null
}

const TONE: Record<StatusTone, string> = { warning: '#FFA200', error: '#F50000' }

/** Failure / blocked-state sheet: alert mark, message, Retry and Go Back. */
export default function StatusSheet({
  open, tone, title, body, retryLabel = 'Retry', backLabel = 'Go Back', onRetry, onBack, shakeKey, host,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!shakeKey) return
    ref.current?.animate(
      [
        { transform: 'translate3d(0,0,0)' },
        { transform: 'translate3d(-7px,0,0)' },
        { transform: 'translate3d(6px,0,0)' },
        { transform: 'translate3d(-4px,0,0)' },
        { transform: 'translate3d(0,0,0)' },
      ],
      { duration: 380, easing: 'cubic-bezier(.36,.07,.19,.97)' },
    )
    if ('vibrate' in navigator) navigator.vibrate([35, 40, 35])
  }, [shakeKey])

  const sheet = (
    <BottomSheet open={open} onClose={onBack} dismissOnBackdrop={false} showGrabber={false} padding="px-5 pt-[30px] pb-10">
      <div ref={ref} className="flex flex-col items-center text-center">
        <span
          key={open ? 'on' : 'off'}
          className="size-11 rounded-full flex items-center justify-center"
          style={{ background: TONE[tone], animation: 'markPop 420ms var(--ease-pop) 160ms both' }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path d="M11 5v7.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="11" cy="16.6" r="1.6" fill="#fff" />
          </svg>
        </span>
        <h2 className="mt-3 font-manrope font-bold text-[18px] leading-[1.4] text-[#1F2937]">{title}</h2>
        <p className="mt-2 max-w-[300px] font-manrope font-medium text-[12px] leading-[1.4] text-[#6B7280] whitespace-pre-line">{body}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-[30px] w-full h-12 rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform"
      >
        {retryLabel}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="mt-2 w-full h-12 rounded-[8px] bg-white border border-parkway-grey03 font-manrope font-semibold text-[14px] text-parkway-grey01 active:scale-[0.98] transition-transform"
      >
        {backLabel}
      </button>
    </BottomSheet>
  )
  return host ? createPortal(sheet, host) : sheet
}
