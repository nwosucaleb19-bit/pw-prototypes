import BankAccess from '../assets/figma/bank-access.png'
import BankAlat from '../assets/figma/bank-alat.png'
import BankFidelity from '../assets/figma/bank-fidelity.png'
import BankFirst from '../assets/figma/bank-firstbank.png'
import BankGlobus from '../assets/figma/bank-globus.png'
import BankGtb from '../assets/figma/bank-gtb.png'
import BankJaiz from '../assets/figma/bank-jaiz.png'
import BankKeystone from '../assets/figma/bank-keystone.png'
import BankKuda from '../assets/figma/bank-kuda.png'
import BankTaj from '../assets/figma/bank-tajbank.png'
import BankWema from '../assets/figma/bank-wema.png'
import BankZenith from '../assets/figma/bank-zenith.png'

export type BankCode =
  | 'access' | 'alat' | 'fidelity' | 'firstbank' | 'globus' | 'gtb'
  | 'jaiz' | 'keystone' | 'kuda' | 'tajbank' | 'wema' | 'zenith'

export type Bank = { code: BankCode; name: string; logo: string }

export const BANKS: Bank[] = [
  { code: 'access',    name: 'Access Bank',         logo: BankAccess },
  { code: 'alat',      name: 'Alat by Wema',        logo: BankAlat },
  { code: 'fidelity',  name: 'Fidelity Bank',       logo: BankFidelity },
  { code: 'firstbank', name: 'First Bank',          logo: BankFirst },
  { code: 'globus',    name: 'Globus Bank',         logo: BankGlobus },
  { code: 'gtb',       name: 'Guaranty Trust Bank', logo: BankGtb },
  { code: 'jaiz',      name: 'Jaiz Bank',           logo: BankJaiz },
  { code: 'keystone',  name: 'Keystone Bank',       logo: BankKeystone },
  { code: 'kuda',      name: 'Kuda',                logo: BankKuda },
  { code: 'tajbank',   name: 'TAJ Bank',            logo: BankTaj },
  { code: 'wema',      name: 'Wema Bank',           logo: BankWema },
  { code: 'zenith',    name: 'Zenith Bank',         logo: BankZenith },
]

export const BANK_BY_CODE: Record<BankCode, Bank> = Object.fromEntries(
  BANKS.map((b) => [b.code, b]),
) as Record<BankCode, Bank>

export type FullRecipient = {
  name: string
  bank: BankCode
  fullAccount: string
}

// Recent full history — all starting with "0123" so that prefix surfaces suggestions
export const RECENT_HISTORY: FullRecipient[] = [
  { name: 'Adetula Mabel',  bank: 'zenith',  fullAccount: '0123456018' },
  { name: 'Adetula Mabel',  bank: 'wema',    fullAccount: '0123789018' },
  { name: 'Adetula Mabel',  bank: 'access',  fullAccount: '0234567018' },
  { name: 'Adetula Mabel',  bank: 'kuda',    fullAccount: '0345678018' },
  { name: 'Adetula Mabel',  bank: 'tajbank', fullAccount: '0456789018' },
]

export function maskAccount(full: string): string {
  if (full.length !== 10) return full
  return `${full.slice(0, 4)}***${full.slice(-3)}`
}

// Parkway Wallet recipients — these are peer-to-peer within Parkway.
// Recipient is validated by either their 10-digit Parkway account number OR their @tag.
export type ParkwayRecipient = {
  name: string
  parkwayTag: string   // "@adetulamabel"
  fullAccount: string  // 10 digits
}

export const PARKWAY_RECENTS: ParkwayRecipient[] = [
  { name: 'Adetula Mabel',   parkwayTag: '@adetulamabel', fullAccount: '0123456789' },
  { name: 'Adetula Mabel',   parkwayTag: '@adetula_m',    fullAccount: '0123654321' },
  { name: 'Jamie Joe',       parkwayTag: '@jamiejoe',     fullAccount: '0234567890' },
  { name: 'Kutaje Joseph',   parkwayTag: '@kjoseph',      fullAccount: '0345678901' },
]

