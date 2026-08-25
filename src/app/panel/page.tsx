"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { MODULES } from "@/components/panel/modules";

export default function DashboardPage() {
  const router = useRouter();
  const modules = MODULES.filter((m) => m.href !== "/panel");

  return (
    <PanelShell title="Dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: "72rem", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
            Bienvenido a Wasito
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
            Centraliza la operación de Neo Was: marketing, contabilidad, contratos, clientes y más.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))", gap: "0.9rem" }}>
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.href}
                onClick={() => router.push(m.href)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  padding: "1.25rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.875rem",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--cyan)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: "2.4rem", height: "2.4rem", borderRadius: "0.7rem", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color="var(--accent)" />
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", fontFamily: "var(--font-display)" }}>{m.label}</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{m.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </PanelShell>
  );
}
