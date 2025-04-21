export const oxapayConfig = {
  merchant: process.env.OXAPAY_MERCHANT_KEY as string,
  url: process.env.OXAPAY_URL, // endpoint của OxaPay
  payoutKey: process.env.OXAPAY_PAYOUT_KEY || "",
  lifeTime: process.env.OXAPAY_LIFETTIME || 30,
  feePaidByPayer: process.env.OXAPAY_FEEPAID_BY_PAYER,
  underPaidCover: process.env.OXAPAY_UNDER_PAID_COVER || 0,
  payoutAddress: process.env.OXAPAY_PAYOUT_ADDRESS || "",
  sandbox: process.env.OXAPAY_SANDBOX==='TRUE' ? true : false,
  currency: "USDT"
};
