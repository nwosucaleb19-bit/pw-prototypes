import PasscodeIllustration from '../../components/PasscodeIllustration'
import TopArc from '../../assets/figma/passcode/top-arc.svg'
import IconTimer from '../../assets/figma/passcode/timer.svg'

type Props = {
  onSetPasscode: () => void
}

const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` })

/**
 * "Secure your Wallet" prompt (Figma 36377:23471), shown over the dashboard
 * after onboarding. Design coordinates include a 44px status bar, which the
 * prototype draws separately, so everything sits 44px higher here.
 */
export default function PasscodePrompt({ onSetPasscode }: Props) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white flex flex-col items-center">
      {/* Decorative arc running in from the top edge */}
      <div className="pointer-events-none absolute left-1/2 top-[-44px] h-[110px] w-[375px] -translate-x-1/2">
        <img src={TopArc} alt="" className="absolute inset-0 block size-full max-w-none" />
      </div>

      <div className="mt-[86px] rise-in" style={d(120)}>
        <PasscodeIllustration startDelay={1100} />
      </div>

      <div className="mt-px w-[335px] flex flex-col items-center gap-3 text-center">
        <h1 className="font-display font-medium text-[28px] leading-normal text-parkway-grey01 rise-in" style={d(220)}>
          Secure your Wallet with a 6-digit Passcode.
        </h1>
        <p
          className="w-[243px] font-manrope font-normal text-[14px] leading-normal tracking-[-0.14px] text-parkway-grey09 rise-in"
          style={d(280)}
        >
          Set up your passcode for faster and safer login
        </p>
      </div>

      <div className="mt-auto pb-4 w-[335px] flex flex-col items-center gap-6 rise-in" style={d(380)}>
        <button
          type="button"
          onClick={onSetPasscode}
          className="w-full h-12 rounded-[8px] bg-parkway-tangerine01 font-manrope font-semibold text-[14px] leading-[1.8] text-white active:scale-[0.98] transition-transform"
        >
          Set Passcode
        </button>
        <div className="flex items-center gap-1.5 rounded-[4px] bg-[#FCF8E8] px-2 py-1">
          <img src={IconTimer} alt="" className="size-[14px]" />
          <p className="flex items-center gap-0.5 whitespace-nowrap text-[12px]">
            <span className="font-manrope font-normal leading-[1.415] text-parkway-grey02">This will only take</span>
            <span className="font-display font-medium leading-[1.52] text-parkway-grey01">10 seconds</span>
          </p>
        </div>
      </div>
    </div>
  )
}
