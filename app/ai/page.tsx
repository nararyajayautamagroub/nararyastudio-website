"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function StudioAIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Halo! Aku Nararya Studio AI. Aku bisa bantu mencari produk, menjelaskan layanan, dan memberi rekomendasi berdasarkan katalog terbaru." }
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setError("");
    setMessages((items) => [...items, { role: "user", content: message }]);
    setBusy(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI gagal menjawab.");
      setMessages((items) => [...items, { role: "assistant", content: data.answer }]);
      setUpdatedAt(data.generatedAt || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI gagal menjawab.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <div className="eyebrow">NARARYA STUDIO · AI ASSISTANT</div>
      <h1>Studio AI</h1>
      <p className="muted mb-6">Asisten produk dengan katalog yang dibaca langsung dari database saat pertanyaan dikirim.</p>
      <section className="card p-4 sm:p-6">
        <div className="stack max-h-[55vh] overflow-y-auto" aria-live="polite">
          {messages.map((message, index) => (
            <div key={index} className={message.role === "user" ? "ml-auto max-w-[90%] rounded-2xl bg-violet-600 p-4 text-white" : "mr-auto max-w-[90%] rounded-2xl border p-4"}>
              <div className="mb-1 text-xs opacity-70">{message.role === "user" ? "Kamu" : "Nararya Studio AI"}</div>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {busy && <p className="muted">AI sedang menyusun jawaban...</p>}
        </div>
        {error && <div className="mt-4 rounded-xl border border-red-200 p-3 text-sm text-red-700" role="alert">{error}</div>}
        <form onSubmit={send} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input className="min-w-0 flex-1" value={input} onChange={(e) => setInput(e.target.value)} maxLength={2000} placeholder="Contoh: rekomendasikan produk untuk saya..." aria-label="Pesan untuk AI" />
          <button className="btn btn-primary" type="submit" disabled={busy || !input.trim()}>{busy ? "Memproses..." : "Kirim"}</button>
        </form>
        <p className="muted mt-3 text-xs">AI dapat keliru. Harga dan produk merujuk data katalog saat permintaan diproses.</p>
        {updatedAt && <p className="muted mt-1 text-xs">Data terakhir dibaca: {new Date(updatedAt).toLocaleString("id-ID")}</p>}
      </section>
    </main>
  );
}
