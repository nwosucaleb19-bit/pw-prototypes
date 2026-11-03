export type InvoiceStatus = 'unpaid' | 'paid'

export type Invoice = {
  number: string
  status: InvoiceStatus
  amount: number
  payeeName: string
  serviceProvider: string
  serviceLabel: string
}

// Demo invoices.
// 1006985069 → payable (the "happy path" in the Figma designs)
// 2001234567 → already paid (triggers the green pill)
// anything else → not found
export const INVOICES: Invoice[] = [
  {
    number: '1006985069',
    status: 'unpaid',
    amount: 2500,
    payeeName: 'Adetula Mabel',
    serviceProvider: 'CBS',
    serviceLabel:
      'BOARD OF INTERNAL REVENUE SERVICES | 02211826691 | DEVELOPMENT LEVY PAYMENT',
  },
  {
    number: '2001234567',
    status: 'paid',
    amount: 50000,
    payeeName: 'Adetula Mabel',
    serviceProvider: 'CBS',
    serviceLabel: 'LAGOS INTERNAL REVENUE | 03312456789 | PERSONAL INCOME TAX',
  },
]

export function findInvoice(num: string): Invoice | undefined {
  return INVOICES.find((i) => i.number === num)
}
