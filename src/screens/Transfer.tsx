import { useState } from 'react'
import HeaderBar from '../components/HeaderBar'
import TileParkway from '../assets/figma/tile-parkway.svg'
import TileBank from '../assets/figma/tile-bank.svg'
import TileInvoice from '../assets/figma/tile-invoice.svg'
import MagnifyingGlass from '../assets/figma/magnifying-glass.svg'
import CaretRight from '../assets/figma/caret-right.svg'
import ParkwayLogoOrange from '../assets/figma/parkway-logo-orange.svg'
import { BANK_BY_CODE, type BankCode } from '../data/banks'

export type Recipient = {
  name: string
  channel: string
  maskedAccount: string
  fullAccount: string
  bankCode: BankCode | 'parkway'
}

const RECIPIENTS: Recipient[] = [
  { name: 'Adetula Mabel', channel: 'Zenith Bank',       maskedAccount: '0015***018', fullAccount: '0015478018', bankCode: 'zenith'  },
  { name: 'Adetula Mabel', channel: 'Parkway Projects',  maskedAccount: '0015***018', fullAccount: '0015478018', bankCode: 'parkway' },
  { name: 'Adetula Mabel', channel: 'Access Bank',       maskedAccount: '0015***018', fullAccount: '0015478018', bankCode: 'access'  },
  { name: 'Adetula Mabel', channel: 'GT Bank',           maskedAccount: '0015***018', fullAccount: '0015478018', bankCode: 'gtb'     },
  { name: 'Adetula Mabel', channel: 'Kuda',              maskedAccount: '0015***018', fullAccount: '0015478018', bankCode: 'kuda'    },
]

type Props = {
  onBack: () => void
  onPickRecipient: (r: Recipient) => void
  onOpenToBank: () => void
  onOpenToParkway?: () => void
  onOpenToInvoice?: () => void
}

type Destination = 'parkway' | 'bank' | 'invoice'
type Tab = 'recents' | 'beneficiaries'

export default function Transfer({ onBack, onPickRecipient, onOpenToBank, onOpenToParkway, onOpenToInvoice }: Props) {
  const [destination, setDestination] = useState<Destination | null>(null)
  const [tab, setTab] = useState<Tab>('recents')
  const [query, setQuery] = useState('')

  const chooseDestination = (d: Destination) => {
    setDestination(d)
    if (d === 'bank') {
      setTimeout(onOpenToBank, 120)
    } else if (d === 'parkway') {
      onOpenToParkway?.()
    } else if (d === 'invoice') {
      onOpenToInvoice?.()
    }
  }

  const filtered = RECIPIENTS.filter((r) =>
    (r.name + r.channel + r.maskedAccount).toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="h-full w-full bg-parkway-bg overflow-y-auto hide-scrollbar">
      <HeaderBar title="Transfer" onBack={onBack} />

      <div className="px-4 pt-5 pb-20">
        <p className="font-manrope font-semibold text-[14px] text-[#1e1e1e] tracking-[-0.28px]">
          All transfers are free! 🎉
        </p>

        <div className="mt-3 flex gap-1.5">
          <DestinationTile icon={TileParkway} label="To Parkway" selected={destination === 'parkway'} onClick={() => chooseDestination('parkway')} />
          <DestinationTile icon={TileBank}    label="To Bank"    selected={destination === 'bank'}    onClick={() => chooseDestination('bank')} />
          <DestinationTile icon={TileInvoice} label="To Invoice" selected={destination === 'invoice'} onClick={() => chooseDestination('invoice')} />
        </div>

        <div className="mt-7 h-[48px] bg-[#f5f4f4] rounded-full p-1 flex">
          <PillTab active={tab === 'recents'} onClick={() => setTab('recents')}>Recents</PillTab>
          <PillTab active={tab === 'beneficiaries'} onClick={() => setTab('beneficiaries')}>Beneficiaries</PillTab>
        </div>

        <div className="mt-3 bg-parkway-grey06 border border-parkway-grey04 rounded-[4px] px-4 py-[14px] flex items-center gap-2.5">
          <img src={MagnifyingGlass} alt="" className="size-[14px]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, account number or Parkway tag"
            className="flex-1 bg-transparent outline-none font-manrope text-[13px] text-parkway-grey01 placeholder:text-[#999]"
          />
        </div>

        <div className="mt-3 space-y-3">
          {filtered.map((r, i) => (
            <RecipientRow key={i} r={r} onClick={() => onPickRecipient(r)} />
          ))}
          {filtered.length === 0 && (
            <p className="text-center font-manrope text-[13px] text-parkway-grey02 mt-8">
              No {tab} match “{query}”.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function DestinationTile({ icon, label, selected, onClick }: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-[80px] rounded-[10px] flex flex-col items-center justify-center gap-2.5 transition-all active:scale-[0.98] ${
        selected ? 'bg-parkway-tangerine05 border border-parkway-tangerine01/40' : 'bg-[#f4f4f4] hover:bg-[#eeeded]'
      }`}
    >
      <img src={icon} alt="" className="size-[18px]" />
      <span className="font-manrope font-semibold text-[12px] text-black leading-[1.415]">{label}</span>
    </button>
  )
}

function PillTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-[40px] rounded-full flex items-center justify-center transition-all ${
        active ? 'bg-white border border-parkway-tangerine04' : 'bg-transparent'
      }`}
    >
      <span className="font-manrope font-semibold text-[14px] text-black">{children}</span>
    </button>
  )
}

export function RecipientAvatar({ bankCode, size = 28 }: { bankCode: Recipient['bankCode']; size?: number }) {
  if (bankCode === 'parkway') {
    return (
      <div className="rounded-full bg-parkway-tangerine01/10 flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <img src={ParkwayLogoOrange} alt="" className="w-[50%] h-[46%]" />
      </div>
    )
  }
  const bank = BANK_BY_CODE[bankCode]
  return (
    <div className="rounded-full bg-white border border-parkway-grey05 overflow-hidden flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <img src={bank.logo} alt="" className="size-full object-contain p-0.5" />
    </div>
  )
}

function RecipientRow({ r, onClick }: { r: Recipient; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white border border-[#f5f5f5] rounded-[8px] px-4 py-3 flex items-center justify-between hover:border-parkway-tangerine01/40 transition-colors active:scale-[0.995]"
    >
      <div className="flex items-center gap-3">
        <RecipientAvatar bankCode={r.bankCode} />
        <div className="text-left">
          <p className="font-manrope font-medium text-[13px] text-parkway-grey01 uppercase">{r.name}</p>
          <p className="font-manrope font-medium text-[12px] text-parkway-grey02 mt-0.5">
            {r.channel} ∙ {r.maskedAccount}
          </p>
        </div>
      </div>
      <img src={CaretRight} alt="" className="size-[14px]" />
    </button>
  )
}
