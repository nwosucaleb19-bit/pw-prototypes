import { useState } from 'react'
import BottomSheet from './BottomSheet'
import IconWarning from '../assets/figma/icon-warning-circle.svg'
import ParkwayWalletLogo from '../assets/figma/logo-parkway-wallet.png'
import type { Recipient } from '../screens/Transfer'
import {
  BANK_BY_CODE,
  type BankCode,
} from '../data/banks'
import ParkwayLogoOrange from '../assets/figma/parkway-logo-orange.svg'

type Props = {
  open: boolean
  onClose: () => void
  recipient: Recipient
  amount: number
  description: string
  fullAccount: string
  bankCode: BankCode | 'parkway'
  sourceAccountNo: string
  onConfirm: (saveAsBeneficiary: boolean) => void
}

export default function ConfirmationSheet({
  open,
  onClose,
  recipient,
  amount,
  description,
  fullAccount,
  bankCode,
  sourceAccountNo,
  onConfirm,
}: Props) {
  const [saveAsBeneficiary, setSaveAsBeneficiary] = useState(false)
  const isParkway = bankCode === 'parkway'
  const bank = isParkway ? null : BANK_BY_CODE[bankCode]
  const bankDisplayName = isParkway ? 'Parkway Wallet' : bank!.name

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 pt-1">
        <div className="size-10 rounded-full bg-parkway-buff03 flex items-center justify-center">
          <img src={IconWarning} alt="" className="size-6" />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="font-display font-bold text-[30px] text-parkway-grey01 tracking-tightish">
            ₦ {formatMoney(amount)}
          </h2>
          <p className="font-manrope text-[12px] text-[#808080] max-w-[280px]">
            Kindly double-check the details below before confirming your payment
          </p>
        </div>

        {/* Source */}
        <div className="w-full bg-parkway-grey06 border border-[#f5f5f5] rounded-[8px] h-[56px] px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Parkway logo MARK only (crop out the wordmark). Matches Figma node 35410:18355 */}
            <div className="relative size-5 shrink-0 overflow-hidden">
              <img
                src={ParkwayWalletLogo}
                alt=""
                aria-hidden
                className="absolute top-0 h-[100.68%] w-[594.72%] left-[-505.56%] max-w-none"
              />
            </div>
            <span className="font-manrope font-bold text-[14px] text-parkway-grey01">
              Parkway wallet
            </span>
          </div>
          <span className="font-manrope font-medium text-[14px] text-[#999]">
            {sourceAccountNo}
          </span>
        </div>

        {/* Details */}
        <div className="w-full bg-[#FCF8E8] border border-[#f5f5f5] rounded-[8px] p-4 space-y-2.5">
          <DetailRow label="Bank">
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
          </DetailRow>
          <DetailRow label="Account Name">
            <span className="font-manrope font-bold text-[14px] text-parkway-grey01 uppercase">
              {recipient.name}
            </span>
          </DetailRow>
          <DetailRow label="Account Number">
            <span className="font-manrope font-bold text-[14px] text-parkway-grey01 tabular-nums">
              {fullAccount}
            </span>
          </DetailRow>
          <DetailRow label="Transaction Fee">
            <span className="font-manrope font-bold text-[14px] text-[#29CC6A]">
              FREE
            </span>
          </DetailRow>
          {description && (
            <DetailRow label="Description">
              <span className="font-manrope font-bold text-[14px] text-parkway-grey01">
                {description}
              </span>
            </DetailRow>
          )}
        </div>

        {/* Save as beneficiary toggle */}
        <div className="w-full flex items-center justify-between py-1">
          <span className="font-manrope font-medium text-[14px] text-[#999]">
            Save as beneficiary?
          </span>
          <Toggle
            checked={saveAsBeneficiary}
            onChange={setSaveAsBeneficiary}
          />
        </div>

        <button
          type="button"
          onClick={() => onConfirm(saveAsBeneficiary)}
          className="w-full h-[46px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform"
        >
          Send Money
        </button>
      </div>
    </BottomSheet>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-manrope font-medium text-[14px] text-[#727272]">
        {label}
      </span>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-5 w-10 rounded-full border transition-colors"
      style={{
        background: checked ? '#F9956B' : '#fff',
        borderColor: checked ? '#F9956B' : '#999',
      }}
    >
      <div
        className="absolute top-[2px] size-[14px] rounded-full bg-parkway-grey01 transition-transform"
        style={{
          left: 2,
          transform: checked ? 'translate3d(20px,0,0)' : 'translate3d(0,0,0)',
          background: checked ? '#fff' : '#121212',
        }}
      />
    </button>
  )
}

function formatMoney(n: number) {
  return n.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
