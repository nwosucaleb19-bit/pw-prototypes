import Home from '../Home'
import { StatusBar } from '../../components/PhoneFrame'
import ParkwayLogo from '../../assets/figma/logo-parkway-wallet.png'
import { useToast } from '../../onboarding/ui'

type Props = {
  onCreateAccount: () => void
}

const HOME_W = 393
const HOME_H = 798
const MINI_SCREEN_W = 272
const MINI_SCALE = MINI_SCREEN_W / HOME_W

export default function Welcome({ onCreateAccount }: Props) {
  const toast = useToast()
  return (
    <div className="h-full w-full flex flex-col relative bg-white overflow-hidden">
      {/* Hero */}
      <div className="relative h-[448px] shrink-0 bg-[#F4F4F4] overflow-hidden">
        <svg aria-hidden viewBox="0 0 393 448" className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M-40 -6 C 110 -40, 300 -10, 470 150" stroke="#FAF1D2" strokeWidth="12" fill="none" />
          <path d="M470 150 C 520 220, 520 300, 480 360" stroke="#FAF1D2" strokeWidth="12" fill="none" opacity="0.6" />
        </svg>
        <div className="relative flex justify-center pt-4 rise-in" style={{ ['--d' as string]: '40ms' }}>
          <img src={ParkwayLogo} alt="Parkway" className="h-[20px] w-auto" />
        </div>
        <div className="absolute inset-x-0 top-[75px] flex justify-center">
          <div className="rise-in" style={{ ['--d' as string]: '120ms' }}>
            <MiniPhone />
          </div>
        </div>
      </div>

      {/* Copy + actions */}
      <div className="relative flex-1 bg-white px-5 pt-[50px] flex flex-col items-center">
        <h1
          className="font-display font-medium text-[22px] leading-[1.2] text-[#1F2937] text-center max-w-[260px] rise-in"
          style={{ ['--d' as string]: '220ms' }}
        >
          Transfer and Receive Money Super Fast For FREE
        </h1>
        <p
          className="mt-2 font-manrope font-medium text-[14px] leading-[1.45] text-[#1F2937] text-center max-w-[260px] rise-in"
          style={{ ['--d' as string]: '280ms' }}
        >
          With Parkway enjoy seamless transactions.
        </p>
        <div className="w-full mt-6 rise-in" style={{ ['--d' as string]: '360ms' }}>
          <button
            type="button"
            onClick={onCreateAccount}
            className="w-full h-[54px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[15px] active:scale-[0.98] transition-transform"
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => toast.show('Login isn’t part of this prototype yet')}
            className="mt-4 w-full font-manrope font-semibold text-[14px] text-parkway-tangerine01 active:opacity-60 transition-opacity"
          >
            Login to Parkway
          </button>
        </div>
      </div>
      {toast.el}
    </div>
  )
}

/** A live, non-interactive render of the Home screen inside a cropped device. */
function MiniPhone() {
  return (
    <div className="relative w-[300px] h-[373px] overflow-hidden">
      <div className="absolute left-0 top-0 w-[300px] h-[620px] rounded-[48px] bg-[#1b1b1d] p-[14px] shadow-[0_30px_50px_-30px_rgba(0,0,0,0.45),inset_0_0_0_2px_#3a3a3d]">
        <div className="relative h-full w-full rounded-[36px] overflow-hidden bg-white">
          <div
            aria-hidden
            inert
            className="pointer-events-none origin-top-left"
            style={{ width: HOME_W, height: HOME_H + 54, transform: `scale(${MINI_SCALE})` }}
          >
            <StatusBar theme="light" />
            <div style={{ height: HOME_H }}>
              <Home onOpenTransfer={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
