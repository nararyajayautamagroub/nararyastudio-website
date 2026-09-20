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
      select: { orderId: true, total: true, paymentStatus: true, paymentMethod: true, createdAt: true }
    });
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    return NextResponse.json({
      order,
      methodLabel: paymentLabel(order.paymentMethod),
      instructions: paymentInstructions(order.paymentMethod)
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat instruksi pembayaran." }, { status: 500 });
  }
}
