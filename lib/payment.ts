export const PAYMENT_METHODS = ["QRIS", "VIRTUAL_ACCOUNT", "BANK_TRANSFER", "E_WALLET"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function paymentLabel(method: string) {
  return method === "VIRTUAL_ACCOUNT" ? "Virtual Account" : method === "BANK_TRANSFER" ? "Bank Transfer" : method === "E_WALLET" ? "E-Wallet" : "QRIS";
}

export function paymentInstructions(method: string) {
  switch (method) {
    case "QRIS":
      return process.env.PAYMENT_QRIS_INSTRUCTIONS || "QRIS belum dikonfigurasi. Hubungkan payment provider sebelum produksi.";
    case "VIRTUAL_ACCOUNT":
      return process.env.PAYMENT_VA_INSTRUCTIONS || "Virtual Account belum dikonfigurasi. Hubungkan payment provider sebelum produksi.";
    case "BANK_TRANSFER":
      return process.env.PAYMENT_BANK_INSTRUCTIONS || "Bank transfer belum dikonfigurasi. Isi PAYMENT_BANK_INSTRUCTIONS di environment.";
    case "E_WALLET":
      return process.env.PAYMENT_WALLET_INSTRUCTIONS || "E-Wallet belum dikonfigurasi. Hubungkan payment provider sebelum produksi.";
    default:
      return "Metode pembayaran tidak dikenali.";
  }
}
