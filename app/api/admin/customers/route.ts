import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin";

export async function GET() {
  const staff = await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const customers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, username: true, email: true, role: true, locale: true, theme: true, createdAt: true,
      _count: { select: { orders: true, requests: true, tickets: true } }
    }
  });
  return NextResponse.json({ customers });
}
