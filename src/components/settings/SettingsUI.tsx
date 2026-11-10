import type { CSSProperties, ReactNode } from 'react'
import LoginHeaderArc from '../LoginHeaderArc'
import { BackButton, TopArc } from '../../onboarding/ui'
import IconBack from '../../assets/figma/settings/back-arrow.svg'
import IconChevron from '../../assets/figma/settings/chevron.svg'

/**
 * The More / Security screen shell (Figma 36652:14503, 36652:14441): a white
 * header band with the yellow arc, a centred title and (on pushed pages) a
 * back arrow, over a scrolling list. Design coordinates include a 44px
 * status bar, which the prototype draws separately, so everything sits 44px
 * higher here.
 */
export function SettingsScreen({
  title,
  onBack,
  children,
  footer,
  overlay,
}: {
  title: string
  /** Omit on a tab (More), which has the bottom nav instead. */
  onBack?: () => void
  children: ReactNode
  /** Pinned under the list, e.g. the bottom nav. */
  footer?: ReactNode
  /** Rendered over the screen, e.g. a toast. */
  overlay?: ReactNode
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-parkway-grey06 flex flex-col">
      <div className="mt-[66px] flex-1 min-h-0 overflow-y-auto hide-scrollbar">
        <div className="w-[335px] mx-auto pt-[30px] pb-8">{children}</div>
      </div>
      {footer}

      <header className="absolute left-0 right-0 top-[-44px] z-10 h-[110px] overflow-hidden border-b border-[#E6E6E6] bg-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[110px] w-[375px] -translate-x-1/2 overflow-hidden">
          <LoginHeaderArc />
        </div>
        <h1 className="absolute inset-x-0 top-[60px] text-center font-display font-medium text-[20px] leading-[1.52] text-parkway-grey01">
          {title}
        </h1>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="absolute left-[10px] top-[61px] size-[28px] flex items-center justify-center rounded-[2px] bg-white active:opacity-60"
          >
            <img src={IconBack} alt="" width={20} height={20} className="size-5 rotate-90" />
          </button>
        )}
      </header>

      {overlay}
    </div>
  )
}

/**
 * Header for the passcode-reset steps: the onboarding arc and back button,
 * with the flow's name where the logo would be, and (for multi-step checks)
 * a segmented progress bar.
 */
export function FlowHeader({ title, onBack, step = 0, steps = 0 }: { title: string; onBack: () => void; step?: number; steps?: number }) {
  return (
    <div className="relative shrink-0">
      <TopArc className="-top-[54px]" />
      <div className="relative h-[60px] flex items-center justify-center">
        <div className="absolute left-[14px] top-1/2 -translate-y-1/2">
          <BackButton onClick={onBack} />
        </div>
        <p className="font-manrope font-bold text-[14px] leading-normal text-parkway-grey01">{title}</p>
      </div>
      {steps > 1 && (
      <div className="relative mx-auto mt-1.5 w-[335px] flex gap-1.5" aria-label={`Step ${step} of ${steps}`}>
        {Array.from({ length: steps }, (_, i) => (
          <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-parkway-grey05">
            <span
              className="block h-full rounded-full bg-parkway-tangerine01"
              style={{
                transformOrigin: 'left',
                transform: i < step ? 'none' : 'scaleX(0)',
                // The newest segment fills as the step arrives.
                animation: i === step - 1 ? 'segmentFill 520ms var(--ease-arrive) 120ms both' : undefined,
              }}
            />
          </span>
        ))}
      </div>
      )}
      <style>{'@keyframes segmentFill { from { transform: scaleX(0); } to { transform: none; } }'}</style>
    </div>
  )
}

const CARD =
  'w-full h-[61.289px] px-4 py-3 flex items-center gap-2 rounded-[8px] border border-[#F5F5F5] bg-white text-left transition-[transform,background-color] duration-150 active:scale-[0.985] active:bg-[#FAFAFA]'

/** Entrance stagger for list cards. */
export const riseDelay = (i: number): CSSProperties => ({ ['--d' as string]: `${Math.min(i, 10) * 28}ms` })

export function Chevron() {
  return <img src={IconChevron} alt="" width={16} height={16} className="size-4 shrink-0 -rotate-90" />
}

/** A tappable card: icon, label, and whatever sits on the right (a chevron by default). */
export function SettingsRow({
  icon,
  label,
  trailing = <Chevron />,
  onClick,
  style,
  labelClassName = 'font-medium text-parkway-grey01',
  checked,
}: {
  icon?: ReactNode
  label: string
  trailing?: ReactNode
  onClick?: () => void
  style?: CSSProperties
  labelClassName?: string
  /** Set for a row that toggles; it then reads as a switch. */
  checked?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={checked === undefined ? undefined : 'switch'}
      aria-checked={checked}
      className={`${CARD} rise-in`}
      style={style}
    >
      {icon}
      <span className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className={`font-manrope text-[14px] leading-normal whitespace-nowrap ${labelClassName}`}>{label}</span>
        {trailing}
      </span>
    </button>
  )
}

export function RowIcon({ src }: { src: string }) {
  return <img src={src} alt="" width={24} height={24} className="size-6 shrink-0" />
}

/**
 * On/off switch. Off is drawn as in Figma (white track, grey outline, dark
 * knob on the left); on fills the track tangerine and slides the knob over.
 */
export function SettingsToggle({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className="relative h-5 w-10 shrink-0 rounded-[10px] border transition-colors duration-200"
      style={{ background: on ? '#F9956B' : '#FFFFFF', borderColor: on ? '#F9956B' : '#999999' }}
    >
      <span
        className="absolute left-[2px] top-[2px] size-[14px] rounded-[9.5px]"
        style={{
          background: on ? '#FFFFFF' : '#121212',
          transform: on ? 'translateX(20px)' : 'none',
          transition: 'transform 260ms var(--ease-pop), background-color 200ms ease',
        }}
      />
    </span>
  )
}
