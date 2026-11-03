import { useState } from 'react'
import HeaderBar from '../components/HeaderBar'
import CaretRight from '../assets/figma/caret-right.svg'
import ParkwayLogoOrange from '../assets/figma/parkway-logo-orange.svg'
import {
  BANK_BY_CODE,
  PARKWAY_RECENTS,
  RECENT_HISTORY,
  maskAccount,
  type FullRecipient,
  type ParkwayRecipient,
} from '../data/banks'
import type { Recipient } from './Transfer'

type Tab = 'recents' | 'beneficiaries'

type Scope = 'bank' | 'parkway'

type Props = {
  onBack: () => void
  onPickRecipient: (r: Recipient) => void
  // When 'parkway', only Parkway Wallet peers are shown. Default stays 'bank'
  // so the existing SendToBank → See All path renders bank recipients unchanged.
  scope?: Scope
}

export default function RecentsBeneficiaries({
  onBack,
  onPickRecipient,
  scope = 'bank',
}: Props) {
  const [tab, setTab] = useState<Tab>('recents')

  const bankItems: FullRecipient[]       = tab === 'recents' ? RECENT_HISTORY : []
  const parkwayItems: ParkwayRecipient[] = tab === 'recents' ? PARKWAY_RECENTS : []

  const handleBankTap = (r: FullRecipient) => {
    const bank = BANK_BY_CODE[r.bank]
    onPickRecipient({
      name: r.name,
      channel: bank.name,
      maskedAccount: maskAccount(r.fullAccount),
      fullAccount: r.fullAccount,
      bankCode: r.bank,
    })
  }

  const handleParkwayTap = (r: ParkwayRecipient) => {
    onPickRecipient({
      name: r.name,
      channel: 'Parkway Projects',
      maskedAccount: maskAccount(r.fullAccount),
      fullAccount: r.fullAccount,
      bankCode: 'parkway',
    })
  }

  const empty =
    scope === 'parkway' ? parkwayItems.length === 0 : bankItems.length === 0

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col">
      <HeaderBar title="Recents & Beneficiaries" onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-4 pt-5 pb-6">
        {/* Pill tabs */}
        <div className="h-[48px] bg-[#f5f4f4] rounded-full p-1 flex">
          <PillTab active={tab === 'recents'} onClick={() => setTab('recents')}>
            Recents
          </PillTab>
          <PillTab active={tab === 'beneficiaries'} onClick={() => setTab('beneficiaries')}>
            Beneficiaries
          </PillTab>
        </div>

        {/* List */}
        <div className="mt-3 space-y-3">
          {scope === 'bank' &&
            bankItems.map((r, i) => (
              <BankRecipientRow key={i} r={r} onClick={() => handleBankTap(r)} />
            ))}
          {scope === 'parkway' &&
            parkwayItems.map((r, i) => (
              <ParkwayRecipientRow key={i} r={r} onClick={() => handleParkwayTap(r)} />
            ))}
          {empty && (
            <p className="text-center font-manrope text-[13px] text-parkway-grey02 mt-10">
              No {tab} yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function PillTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-[40px] rounded-full flex items-center justify-center transition-all ${
        active ? 'bg-white border border-parkway-tangerine04' : 'bg-transparent'
      }`}
    >
      <span className="font-manrope font-semibold text-[14px] text-black">
        {children}
      </span>
    </button>
  )
}

function BankRecipientRow({ r, onClick }: { r: FullRecipient; onClick: () => void }) {
  const bank = BANK_BY_CODE[r.bank]
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white border border-[#f5f5f5] rounded-[8px] px-4 py-3 flex items-center justify-between hover:border-parkway-tangerine01/40 transition-colors active:scale-[0.995]"
    >
      <div className="flex items-center gap-3">
        <div className="size-7 rounded-full bg-white border border-parkway-grey05 overflow-hidden flex items-center justify-center shrink-0">
          <img src={bank.logo} alt="" className="size-full object-contain p-0.5" />
        </div>
        <div className="text-left">
          <p className="font-manrope font-medium text-[13px] text-parkway-grey01 uppercase">
            {r.name}
          </p>
          <p className="font-manrope font-medium text-[12px] text-parkway-grey02 mt-0.5">
            {bank.name} ∙ {maskAccount(r.fullAccount)}
          </p>
        </div>
      </div>
      <img src={CaretRight} alt="" className="size-[14px]" />
    </button>
  )
}

function ParkwayRecipientRow({
  r,
  onClick,
}: {
  r: ParkwayRecipient
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white border border-[#f5f5f5] rounded-[8px] px-4 py-3 flex items-center justify-between hover:border-parkway-tangerine01/40 transition-colors active:scale-[0.995]"
    >
      <div className="flex items-center gap-3">
        <div className="size-7 rounded-full bg-parkway-tangerine01/10 flex items-center justify-center shrink-0">
          <img src={ParkwayLogoOrange} alt="" className="w-[14px] h-[13px]" />
        </div>
        <div className="text-left">
          <p className="font-manrope font-medium text-[13px] text-parkway-grey01 uppercase">
            {r.name}
          </p>
          <p className="font-manrope font-medium text-[12px] text-parkway-grey02 mt-0.5">
            Parkway Projects ∙ {maskAccount(r.fullAccount)}
          </p>
        </div>
      </div>
      <img src={CaretRight} alt="" className="size-[14px]" />
    </button>
  )
}
