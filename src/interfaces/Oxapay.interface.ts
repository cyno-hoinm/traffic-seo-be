export interface CreateInvoiceInput {
  merchant: string,
  amount: number,
  currency: string,
  lifeTime: number,
  feePaidByPayer: number,
  underPaidCover: number,
  callbackUrl: string,
  returnUrl?: string,
  description?: string,
  orderId?: string,
  email?: string
}

export interface CreateInvoiceResult {
  result: number,
  message: string,
  trackId: string,
  payLink: string
}

export interface CreatePayoutInput {
  key: string,
  callbackUrl: string,
  network?: string,       // The blockchain network to be used for the payout.
  memo?: string,         // Optional: Memo for networks that support this option.
  currency: string,      // The symbol of the cryptocurrency to be sent (e.g., BTC, ETH, LTC, etc.).
  amount: number,        // The amount of cryptocurrency to be sent as the payout.
  address: string,       // The cryptocurrency address of the recipient.
  description?: string,  // Optional: Payout details or additional information.
}

export interface CreatePayoutResult {
  result: number,
  message: string,
  trackId: string,
  status: string,
}
