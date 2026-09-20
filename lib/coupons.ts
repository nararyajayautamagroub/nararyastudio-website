import { db } from "@/lib/db";

export type CouponRecord = {
  id: string;
  code: string;
  discountPercent: number | null;
  discountFixed: number | null;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export function calculateCouponDiscount(coupon: CouponRecord, subtotal: number) {
  const now = new Date();
  if (!coupon.active) return 0;
  if (coupon.startsAt && coupon.startsAt > now) return 0;
  if (coupon.endsAt && coupon.endsAt < now) return 0;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return 0;
  if (subtotal < coupon.minSubtotal) return 0;

  const percent = coupon.discountPercent ? Math.round(subtotal * Math.min(100, coupon.discountPercent) / 100) : 0;
  const fixed = coupon.discountFixed ? Math.max(0, coupon.discountFixed) : 0;
  return Math.min(subtotal, Math.max(percent, fixed));
}

export async function findValidCoupon(code: string, subtotal: number) {
  const normalized = code.trim().toUpperCase().slice(0, 64);
  if (!normalized) return null;
  const coupon = await db.coupon.findUnique({ where: { code: normalized } });
  if (!coupon || calculateCouponDiscount(coupon, subtotal) <= 0) return null;
  return coupon;
}
