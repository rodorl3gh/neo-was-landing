"use client";

import { useRouter } from "next/navigation";
import { Link2, Target, Wallet, Users, UserPlus, FileText, CalendarDays, MessageCircle, Layers, ArrowRight } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";

const MODULES = [
  { label: "Enlaces", desc: "Accesos y recursos del equipo", icon: Link2, href: "/panel/enlaces", ready: true },
  { label: "Metas", desc: "Objetivos por integrante y área", icon: Target, ready: false },
  { label: "Contabilidad", desc: "Ingresos, egresos y facturación", icon: Wallet, ready: false },
  { label: "Clientes", desc: "Datos y servicios de clientes", icon: Users, ready: false },
  { label: "Prospectos", desc: "Pipeline de nuevos prospectos", icon: UserPlus, ready: false },
  { label: "Procesos", desc: "Trabajo activo con cada cliente", icon: Layers, ready: false },
  { label: "Contratos", desc: "Plantillas y contratos por cliente", icon: FileText, ready: false },
  { label: "Calendario", desc: "Agenda sincronizada con Google", icon: CalendarDays, ready: false },
  { label: "Asistente", desc: "Trabaja por voz o mensaje", icon: MessageCircle, ready: false },
];

export default function DashboardPage() {
  const router = useRouter();

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
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                onClick={() => m.ready && m.href && router.push(m.href)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  padding: "1.25rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.875rem",
                  textAlign: "left",
                  cursor: m.ready ? "pointer" : "default",
                  opacity: m.ready ? 1 : 0.55,
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
                onMouseOver={(e) => {
                  if (m.ready) e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseOut={(e) => {
                  if (m.ready) e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: "2.4rem", height: "2.4rem", borderRadius: "0.7rem", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color="var(--accent)" />
                  </div>
                  {m.ready ? (
                    <ArrowRight size={16} color="var(--text-muted)" />
                  ) : (
                    <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "0.12rem 0.45rem", borderRadius: "9999px" }}>
                      Pronto
                    </span>
                  )}
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
