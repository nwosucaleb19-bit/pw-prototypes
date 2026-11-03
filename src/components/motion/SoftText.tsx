import { useRef, useState } from 'react'

type Item = { id: number; ch: string; state: 'in' | 'stable' | 'out' }

/**
 * Renders a string one character per span and animates only what changed:
 * typed characters rise softly out of a blur and open their own width,
 * deleted ones close their width as they fade. Unchanged characters never move
 * or re-animate, even when a thousands comma is inserted mid-number.
 *
 * Purely visual: pair it with a real <input> whose text is transparent.
 */
export default function SoftText({ value, className = '' }: { value: string; className?: string }) {
  const nextId = useRef(0)
  const makeItems = (s: string, state: Item['state']) =>
    s.split('').map((ch) => ({ id: nextId.current++, ch, state }))

  const [items, setItems] = useState<Item[]>(() => makeItems(value, 'stable'))
  const [prevValue, setPrevValue] = useState(value)

  // Adjust state during render when the value changes (no extra paint of stale text).
  if (value !== prevValue) {
    setPrevValue(value)
    setItems((current) => diffItems(current, value, (s) => makeItems(s, 'in')))
  }

  const remove = (id: number) => setItems((cur) => cur.filter((i) => i.id !== id))

  return (
    <span aria-hidden className={`whitespace-pre ${className}`}>
      {items.map((it) => (
        <span
          key={it.id}
          className={`soft-char ${it.state === 'in' ? 'soft-char-in' : it.state === 'out' ? 'soft-char-out' : ''}`}
          onAnimationEnd={
            it.state === 'out'
              ? (e) => {
                  if (e.animationName === 'softCharOut') remove(it.id)
                }
              : undefined
          }
        >
          {it.ch}
        </span>
      ))}
    </span>
  )
}

/**
 * Keep the longest common prefix and suffix of the visible text, mark the
 * middle of the old string as leaving and insert the middle of the new one.
 */
function diffItems(items: Item[], next: string, make: (s: string) => Item[]): Item[] {
  const live = items.filter((i) => i.state !== 'out')
  const old = live.map((i) => i.ch).join('')

  let p = 0
  while (p < old.length && p < next.length && old[p] === next[p]) p++
  let s = 0
  while (
    s < old.length - p &&
    s < next.length - p &&
    old[old.length - 1 - s] === next[next.length - 1 - s]
  ) s++

  const removed = new Set(live.slice(p, old.length - s).map((i) => i.id))
  const inserted = make(next.slice(p, next.length - s))
  const suffixStart = old.length - s

  const out: Item[] = []
  let liveIdx = 0
  let placed = false
  for (const it of items) {
    if (it.state === 'out') {
      out.push(it)
      continue
    }
    if (!placed && liveIdx === suffixStart) {
      out.push(...inserted)
      placed = true
    }
    out.push(removed.has(it.id) ? { ...it, state: 'out' } : it)
    liveIdx++
  }
  if (!placed) out.push(...inserted)
  return out
}
