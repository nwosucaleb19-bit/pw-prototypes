import HeaderCurve from '../assets/figma/header-curve.svg'
import BackArrow from '../assets/figma/back-arrow.svg'

type Props = {
  title: string
  onBack?: () => void
  titleSize?: number
}

export default function HeaderBar({ title, onBack, titleSize = 20 }: Props) {
  return (
    <div className="relative h-[88px] w-full bg-white border-b border-[#E6E6E6] overflow-hidden shrink-0">
      <img
        src={HeaderCurve}
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute -top-6 right-0 w-[260px] opacity-80"
      />
      {onBack && (
        <button
          type="button"
          aria-label="Go back"
          onClick={onBack}
          className="absolute left-[10px] top-[46px] size-[28px] rounded-md bg-white/80 flex items-center justify-center active:scale-95 transition-transform"
        >
          <img src={BackArrow} alt="" className="size-5 rotate-90" />
        </button>
      )}
      <h1
        className="absolute left-1/2 -translate-x-1/2 top-[44px] font-display font-semibold leading-[1.52] text-parkway-grey10 tracking-tightish whitespace-nowrap"
        style={{ fontSize: titleSize }}
      >
        {title}
      </h1>
    </div>
  )
}
