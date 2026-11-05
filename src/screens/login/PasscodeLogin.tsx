import { useEffect, useRef, useState } from 'react'
import BottomSheet from '../../components/BottomSheet'
import Collapse from '../../components/motion/Collapse'
import { PASSCODE_LENGTH, PasscodeDots, PasscodeKeypad, buzzError, shake } from '../../components/passcode/PasscodePad'
import { useToast } from '../../onboarding/ui'
import LoginHeaderArc from '../../components/LoginHeaderArc'
import IconFaceId from '../../assets/figma/login/face-id.svg'
import IconGetHelp from '../../assets/figma/login/get-help.svg'
import FaceIdSymbol from '../../assets/figma/login/faceid-symbol.svg'
import FaceIdCheckCircle from '../../assets/figma/login/faceid-check-circle.svg'
import IconLock from '../../assets/figma/login/lock-fill.svg'
import IconArrowRight from '../../assets/figma/login/arrow-right.svg'

/** Wrong entries allowed before the account locks. */
const MAX_ATTEMPTS = 5
/** Face ID is withdrawn once this few attempts remain. */
const FACE_ID_CUTOFF = 2

type Props = {
  firstName: string
  maskedPhone: string
  /** The passcode that unlocks the account. */
  passcode: string
  onSuccess: () => void
  onLogout: () => void
  /** "Go Back" on the locked sheet. */
  onLockedGoBack: () => void
}

type FaceIdStage = 'idle' | 'scanning' | 'done'

/**
 * Login with passcode (Figma 36319:22275 and its states): attempts counting
 * down (36377:23386, 36396:25387, 36396:25448, 36396:25509), Face ID
 * (36319:22356, 36319:22443) withdrawn at 2 attempts left, and the locked
 * sheet (36396:25572). Design coordinates include a 44px status bar, which
 * the prototype draws separately, so everything sits 44px higher here.
 */
export default function PasscodeLogin({ firstName, maskedPhone, passcode, onSuccess, onLogout, onLockedGoBack }: Props) {
  const [code, setCode] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS)
  const [error, setError] = useState<string | null>(null)
  const [shownError, setShownError] = useState('')
  const [locked, setLocked] = useState(false)
  const [lockedAt, setLockedAt] = useState<Date | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [faceId, setFaceId] = useState<FaceIdStage>('idle')
  const dotsRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const faceIdAvailable = attemptsLeft > FACE_ID_CUTOFF && !locked
  const busy = locked || unlocking || faceId !== 'idle'

  // Check the code once the sixth digit lands.
  useEffect(() => {
    if (code.length !== PASSCODE_LENGTH) return
    const t = window.setTimeout(() => {
      if (code === passcode) {
        setUnlocking(true)
        window.setTimeout(onSuccess, 260)
        return
      }
      const left = attemptsLeft - 1
      setAttemptsLeft(left)
      const message =
        left === 0 ? 'Invalid passcode' : `Invalid passcode. ${left} ${left === 1 ? 'attempt' : 'attempts'} left`
      setError(message)
      setShownError(message)
      buzzError()
      shake(dotsRef.current)
      window.setTimeout(() => setCode(''), 520)
      if (left === 0) {
        window.setTimeout(() => {
          setLockedAt(new Date())
          setLocked(true)
        }, 700)
      }
    }, 220)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const press = (d: string) => {
    if (busy || code.length >= PASSCODE_LENGTH) return
    if (error) setError(null)
    setCode((c) => c + d)
  }
  const back = () => setCode((c) => c.slice(0, -1))

  const startFaceId = () => {
    if (!faceIdAvailable || busy) return
    setFaceId('scanning')
    window.setTimeout(() => setFaceId('done'), 1100)
    window.setTimeout(onSuccess, 1100 + 750)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-parkway-grey06 flex flex-col items-center">
      {/* Header: arc, "Not you? Log out", Get Help */}
      <div className="pointer-events-none absolute left-1/2 top-[-44px] h-[110px] w-[375px] -translate-x-1/2 overflow-hidden">
        <LoginHeaderArc />
      </div>
      <div className="relative w-full max-w-[375px] px-5 pt-[3px] flex items-center justify-between">
        <p className="mt-1 font-manrope font-medium text-[14px] leading-normal tracking-[-0.28px] text-parkway-grey09 whitespace-nowrap">
          Not you?{' '}
          <button
            type="button"
            onClick={onLogout}
            className="font-semibold text-parkway-tangerine01 active:opacity-60 transition-opacity"
          >
            Log out
          </button>
        </p>
        <button
          type="button"
          onClick={() => toast.show('Connecting you to support')}
          className="flex items-center gap-1 rounded-[24px] border border-[#F5F5F5] bg-parkway-grey06 px-2 py-1 active:scale-95 transition-transform"
        >
          <span className="relative size-[19px] overflow-hidden">
            <span className="absolute left-[5.56%] right-[5.56%] top-[calc(50%+0.5px)] aspect-square -translate-y-1/2">
              <span className="absolute inset-[9.37%_9.38%_9.38%_9.38%]">
                <span className="absolute inset-[-5.47%]">
                  <img src={IconGetHelp} alt="" className="block size-full max-w-none" />
                </span>
              </span>
            </span>
          </span>
          <span className="font-manrope font-bold text-[11px] leading-normal text-parkway-grey01">Get Help</span>
        </button>
      </div>

      {/* Greeting */}
      <div className="mt-[82px] flex flex-col items-center text-center leading-[1.52] rise-in">
        <p className="font-display font-medium text-[22px] text-parkway-grey01">Hi, {firstName} 👋</p>
        <p className="font-manrope font-medium text-[14px] tracking-[-0.56px] text-parkway-grey09">{maskedPhone}</p>
      </div>

      {/* Dots, error, Forgot Passcode. The block rises as the error opens,
          so the keypad only eases down a little, as in the design. */}
      <div
        className="py-8 flex flex-col items-center"
        style={{ marginTop: error ? 14 : 39, transition: 'margin-top 280ms var(--ease-arrive)' }}
      >
        <PasscodeDots count={code.length} error={!!error} dotsRef={dotsRef} />
        <Collapse open={!!error} duration={280}>
          <p
            className="pt-6 font-manrope font-semibold text-[11px] leading-normal tracking-[-0.11px] text-[#D94141] text-center whitespace-nowrap"
            aria-live="assertive"
          >
            {shownError}
          </p>
        </Collapse>
        <button
          type="button"
          onClick={() => toast.show('Passcode reset isn’t part of this prototype yet')}
          className="mt-6 font-manrope font-medium text-[12px] leading-normal tracking-[-0.24px] text-parkway-grey09 underline decoration-[5%] underline-offset-2 active:opacity-60"
        >
          Forgot Passcode?
        </button>
      </div>

      {/* Keypad, with Face ID bottom-left until attempts run low */}
      <div className="mt-4 rise-in" style={{ ['--d' as string]: '80ms' }}>
        <PasscodeKeypad
          onDigit={press}
          onBackspace={back}
          showBackspace
          disabled={busy}
          leftSlot={
            <button
              type="button"
              onClick={startFaceId}
              disabled={!faceIdAvailable || busy}
              aria-label="Log in with Face ID"
              aria-hidden={!faceIdAvailable}
              className="size-[68px] rounded-full flex items-center justify-center active:bg-black/5 active:scale-95"
              style={{
                opacity: faceIdAvailable ? 1 : 0,
                transform: faceIdAvailable ? undefined : 'scale(0.85)',
                transition: 'opacity 260ms ease, transform 300ms var(--ease-arrive), background-color 150ms ease',
              }}
            >
              <img src={IconFaceId} alt="" className="size-8" />
            </button>
          }
        />
      </div>

      {/* Face ID panel */}
      <FaceIdPanel stage={faceId} />

      {/* Locked */}
      <BottomSheet open={locked} onClose={() => {}} dismissOnBackdrop={false} showGrabber={false} padding="px-5 pt-5 pb-10">
        <div className="flex flex-col items-center gap-6">
          <span
            className="rounded-[40px] bg-[#FFF0F0] p-[10px]"
            style={{ animation: locked ? 'markPop 560ms var(--ease-pop) 160ms both' : undefined }}
          >
            <img src={IconLock} alt="" className="block size-10" />
          </span>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="w-[307px] font-display font-medium text-[20px] leading-normal text-parkway-grey01">
              Your account is temporarily locked for security reasons.
            </p>
            <p className="w-[281px] font-manrope font-medium text-[12px] leading-normal text-[#808080]">
              We locked it to protect you. Verify your identity to regain access.
            </p>
            <p className="w-[273px] font-manrope font-medium text-[12px] leading-[1.415] text-parkway-grey01">
              Your account was temporarily locked on <b className="font-bold">{lockedAt ? formatDate(lockedAt) : ''}</b> at{' '}
              <b className="font-bold">{lockedAt ? formatTime(lockedAt) : ''}</b>
            </p>
          </div>
          <div className="w-full flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toast.show('Identity verification isn’t part of this prototype yet')}
              className="w-full h-12 rounded-[8px] bg-parkway-tangerine01 flex items-center justify-center gap-[10px] font-manrope font-semibold text-[14px] leading-[1.8] text-white active:scale-[0.98] transition-transform"
            >
              Verify my Identity
              <img src={IconArrowRight} alt="" className="size-5" />
            </button>
            <button
              type="button"
              onClick={onLockedGoBack}
              className="w-full h-12 rounded-[8px] bg-parkway-tangerine05 font-manrope font-semibold text-[14px] leading-[1.8] text-parkway-tangerine01 active:scale-[0.98] transition-transform"
            >
              Go Back
            </button>
          </div>
        </div>
      </BottomSheet>

      {toast.el}
    </div>
  )
}

/**
 * The system-style Face ID panel near the top of the screen: the face
 * symbol while scanning, then a green check that draws itself.
 */
function FaceIdPanel({ stage }: { stage: FaceIdStage }) {
  const open = stage !== 'idle'
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-2 z-20 size-[125.568px] rounded-[33.263px] bg-black"
      style={{
        boxShadow: '0 9.979px 30.768px rgba(0,0,0,0.22)',
        opacity: open ? 1 : 0,
        transform: `translateX(-50%) scale(${open ? 1 : 0.9})`,
        transition: 'opacity 220ms ease, transform 320ms var(--ease-arrive)',
      }}
      aria-hidden={!open}
      role="status"
      aria-label={stage === 'done' ? 'Face ID recognised' : stage === 'scanning' ? 'Scanning with Face ID' : undefined}
    >
      {/* Scanning: the face symbol breathes gently */}
      <img
        src={FaceIdSymbol}
        alt=""
        className="absolute left-1/2 top-[33.67px] size-[58.211px] -translate-x-1/2"
        style={{
          opacity: stage === 'scanning' ? 1 : 0,
          animation: stage === 'scanning' ? 'faceIdBreathe 900ms ease-in-out infinite' : undefined,
          transition: 'opacity 180ms ease',
        }}
      />
      {/* Recognised: circle and a check that draws itself */}
      <span
        className="absolute left-1/2 top-[34.09px] size-[58.211px] -translate-x-1/2"
        style={{ opacity: stage === 'done' ? 1 : 0, transition: 'opacity 180ms ease' }}
      >
        <img src={FaceIdCheckCircle} alt="" className="absolute inset-0 block size-full max-w-none" />
        {stage === 'done' && (
          <svg viewBox="0 0 58 58" className="absolute inset-0 size-full" fill="none" aria-hidden>
            <path
              d="M18.5 29.5l7.5 7.5 14-15"
              pathLength={1}
              stroke="#87FA89"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'checkDraw 360ms var(--ease-travel) 80ms forwards' }}
            />
          </svg>
        )}
      </span>
      <style>{`
        @keyframes faceIdBreathe {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50%      { transform: translateX(-50%) scale(1.05); }
        }
      `}</style>
    </div>
  )
}

function formatDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

function formatTime(d: Date) {
  const h = d.getHours() % 12 || 12
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}${d.getHours() < 12 ? 'AM' : 'PM'}`
}
