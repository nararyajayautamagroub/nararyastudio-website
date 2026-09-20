import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin";
import { safeText } from "@/lib/security";

const statuses = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"] as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff(["SUPER_ADMIN", "ADMIN", "SUPPORT"]);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await params;
    const body = await req.json();
    const status = safeText(body.status, 40) as (typeof statuses)[number];
    if (!statuses.includes(status)) return NextResponse.json({ error: "Status ticket tidak valid." }, { status: 400 });
    const ticket = await db.ticket.update({ where: { id }, data: { status } });
    await db.notification.create({
      data: {
        userId: ticket.userId,
        title: "Ticket diperbarui",
        message: "Status ticket " + ticket.ticketId + " sekarang " + ticket.status + ".",
        type: "SUPPORT"
      }
    });
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "Ticket tidak ditemukan." }, { status: 404 });
  }
}
