import BottomSheet from './BottomSheet'
import IconWarningYellow from '../assets/figma/icon-warning-circle-yellow.svg'

type Props = {
  open: boolean
  onClose: () => void
  bankName: string
  // "Yes" accepts the risk and continues the flow.
  onProceed: () => void
}

export default function WeakNetworkSheet({ open, onClose, bankName, onProceed }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="size-10 rounded-full bg-[rgba(255,199,0,0.1)] flex items-center justify-center">
          <img src={IconWarningYellow} alt="" className="size-5" />
        </div>
        <h2 className="font-display font-medium text-[20px] text-parkway-grey01 text-center tracking-tightish max-w-[307px]">
          Weak Network from Bank
        </h2>
        <p className="font-manrope text-[14px] text-parkway-grey09 text-center tracking-[-0.14px] leading-[1.8]">
          We detected that the bank (
          <span className="text-[#C77756]">{bankName}</span>
          ) has a weak network and this may cause transfer failures and delays.
          <br /><br />
          Do you want to proceed with the transfer?
        </p>
        <div className="w-full flex gap-4 pt-2">
          <button
            type="button"
            onClick={onProceed}
            className="flex-1 h-[46px] rounded-[8px] bg-parkway-grey05 text-parkway-grey10 font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[46px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform"
          >
            No, Go Back
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
