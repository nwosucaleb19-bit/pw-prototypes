import { useToast } from '../../onboarding/ui'
import ParkwayLogo from '../../assets/figma/welcome/parkway-logo.png'
import PhoneMockup from '../../assets/figma/welcome/phone-mockup.png'
import HeroArc from '../../assets/figma/welcome/hero-arc.svg'

type Props = {
  onCreateAccount: () => void
}

/** Stagger helper for `.rise-in`. */
const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` })

/**
 * Onboarding welcome, from Figma node 35830:16405.
 *
 * The hero keeps the design's own 375 × 492 canvas. That canvas includes a
 * 44px iOS status bar, which the prototype draws separately above the
 * screen, so the canvas sits 44px higher and is centred on wider phones.
 */
export default function Welcome({ onCreateAccount }: Props) {
  const toast = useToast()
  return (
    <div className="h-full w-full flex flex-col relative bg-white overflow-hidden">
      {/* Hero */}
      <div className="relative h-[448px] shrink-0 bg-[#F5F5F5] overflow-hidden">
        <div className="absolute left-1/2 top-[-44px] h-[492px] w-[375px] -translate-x-1/2">
          {/* Soft shadow the phone sits on */}
          <div className="absolute left-[25px] top-[182px] h-[561px] w-[325px] rounded-[31px] bg-[rgba(18,18,18,0.2)] blur-[20px]" />

          {/* Decorative arc */}
          <div
            className="absolute inset-[-34.8%_-12.53%_25.56%_-25.07%] flex items-center justify-center animate-soft-in"
            style={{ containerType: 'size' }}
          >
            <div
              className="flex-none"
              style={{
                width: 'hypot(68.4115cqw, -41.9247cqh)',
                height: 'hypot(-31.5885cqw, -58.0753cqh)',
                transform: 'rotate(147.45deg) skewX(4.98deg) scaleX(-1)',
              }}
            >
              <div className="relative size-full">
                <div className="absolute inset-[-1.99%_-1.67%]">
                  <img src={HeroArc} alt="" className="block max-w-none size-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="absolute left-1/2 top-[60px] h-[19.129px] w-[107.05px] -translate-x-1/2">
            <div className="rise-in size-full" style={d(40)}>
              <img src={ParkwayLogo} alt="Parkway" className="size-full object-cover" />
            </div>
          </div>

          {/* Phone mockup */}
          <div className="absolute left-[34px] top-[119px] h-[373px] w-[308px] rise-in" style={d(120)}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={PhoneMockup}
                alt="The Parkway Wallet home screen"
                className="absolute left-[-62.91%] top-[-38.46%] h-[138.46%] w-[223.26%] max-w-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copy + actions */}
      <div className="relative flex-1 bg-white pt-[50px] flex flex-col items-center">
        <div className="flex flex-col items-center gap-1 text-center text-[#1F2937]">
          <h1 className="w-[238px] font-display font-medium text-[18px] leading-normal rise-in" style={d(220)}>
            Transfer and Receive Money Super Fast For FREE
          </h1>
          <p className="w-[281px] font-manrope font-normal text-[14px] leading-[20px] rise-in" style={d(280)}>
            With Parkway enjoy seamless
            <br />
            transactions.
          </p>
        </div>

        <div className="mt-6 w-[335px] flex flex-col items-center gap-4 rise-in" style={d(360)}>
          <button
            type="button"
            onClick={onCreateAccount}
            className="w-full h-[54px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] leading-[1.8] active:scale-[0.98] transition-transform"
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => toast.show('Login isn’t part of this prototype yet')}
            className="font-manrope font-extrabold text-[14px] leading-[1.8] text-parkway-tangerine01 active:opacity-60 transition-opacity"
          >
            Login to Parkway
          </button>
        </div>
      </div>
      {toast.el}
    </div>
  )
}
