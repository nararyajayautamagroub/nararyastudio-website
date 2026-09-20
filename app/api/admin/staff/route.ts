import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin";
import type { StaffRole } from "@prisma/client";
import { safeText } from "@/lib/security";
import { writeAudit } from "@/lib/audit";

const roles: StaffRole[] = ["SUPER_ADMIN", "ADMIN", "FINANCE", "DESIGNER", "ARTIST_3D", "SUPPORT", "PRODUCT_MANAGER", "CONTENT_MANAGER"];

export async function GET() {
  const staff = await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await db.user.findMany({
    where: { role: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, username: true, email: true, role: true, createdAt: true }
  });
  return NextResponse.json({ staff: users, roles });
}

export async function PATCH(req: Request) {
  const actor = await requireStaff(["SUPER_ADMIN"]);
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const id = safeText(body.id, 80);
    const roleValue = safeText(body.role, 40);
    if (!id || !roles.includes(roleValue as StaffRole)) {
      return NextResponse.json({ error: "Role staff tidak valid." }, { status: 400 });
    }
    if (id === actor.id && roleValue !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin tidak boleh menurunkan role dirinya sendiri dari menu ini." }, { status: 400 });
    }
    const user = await db.user.update({ where: { id }, data: { role: roleValue as StaffRole }, select: { id: true, name: true, username: true, email: true, role: true } });
    await writeAudit({ actorId: actor.id, action: "UPDATE_ROLE", entity: "User", entityId: user.id, metadata: { role: user.role } });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Staff tidak ditemukan." }, { status: 404 });
  }
}
