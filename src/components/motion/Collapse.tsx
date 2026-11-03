import type { CSSProperties, ReactNode } from 'react'

type Props = {
  open: boolean
  children: ReactNode
  /** Duration of the height change in ms. */
  duration?: number
  className?: string
  /** Extra transform for the content while closed, e.g. 'translateY(-4px)'. */
  from?: string
}

/**
 * Opens and closes its own height so neighbours make room continuously,
 * instead of content popping in and shoving the layout. The content stays
 * mounted, so it can fade out as gracefully as it faded in.
 */
export default function Collapse({
  open,
  children,
  duration = 300,
  className = '',
  from = 'translate3d(0,-4px,0)',
}: Props) {
  const outer: CSSProperties = {
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    transition: `grid-template-rows ${duration}ms var(--ease-arrive)`,
  }
  // Content fades after the room opens and before the room closes,
  // so a moving edge never slices through text.
  const inner: CSSProperties = {
    opacity: open ? 1 : 0,
    transform: open ? 'none' : from,
    filter: open ? 'blur(0)' : 'blur(2px)',
    transition: open
      ? `opacity ${duration}ms var(--ease-arrive) ${duration * 0.25}ms, transform ${duration}ms var(--ease-arrive) ${duration * 0.25}ms, filter ${duration}ms var(--ease-arrive) ${duration * 0.25}ms`
      : `opacity ${duration * 0.6}ms var(--ease-arrive), transform ${duration * 0.6}ms var(--ease-arrive), filter ${duration * 0.6}ms var(--ease-arrive)`,
  }
  return (
    <div style={outer} className={className} aria-hidden={!open} inert={!open}>
      <div className="min-h-0 overflow-hidden">
        <div style={inner}>{children}</div>
      </div>
    </div>
  )
}
