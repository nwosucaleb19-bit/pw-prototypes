import { useEffect, useRef, useState } from 'react'
import BottomSheet from '../../components/BottomSheet'
import LivenessTipsSheet from '../../components/LivenessTipsSheet'
import StatusSheet from '../../components/StatusSheet'
import { useOnlineGuard, useSimulation } from '../../onboarding/network'
import { BackButton, PrimaryButton, Stepper } from '../../onboarding/ui'

type Props = {
  onBack: () => void
  onComplete: () => void
}

/**
 * intro    → "Get Started" over the empty oval
 * tips     → "Let's verify it's you" sheet
 * starting → camera permission / warm-up
 * scanning → liveness prompts, one after another
 * done     → "Face Verification Successful" sheet
 * failed   → "Face Verification Failed" sheet (Retry rescans)
 */
type Phase = 'intro' | 'tips' | 'starting' | 'scanning' | 'done' | 'failed'

/** Each prompt also sets how close the face appears, so "come closer" reads physically. */
const PROMPTS: { title: string; zoom: number }[] = [
  { title: 'Come closer to the camera', zoom: 1 },
  { title: 'Come closer to the camera again', zoom: 1.14 },
  { title: 'Smile', zoom: 1.22 },
]
const PROMPT_MS = 1900
const SUCCESS_AFTER_MS = 900

// Oval geometry (202 × 262 in the intro frame, 216 × 280 while scanning).
const W = 216
const H = 280

export default function FaceVerification({ onBack, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [prompt, setPrompt] = useState(0)
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const net = useOnlineGuard()
  const { faceFails } = useSimulation()
  // The panel's "Face check fails" switch makes the first attempt fail; a retry passes.
  const [attempts, setAttempts] = useState(0)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }
  useEffect(() => stopCamera, [])

  const startCamera = async () => {
    setPhase('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 640 }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setHasCamera(true)
    } catch {
      setHasCamera(false)
    }
    setPrompt(0)
    setPhase('scanning')
  }

  // Step through the prompts, then present the success sheet.
  useEffect(() => {
    if (phase !== 'scanning') return
    const last = prompt === PROMPTS.length - 1
    const t = window.setTimeout(() => {
      if (!last) setPrompt(prompt + 1)
      else {
        videoRef.current?.pause()
        if (faceFails && attempts === 0) {
          setAttempts(1)
          setPhase('failed')
          if ('vibrate' in navigator) navigator.vibrate([35, 40, 35])
        } else {
          setPhase('done')
          if ('vibrate' in navigator) navigator.vibrate(20)
        }
      }
    }, last ? PROMPT_MS + SUCCESS_AFTER_MS : PROMPT_MS)
    return () => window.clearTimeout(t)
  }, [phase, prompt, faceFails, attempts])

  const rescan = () => {
    setPrompt(0)
    setPhase('scanning')
    videoRef.current?.play().catch(() => {})
  }
  const leaveFailure = () => {
    stopCamera()
    setHasCamera(null)
    setPrompt(0)
    setPhase('intro')
  }

  const live = phase === 'scanning' || phase === 'done' || phase === 'failed'
  const title = live ? PROMPTS[prompt].title : 'Face Verification'
  const zoom = live ? PROMPTS[prompt].zoom : 1
  const ovalW = live ? W : 202
  const ovalH = live ? H : 262

  return (
    <div className="h-full w-full bg-[#525252] flex flex-col relative overflow-hidden">
      <div className="shrink-0">
        <div className="h-[60px] flex items-center px-[14px]">
          <BackButton tone="light" onClick={() => { stopCamera(); onBack() }} />
        </div>
        <div className="pt-1.5">
          <Stepper step={4} animate tone="light" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 pt-[30px]">
        <div className="h-[30px] grid place-items-center" aria-live="polite">
          <h1 key={title} className="col-start-1 row-start-1 font-display font-medium text-[20px] leading-[1.5] tracking-[0.02em] text-white uppercase text-center animate-soft-in">
            {title}
          </h1>
        </div>
        <p className="mt-1.5 font-manrope font-medium text-[12px] text-white">
          {phase === 'starting' ? 'Opening camera…' : 'Look directly into the camera'}
        </p>

        <div
          className="relative mt-[44px] transition-[width,height] duration-500"
          style={{ width: ovalW, height: ovalH, transitionTimingFunction: 'var(--ease-travel)' }}
        >
          {/* Face area */}
          <div
            className="absolute inset-0 rounded-[50%] overflow-hidden bg-white transition-shadow duration-300"
            style={{
              boxShadow: !live ? '0 0 0 4px #F9956B' : `0 0 0 3px #fff, 0 0 0 7px ${phase === 'failed' ? '#FFA200' : '#44AC21'}`,
            }}
          >
            <div className="absolute inset-0 transition-transform duration-700" style={{ transform: `scale(${zoom})`, transitionTimingFunction: 'var(--ease-travel)' }}>
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 size-full object-cover -scale-x-100 transition-opacity duration-500"
                style={{ opacity: hasCamera && live ? 1 : 0 }}
              />
              {hasCamera === false && live && <SimulatedFace smiling={prompt === PROMPTS.length - 1} />}
            </div>
          </div>
        </div>

        {hasCamera === false && live && (
          <p className="mt-10 font-manrope font-medium text-[11px] text-white/70 animate-soft-in">Camera unavailable, so this check is simulated.</p>
        )}
      </div>

      {/* The button only exists before the camera starts, as in the design. */}
      <div
        className="shrink-0 px-5 pb-6 transition-[opacity,transform] duration-300"
        style={{ opacity: live ? 0 : 1, transform: live ? 'translate3d(0,12px,0)' : 'none', pointerEvents: live ? 'none' : undefined }}
      >
        <PrimaryButton onClick={() => setPhase('tips')} loading={phase === 'starting'} loadingText="Opening camera…">
          Get Started
        </PrimaryButton>
      </div>

      <LivenessTipsSheet
        open={phase === 'tips'}
        onClose={() => setPhase('intro')}
        onProceed={() => { if (!net.guard(startCamera)) setPhase('intro') }}
      />
      {net.sheet}

      <StatusSheet
        open={phase === 'failed'}
        tone="warning"
        title="Face Verification Failed"
        body={'The data provided does not match.\nKindly provide accurate data to proceed.'}
        onRetry={rescan}
        onBack={leaveFailure}
      />

      <BottomSheet open={phase === 'done'} onClose={() => {}} dismissOnBackdrop={false} showGrabber={false} padding="px-5 pt-9 pb-6">
        <div className="flex flex-col items-center text-center">
          <span className="size-14 rounded-full bg-[#2FB344] flex items-center justify-center" style={{ animation: 'markPop 460ms var(--ease-pop) 200ms both' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path d="M7 14.5 12 19.5 21.5 9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 26, strokeDashoffset: 26, animation: 'checkDraw 380ms var(--ease-arrive) 420ms forwards' }} />
            </svg>
          </span>
          <h2 className="mt-4 font-manrope font-bold text-[18px] leading-[1.4] text-[#1F2937]">Face Verification Successful</h2>
          <p className="mt-2 font-manrope font-medium text-[12px] text-[#6B7280]">Facial Liveliness check has been completed!</p>
        </div>
        <button
          type="button"
          onClick={() => { stopCamera(); onComplete() }}
          className="mt-[34px] w-full h-12 rounded-[8px] bg-parkway-tangerine01 text-white font-manrope font-semibold text-[14px] active:scale-[0.98] transition-transform"
        >
          Proceed
        </button>
      </BottomSheet>
    </div>
  )
}

/** Stand-in face when no camera is available. */
function SimulatedFace({ smiling }: { smiling: boolean }) {
  return (
    <svg viewBox="0 0 216 280" className="absolute inset-0 size-full animate-soft-in" aria-hidden>
      <rect width="216" height="280" fill="#EDE3DA" />
      <path d="M40 120c0-50 30-80 68-80s68 30 68 80v40H40z" fill="#B8754F" />
      <ellipse cx="108" cy="130" rx="48" ry="58" fill="#F1CDB3" />
      <path d="M26 280c8-50 42-76 82-76s74 26 82 76z" fill="#F1CDB3" />
      <circle cx="90" cy="124" r="4" fill="#5B4636" />
      <circle cx="126" cy="124" r="4" fill="#5B4636" />
      <path
        d={smiling ? 'M90 152c10 10 26 10 36 0' : 'M94 156c8 3 20 3 28 0'}
        stroke="#B5655A"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'd 400ms var(--ease-arrive)' }}
      />
    </svg>
  )
}
