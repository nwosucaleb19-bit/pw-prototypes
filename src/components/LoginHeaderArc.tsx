import HeaderArc from '../assets/figma/login/header-arc.svg'

/**
 * The soft yellow arc across the top of the login screens, placed as in
 * Figma inside a 375 × 110 header box (the parent clips it).
 */
export default function LoginHeaderArc() {
  return (
    <div
      className="absolute inset-[-140.78%_-12.53%_-201.13%_-25.07%] flex items-center justify-center"
      style={{ containerType: 'size' }}
    >
      <div
        className="flex-none"
        style={{
          width: 'hypot(68.4115cqw, -41.9247cqh)',
          height: 'hypot(-31.5885cqw, -58.0753cqh)',
          transform: 'rotate(150deg) scaleX(-1)',
        }}
      >
        <div className="relative size-full">
          <div className="absolute inset-[-2.15%_-1.72%]">
            <img src={HeaderArc} alt="" className="block size-full max-w-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
