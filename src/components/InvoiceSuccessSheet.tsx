import BottomSheet from './BottomSheet'
import IconShare from '../assets/figma/icon-share.svg'
import IconDownload from '../assets/figma/icon-download.svg'
import type { Invoice } from '../data/invoices'
import ConfettiBurst from './ConfettiBurst'

type Props = {
  open: boolean
  onClose: () => void
  invoice: Invoice
  amount: number
}

export default function InvoiceSuccessSheet({ open, onClose, invoice, amount }: Props) {
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
          <Row label="Invoice Number">
            <span className="font-manrope font-bold text-[14px] text-[#1F2937] text-center">
              {invoice.number}
            </span>
          </Row>
          <Row label="Payee Name">
            <span className="font-manrope font-bold text-[14px] text-parkway-grey01 uppercase">
              {invoice.payeeName}
            </span>
          </Row>
          <Row label="Transaction Fee">
            <span className="font-manrope font-bold text-[14px] text-[#29CC6A]">FREE</span>
          </Row>
          <Row label="Service Provider">
            <span className="font-manrope font-bold text-[14px] text-parkway-grey01">
              {invoice.serviceProvider}
            </span>
          </Row>
        </div>

        <div className="w-full flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[44px] px-5 rounded-[8px] bg-parkway-grey05 flex items-center justify-center gap-2 font-manrope font-semibold text-[14px] text-parkway-grey01 active:scale-[0.98] transition-transform"
          >
            <img src={IconShare} alt="" className="size-5" />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[44px] rounded-[8px] bg-parkway-tangerine01 flex items-center justify-center gap-2 font-manrope font-semibold text-[14px] text-white active:scale-[0.98] transition-transform"
          >
            <img src={IconDownload} alt="" className="size-5" />
            <span>Download Receipt</span>
          </button>
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

function SuccessBurst() {
  return (
    <div className="relative size-[60px] flex items-center justify-center">
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
