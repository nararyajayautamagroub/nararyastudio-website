"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";

export default function Login() {
  const router = useRouter();
  const { t } = useI18n();
  const [next, setNext] = useState("");
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("next");
    const oauthError = params.get("error");
    if (value && value.startsWith("/") && !value.startsWith("//")) setNext(value);
    if (oauthError) setError("Google login gagal atau dibatalkan.");
  }, []);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email, password } : { name, username, email, password };
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const x = await r.json();
      if (!r.ok) throw new Error(x.error || "Permintaan gagal");
      setMessage(mode === "login" ? "Login berhasil. Mengarahkan..." : "Akun berhasil dibuat. Mengarahkan...");
      setTimeout(() => router.push(next || "/dashboard"), 350);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Permintaan gagal");
    } finally {
      setLoading(false);
    }
  }

  function google() {
    window.location.href = "/api/auth/google?next=" + encodeURIComponent(next || "/dashboard");
  }

  return (
    <main className="page">
      <div className="card" style={{ maxWidth: 520, margin: "auto" }}>
        <div className="eyebrow">ACCOUNT</div>
        <h1>{mode === "login" ? t("login") : t("register")}</h1>
        <button type="button" className="btn btn-ghost w-full" onClick={google}>
          <span className="font-bold text-red-600">G</span> Continue with Google
        </button>
        <div className="flex items-center gap-3 my-5 text-xs text-neutral-400"><span className="h-px bg-violet-100 flex-1"/><span>OR</span><span className="h-px bg-violet-100 flex-1"/></div>
        <form onSubmit={submit} className="stack">
          {mode === "register" && <>
            <input required maxLength={120} placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} />
            <input required minLength={3} maxLength={40} pattern="[a-z0-9_]+" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </>}
          <input required type="email" maxLength={160} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required minLength={8} type="password" placeholder="Password (min. 8 karakter)" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Memproses..." : mode === "login" ? t("login") : t("register")}</button>
        </form>
        {message && <p className="muted" role="status">{message}</p>}
        {error && <p className="text-red-700" role="alert">{error}</p>}
        <button type="button" className="btn btn-ghost w-full mt-4" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); setError(""); }}>
          {mode === "login" ? t("register") : t("login")}
        </button>
      </div>
    </main>
  );
}
