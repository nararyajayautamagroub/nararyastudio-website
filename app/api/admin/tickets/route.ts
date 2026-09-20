import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin";

export async function GET() {
  const staff = await requireStaff(["SUPER_ADMIN", "ADMIN", "CUSTOMER_SUPPORT"]);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const tickets = await db.ticket.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, username: true, email: true } } }
  });
  return NextResponse.json({ tickets });
}
