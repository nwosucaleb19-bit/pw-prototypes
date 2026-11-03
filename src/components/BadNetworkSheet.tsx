import BottomSheet from './BottomSheet'
import IconWarningRed from '../assets/figma/icon-warning-tri-modal.svg'

type Props = {
  open: boolean
  onClose: () => void
  bankName: string
}

export default function BadNetworkSheet({ open, onClose, bankName }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="size-10 rounded-full bg-[rgba(255,0,0,0.1)] flex items-center justify-center">
          <img src={IconWarningRed} alt="" className="size-5" />
        </div>
        <h2 className="font-display font-medium text-[20px] text-parkway-grey01 text-center tracking-tightish max-w-[307px]">
          Bad Network from Bank
        </h2>
        <p className="font-manrope text-[14px] text-parkway-grey09 text-center tracking-[-0.14px] leading-[1.8]">
          We detected that the bank (
          <span className="text-[#C77756]">{bankName}</span>
          ) network is down. You cannot proceed with the transfer as this may cause transfer failures.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-[46px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform mt-2"
        >
          Okay
        </button>
      </div>
    </BottomSheet>
  )
}
