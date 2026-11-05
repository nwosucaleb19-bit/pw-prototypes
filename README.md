# Parkway Wallet — Send flow prototype

Interactive prototype of the "Send To Parkway Wallet" screen, implemented from the Figma design.

## Stack
- Vite + React 19 + TypeScript
- Tailwind CSS 3

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173.

## Build
```bash
npm run build
```
Static output lands in `dist/`.

## Notable interactions
- Editable amount field (formats on blur).
- Preset-amount chips sync with the amount.
- Reason buttons (Transfer / For Food / For Bills) sync with the description.
- When the entered amount exceeds the wallet balance and the user taps **Confirm**, the Wallet Balance pill shakes and `navigator.vibrate()` fires a short haptic buzz (on devices that support it).

## Onboarding flow (`feature/onboarding`)
The app now opens on the onboarding flow; add `?start=home` to the URL to go straight to Home and the transfer flow.

Welcome → Phone number → Verify code (step 1) → BVN / NIN choice → BVN or NIN verification (step 2) → Address + details sheet (step 3) → Face verification (step 4) → Create password (step 5) → Set PIN → Confirm PIN (step 6) → Home.

- The stepper's new segment fills when you arrive at a new step.
- Buttons stay disabled until the step is valid. Tapping one early shakes the missing field (with haptics), like the transfer flow's checks.
- BVN/NIN: **Confirm** looks the number up. On a match, the Address step opens. After the address is filled in, **Continue** shows the *Details Confirmation* sheet (masked name, phone, email). Confirm moves on to face verification.
- State / LGA use a searchable bottom sheet. Changing the state clears the LGA.
- Face verification: a tips sheet, then three prompts (come closer, closer again, smile), then a success sheet. It uses the device camera, or simulates the scan if no camera is available.
- Create password: a strength meter and rule checklist appear as you type, plus a match tick on confirm.
- PIN: easy PINs are refused. A mismatch on confirm shakes and clears.
- Passcode: 1.5s after onboarding lands on the dashboard, a "Secure your Wallet" prompt rises over it. Its keycap illustration presses keys at random. **Set Passcode** → enter 6 digits → confirm them (a mismatch shakes and clears) → "Your Passcode has been created!" → **Go to Dashboard**. Open `?start=passcode` to jump straight to the prompt.
- Login (returning user): "Hi, Caleb" with a 6-digit passcode, `135790` (or the passcode set in the Passcode flow). Each wrong try counts down "N attempts left"; at 2 left Face ID is withdrawn; the 5th wrong try locks the account (lock sheet → **Go Back** to the password login). Face ID shows the scan panel, then logs in. **Not you? Log out** opens the phone/email + password login. Open `?start=login` to jump straight there.
- On wide screens, a **Flow** dropdown beside the phone jumps to the start of Onboarding, Transfer, Passcode or Login.
- Test inputs: OTP `0000` is rejected, and a BVN/NIN starting `000` has no record. In the transfer flow, PIN `0000` succeeds, `1111` stays pending and `2222` fails.

### Resume signup
Progress is saved on the device as the user moves through onboarding. Reopening the app mid-signup lands on **Glad to have you back!**, which shows the steps as done, current or locked. Review re-opens the BVN/NIN details, Edit opens a pre-filled address form, and Continue jumps to the current step. Start Again asks first, then clears the identity and address details and restarts from BVN/NIN. The phone stays verified. Finishing the PIN step, or tapping Create Account on Welcome, clears saved progress. On wide screens, the panel's **Returning user (resume)** button simulates someone who left at Liveness.

### Home
Updated to the new dashboard (Marcus, ₦500.00) with a **Complete your profile** row. Tapping a task ticks it off and raises the count; Hide slides it away.

### OTP edge cases
- When the 2:00 timer runs out, **Get a voice call** appears under Resend OTP. Add `?otpTimer=5` to the URL to see it sooner.
- A phone number ending `0000` already has a wallet. After its code is verified, the **You already have a Parkway Wallet account** sheet appears instead of continuing.

### Progress sheet
Tapping the stepper on any onboarding screen opens **Your sign-up progress**: done steps are ticked, the current one is outlined, and the rest are locked. Review shows the BVN/NIN details, Edit jumps back to the address, and **Back to …** closes the sheet.

### Failure and offline sheets
- **BVN/NIN Verification Failed:** a number starting `000` has no record. Retry clears the field; Go Back returns to the BVN/NIN choice.
- **Face Verification Failed:** turn on **Face check fails** in the panel. The first scan fails, and Retry rescans (and passes). Go Back returns to the face intro.
- **You're offline — we'll keep your details:** appears on any onboarding submit when the browser goes offline, or with **Simulate offline** on. Retry re-sends once you're back online, or shakes if you're still offline. Go Back closes the sheet with every field kept.
