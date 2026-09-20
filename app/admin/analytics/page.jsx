"use client";
import { useEffect, useState } from "react";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/analytics", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Gagal memuat analytics.");
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="page">
      <div className="eyebrow">ADMIN / ANALYTICS</div>
      <h1>Analytics</h1>
      <p className="muted">Ringkasan database live dan aktivitas audit 30 hari terakhir.</p>
      <button className="btn btn-primary mt-6" type="button" onClick={load} disabled={loading}>
        {loading ? "Memuat..." : "Refresh Analytics"}
      </button>

      {error && <div role="alert" className="card p-5 mt-6 text-red-700">{error}</div>}
      {data && (
        <>
          <div className="grid mt-8">
            {[
              ["Customers", data.users],
              ["Products", data.products],
              ["Published", data.publishedProducts],
              ["Requests", data.requests],
              ["Open Tickets", data.openTickets],
              ["Paid Orders", data.paidOrders]
            ].map(([label, value]) => (
              <section className="card p-6" key={label}>
                <p className="muted">{label}</p>
                <b className="text-3xl">{Number(value).toLocaleString("id-ID")}</b>
              </section>
            ))}
          </div>
          <section className="card p-6 mt-6">
            <p className="muted">Paid Revenue</p>
            <b className="text-4xl">{Number(data.revenue).toLocaleString("id-ID")} IDR</b>
          </section>
          <section className="card p-6 mt-6">
            <h2>Audit Activity · 30 Hari</h2>
            <div className="stack mt-4">
              {data.activity.length ? data.activity.map((item) => (
                <div className="flex items-center justify-between gap-4 border-b border-violet-100 py-3" key={item.action}>
                  <span className="break-all">{item.action}</span>
                  <b>{item.count}</b>
                </div>
              )) : <p className="muted">Belum ada audit activity pada periode ini.</p>}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
