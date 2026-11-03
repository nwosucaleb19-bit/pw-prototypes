/**
 * Pure-CSS confetti burst — meant to sit absolutely behind the pulsing success check.
 * ~24 pieces fire outward from the center with staggered rotation + a hint of gravity drift.
 * Palette picks from Parkway tangerine, buff, and the FlowKit greens that match the check.
 */

type Piece = { x: number; y: number; rot: number; color: string; shape: 'rect' | 'dot'; delay: number }

const COLORS = [
  '#F9956B', // tangerine 01
  '#FDD5C4', // tangerine 04
  '#FAF1D2', // buff
  '#FFC700', // warn / gold
  '#29CC6A', // flowkit green
  '#44AC21', // success
  '#C77756', // tangerine 07
  '#1F2937', // dark grey (contrast specks)
]

const PIECES: Piece[] = Array.from({ length: 28 }, (_, i) => {
  // Spread the pieces evenly around a circle, then add tiny jitter so the burst doesn't look mechanical.
  const angle = (i / 28) * Math.PI * 2 + ((i * 37) % 100) / 1000
  const distance = 70 + ((i * 13) % 40) // 70–110 px radius
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rot: (i * 47) % 360,
    color: COLORS[i % COLORS.length],
    shape: i % 3 === 0 ? 'dot' : 'rect',
    delay: ((i * 11) % 180) / 1000, // 0–180 ms stagger
  }
})

/**
 * @param spread multiplies the burst radius (1 suits a ~60px check).
 * @param delay  ms before the first piece fires.
 */
export default function ConfettiBurst({ spread = 1, delay = 0 }: { spread?: number; delay?: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative size-0">
        {PIECES.map((p, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              background: p.color,
              transform: 'translate3d(-50%, -50%, 0) rotate(0deg)',
              animationDelay: `${p.delay + delay / 1000}s`,
              borderRadius: p.shape === 'dot' ? '9999px' : '2px',
              width: p.shape === 'dot' ? 7 : 5,
              height: p.shape === 'dot' ? 7 : 10,
              // Use CSS variables for the final offset / rotation so the keyframe can read them.
              ['--cx' as string]: `${p.x * spread}px`,
              ['--cy' as string]: `${p.y * spread}px`,
              ['--cr' as string]: `${p.rot}deg`,
            }}
          />
        ))}
      </div>
      <style>{`
        .confetti-piece {
          position: absolute;
          left: 0;
          top: 0;
          will-change: transform, opacity;
          opacity: 0;
          animation-name: confettiFly;
          animation-duration: 900ms;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(.18, .72, .35, 1);
        }
        @keyframes confettiFly {
          0% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) rotate(0deg) scale(0.4);
          }
          12% {
            opacity: 1;
          }
          70% {
            opacity: 1;
            transform:
              translate3d(calc(var(--cx) - 50%), calc(var(--cy) - 50%), 0)
              rotate(var(--cr))
              scale(1);
          }
          100% {
            opacity: 0;
            transform:
              translate3d(calc(var(--cx) - 50%), calc(var(--cy) * 1.25 - 50%), 0)
              rotate(calc(var(--cr) + 120deg))
              scale(0.9);
          }
        }
      `}</style>
    </div>
  )
}
