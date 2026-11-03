import { useEffect, useState } from 'react'

type Props = {
  /** Already formatted, e.g. "5,000.00". Digits roll; separators stay still. */
  value: string
  /** Delay before the roll starts, in ms. */
  delay?: number
  className?: string
}

/**
 * An odometer: every digit rolls up from zero to its value, the last digit
 * first, on a long soft settle. Commas and the decimal point never move.
 */
export default function RollingNumber({ value, delay = 0, className = '' }: Props) {
  const [go, setGo] = useState(false)
  const [settled, setSettled] = useState(false)

  const chars = value.split('')
  const digitCount = chars.filter((c) => /\d/.test(c)).length

  useEffect(() => {
    const t = window.setTimeout(() => setGo(true), delay)
    // Longest digit: (900 + n·60)ms of travel after an n·45ms stagger.
    const longest = 900 + (digitCount - 1) * 105
    const s = window.setTimeout(() => setSettled(true), delay + longest + 60)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(s)
    }
  }, [delay, digitCount])

  // The soft edge mask only exists while digits travel; at rest the amount is crisp.
  const mask = settled
    ? undefined
    : 'linear-gradient(to bottom, transparent 0, #000 18%, #000 82%, transparent 100%)'
  let digitIndex = 0

  return (
    <span className={`inline-flex tabular-nums ${className}`}>
      <span className="sr-only">{value}</span>
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={i} aria-hidden className="inline-block">
              {ch}
            </span>
          )
        }
        const d = Number(ch)
        // Last digit first: stagger from the right.
        const order = digitCount - 1 - digitIndex++
        return (
          <span
            key={i}
            aria-hidden
            className="relative inline-block overflow-hidden"
            style={{
              height: '1.15em',
              lineHeight: '1.15em',
              // Soft top and bottom edges so moving digits don't slice on a hard line.
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          >
            {/* Invisible copy holds the width of the final digit. */}
            <span className="invisible">{ch}</span>
            <span
              className="absolute left-0 top-0 flex flex-col"
              style={{
                transform: `translate3d(0, ${go ? -d * 1.15 : 0}em, 0)`,
                transition: `transform ${900 + order * 60}ms var(--ease-arrive) ${order * 45}ms`,
              }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} style={{ height: '1.15em' }}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}
