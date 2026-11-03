import type { ReactNode } from 'react'
import BottomSheet from './BottomSheet'

type Props = {
  open: boolean
  onClose: () => void
  onProceed: () => void
}

const TIPS: { title: string; body: string; icon: ReactNode }[] = [
  { title: 'Use good lightning', body: 'Find a place with good lighting.', icon: <SunIcon /> },
  { title: 'No head or face coverings', body: 'Don’t wear glasses, hats, masks, or anything covering your face.', icon: <NoCoverIcon /> },
  { title: 'Keep your face visible', body: 'Stay still and make sure your face is clear in the picture.', icon: <FaceFrameIcon /> },
]

/** "Let's verify it's you": what to do before the liveness camera opens. */
export default function LivenessTipsSheet({ open, onClose, onProceed }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} showGrabber={false} padding="px-5 pt-8 pb-6" maxHeight="92%">
      <div className="flex flex-col items-center text-center">
        <ScanPersonIcon />
        <h2 className="mt-4 font-display font-medium text-[22px] leading-[1.1] text-parkway-grey01">Let’s verify it’s you</h2>
        <p className="mt-3 max-w-[290px] font-manrope font-medium text-[12px] leading-[1.35] text-[#6B7280]">
          We want to keep your account safe! Please help us confirm that you are the owner.
        </p>
      </div>

      <div className="mt-[30px] px-2 space-y-3">
        {TIPS.map((t, i) => (
          <div
            key={t.title}
            className="rounded-[8px] border border-parkway-grey05 bg-parkway-grey06 px-4 py-3 min-h-[80px] flex items-center gap-5 rise-in"
            style={{ ['--d' as string]: `${200 + i * 70}ms` }}
          >
            <span className="size-11 shrink-0 rounded-full bg-parkway-buff04 flex items-center justify-center">{t.icon}</span>
            <span>
              <span className="block font-manrope font-bold text-[14px] leading-5 text-parkway-grey01">{t.title}</span>
              <span className="block mt-1 font-manrope font-medium text-[12px] leading-4 text-parkway-grey09">{t.body}</span>
            </span>
          </div>
        ))}
        <div className="rounded-[8px] border border-parkway-grey05 bg-parkway-grey06 p-2 flex gap-1.5 rise-in" style={{ ['--d' as string]: '420ms' }}>
          <ShieldIcon />
          <p className="font-manrope font-medium text-[10px] leading-[14px] text-parkway-grey02">
            The photos we capture will be used solely for verification purposes.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onProceed}
        className="mt-[26px] w-full h-12 rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform"
      >
        Proceed
      </button>
    </BottomSheet>
  )
}

const INK = '#E5B800'

function SunIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="5.5" stroke={INK} strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="16" y1="3.5" x2="16" y2="6.5" stroke={INK} strokeWidth="2" strokeLinecap="round" transform={`rotate(${a} 16 16)`} />
      ))}
    </svg>
  )
}

function NoCoverIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="11" stroke={INK} strokeWidth="2" />
      <path d="M9 18c2.5 1.5 4.5 2 7 2s4.5-.5 7-2" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 13.5h4M18 13.5h4" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="25" x2="25" y2="7" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FaceFrameIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path d="M1 7V4a3 3 0 0 1 3-3h3M19 1h3a3 3 0 0 1 3 3v3M25 19v3a3 3 0 0 1-3 3h-3M7 25H4a3 3 0 0 1-3-3v-3" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="13" cy="13" r="6.5" stroke={INK} strokeWidth="1.8" />
      <circle cx="10.6" cy="12" r="0.9" fill={INK} />
      <circle cx="15.4" cy="12" r="0.9" fill={INK} />
      <path d="M10.8 15.2c1.3 1 3.1 1 4.4 0" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0 mt-px">
      <path d="M7 1 2 2.8v3.6c0 3 2.1 5.4 5 6.6 2.9-1.2 5-3.6 5-6.6V2.8z" fill="#F9956B" />
      <path d="m4.8 7 1.5 1.5L9.3 5.6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ScanPersonIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path d="M2 10V6a4 4 0 0 1 4-4h4M34 2h4a4 4 0 0 1 4 4v4M42 34v4a4 4 0 0 1-4 4h-4M10 42H6a4 4 0 0 1-4-4v-4" stroke="#F9956B" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 40c1-6.5 6.5-10 13-10s12 3.5 13 10" fill="#FDD5C4" stroke="#F9956B" strokeWidth="2" />
      <circle cx="22" cy="18" r="7.5" fill="#FDD5C4" stroke="#F9956B" strokeWidth="2" />
      <path d="M14.5 17c2-4.5 5-6.5 8-6.5s6 2 7.5 6.5" stroke="#F9956B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
