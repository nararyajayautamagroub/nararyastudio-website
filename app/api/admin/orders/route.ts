import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin";
import { safeText } from "@/lib/security";
import { writeAudit } from "@/lib/audit";
import { randomBytes } from "node:crypto";
import type { PaymentStatus } from "@prisma/client";

const statuses: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "EXPIRED", "REFUNDED"];

export async function GET() {
  const staff = await requireStaff(["SUPER_ADMIN", "ADMIN", "FINANCE"]);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { customer: { select: { name: true, username: true, email: true } }, items: { include: { product: { select: { productId: true, name: true } } } } }
  });
  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  const staff = await requireStaff(["SUPER_ADMIN", "ADMIN", "FINANCE"]);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const orderId = safeText(body.orderId, 80);
    const status = safeText(body.paymentStatus, 30) as PaymentStatus;
    if (!orderId || !statuses.includes(status)) return NextResponse.json({ error: "Payment status tidak valid." }, { status: 400 });
    const order = await db.order.findUnique({ where: { orderId }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    const updated = await db.$transaction(async (tx) => {
      const changed = await tx.order.update({ where: { id: order.id }, data: { paymentStatus: status, status: status === "PAID" ? "PAID" : status === "REFUNDED" ? "REFUNDED" : status === "PENDING" ? "PENDING" : "CANCELLED" } });
      await tx.paymentEvent.create({ data: { eventId: "admin:" + order.id + ":" + Date.now() + ":" + randomBytes(6).toString("hex"), orderId: order.id, status, amount: order.total, payload: { actorId: staff.id, manual: true } } });
      if (status === "PAID" && order.paymentStatus !== "PAID") {
        for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { salesCount: { increment: item.quantity } } });
      }
      await tx.notification.create({ data: { userId: order.customerId, title: "Status pembayaran diperbarui", message: "Order " + order.orderId + " sekarang " + status + ".", type: "PAYMENT" } });
      return changed;
    });
    await writeAudit({ actorId: staff.id, action: "UPDATE_PAYMENT_STATUS", entity: "Order", entityId: order.id, metadata: { orderId, from: order.paymentStatus, to: status } });
    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Update order gagal." }, { status: 500 });
  }
}
