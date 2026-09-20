import { NextResponse } from "next/server";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { safeText } from "@/lib/security";
import { writeAudit } from "@/lib/audit";

function safeEqualHex(a: string, b: string) {
  try {
    const x = Buffer.from(a, "hex");
    const y = Buffer.from(b, "hex");
    return x.length === y.length && timingSafeEqual(x, y);
  } catch {
    return false;
  }
}

function verifyMidtrans(body: {
  order_id?: unknown;
  status_code?: unknown;
  gross_amount?: unknown;
  signature_key?: unknown;
}) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return false;
  const orderId = safeText(body.order_id, 80);
  const statusCode = safeText(body.status_code, 10);
  const grossAmount = safeText(body.gross_amount, 64);
  const signature = safeText(body.signature_key, 256).toLowerCase();
  if (!orderId || !statusCode || !grossAmount || !signature) return false;
  const expected = createHash("sha512").update(orderId + statusCode + grossAmount + serverKey).digest("hex");
  return safeEqualHex(expected, signature);
}

function verifyInternal(raw: string, signature: string) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature.replace(/^sha256=/i, ""), "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function mapMidtransStatus(value: string, fraudStatus: string) {
  const status = value.toLowerCase();
  if ((status === "capture" && fraudStatus !== "deny") || status === "settlement" || status === "authorize") return "PAID" as const;
  if (status === "pending") return "PENDING" as const;
  if (status === "expire" || status === "expired") return "EXPIRED" as const;
  if (status === "cancel" || status === "deny" || status === "failure") return "FAILED" as const;
  return null;
}

export async function POST(req: Request) {
  const raw = await req.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Payload webhook bukan JSON valid." }, { status: 400 });
  }

  const looksLikeMidtrans = body.signature_key !== undefined && body.order_id !== undefined;
  const verified = looksLikeMidtrans
    ? verifyMidtrans(body)
    : verifyInternal(raw, req.headers.get("x-webhook-signature") || "");

  if (!verified) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const orderCode = safeText(body.order_id ?? body.orderId, 80);
    const transactionStatus = safeText(body.transaction_status ?? body.status, 30).toUpperCase();
    const paymentStatus = looksLikeMidtrans
      ? mapMidtransStatus(transactionStatus, safeText(body.fraud_status, 30))
      : (["PAID", "FAILED", "EXPIRED", "REFUNDED"].includes(transactionStatus) ? transactionStatus as "PAID" | "FAILED" | "EXPIRED" | "REFUNDED" : null);
    const amountText = safeText(body.gross_amount ?? body.amount, 64);
    const amount = Number(amountText);
    const transactionId = safeText(body.transaction_id, 160);
    const eventId = safeText(body.eventId, 120) || transactionId || orderCode + ":" + transactionStatus;

    if (!orderCode || !paymentStatus) return NextResponse.json({ error: "Payload webhook tidak valid." }, { status: 400 });

    const order = await db.order.findUnique({ where: { orderId: orderCode }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    if (Number.isFinite(amount) && Math.round(amount) !== order.total) {
      return NextResponse.json({ error: "Nominal pembayaran tidak sesuai." }, { status: 400 });
    }

    let duplicate = false;
    await db.$transaction(async (tx) => {
      const existing = await tx.paymentEvent.findUnique({ where: { eventId } });
      if (existing) {
        duplicate = true;
        return;
      }

      await tx.paymentEvent.create({
        data: {
          eventId,
          orderId: order.id,
          status: paymentStatus,
          amount: Number.isFinite(amount) ? Math.round(amount) : null,
          payload: body as Prisma.InputJsonValue
        }
      });

      const wasPaid = order.paymentStatus === "PAID";
      const orderStatus = paymentStatus === "PAID" ? "PAID" : paymentStatus === "REFUNDED" ? "REFUNDED" : paymentStatus === "PENDING" ? "PENDING" : "CANCELLED";
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus,
          status: orderStatus,
          gatewayTransactionId: transactionId || undefined,
          gatewayProvider: looksLikeMidtrans ? "MIDTRANS" : order.gatewayProvider
        }
      });

      if (paymentStatus === "PAID" && !wasPaid) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { salesCount: { increment: item.quantity } }
          });
        }
        await tx.notification.create({
          data: {
            userId: order.customerId,
            title: "Pembayaran diterima",
            message: "Pembayaran untuk " + order.orderId + " sudah terverifikasi.",
            type: "PAYMENT"
          }
        });
      }
    });

    await writeAudit({
      action: "PAYMENT_WEBHOOK",
      entity: "Order",
      entityId: order.id,
      metadata: { eventId, paymentStatus, amount, provider: looksLikeMidtrans ? "MIDTRANS" : "INTERNAL" }
    });

    return NextResponse.json({ received: true, duplicate });
  } catch {
    return NextResponse.json({ error: "Webhook gagal diproses." }, { status: 500 });
  }
}
