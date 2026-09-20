"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart, writeCart } from "@/lib/client-cart";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);

  useEffect(() => setCart(readCart()), []);

  async function validateCoupon() {
    setCouponInfo("");
    if (!couponCode.trim() || !cart.length) return;
    setCouponBusy(true);
    try {
      const r = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: couponCode, items: cart })
      });
      const x = await r.json();
      setCouponInfo(r.ok
        ? "Coupon valid. Subtotal " + x.subtotal.toLocaleString("id-ID") + " IDR · Diskon " + x.discount.toLocaleString("id-ID") + " IDR."
        : x.error || "Coupon tidak valid.");
    } catch {
      setCouponInfo("Coupon tidak dapat divalidasi sekarang.");
    } finally {
      setCouponBusy(false);
    }
  }

  async function startGateway(orderId) {
    const response = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId })
    });
    const gateway = await response.json();
    if (!response.ok) throw new Error(gateway.error || "Payment gateway gagal dibuat.");

    if (gateway.provider === "MIDTRANS" && gateway.token && gateway.clientKey) {
      if (!window.NararyaGateway) throw new Error("Gateway JavaScript belum siap.");
      setStatus("Membuka pembayaran Midtrans...");
      await window.NararyaGateway.startMidtrans(
        gateway.token,
        gateway.clientKey,
        gateway.production,
        {
          onSuccess: () => setStatus("Pembayaran berhasil diproses. Menunggu verifikasi webhook."),
          onPending: () => setStatus("Pembayaran menunggu diselesaikan."),
          onError: () => setError("Pembayaran gagal diproses oleh gateway."),
          onClose: () => setStatus("Pembayaran belum diselesaikan. Kamu bisa melanjutkan dari Orders.")
        }
      );
      return;
    }

    setStatus("Order " + orderId + " dibuat. Provider pembayaran belum aktif, gunakan instruksi pembayaran pada Orders.");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!cart.length) {
      setError("Keranjang kosong. Tambahkan produk terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, contact, paymentMethod, couponCode, items: cart })
      });
      const x = await r.json();
      if (!r.ok) throw new Error(x.error || "Checkout gagal");
      writeCart([]);
      setCart([]);
      await startGateway(x.orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="eyebrow">COMMERCE</div>
      <h1>Checkout</h1>
      <form onSubmit={submit} className="grid">
        <section className="card">
          <h2>Customer</h2>
          <div className="stack">
            <input required maxLength={120} placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} />
            <input required type="email" maxLength={160} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input maxLength={80} placeholder="WhatsApp / Contact" value={contact} onChange={(e) => setContact(e.target.value)} />
            <p className="text-sm text-neutral-500">Item diambil dari keranjang aktif. Jangan masukkan data kartu di form ini.</p>
          </div>
        </section>

        <section className="card">
          <h2>Payment</h2>
          <div className="stack">
            <div className="flex gap-2">
              <input maxLength={64} placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
              <button className="btn" type="button" onClick={validateCoupon} disabled={couponBusy || !couponCode.trim() || !cart.length}>
                {couponBusy ? "..." : "Apply"}
              </button>
            </div>
            {couponInfo && <p className="text-sm text-violet-700">{couponInfo}</p>}
            {[
              ["QRIS", "QRIS"],
              ["VIRTUAL_ACCOUNT", "Virtual Account"],
              ["BANK_TRANSFER", "Bank Transfer"],
              ["E_WALLET", "E-Wallet"]
            ].map(([value, label]) => (
              <label className="flex gap-2 items-center" key={value}>
                <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={(e) => setPaymentMethod(e.target.value)} />
                {label}
              </label>
            ))}
            <button type="submit" disabled={loading || !cart.length} className="btn btn-primary w-full">
              {loading ? "Memproses..." : "Create Order & Pay"}
            </button>
            {status && (
              <div role="status" className="card p-4 text-emerald-700">
                {status}
                <div className="mt-3 flex gap-2">
                  <Link className="btn" href="/orders">Lihat Orders</Link>
                  <Link className="btn" href="/store">Kembali ke Store</Link>
                </div>
              </div>
            )}
            {error && (
              <div role="alert" className="card p-4 text-red-700">
                {error}
                <div className="mt-3"><Link className="btn" href="/cart">Kembali ke Cart</Link></div>
              </div>
            )}
          </div>
        </section>
      </form>
    </main>
  );
}
