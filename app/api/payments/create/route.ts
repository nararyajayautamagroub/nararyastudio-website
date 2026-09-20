import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createGatewaySession } from "@/lib/payment-gateway";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment";
import { writeAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit("payment-create:" + user.id, 10, 10 * 60_000).allowed) {
    return NextResponse.json({ error: "Terlalu banyak pembuatan payment session." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const orderId = String(body.orderId || "");
    const order = await db.order.findFirst({
      where: { orderId, customerId: user.id },
      include: { items: { include: { product: { select: { productId: true, name: true } } } } }
    });

    if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    if (order.paymentStatus !== "PENDING") {
      return NextResponse.json({ error: "Order ini tidak lagi menunggu pembayaran." }, { status: 409 });
    }

    const paymentMethod = order.paymentMethod as PaymentMethod;
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: "Metode pembayaran order tidak valid." }, { status: 400 });
    }

    const gateway = await createGatewaySession({
      orderId: order.orderId,
      total: order.total,
      paymentMethod,
      customer: { name: user.name, email: user.email },
      items: order.items.map((item) => ({
        productId: item.product.productId,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price
      }))
    });

    const updated = await db.order.update({
      where: { id: order.id },
      data: {
        gatewayProvider: gateway.provider,
        gatewayToken: gateway.token ?? null,
        gatewayRedirectUrl: gateway.redirectUrl ?? null
      },
      select: { orderId: true, paymentStatus: true, paymentMethod: true, gatewayProvider: true, gatewayToken: true, gatewayRedirectUrl: true }
    });

    await writeAudit({
      actorId: user.id,
      action: "CREATE_PAYMENT_SESSION",
      entity: "Order",
      entityId: order.id,
      metadata: { provider: gateway.provider, paymentMethod }
    });

    return NextResponse.json({
      provider: gateway.provider,
      token: gateway.token,
      redirectUrl: gateway.redirectUrl,
      clientKey: gateway.clientKey,
      production: process.env.MIDTRANS_IS_PRODUCTION === "true",
      order: updated
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "MIDTRANS_NOT_CONFIGURED") {
      return NextResponse.json({ error: "Payment gateway belum dikonfigurasi." }, { status: 503 });
    }
    return NextResponse.json({ error: "Payment session gagal dibuat." }, { status: 502 });
  }
}
