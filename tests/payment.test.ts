import { describe, expect, it } from "vitest";
import { PAYMENT_METHODS, paymentInstructions, paymentLabel } from "../lib/payment";

describe("payment helpers", () => {
  it("exposes all supported checkout methods", () => {
    expect(PAYMENT_METHODS).toEqual(["QRIS", "VIRTUAL_ACCOUNT", "BANK_TRANSFER", "E_WALLET"]);
  });
  it("returns readable labels", () => {
    expect(paymentLabel("QRIS")).toBe("QRIS");
    expect(paymentLabel("VIRTUAL_ACCOUNT")).toBe("Virtual Account");
    expect(paymentLabel("BANK_TRANSFER")).toBe("Bank Transfer");
    expect(paymentLabel("E_WALLET")).toBe("E-Wallet");
  });
  it("returns safe default instructions", () => {
    expect(paymentInstructions("QRIS")).toContain("belum dikonfigurasi");
  });
});
