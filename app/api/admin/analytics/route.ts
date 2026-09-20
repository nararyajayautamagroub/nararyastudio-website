import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin";

const ROLES = ["SUPER_ADMIN", "ADMIN", "FINANCE"] as const;

export async function GET() {
  const staff = await requireStaff(ROLES);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [users, products, publishedProducts, requests, tickets, paidOrders, revenue, auditRows] = await Promise.all([
    db.user.count({ where: { role: null } }),
    db.product.count(),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.serviceRequest.count(),
    db.ticket.count({ where: { status: { not: "CLOSED" } } }),
    db.order.count({ where: { paymentStatus: "PAID" } }),
    db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    db.auditLog.findMany({
      where: { createdAt: { gte: since } },
      select: { action: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 500
    })
  ]);

  const activity = new Map();
  for (const row of auditRows) activity.set(row.action, (activity.get(row.action) || 0) + 1);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    periodDays: 30,
    users,
    products,
    publishedProducts,
    requests,
    openTickets: tickets,
    paidOrders,
    revenue: revenue._sum.total || 0,
    activity: [...activity.entries()].slice(0, 12).map(([action, count]) => ({ action, count }))
  });
}
