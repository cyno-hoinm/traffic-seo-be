import PayOS from "@payos/node";

const payOSPaymentMethod = new PayOS(
  process.env.PAY_OS_CLIENT || "YOUR_PAYOS_CLIENT_ID",
  process.env.PAY_OS_API_KEY || "YOUR_PAYOS_API_KEY",
  process.env.PAY_OS_CHECKSUM || "YOUR_PAYOS_CHECKSUM_KEY"
);


export default payOSPaymentMethod;