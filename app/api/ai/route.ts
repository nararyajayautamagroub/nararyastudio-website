import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { safeText } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit("studio-ai:" + ip, 20, 10 * 60_000).allowed) {
    return NextResponse.json({ error: "Batas penggunaan AI tercapai. Coba lagi beberapa menit." }, { status: 429 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI belum aktif di server. Admin perlu mengisi OPENAI_API_KEY pada environment deployment." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const message = safeText(body.message, 2000);
    if (message.length < 2) return NextResponse.json({ error: "Tulis pertanyaan minimal 2 karakter." }, { status: 400 });

    const products = await db.product.findMany({
      where: { status: "PUBLISHED" },
      select: { productId: true, name: true, category: true, description: true, price: true, discount: true, version: true, salesCount: true },
      orderBy: { updatedAt: "desc" },
      take: 30
    });
    const catalog = products.map((p) => ({
      id: p.productId,
      name: p.name,
      category: p.category,
      description: p.description.slice(0, 280),
      priceIDR: Math.max(0, p.price - Math.round(p.price * Math.min(100, Math.max(0, p.discount)) / 100)),
      version: p.version,
      salesCount: p.salesCount
    }));
    const system = [
      "Kamu adalah Nararya Studio AI, asisten layanan pelanggan dan rekomendasi produk.",
      "Jawab dalam bahasa Indonesia yang jelas, ramah, singkat, dan tidak mengarang stok, harga, kebijakan, atau status pembayaran.",
      "Gunakan katalog JSON terbaru dari database di bawah ini untuk menjawab pertanyaan produk. Harga dalam Rupiah.",
      "Jika informasi tidak ada, arahkan pelanggan menghubungi admin. Jangan meminta password, OTP, PIN, atau data kartu.",
      "Katalog database (waktu pengambilan: " + new Date().toISOString() + "): " + JSON.stringify(catalog)
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: system }, { role: "user", content: message }],
        temperature: 0.3,
        max_tokens: 700
      }),
      signal: AbortSignal.timeout(20000)
    });
    const result = await response.json().catch(() => ({})) as { choices?: { message?: { content?: string } }[] };
    if (!response.ok) return NextResponse.json({ error: "Layanan AI sedang bermasalah. Coba kembali nanti." }, { status: 502 });
    const answer = result.choices?.[0]?.message?.content?.trim();
    if (!answer) return NextResponse.json({ error: "AI belum menghasilkan jawaban. Coba pertanyaan lain." }, { status: 502 });
    return NextResponse.json({ answer, generatedAt: new Date().toISOString(), catalogUpdatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Tidak dapat menghubungi AI sekarang." }, { status: 502 });
  }
}
