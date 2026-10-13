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
