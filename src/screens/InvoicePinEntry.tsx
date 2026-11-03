import PinEntry from './PinEntry'
import type { Outcome } from '../components/OutcomeMark'

type Props = {
  onBack: () => void
  onSuccess: (outcome: Outcome) => void
}

/** PIN step for invoice payments; the success page is presented by the app. */
export default function InvoicePinEntry({ onBack, onSuccess }: Props) {
  return <PinEntry title="Send To Invoice" onBack={onBack} onSuccess={onSuccess} />
}
