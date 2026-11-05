import type { ReactNode, RefObject } from 'react'
import DotEmpty from '../../assets/figma/passcode/dot-empty.svg'
import DotFilled from '../../assets/figma/passcode/dot-filled.svg'
import DotError from '../../assets/figma/passcode/dot-error.svg'
import IconBackspace from '../../assets/figma/passcode/backspace.svg'

/** Shared by passcode setup and passcode login. */
export const PASSCODE_LENGTH = 6

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

/** Shake a row of dots side to side, as for a wrong entry. */
export function shake(el: HTMLElement | null) {
  el?.animate(
    [
      { transform: 'translate3d(0,0,0)' },
      { transform: 'translate3d(-8px,0,0)' },
      { transform: 'translate3d(7px,0,0)' },
      { transform: 'translate3d(-5px,0,0)' },
      { transform: 'translate3d(3px,0,0)' },
      { transform: 'translate3d(0,0,0)' },
    ],
    { duration: 420, easing: 'cubic-bezier(.36,.07,.19,.97)' },
  )
}

/** A short double buzz for an error, where the device supports it. */
export function buzzError() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([35, 40, 35])
}

/**
 * Six dots. Filled dots pop in orange. On an error the fill turns the
 * ring's red while the row shakes, then empties, leaving red rings.
 */
export function PasscodeDots({
  count,
  error,
  dotsRef,
}: {
  count: number
  error: boolean
  dotsRef?: RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={dotsRef} className="flex gap-4" role="status" aria-label={`${count} of ${PASSCODE_LENGTH} digits entered`}>
      {Array.from({ length: PASSCODE_LENGTH }, (_, i) => {
        const filled = i < count
        return (
          <span key={i} className="relative size-[15px]">
            {/* Orange and red rings crossfade. */}
            <span className="absolute inset-[-6.67%]">
              <img src={DotEmpty} alt="" className="absolute inset-0 block size-full max-w-none" />
              <img
                src={DotError}
                alt=""
                className="absolute inset-0 block size-full max-w-none transition-opacity duration-200"
                style={{ opacity: error ? 1 : 0 }}
              />
            </span>
            {/* The fill */}
            <span
              className="absolute inset-0"
              style={{
                opacity: filled ? 1 : 0,
                transform: filled ? 'scale(1)' : 'scale(0.3)',
                transition: filled
                  ? 'opacity 120ms ease, transform 260ms var(--ease-pop)'
                  : 'opacity 180ms ease, transform 220ms var(--ease-arrive)',
              }}
            >
              <img src={DotFilled} alt="" className="absolute inset-0 block size-full max-w-none" />
              <span
                className="absolute inset-0 rounded-full bg-[#FC5555] transition-opacity duration-150"
                style={{ opacity: error ? 1 : 0 }}
              />
            </span>
          </span>
        )
      })}
    </div>
  )
}

/**
 * The round 3×4 keypad. The bottom-left slot is empty unless `leftSlot`
 * is given (passcode login puts Face ID there).
 */
export function PasscodeKeypad({
  onDigit,
  onBackspace,
  showBackspace,
  leftSlot,
  disabled = false,
  className = '',
}: {
  onDigit: (d: string) => void
  onBackspace: () => void
  showBackspace: boolean
  leftSlot?: ReactNode
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={`grid grid-cols-[repeat(3,68px)] gap-8 ${className}`} aria-disabled={disabled || undefined}>
      {DIGITS.map((k) => (
        <Key key={k} label={k} onPress={() => onDigit(k)} disabled={disabled} />
      ))}
      <span className="flex items-center justify-center">{leftSlot}</span>
      <Key label="0" onPress={() => onDigit('0')} disabled={disabled} />
      <button
        type="button"
        onClick={onBackspace}
        aria-label="Delete last digit"
        disabled={!showBackspace || disabled}
        className="size-[59px] self-center justify-self-center rounded-[8px] flex items-center justify-center active:bg-[#F0F0F0] active:scale-[0.94]"
        style={{
          opacity: showBackspace ? 1 : 0,
          transform: showBackspace ? undefined : 'scale(0.85)',
          transition: 'opacity 200ms ease, transform 260ms var(--ease-arrive), background-color 150ms ease',
        }}
      >
        <img src={IconBackspace} alt="" className="size-8" />
      </button>
    </div>
  )
}

function Key({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className="size-[68px] rounded-full bg-[#F0F0F0] font-manrope font-bold text-[20px] leading-normal text-parkway-grey01 active:scale-[0.94] active:bg-[#E6E6E6] transition-[transform,background-color] duration-150"
    >
      {label}
    </button>
  )
}
