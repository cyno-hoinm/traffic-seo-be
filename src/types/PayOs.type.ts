export type PayOsType = {
  accountNumber: string;
  amount: number;
  description: string;
  reference: string;
  transactionDateTime: string;
  virtualAccountNumber: string;
  counterAccountBankId: string;
  counterAccountBankName: string;
  counterAccountName: string | null;
  counterAccountNumber: string;
  virtualAccountName: string;
  currency: string;
  orderCode: number;
  paymentLinkId: string;
  code: string;
  desc: string;
};
