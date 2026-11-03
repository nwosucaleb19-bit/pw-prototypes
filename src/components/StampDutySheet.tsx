import BottomSheet from './BottomSheet'
import IconQuestion from '../assets/figma/icon-question-mark.svg'

type Props = {
  open: boolean
  onClose: () => void
}

export default function StampDutySheet({ open, onClose }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-6 pt-2">
        <div className="size-10 rounded-full bg-[#FFEFE8] flex items-center justify-center">
          <img src={IconQuestion} alt="" className="size-6" />
        </div>
        <h2 className="font-display font-medium text-[24px] text-parkway-grey01 text-center leading-tight max-w-[247px]">
          Why is ₦50 deducted from your wallet?
        </h2>
        <p className="font-manrope text-[12px] text-[#5D6574] text-center tracking-[-0.12px] leading-[1.8]">
          In line with the directive from the Federal Inland Revenue Service (FIRS), a{' '}
          <span className="font-semibold">stamp duty of ₦50</span> is applicable to all electronic
          transactions of <span className="font-semibold">₦10,000</span> or above.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-[46px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform"
        >
          Close
        </button>
      </div>
    </BottomSheet>
  )
}
