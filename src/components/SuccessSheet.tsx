import BottomSheet from './BottomSheet'
import IconShare from '../assets/figma/icon-share.svg'
import IconRetry from '../assets/figma/icon-retry.svg'
import IconDownload from '../assets/figma/icon-download.svg'
import type { Recipient } from '../screens/Transfer'
import { BANK_BY_CODE, type BankCode } from '../data/banks'
import ParkwayLogoOrange from '../assets/figma/parkway-logo-orange.svg'
import ConfettiBurst from './ConfettiBurst'

type Props = {
  open: boolean
  onClose: () => void
  recipient: Recipient
  amount: number
  description: string
  fullAccount: string
  bankCode: BankCode | 'parkway'
  onSendAgain: () => void
}

export default function SuccessSheet({
  open,
  onClose,
  recipient,
  amount,
  description,
  fullAccount,
  bankCode,
  onSendAgain,
}: Props) {
  const isParkway = bankCode === 'parkway'
  const bank = isParkway ? null : BANK_BY_CODE[bankCode]
  const bankDisplayName = isParkway ? 'Parkway Wallet' : bank!.name

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="flex flex-col items-center gap-3">
          <SuccessBurst />
          <p className="font-manrope font-medium text-[12px] text-parkway-grey01">
            Payment Successfully
          </p>
          <p className="font-display font-bold text-[30px] text-[#1F2937] tracking-tightish">
            ₦{formatMoney(amount)}
          </p>
        </div>

        <div className="w-full bg-[#FCF8E8] border border-[#f5f5f5] rounded-[8px] p-4 space-y-2.5">
          <Row label="Bank">
            <div className="flex items-center gap-1.5">
              {isParkway ? (
                <div className="size-5 rounded-full bg-parkway-tangerine01/10 flex items-center justify-center">
                  <img src={ParkwayLogoOrange} alt="" className="w-[11px] h-[10px]" />
                </div>
              ) : (
                <img src={bank!.logo} alt="" className="size-5 object-contain" />
              )}
              <span className="font-manrope font-bold text-[14px] text-[#1F2937]">
                {bankDisplayName}
              </span>
            </div>
          </Row>
          <Row label="Account Name">
            <span className="font-manrope font-bold text-[14px] text-parkway-grey01 uppercase">
              {recipient.name}
            </span>
          </Row>
          <Row label="Account Number">
            <span className="font-manrope font-bold text-[14px] text-parkway-grey01 tabular-nums">
              {fullAccount}
            </span>
          </Row>
          <Row label="Transaction Fee">
            <span className="font-manrope font-bold text-[14px] text-[#29CC6A]">FREE</span>
          </Row>
          <Row label="Description">
            <span className="font-manrope font-bold text-[14px] text-parkway-grey01">
              {description || 'Transfer'}
            </span>
          </Row>
        </div>

        <div className="w-full grid grid-cols-2 gap-3">
          <SecondaryButton icon={IconShare} label="Share" onClick={onClose} />
          <SecondaryButton icon={IconRetry} label="Send Again" onClick={onSendAgain} />
          <PrimaryButton icon={IconDownload} label="Download Receipt" onClick={onClose} />
        </div>
      </div>
    </BottomSheet>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-manrope font-medium text-[14px] text-[#727272]">{label}</span>
      {children}
    </div>
  )
}

function SecondaryButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[44px] rounded-[8px] bg-parkway-grey05 flex items-center justify-center gap-2 font-manrope font-semibold text-[14px] text-parkway-grey01 active:scale-[0.98] transition-transform"
    >
      <img src={icon} alt="" className="size-5" />
      <span>{label}</span>
    </button>
  )
}

function PrimaryButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="col-span-2 h-[44px] rounded-[8px] bg-parkway-tangerine01 flex items-center justify-center gap-2 font-manrope font-semibold text-[14px] text-white active:scale-[0.98] transition-transform"
    >
      <img src={icon} alt="" className="size-5" />
      <span>{label}</span>
    </button>
  )
}

function SuccessBurst() {
  return (
    <div className="relative size-[60px] flex items-center justify-center">
      {/* Confetti sits behind the check — pointer-events are off so taps still land on the sheet. */}
      <ConfettiBurst />
      <div className="absolute inset-0 rounded-full bg-[#29CC6A]/15 animate-ping" />
      <div className="absolute inset-2 rounded-full bg-[#29CC6A] flex items-center justify-center z-10">
        <svg viewBox="0 0 24 24" className="size-7 text-white" fill="none">
          <path
            d="M5 12.5l4 4 10-10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

function formatMoney(n: number) {
  return n.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
