import IconBackspace from '../assets/figma/icon-backspace.svg'

type Props = {
  onDigit: (d: string) => void
  onDecimal: () => void
  onBackspace: () => void
}

type Key = { kind: 'digit'; value: string } | { kind: 'decimal' } | { kind: 'back' } | { kind: 'empty' }

const KEYS: Key[] = [
  { kind: 'digit', value: '1' }, { kind: 'digit', value: '2' }, { kind: 'digit', value: '3' },
  { kind: 'digit', value: '4' }, { kind: 'digit', value: '5' }, { kind: 'digit', value: '6' },
  { kind: 'digit', value: '7' }, { kind: 'digit', value: '8' }, { kind: 'digit', value: '9' },
  { kind: 'decimal' },           { kind: 'digit', value: '0' }, { kind: 'back' },
]

export default function NumericKeypad({ onDigit, onDecimal, onBackspace }: Props) {
  const noBlur = (e: React.MouseEvent) => e.preventDefault()

  return (
    <div className="shrink-0 bg-[#D1D5DB]/70 backdrop-blur-sm px-2 pt-2 pb-5">
      <div className="grid grid-cols-3 gap-1.5">
        {KEYS.map((k, i) => {
          if (k.kind === 'empty') return <div key={i} />
          if (k.kind === 'back') {
            return (
              <button
                key={i}
                type="button"
                onMouseDown={noBlur}
                onClick={onBackspace}
                aria-label="Delete"
                className="h-[44px] rounded-[6px] flex items-center justify-center active:bg-black/5 active:scale-[0.97] transition-[transform,background-color] duration-100"
              >
                <img src={IconBackspace} alt="" className="size-6" />
              </button>
            )
          }
          if (k.kind === 'decimal') {
            return (
              <button
                key={i}
                type="button"
                onMouseDown={noBlur}
                onClick={onDecimal}
                aria-label="Decimal"
                className="h-[44px] rounded-[6px] bg-white font-manrope font-bold text-[22px] text-parkway-grey01 shadow-[0_1px_0_rgba(0,0,0,0.08)] active:bg-[#EFEFEF] active:scale-[0.97] transition-[transform,background-color] duration-100"
              >
                .
              </button>
            )
          }
          return (
            <button
              key={i}
              type="button"
              onMouseDown={noBlur}
              onClick={() => onDigit(k.value)}
              className="h-[44px] rounded-[6px] bg-white font-manrope font-bold text-[22px] text-parkway-grey01 shadow-[0_1px_0_rgba(0,0,0,0.08)] active:bg-[#EFEFEF] active:scale-[0.97] transition-[transform,background-color] duration-100"
            >
              {k.value}
            </button>
          )
        })}
      </div>
    </div>
  )
}
