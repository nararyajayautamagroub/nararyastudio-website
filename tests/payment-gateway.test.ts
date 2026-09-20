import { describe, expect, it, vi, afterEach } from "vitest";
import { createGatewaySession } from "../lib/payment-gateway";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("payment gateway adapter", () => {
  it("uses manual mode without provider credentials", async () => {
    vi.stubEnv("PAYMENT_GATEWAY", "MANUAL");
    const result = await createGatewaySession({
      orderId: "NS-ORD-TEST01",
      total: 45000,
      paymentMethod: "QRIS",
      customer: { name: "Test User", email: "test@example.com" },
      items: [{ productId: "NS-PROD-1", name: "Test Product", quantity: 1, price: 45000 }]
    });
    expect(result.provider).toBe("MANUAL");
    expect(result.token).toBeUndefined();
  });

  it("fails cleanly when Midtrans is selected without server credentials", async () => {
    vi.stubEnv("PAYMENT_GATEWAY", "MIDTRANS");
    vi.stubEnv("MIDTRANS_SERVER_KEY", "");
    vi.stubEnv("MIDTRANS_CLIENT_KEY", "");
    await expect(createGatewaySession({
      orderId: "NS-ORD-TEST02",
      total: 45000,
      paymentMethod: "QRIS",
      customer: { name: "Test User", email: "test@example.com" },
      items: [{ productId: "NS-PROD-1", name: "Test Product", quantity: 1, price: 45000 }]
    })).rejects.toThrow("MIDTRANS_NOT_CONFIGURED");
  });
});
