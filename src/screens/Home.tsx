import HeaderCurve from '../assets/figma/header-curve.svg'
import ProfilePic from '../assets/figma/profile-pic.png'
import HelpIcon from '../assets/figma/help-icon.svg'
import Bell from '../assets/figma/bell.svg'
import IconLoans from '../assets/figma/action-loans.svg'
import IconBank from '../assets/figma/action-bank.svg'
import IconDeposit from '../assets/figma/action-deposit.svg'
import IconTransfer from '../assets/figma/action-transfer.svg'
import IconCoins from '../assets/figma/quick-coins.svg'
import IconGraduation from '../assets/figma/quick-graduation.svg'
import IconMobile from '../assets/figma/quick-mobile.svg'
import IconBasketball from '../assets/figma/quick-basketball.svg'
import MoneyReceive from '../assets/figma/money-receive.svg'
import MoneySend from '../assets/figma/money-send.svg'
import ArrowTiny from '../assets/figma/arrow-tiny.svg'
import ArrowAcc from '../assets/figma/arrow-acc.svg'
import IconCopy from '../assets/figma/icon-copy.svg'
import IconEye from '../assets/figma/icon-eye.svg'
import NavHome from '../assets/figma/nav-home.svg'
import NavCards from '../assets/figma/nav-cards.svg'
import NavBills from '../assets/figma/nav-bills.svg'
import NavMore from '../assets/figma/nav-more.svg'
import BannerBankAccounts from '../assets/figma/banner-bank-accounts.png'

type Props = {
  onOpenTransfer: () => void
}

type QuickAction = {
  label: string
  icon: string
  bg: string
  onClick?: () => void
}

type Txn = {
  name: string
  date: string
  amount: string
  direction: 'in' | 'out'
  status: 'Successful' | 'Failed' | 'Pending'
}

const TRANSACTIONS: Txn[] = [
  { name: 'Jamie Joe',       date: 'July 22, 9:42 PM', amount: '200,000', direction: 'out', status: 'Successful' },
  { name: 'Kutaje Josep…',   date: 'July 20, 8:10 AM', amount: '200,000', direction: 'in',  status: 'Successful' },
  { name: 'Kutaje Josep…',   date: 'July 20, 8:10 AM', amount: '200,000', direction: 'out', status: 'Failed' },
  { name: 'Kutaje Josep…',   date: 'July 20, 8:10 AM', amount: '200,000', direction: 'out', status: 'Pending' },
]

const QUICK_ACTIONS = [
  { label: 'Coop',      icon: IconCoins,      bg: '#FAFAFA', badge: null },
  { label: 'Education', icon: IconGraduation, bg: '#FAFAFA', badge: 'HOT' },
  { label: 'Airtime',   icon: IconMobile,     bg: '#FAFAFA', badge: null },
  { label: 'Betting',   icon: IconBasketball, bg: '#FAFAFA', badge: null },
] as const

export default function Home({ onOpenTransfer }: Props) {
  const actions: QuickAction[] = [
    { label: 'Loans',         icon: IconLoans,    bg: '#FEEAE1' },
    { label: 'Bank Accounts', icon: IconBank,     bg: '#FAF1D2' },
    { label: 'Deposit',       icon: IconDeposit,  bg: '#EFEFEF' },
    { label: 'Transfer',      icon: IconTransfer, bg: '#FDD5C4', onClick: onOpenTransfer },
  ]

  return (
    <div className="h-full w-full bg-white flex flex-col relative">
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
      {/* Top panel with curve */}
      <div className="relative bg-[#fafafa] border-b border-[#f5f5f5] overflow-hidden">
        <img
          src={HeaderCurve}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute -top-6 right-[-20px] w-[320px] opacity-80"
        />

        <div className="relative flex items-start justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <img
              src={ProfilePic}
              alt=""
              className="size-8 rounded-full object-cover"
            />
            <div>
              <p className="font-manrope font-bold text-[12px] text-parkway-grey01 tracking-[-0.12px] leading-none">
                Hi, Jenny
              </p>
              <p className="font-manrope text-[12px] text-[#808080] tracking-[-0.12px] mt-[2px] leading-none">
                Welcome to Parkway Wallet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-parkway-grey06 border border-parkway-grey05 flex items-center gap-1 px-2 py-1 rounded-full">
              <img src={HelpIcon} alt="" className="size-[16px]" />
              <span className="font-manrope font-bold text-[10px] text-parkway-grey01">Get Help</span>
            </div>
            <img src={Bell} alt="Notifications" className="size-[30px]" />
          </div>
        </div>

        {/* Balance / quick actions card */}
        <div className="relative mt-6 mx-auto w-[335px] bg-white rounded-[10px] shadow-card pt-4 pb-5 px-3 mb-5">
          <div className="flex flex-col items-start gap-2 px-2">
            <div className="flex items-center gap-1 bg-white rounded-full h-[26px] px-2">
              <span className="font-manrope text-[12px] text-parkway-grey01">
                <span className="font-normal">Acc. No:</span>
                <span className="font-semibold"> 0123456789</span>
              </span>
              <img src={ArrowAcc} alt="" className="size-[10px]" />
            </div>
            <div className="flex items-center justify-between w-full px-1">
              <h2 className="font-display font-medium text-[26px] text-parkway-grey01 tracking-tightish leading-none">
                ₦30,000.00
              </h2>
              <div className="flex items-center gap-2">
                <img src={IconCopy} alt="Copy" className="size-[18px]" />
                <img src={IconEye} alt="Show" className="size-[22px]" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.onClick}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className="size-[60px] rounded-[8px] flex items-center justify-center transition-transform group-active:scale-95"
                  style={{ background: a.bg }}
                >
                  <img src={a.icon} alt="" className="size-[26px]" />
                </div>
                <span className="font-manrope font-semibold text-[10px] text-parkway-grey01">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Promo banner carousel */}
      <div className="pt-4 pb-5">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pl-5 pr-5">
          <div
            className="shrink-0 w-[335px] h-[85px] rounded-[8px] overflow-hidden relative bg-parkway-buff04"
            style={{
              backgroundImage: `url(${BannerBankAccounts})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <PromoBannerBlack
            title="Earn up to ₦30,000"
            body="When you refer your friends to parkway wallet"
            cta="Learn More"
            accent="refer"
          />
          <PromoBannerBlack
            title="Parkway Virtual Card"
            body="Handle online payments, subscriptions and more with ease."
            cta="Get it Now"
            accent="card"
          />
        </div>
      </div>

      {/* Quick Actions grid */}
      <div className="px-5 pb-6">
        <h3 className="font-manrope font-bold text-[16px] text-[#313131] leading-[1.8]">
          Quick Actions
        </h3>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((q) => (
            <button
              key={q.label}
              type="button"
              className="relative flex flex-col items-center gap-1 group"
            >
              <div
                className="size-[60px] rounded-[8px] flex items-center justify-center bg-[#fafafa] transition-transform group-active:scale-95"
              >
                <img src={q.icon} alt="" className="size-[36px]" />
              </div>
              {q.badge && (
                <span className="absolute -top-1 right-2 bg-[#e70404] text-[#fddcce] font-manrope font-semibold text-[7px] leading-[10px] px-[6px] py-[1px] rounded-md">
                  {q.badge}
                </span>
              )}
              <span className="font-manrope font-semibold text-[13px] text-parkway-grey01 text-center">
                {q.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-manrope font-bold text-[16px] text-[#313131] leading-[1.8]">
            Recent Transactions
          </h3>
          <button type="button" className="flex items-center gap-1">
            <span className="font-manrope font-semibold text-[14px] text-parkway-tangerine01 tracking-[-0.14px]">
              See All
            </span>
            <img src={ArrowTiny} alt="" className="size-[14px] -rotate-90" />
          </button>
        </div>

        <div className="mt-3 bg-white border border-[#f5f5f5] rounded-[8px] px-4 pt-4 pb-6 space-y-5">
          {TRANSACTIONS.map((t, idx) => (
            <TxnRow key={idx} tx={t} />
          ))}
        </div>
      </div>
      </div>

      {/* Bottom nav — sticks to bottom of the phone screen */}
      <nav className="shrink-0 h-[72px] bg-white border-t border-[#f5f5f5] flex items-center justify-around px-6"
           style={{ boxShadow: '0 -4px 10px rgba(0,0,0,0.06)' }}
      >
        <NavItem icon={NavHome} label="Home" active />
        <NavItem icon={NavCards} label="Cards" />
        <NavItem icon={NavBills} label="Bills" />
        <NavItem icon={NavMore} label="More" />
      </nav>
    </div>
  )
}

function TxnRow({ tx }: { tx: Txn }) {
  const sign = tx.direction === 'in' ? '+' : '-'
  const amountColor = tx.direction === 'in' ? 'text-[#6bc127]' : 'text-[#FC5555]'
  const statusStyle = {
    Successful: 'bg-parkway-successBg text-parkway-success',
    Failed: 'bg-parkway-failBg text-[#FC5555]',
    Pending: 'bg-parkway-pendingBg text-parkway-pending',
  }[tx.status]
  return (
    <div className="flex items-center gap-3">
      <div className="size-9 rounded-full bg-[#fef1eb] flex items-center justify-center shrink-0">
        <img
          src={tx.direction === 'in' ? MoneySend : MoneyReceive}
          alt=""
          className="size-[18px]"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-manrope font-semibold text-[14px] text-parkway-grey01 truncate">
          {tx.name}
        </p>
        <span
          className={`inline-block mt-1 font-manrope font-medium text-[10px] px-1 py-[2px] rounded tracking-[-0.25px] ${statusStyle}`}
        >
          {tx.status}
        </span>
      </div>
      <div className="text-right">
        <p className={`font-manrope font-semibold text-[14px] ${amountColor} tabular-nums`}>
          {sign} ₦{tx.amount}
        </p>
        <p className="font-manrope font-medium text-[10px] text-[#999] mt-[2px]">
          {tx.date}
        </p>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <button type="button" className="flex flex-col items-center gap-[2px]">
      <img src={icon} alt="" className="size-[22px]" style={{ opacity: active ? 1 : 0.6 }} />
      <span
        className="font-manrope font-semibold text-[10px] tracking-[-0.1px]"
        style={{ color: active ? '#F9956B' : '#B3B3B3' }}
      >
        {label}
      </span>
    </button>
  )
}

function PromoBannerBlack({
  title,
  body,
  cta,
  accent,
}: {
  title: string
  body: string
  cta: string
  accent: 'refer' | 'card'
}) {
  return (
    <div className="shrink-0 w-[335px] h-[85px] rounded-[8px] overflow-hidden relative bg-black">
      <div className="absolute left-[15px] top-[9px] w-[200px] space-y-1">
        <p className="font-manrope font-extrabold text-[13px] text-white leading-tight">
          {title}
        </p>
        <p className="font-manrope text-[9px] text-white/90 leading-tight">
          {body}
        </p>
        <span className="inline-flex items-center justify-center bg-parkway-tangerine01 text-white font-manrope font-semibold text-[8px] px-[6px] py-[2px] rounded-[2px] mt-1">
          {cta}
        </span>
      </div>
      <AccentShape accent={accent} />
    </div>
  )
}

function AccentShape({ accent }: { accent: 'refer' | 'card' }) {
  if (accent === 'refer') {
    return (
      <>
        <div className="absolute right-[-10px] top-[-18px] size-[110px] rounded-full bg-parkway-tangerine01/15 blur-xl" />
        <div className="absolute right-[8px] top-[14px] grid grid-cols-3 gap-[3px]">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="size-[16px] rounded-full"
              style={{
                background: ['#F9956B', '#FDD5C4', '#FFC700'][i % 3],
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      </>
    )
  }
  return (
    <>
      <div className="absolute right-[-40px] top-[-30px] size-[142px] rounded-full bg-parkway-tangerine01/15" />
      <div className="absolute right-[12px] top-[12px] w-[90px] h-[60px] rounded-md border border-white/20 bg-gradient-to-br from-[#F9956B] to-[#B65532] flex items-end justify-between p-2">
        <span className="font-display text-white text-[10px] tracking-tightish">PARKWAY</span>
        <span className="font-manrope text-white/80 text-[8px]">1234</span>
      </div>
    </>
  )
}
