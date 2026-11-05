import { useRef, useState } from 'react'
import { useToast } from '../../onboarding/ui'
import LoginHeaderArc from '../../components/LoginHeaderArc'
import { buzzError, shake } from '../../components/passcode/PasscodePad'
import ParkwayLogo from '../../assets/figma/welcome/parkway-logo.png'
import IconEyeHidden from '../../assets/figma/login/eye-hidden.svg'
import IconArrowUp from '../../assets/figma/login/arrow-up.svg'

type Props = {
  onLogin: () => void
  onCreateAccount: () => void
}

/**
 * Login with phone/email and password (Figma 29530:36273), where "Not you?
 * Log out" leads. Design coordinates include a 44px status bar, which the
 * prototype draws separately, so everything sits 44px higher here.
 */
export default function PasswordLogin({ onLogin, onCreateAccount }: Props) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const idRef = useRef<HTMLDivElement>(null)
  const passwordRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const submit = () => {
    // Point at whatever is missing instead of disabling the button.
    if (!id.trim() || !password) {
      buzzError()
      if (!id.trim()) shake(idRef.current)
      if (!password) shake(passwordRef.current)
      return
    }
    onLogin()
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-parkway-grey06 flex flex-col items-center">
      {/* Header: white band with the logo, under the status bar */}
      <div className="absolute left-0 right-0 top-[-44px] h-[110px] overflow-hidden border-b border-[#E6E6E6] bg-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[110px] w-[375px] -translate-x-1/2 overflow-hidden">
          <LoginHeaderArc />
        </div>
        <img
          src={ParkwayLogo}
          alt="Parkway"
          className="absolute left-1/2 top-[66px] h-[19.129px] w-[107.05px] -translate-x-1/2 object-cover"
        />
      </div>

      <form
        className="relative mt-[96px] w-[335px] flex flex-col items-start gap-6 rise-in"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <h1 className="font-display font-medium text-[18px] leading-[1.52] text-parkway-grey01">Login</h1>

        <div className="w-full flex flex-col gap-6">
          <label className="flex flex-col gap-1.5">
            <span className="font-manrope font-medium text-[12px] leading-[1.415] text-parkway-grey01">Phone Number or Email</span>
            <div ref={idRef}>
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter phone number or Email"
                autoComplete="username"
                className="w-full rounded-[4px] border border-parkway-grey04 bg-transparent px-4 py-[14px] font-manrope font-normal text-[12px] leading-[1.415] text-parkway-grey01 placeholder:text-parkway-grey02 outline-none focus:border-parkway-tangerine01/70 transition-colors"
              />
            </div>
          </label>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="font-manrope font-medium text-[12px] leading-[1.415] text-parkway-grey01">
              Password
            </label>
            <div ref={passwordRef} className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full rounded-[4px] border border-parkway-grey04 bg-transparent py-[14px] pl-4 pr-12 font-manrope font-normal text-[12px] leading-[1.415] text-parkway-grey01 placeholder:text-parkway-grey02 outline-none focus:border-parkway-tangerine01/70 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center rounded-full active:bg-black/5"
              >
                <img
                  src={IconEyeHidden}
                  alt=""
                  className="size-5 transition-opacity duration-200"
                  style={{ opacity: showPassword ? 0.4 : 1 }}
                />
              </button>
            </div>
            <div className="pt-4 flex items-start justify-between font-manrope font-bold text-[12px] leading-[1.2] tracking-[-0.5px]">
              <button type="button" onClick={() => toast.show('Connecting you to support')} className="text-parkway-grey01 underline active:opacity-60">
                Contact Support
              </button>
              <button
                type="button"
                onClick={() => toast.show('Password reset isn’t part of this prototype yet')}
                className="text-parkway-tangerine01 active:opacity-60"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          role="checkbox"
          aria-checked={remember}
          onClick={() => setRemember((r) => !r)}
          className="flex items-center gap-2"
        >
          <span className="relative size-5">
            <span
              className="absolute inset-[5%] rounded-[4px] border flex items-center justify-center transition-colors duration-150"
              style={{ background: remember ? '#F9956B' : '#FFFFFF', borderColor: remember ? '#F9956B' : '#DDDDDD' }}
            >
              <svg
                viewBox="0 0 16 16"
                className="size-3"
                fill="none"
                aria-hidden
                style={{ opacity: remember ? 1 : 0, transform: remember ? 'scale(1)' : 'scale(0.6)', transition: 'opacity 150ms ease, transform 220ms var(--ease-pop)' }}
              >
                <path d="M3.5 8.5l3 3 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
          <span className="font-manrope font-medium text-[12px] leading-normal text-parkway-grey01">Remember me next time.</span>
        </button>

        <button
          type="submit"
          className="w-full h-12 rounded-[8px] bg-parkway-tangerine01 font-manrope font-semibold text-[14px] leading-[1.8] text-white active:scale-[0.98] transition-transform"
        >
          Login
        </button>
      </form>

      <div className="mt-auto pb-6 flex flex-col items-center text-center rise-in" style={{ ['--d' as string]: '120ms' }}>
        <p className="font-manrope font-medium text-[14px] leading-normal text-[#4B5563]">Don’t have a Parkway account?</p>
        <button
          type="button"
          onClick={onCreateAccount}
          className="h-5 flex items-center font-manrope font-extrabold text-[14px] leading-normal text-parkway-tangerine01 active:opacity-60"
        >
          Create Account
          <img src={IconArrowUp} alt="" className="size-4" style={{ transform: 'rotate(-90deg) scaleY(-1)' }} />
        </button>
      </div>

      {toast.el}
    </div>
  )
}
