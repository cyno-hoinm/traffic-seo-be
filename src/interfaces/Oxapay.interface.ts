export interface CreateInvoiceInput {
  amount: number;                      // Số tiền cần thanh toán
  currency?: string;                   // Đơn vị tiền tệ (tùy chọn)
  lifeTime?: number;                   // Thời gian hết hạn liên kết thanh toán (phút)
  fee_paid_by_payer?: number;            // 1 nếu người thanh toán trả phí, 0 nếu merchant trả
  under_paid_cover?: number;            // Khoảng sai lệch chấp nhận được (0-60)
  to_currency?: string;                // Chuyển đổi sang crypto nào (chỉ USDT)
  autoWithdrawal?: boolean;           // 1: tự động rút về ví, 0: giữ trong số dư OxaPay
  mixedPayment?: boolean;             // Cho phép thanh toán phần còn lại bằng coin khác
  callback_url: string;                // URL nhận callback khi trạng thái thanh toán thay đổi
  return_url?: string;                 // URL chuyển hướng sau khi thanh toán thành công
  email?: string;                     // Email người thanh toán
  orderId?: string;                   // ID đơn hàng để đối chiếu hệ thống
  thanks_message?: string;             // Lời cảm ơn sau khi thanh toán
  description?: string;               // Mô tả đơn hàng
  sandbox?: boolean;                  // true: dùng môi trường test, false: môi trường thật
}

export interface CreateInvoiceResult {
  result: number,
  message: string,
  trackId: string,
  payment_url: string
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

export interface OxaPayCallback {
  type: 'invoice' | 'payout';
  status: string;
  track_id: string;
  amount: number;
  currency: string;
  order_id?: string;
  [key: string]: any;
}
