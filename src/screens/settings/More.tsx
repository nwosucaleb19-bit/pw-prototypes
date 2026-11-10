import { useToast } from '../../onboarding/ui'
import BottomNav, { type Tab } from '../../components/BottomNav'
import { Chevron, RowIcon, SettingsRow, SettingsScreen, riseDelay } from '../../components/settings/SettingsUI'
import Avatar from '../../assets/figma/settings/avatar.png'
import IconFileText from '../../assets/figma/settings/file-text.svg'
import IconShieldCheck from '../../assets/figma/settings/shield-check.svg'
import IconBell from '../../assets/figma/settings/bell-ringing.svg'
import IconGift from '../../assets/figma/settings/gift.svg'
import IconSun from '../../assets/figma/settings/sun.svg'
import IconScales from '../../assets/figma/settings/scales.svg'
import IconHeadset from '../../assets/figma/settings/headset.svg'
import IconInfo from '../../assets/figma/settings/info.svg'
import IconSignOut from '../../assets/figma/settings/sign-out.svg'

type Props = {
  /** Another bottom-nav tab was picked. */
  onSelectTab: (tab: Tab) => void
  onOpenSecurity: () => void
  onLogout: () => void
}

/**
 * The More tab (Figma 36652:14503): account, settings list, and Logout.
 * It's a tab, so the bottom nav shows with More active and there's no back arrow.
 */
export default function More({ onSelectTab, onOpenSecurity, onLogout }: Props) {
  const toast = useToast()
  const soon = (what: string) => () => toast.show(`${what} isn’t part of this prototype yet`)

  const items = [
    { label: 'Statements', icon: IconFileText, onClick: soon('Statements') },
    { label: 'Security', icon: IconShieldCheck, onClick: onOpenSecurity },
    { label: 'Notifications', icon: IconBell, onClick: soon('Notifications') },
    { label: 'Referrals', icon: IconGift, onClick: soon('Referrals') },
    { label: 'Appearance', icon: IconSun, onClick: soon('Appearance') },
    { label: 'Legal', icon: IconScales, onClick: soon('Legal') },
    { label: 'Support', icon: IconHeadset, onClick: soon('Support') },
    { label: 'About Parkway Wallet', icon: IconInfo, onClick: soon('About Parkway Wallet') },
  ]

  return (
    <SettingsScreen
      title="More"
      overlay={toast.el}
      footer={<BottomNav active="more" onSelect={(t) => (t === 'home' ? onSelectTab(t) : soon(t === 'cards' ? 'Cards' : 'Bills')())} />}
    >
      <div className="flex flex-col gap-6">
        <SettingsRow
          icon={<img src={Avatar} alt="" width={33} height={33} className="size-[32.978px] shrink-0 rounded-full" />}
          label="My Account"
          onClick={soon('My Account')}
          style={riseDelay(0)}
          trailing={
            <span className="flex items-end gap-1">
              <span className="rounded-[12px] bg-parkway-grey01 px-1 py-[2px] font-manrope font-bold text-[8px] leading-normal text-white">
                Tier 2
              </span>
              <Chevron />
            </span>
          }
        />

        <div className="flex flex-col gap-3">
          {items.map((it, i) => (
            <SettingsRow
              key={it.label}
              icon={<RowIcon src={it.icon} />}
              label={it.label}
              onClick={it.onClick}
              style={riseDelay(i + 1)}
            />
          ))}
        </div>

        <SettingsRow
          label="Logout"
          labelClassName="font-semibold text-[#FF0000]"
          trailing={<RowIcon src={IconSignOut} />}
          onClick={onLogout}
          style={riseDelay(items.length + 1)}
        />
      </div>
    </SettingsScreen>
  )
}
