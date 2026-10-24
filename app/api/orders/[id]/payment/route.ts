import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentInstructions, paymentLabel } from "@/lib/payment";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const order = await db.order.findFirst({
      where: { orderId: id, customerId: user.id },
      select: { id: true, orderId: true, total: true, paymentStatus: true, paymentMethod: true, createdAt: true, expiresAt: true }
    });
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    let paymentStatus = order.paymentStatus;
    if (paymentStatus === "PENDING" && order.expiresAt.getTime() <= Date.now()) {
      await db.order.updateMany({ where: { id: order.id, paymentStatus: "PENDING" }, data: { paymentStatus: "EXPIRED", status: "CANCELLED" } });
      paymentStatus = "EXPIRED";
    }
    return NextResponse.json({
      order: { orderId: order.orderId, total: order.total, paymentStatus, paymentMethod: order.paymentMethod, createdAt: order.createdAt, expiresAt: order.expiresAt.toISOString() },
      methodLabel: paymentLabel(order.paymentMethod),
      instructions: paymentInstructions(order.paymentMethod),
      secondsRemaining: Math.max(0, Math.floor((order.expiresAt.getTime() - Date.now()) / 1000))
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat instruksi pembayaran." }, { status: 500 });
  }
}
