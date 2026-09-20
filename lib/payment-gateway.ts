import type { PaymentMethod } from "@/lib/payment";

type GatewaySession = {
  provider: "MANUAL" | "MIDTRANS";
  token?: string;
  redirectUrl?: string;
  transactionId?: string;
  clientKey?: string;
};

function midtransEnabledPayments(method: PaymentMethod) {
  if (method === "QRIS") return ["other_qris"];
  if (method === "VIRTUAL_ACCOUNT") return ["bank_transfer"];
  if (method === "BANK_TRANSFER") return ["bank_transfer"];
  return ["gopay", "shopeepay"];
}

function firstLastName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "Customer", lastName: parts.slice(1).join(" ") || "" };
}

export async function createGatewaySession(input: {
  orderId: string;
  total: number;
  paymentMethod: PaymentMethod;
  customer: { name: string; email: string; phone?: string | null };
  items: { productId: string; name: string; quantity: number; price: number }[];
}): Promise<GatewaySession> {
  const provider = (process.env.PAYMENT_GATEWAY || "MANUAL").toUpperCase();
  if (provider !== "MIDTRANS") return { provider: "MANUAL" };

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;
  if (!serverKey || !clientKey) throw new Error("MIDTRANS_NOT_CONFIGURED");

  const production = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const base = production ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
  const auth = Buffer.from(serverKey + ":").toString("base64");
  const { firstName, lastName } = firstLastName(input.customer.name);
  const callbackUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "") + "/orders";

  const body = {
    transaction_details: {
      order_id: input.orderId,
      gross_amount: input.total
    },
    item_details: input.items.map((item) => ({
      id: item.productId,
      price: item.price,
      quantity: item.quantity,
      name: item.name.slice(0, 50)
    })),
    customer_details: {
      first_name: firstName.slice(0, 40),
      last_name: lastName.slice(0, 40),
      email: input.customer.email,
      phone: input.customer.phone || undefined
    },
    enabled_payments: midtransEnabledPayments(input.paymentMethod),
    callbacks: { finish: callbackUrl },
    page_expiry: { duration: 60, unit: "minutes" }
  };

  const response = await fetch(base + "/snap/v1/transactions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Basic " + auth
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });

  const data = await response.json().catch(() => ({})) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
  };

  if (!response.ok || !data.token) {
    throw new Error(data.error_messages?.join(", ") || "MIDTRANS_CREATE_TRANSACTION_FAILED");
  }

  return {
    provider: "MIDTRANS",
    token: data.token,
    redirectUrl: data.redirect_url,
    clientKey
  };
}
