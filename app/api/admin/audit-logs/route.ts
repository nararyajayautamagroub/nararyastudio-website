import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin";

export async function GET() {
  const staff = await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, username: true, email: true } } }
  });
  return NextResponse.json({ logs });
}
