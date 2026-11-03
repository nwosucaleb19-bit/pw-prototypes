import { useState } from 'react'
import HeaderBar from '../components/HeaderBar'
import IconRefresh from '../assets/figma/icon-refresh.svg'
import IconWarningCircle from '../assets/figma/icon-warning-circle-sm.svg'
import IconWarningTri from '../assets/figma/icon-warning-tri-red.svg'
import { BANKS, type Bank, type BankCode } from '../data/banks'

type Rate = { bank: Bank; rate: number }

// Which banks are currently struggling. Matches the SendToBank warning flags.
const UNSTABLE_RATES: Partial<Record<BankCode, number>> = {
  access: 65,
  alat:   20,
}

function rateStyle(rate: number) {
  if (rate >= 90) return { bg: 'rgba(0,107,34,0.08)',  fg: '#44AC21' }
  if (rate >= 50) return { bg: 'rgba(255,199,0,0.1)',  fg: '#AA8500' }
  return                { bg: 'rgba(252,85,85,0.08)',  fg: '#FC5555' }
}

type Props = {
  onBack: () => void
}

export default function TransferSuccessRateMonitor({ onBack }: Props) {
  const [rates, setRates] = useState<Rate[]>(() => makeRates())
  const [refreshing, setRefreshing] = useState(false)

  const unstable = rates.filter((r) => UNSTABLE_RATES[r.bank.code] !== undefined)
  const stable   = rates.filter((r) => UNSTABLE_RATES[r.bank.code] === undefined)

  const refresh = () => {
    if (refreshing) return
    setRefreshing(true)
    setTimeout(() => {
      setRates(makeRates(true))
      setRefreshing(false)
    }, 900)
  }

  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col">
      <HeaderBar
        title="Transfer Success Rate Monitor"
        onBack={onBack}
        titleSize={16}
      />
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 pt-4 pb-28 space-y-5">
        {unstable.length > 0 && (
          <section className="bg-white rounded-[12px] p-4">
            <div className="flex items-center gap-1">
              <h3 className="font-manrope font-semibold text-[14px] text-[#1e1e1e] tracking-[-0.28px]">
                Banks with Unstable Network
              </h3>
              <img src={IconWarningCircle} alt="" className="size-4" />
            </div>
            <p className="mt-1 font-manrope font-medium text-[12px] text-[#999] tracking-[-0.24px]">
              Monitor the recipient bank’s real-time transfer success rate to prevent any transfer failures or delays.
            </p>
            <div className="mt-3 space-y-2.5">
              {unstable.map((r) => (
                <RateRow key={r.bank.code} r={r} />
              ))}
            </div>
          </section>
        )}

        <section className="bg-white rounded-[12px] p-4">
          <h3 className="font-manrope font-semibold text-[14px] text-[#1e1e1e] tracking-[-0.28px]">
            Banks with Stable Network
          </h3>
          <p className="mt-1 font-manrope font-medium text-[12px] text-[#999] tracking-[-0.24px]">
            Monitor the recipient bank’s real-time transfer success rate to prevent any transfer failures or delays.
          </p>
          <div className="mt-3 space-y-2.5">
            {stable.map((r) => (
              <RateRow key={r.bank.code} r={r} />
            ))}
          </div>
        </section>
      </div>

      <div className="shrink-0 px-5 pb-5 pt-3 bg-gradient-to-t from-parkway-bg to-transparent">
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="w-full h-[48px] rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-70 transition-all"
        >
          <img
            src={IconRefresh}
            alt=""
            className={`size-[18px] ${refreshing ? 'animate-spin' : ''}`}
          />
          <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  )
}

function RateRow({ r }: { r: Rate }) {
  const style = rateStyle(r.rate)
  // Bad rates get a tiny warning triangle after the number.
  const showWarn = r.rate < 30
  return (
    <div className="bg-white border border-[#edeef2] rounded-[8px] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="size-8 rounded-full bg-white overflow-hidden flex items-center justify-center border border-parkway-grey05 shrink-0">
          <img src={r.bank.logo} alt="" className="size-full object-contain p-0.5" />
        </div>
        <span className="font-manrope font-medium text-[14px] text-parkway-grey01 tracking-[-0.25px]">
          {r.bank.name}
        </span>
      </div>
      <div
        className="px-2.5 py-1.5 rounded-[8px] font-manrope font-medium text-[12px] tabular-nums flex items-center gap-1.5"
        style={{ background: style.bg, color: style.fg }}
      >
        <span>{r.rate}%</span>
        {showWarn && <img src={IconWarningTri} alt="" className="size-[14px]" />}
      </div>
    </div>
  )
}

function makeRates(jitter = false): Rate[] {
  return BANKS.map((b) => {
    const fixed = UNSTABLE_RATES[b.code]
    if (fixed !== undefined) {
      return { bank: b, rate: fixed }
    }
    return { bank: b, rate: jitter && Math.random() < 0.15 ? 85 : 100 }
  })
}
