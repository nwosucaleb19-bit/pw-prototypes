import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  theme?: 'light' | 'dark'
}

export function StatusBar({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const fg = theme === 'light' ? '#000' : '#fff'
  return (
    <div
      className="relative h-[54px] w-full flex items-center justify-between px-[30px] shrink-0 pt-[14px] select-none"
      style={{ color: fg }}
    >
      <span className="font-manrope font-semibold text-[16px] tracking-tightish tabular-nums">
        9:41
      </span>
      <div className="absolute left-1/2 -translate-x-1/2 top-[11px] h-[37px] w-[126px] rounded-[20px] bg-black" />
      <div className="flex items-center gap-[6px]">
        {/* Signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
          <rect x="0.5" y="7.5" width="3" height="4" rx="0.6" fill={fg} />
          <rect x="5" y="5" width="3" height="6.5" rx="0.6" fill={fg} />
          <rect x="9.5" y="2.5" width="3" height="9" rx="0.6" fill={fg} />
          <rect x="14" y="0" width="3" height="11.5" rx="0.6" fill={fg} />
        </svg>
        {/* Wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden>
          <path d="M8.5 2C11.6 2 14.4 3.1 16.5 4.8l-1.4 1.6C13.3 5 11 4.1 8.5 4.1S3.7 5 1.9 6.4L0.5 4.8C2.6 3.1 5.4 2 8.5 2z" fill={fg} />
          <path d="M8.5 5.5c2 0 3.9.7 5.3 1.9l-1.4 1.5c-1.1-.9-2.4-1.4-3.9-1.4s-2.8.5-3.9 1.4L3.2 7.4C4.6 6.2 6.5 5.5 8.5 5.5z" fill={fg} />
          <circle cx="8.5" cy="10" r="1.5" fill={fg} />
        </svg>
        {/* Battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.6" stroke={fg} strokeOpacity="0.5" />
          <rect x="2" y="2" width="19" height="8" rx="1.4" fill={fg} />
          <rect x="23.5" y="4" width="1.6" height="4" rx="0.6" fill={fg} fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  )
}

export function HomeIndicator({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const color = theme === 'light' ? 'bg-black' : 'bg-white'
  return (
    <div className="h-[34px] w-full flex items-end justify-center pb-[8px] shrink-0">
      <div className={`h-[5px] w-[134px] rounded-full ${color}`} />
    </div>
  )
}

export default function PhoneFrame({ children, theme = 'light' }: Props) {
  return (
    <div className="relative" style={{ width: 415, height: 874 }}>
      <div
        className="absolute inset-0 rounded-[62px] bg-[#1b1b1d]"
        style={{
          boxShadow:
            '0 50px 90px -30px rgba(0,0,0,0.55), 0 24px 48px -24px rgba(0,0,0,0.35), inset 0 0 0 2px #2a2a2d',
        }}
      />
      {/* Side buttons */}
      <div className="absolute left-[-2px] top-[160px] h-[32px] w-[3px] rounded-l-sm bg-[#101013]" />
      <div className="absolute left-[-2px] top-[220px] h-[56px] w-[3px] rounded-l-sm bg-[#101013]" />
      <div className="absolute left-[-2px] top-[296px] h-[56px] w-[3px] rounded-l-sm bg-[#101013]" />
      <div className="absolute right-[-2px] top-[220px] h-[90px] w-[3px] rounded-r-sm bg-[#101013]" />

      {/* Screen bezel */}
      <div
        className="absolute rounded-[55px] overflow-hidden bg-black"
        style={{ inset: 11 }}
      >
        {/* Actual screen */}
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ background: theme === 'dark' ? '#000' : '#fafafa' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
