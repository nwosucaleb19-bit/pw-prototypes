import { OnboardingHeader } from '../../onboarding/ui'

export type IdMethod = 'bvn' | 'nin'

type Props = {
  onBack: () => void
  onPick: (m: IdMethod) => void
}

const OPTIONS: { id: IdMethod; title: string; ussd: string; disc: string; ink: string }[] = [
  { id: 'bvn', title: 'Use BVN', ussd: '*565*0#', disc: '#FAF1D2', ink: '#E0B400' },
  { id: 'nin', title: 'Use NIN', ussd: '*346*3#', disc: '#FEEAE1', ink: '#F9956B' },
]

export default function IdentityChoice({ onBack, onPick }: Props) {
  return (
    <div className="h-full w-full bg-parkway-bg flex flex-col relative overflow-hidden">
      <OnboardingHeader step={2} animateStep onBack={onBack} />

      <div className="flex-1 px-5 pt-[22px]">
        <div className="text-center">
          <h1 className="font-display font-medium text-[22px] leading-[1.1] text-[#1F2937]">
            Welcome to <span className="text-parkway-tangerine01">Parkway Wallet</span>
          </h1>
          <p className="mt-3 font-manrope font-medium text-[12px] leading-[1.4] text-[#6B7280]">
            Create your Tier 1 wallet in minutes using your BVN or NIN.
          </p>
        </div>

        <h2 className="mt-8 font-manrope font-bold text-[16px] leading-[1.5] text-[#1F2937] text-center">
          How would you like to verify your identity?
        </h2>

        <div className="mt-[30px] space-y-3">
          {OPTIONS.map((o, i) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onPick(o.id)}
              className="group w-full bg-white border border-[#EDEEF2] rounded-[8px] px-4 py-[14px] flex items-center justify-between text-left hover:border-parkway-tangerine01/40 active:scale-[0.99] transition-[transform,border-color] duration-200 rise-in"
              style={{ ['--d' as string]: `${140 + i * 70}ms` }}
            >
              <span className="flex items-center gap-2">
                <span className="size-[34px] rounded-full flex items-center justify-center shrink-0" style={{ background: o.disc }}>
                  <PasswordGlyph color={o.ink} />
                </span>
                <span>
                  <span className="block font-manrope font-semibold text-[14px] leading-[19px] text-parkway-grey01">{o.title}</span>
                  <span className="block mt-1.5 font-manrope font-medium text-[12px] leading-4 text-[#6B7280]">
                    Dial <b className="font-bold text-parkway-grey09">{o.ussd}</b> to get your {o.id.toUpperCase()}
                  </span>
                </span>
              </span>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M7.5 4 13.5 10l-6 6" stroke="#F9956B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** vaadin:password — a pill with three dots, like a masked field. */
function PasswordGlyph({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="0.75" y="4.25" width="14.5" height="7.5" rx="1.5" stroke={color} strokeWidth="1.1" />
      <circle cx="4.6" cy="8" r="0.95" fill={color} />
      <circle cx="8" cy="8" r="0.95" fill={color} />
      <circle cx="11.4" cy="8" r="0.95" fill={color} />
    </svg>
  )
}
