import NavHome from '../assets/figma/nav-home.svg'
import NavHomeInactive from '../assets/figma/nav-home-inactive.svg'
import NavCards from '../assets/figma/nav-cards.svg'
import NavBills from '../assets/figma/nav-bills.svg'
import NavMore from '../assets/figma/nav-more.svg'
import NavMoreActive from '../assets/figma/nav-more-active.svg'

export type Tab = 'home' | 'cards' | 'bills' | 'more'

/** Each tab's icon when active and inactive (same artwork, orange or grey). */
const TABS: { id: Tab; label: string; icon: string; activeIcon: string }[] = [
  { id: 'home', label: 'Home', icon: NavHomeInactive, activeIcon: NavHome },
  { id: 'cards', label: 'Cards', icon: NavCards, activeIcon: NavCards },
  { id: 'bills', label: 'Bills', icon: NavBills, activeIcon: NavBills },
  { id: 'more', label: 'More', icon: NavMore, activeIcon: NavMoreActive },
]

/** The app's bottom nav, shared by the Home and More tabs. */
export default function BottomNav({ active, onSelect }: { active: Tab; onSelect?: (tab: Tab) => void }) {
  return (
    <nav
      className="shrink-0 h-[72px] bg-white border-t border-[#f5f5f5] flex items-center justify-around px-6"
      style={{ boxShadow: '0 -4px 10px rgba(0,0,0,0.06)' }}
    >
      {TABS.map((t) => {
        const on = t.id === active
        return (
          <button
            key={t.id}
            type="button"
            onClick={on ? undefined : () => onSelect?.(t.id)}
            aria-current={on ? 'page' : undefined}
            className="flex flex-col items-center gap-[2px] active:opacity-70"
          >
            <img src={on ? t.activeIcon : t.icon} alt="" className="size-[22px]" style={{ opacity: on ? 1 : 0.6 }} />
            <span
              className="font-manrope font-semibold text-[10px] tracking-[-0.1px]"
              style={{ color: on ? '#F9956B' : '#B3B3B3' }}
            >
              {t.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
