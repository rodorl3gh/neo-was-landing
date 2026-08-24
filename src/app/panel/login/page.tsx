"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2 } from "lucide-react";
import { setToken } from "@/lib/panel/api";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/panel/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        router.replace("/panel");
      } else {
        setError(data.error || "Credenciales inválidas");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "24rem",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "1rem",
              background: "var(--primary)",
              color: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
            }}
          >
            W
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Wasito</h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>Sistema interno de Neo Was</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={lbl}>Usuario</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                style={{ ...input, paddingLeft: "2.4rem" }}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="usuario"
                autoFocus
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={lbl}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                style={{ ...input, paddingLeft: "2.4rem" }}
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div style={{ padding: "0.55rem 0.75rem", background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "0.5rem", color: "var(--danger)", fontSize: "0.82rem", fontWeight: 500 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !user || !pass}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.7rem 1rem",
              background: "var(--accent)",
              color: "var(--accent-fg)",
              border: "none",
              borderRadius: "0.625rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              marginTop: "0.25rem",
              opacity: loading || !user || !pass ? 0.6 : 1,
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.02em" };
const input: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.8rem",
  background: "var(--bg-tertiary)",
  border: "1px solid var(--border)",
  borderRadius: "0.6rem",
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
