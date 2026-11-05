import { useEffect, useRef, type CSSProperties } from 'react'
import BaseShadow from '../assets/figma/passcode/il-v0.svg'
import BaseBottom from '../assets/figma/passcode/il-v1.svg'
import BaseRim from '../assets/figma/passcode/il-v7.svg'
import TopCap from '../assets/figma/passcode/il-v2.svg'
import TopSide from '../assets/figma/passcode/il-v11.svg'
import LeftCap from '../assets/figma/passcode/il-v6.svg'
import LeftSide from '../assets/figma/passcode/il-v9.svg'
import RightCap from '../assets/figma/passcode/il-v5.svg'
import RightSide from '../assets/figma/passcode/il-v10.svg'
import BottomCap from '../assets/figma/passcode/il-v3.svg'
import BottomSide from '../assets/figma/passcode/il-v8.svg'
import Asterisk from '../assets/figma/passcode/il-asterisk.svg'
import GlintRight from '../assets/figma/passcode/il-v12.svg'
import GlintLeft from '../assets/figma/passcode/il-v13.svg'

/**
 * The four-key passcode illustration from Figma (node 36385:24284), typing
 * a code: the four keys are pressed once each in a random order at an
 * uneven rhythm, a short pause, then the next code.
 *
 * Each key is a side (its darker skirt) and a cap (top face + asterisk).
 * The cap's lower edge traces the skirt's upper edge, so painting the skirt
 * first and sliding the cap down over it reads as the key sinking. Under
 * the cap sits its "well": the cap's own shape in a deeper shade of the
 * key, so the band a sinking cap uncovers is the key's colour, never the
 * black base. Keys are painted back to front (top, left, right, bottom).
 */

type KeyId = 'top' | 'left' | 'right' | 'bottom'

type KeySpec = {
  side: { src: string; inset: string }
  cap: { src: string; inset: string }
  /** The shade shown in the well while the cap is down. */
  well: string
  /** Asterisk wrapper position, as in the design. */
  asterisk: { left: string; right: string; top: number }
}

const KEYS: Record<KeyId, KeySpec> = {
  top: {
    side: { src: TopSide, inset: '34.19% 34.35% 49.49% 34.02%' },
    cap: { src: TopCap, inset: '24.37% 35.87% 56.89% 35.59%' },
    well: '#B65C36',
    asterisk: { left: '43.04%', right: '42.96%', top: 67.77 },
  },
  left: {
    side: { src: LeftSide, inset: '46.79% 53.25% 35.38% 14.9%' },
    cap: { src: LeftCap, inset: '36.96% 54.8% 44.32% 16.74%' },
    well: '#C9CAD5',
    asterisk: { left: '23.91%', right: '62.09%', top: 100.72 },
  },
  right: {
    side: { src: RightSide, inset: '46.77% 15.02% 35.41% 53.09%' },
    cap: { src: RightCap, inset: '36.97% 16.89% 44.29% 54.68%' },
    well: '#C9CAD5',
    asterisk: { left: '62.17%', right: '23.83%', top: 100.72 },
  },
  bottom: {
    side: { src: BottomSide, inset: '59.31% 33.67% 25.49% 33.69%' },
    cap: { src: BottomCap, inset: '49.52% 35.76% 31.75% 35.77%' },
    well: '#968031',
    asterisk: { left: '43.04%', right: '42.96%', top: 133.67 },
  },
}

const ORDER: KeyId[] = ['top', 'left', 'right', 'bottom']

/** How far a cap travels into its well, in px (under half the visible side). */
const DEPTH = 7

/**
 * One press: a quick, firm travel down (feedback is fast), a brief hold at
 * the bottom, then a spring back with a small overshoot that settles.
 */
const PRESS_MS = 560
const PRESS_FRAMES: Keyframe[] = [
  { offset: 0, transform: 'translate3d(0,0,0)', easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
  { offset: 0.17, transform: `translate3d(0,${DEPTH}px,0)` },
  { offset: 0.3, transform: `translate3d(0,${DEPTH}px,0)`, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' },
  { offset: 0.66, transform: 'translate3d(0,-1.2px,0)', easing: 'cubic-bezier(0.4, 0, 0.3, 1)' },
  { offset: 1, transform: 'translate3d(0,0,0)' },
]
/** The cap's face dims slightly while it is down, as if it left the light. */
const SHADE_FRAMES: Keyframe[] = [
  { offset: 0, filter: 'brightness(1)' },
  { offset: 0.17, filter: 'brightness(0.94)' },
  { offset: 0.3, filter: 'brightness(0.94)' },
  { offset: 0.6, filter: 'brightness(1)' },
  { offset: 1, filter: 'brightness(1)' },
]

function shuffled(keys: KeyId[], avoidFirst: KeyId | null): KeyId[] {
  const a = [...keys]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  // Don't open a code on the key that closed the last one.
  if (avoidFirst && a[0] === avoidFirst) [a[0], a[1]] = [a[1], a[0]]
  return a
}

export default function PasscodeIllustration({ startDelay = 900 }: { startDelay?: number }) {
  const capRefs = useRef<Partial<Record<KeyId, HTMLDivElement | null>>>({})
  const faceRefs = useRef<Partial<Record<KeyId, HTMLDivElement | null>>>({})

  useEffect(() => {
    let reduced = false
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      /* ignore */
    }
    if (reduced) return

    const timers: number[] = []
    let lastKey: KeyId | null = null

    const press = (id: KeyId) => {
      capRefs.current[id]?.animate(PRESS_FRAMES, { duration: PRESS_MS })
      faceRefs.current[id]?.animate(SHADE_FRAMES, { duration: PRESS_MS })
    }

    // A code: each key once, random order, uneven spacing. Then a pause.
    const typeCode = () => {
      const code = shuffled(ORDER, lastKey)
      let at = 0
      code.forEach((id) => {
        timers.push(window.setTimeout(() => press(id), at))
        at += 260 + Math.random() * 200
      })
      lastKey = code[code.length - 1]
      timers.push(window.setTimeout(typeCode, at + PRESS_MS + 900 + Math.random() * 500))
    }

    timers.push(window.setTimeout(typeCode, startDelay))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [startDelay])

  return (
    <div className="relative h-[250.561px] w-[286px] overflow-hidden" aria-hidden>
      <Layer src={BaseShadow} inset="24.1% 11.64% 17.35% 11.49%" />
      <Layer src={BaseBottom} inset="53.37% 11.9% 17.65% 11.73%" />
      <Layer src={BaseRim} inset="47.81% 11.94% 22.64% 11.76%" />

      {ORDER.map((id) => {
        const k = KEYS[id]
        return (
          <div key={id} className="absolute inset-0">
            <Layer src={k.side.src} inset={k.side.inset} />
            <Well src={k.cap.src} inset={k.cap.inset} color={k.well} />
            {/* Cap and its asterisk travel together. */}
            <div
              ref={(el) => {
                capRefs.current[id] = el
              }}
              className="absolute inset-0"
              style={{ willChange: 'transform' }}
            >
              <div
                ref={(el) => {
                  faceRefs.current[id] = el
                }}
                className="absolute inset-0"
              >
                <Layer src={k.cap.src} inset={k.cap.inset} />
                <AsteriskMark {...k.asterisk} />
              </div>
            </div>
          </div>
        )
      })}

      <Layer src={GlintRight} inset="35.33% 32.51% 62.24% 64.96%" />
      <Layer src={GlintLeft} inset="35.3% 65.24% 62.27% 32.28%" />
    </div>
  )
}

function Layer({ src, inset }: { src: string; inset: string }) {
  return (
    <div className="absolute" style={{ inset }}>
      <img src={src} alt="" className="absolute inset-0 block size-full max-w-none" />
    </div>
  )
}

/** The cap's own silhouette, filled with the key's deeper shade, sitting in the cap's resting place. */
function Well({ src, inset, color }: { src: string; inset: string; color: string }) {
  const mask = `url("${src}")`
  return (
    <div
      className="absolute"
      style={{
        inset,
        background: color,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
    />
  )
}

/** The asterisk glyph, skewed and rotated onto the cap's top face as in the design. */
function AsteriskMark({ left, right, top }: KeySpec['asterisk']) {
  const wrapper: CSSProperties = {
    left,
    right,
    top,
    aspectRatio: '40.01966206155953 / 27.504752156024665',
    containerType: 'size',
  }
  return (
    <div className="absolute flex items-center justify-center" style={wrapper}>
      <div
        className="flex-none"
        style={{
          width: 'hypot(57.6183cqw, 33.8716cqh)',
          height: 'hypot(-42.3817cqw, 66.1284cqh)',
          transform: 'rotate(22deg) skewX(-21deg)',
        }}
      >
        <div className="relative size-full overflow-clip">
          <div className="absolute inset-[10.94%_14.06%]">
            <img src={Asterisk} alt="" className="absolute inset-0 block size-full max-w-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
