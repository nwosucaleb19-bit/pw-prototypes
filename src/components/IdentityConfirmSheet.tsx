import BottomSheet from './BottomSheet'
import type { IdentityRecord } from '../screens/onboarding/IdentityVerification'

type Props = {
  open: boolean
  label: string
  record: IdentityRecord
  /** Tapping outside lets the user go back and edit the address. */
  onClose: () => void
  onConfirm: () => void
}

/** "BVN Details Confirmation": review the masked details the lookup returned. */
export default function IdentityConfirmSheet({ open, label, record, onClose, onConfirm }: Props) {
  const rows = [
    { k: 'Name', v: record.name },
    { k: 'Phone Number', v: record.maskedPhone },
    { k: 'Email', v: record.maskedEmail },
  ]
  return (
    <BottomSheet open={open} onClose={onClose} showGrabber={false} padding="px-5 pt-6 pb-4">
      <div className="flex flex-col items-center text-center">
        <UserCircle />
        <h2 className="mt-3 font-display font-medium text-[22px] leading-[1.35] text-parkway-grey01">
          {label} Details Confirmation
        </h2>
        <p className="mt-3 font-manrope font-medium text-[12px] leading-[1.35] text-[#6B7280]">
          Verification Complete
          <br />
          Please review the details generated from your {label}
        </p>
      </div>

      <div className="mt-6 rounded-[8px] bg-[#FBF7E8] px-4 py-[18px] space-y-2.5">
        {rows.map((r, i) => (
          <div
            key={r.k}
            className="flex items-center justify-between gap-4 rise-in"
            style={{ ['--d' as string]: `${260 + i * 70}ms` }}
          >
            <span className="font-manrope font-medium text-[14px] leading-[19px] text-parkway-grey02">{r.k}</span>
            <span className="font-manrope font-semibold text-[14px] leading-[19px] text-parkway-grey01 text-right truncate">{r.v}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="mt-6 w-full h-12 rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform"
      >
        Confirm
      </button>

      <div className="flex justify-center pt-5">
        <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#FDF8EA] px-2 h-[26px]">
          <span className="font-manrope font-medium text-[12px] text-parkway-grey02">Powered by</span>
          <span className="font-display font-medium text-[13px] text-parkway-grey01">Parkway Rails</span>
        </span>
      </div>
    </BottomSheet>
  )
}

function UserCircle() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden>
      <circle cx="30" cy="30" r="27" fill="#F4F4F4" stroke="#444" strokeWidth="2.4" />
      <circle cx="30" cy="25" r="9" stroke="#444" strokeWidth="2.4" />
      <path d="M13.5 48.5c3.4-6.4 9.6-10 16.5-10s13.1 3.6 16.5 10" stroke="#444" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
