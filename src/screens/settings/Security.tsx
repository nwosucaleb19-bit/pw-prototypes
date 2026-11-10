import { useToast } from '../../onboarding/ui'
import { RowIcon, SettingsRow, SettingsScreen, SettingsToggle, riseDelay } from '../../components/settings/SettingsUI'
import IconFaceId from '../../assets/figma/settings/face-id.svg'
import IconPassword from '../../assets/figma/settings/password.svg'
import IconLockKey from '../../assets/figma/settings/lock-key.svg'
import IconKey from '../../assets/figma/settings/key.svg'

type Props = {
  onBack: () => void
  faceIdOn: boolean
  onToggleFaceId: () => void
  onChangePasscode: () => void
}

/** Security settings (Figma 36652:14441). */
export default function Security({ onBack, faceIdOn, onToggleFaceId, onChangePasscode }: Props) {
  const toast = useToast()
  const soon = (what: string) => () => toast.show(`${what} isn’t part of this prototype yet`)

  return (
    <SettingsScreen title="Security" onBack={onBack} overlay={toast.el}>
      <div className="flex flex-col gap-[13px]">
        <SettingsRow
          icon={<RowIcon src={IconFaceId} />}
          label="Face or Touch ID"
          trailing={<SettingsToggle on={faceIdOn} />}
          checked={faceIdOn}
          onClick={onToggleFaceId}
          style={riseDelay(0)}
        />
        <SettingsRow icon={<RowIcon src={IconPassword} />} label="Transaction PIN" onClick={soon('Transaction PIN')} style={riseDelay(1)} />
        <SettingsRow icon={<RowIcon src={IconLockKey} />} label="Password" onClick={soon('Password')} style={riseDelay(2)} />
        <SettingsRow icon={<RowIcon src={IconKey} />} label="Change Passcode" onClick={onChangePasscode} style={riseDelay(3)} />
      </div>
    </SettingsScreen>
  )
}
