import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin";

export async function GET() {
  const staff = await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const actorIds = [...new Set(logs.map((log) => log.actorId).filter(Boolean) as string[])];
  const actors = actorIds.length ? await db.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, name: true, username: true, email: true }
  }) : [];
  const actorMap = new Map(actors.map((actor) => [actor.id, actor]));
  return NextResponse.json({ logs: logs.map((log) => ({ ...log, actor: log.actorId ? actorMap.get(log.actorId) ?? null : null })) });
}
