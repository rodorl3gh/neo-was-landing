"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  LogIn,
  KeyRound,
  UserPlus,
  UserMinus,
  UserCog,
  ShieldCheck,
  Target,
  Pencil,
  CheckCircle2,
  Trash2,
  Users,
  CalendarPlus,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { apiGet } from "@/lib/panel/api";

interface Actividad {
  id: number;
  tipo: string;
  actor: string;
  mensaje: string;
  detalle: string;
  created_at: number;
}

const TYPE_META: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  login: { icon: LogIn, color: "#22c55e", label: "Sesión" },
  password_cambiada: { icon: KeyRound, color: "#f59e0b", label: "Contraseña" },
  usuario_renombrado: { icon: UserCog, color: "#a855f7", label: "Usuario" },
  rol_cambiado: { icon: ShieldCheck, color: "#a855f7", label: "Rol" },
  usuario_colaborador: { icon: UserCog, color: "#a855f7", label: "Usuario" },
  usuario_creado: { icon: UserPlus, color: "#3b82f6", label: "Usuario" },
  usuario_eliminado: { icon: UserMinus, color: "#ef4444", label: "Usuario" },
  meta_creada: { icon: Target, color: "#36afc0", label: "Meta" },
  meta_editada: { icon: Pencil, color: "#3b82f6", label: "Meta" },
  meta_completada: { icon: CheckCircle2, color: "#22c55e", label: "Meta" },
  meta_estado: { icon: Pencil, color: "#3b82f6", label: "Meta" },
  meta_eliminada: { icon: Trash2, color: "#ef4444", label: "Meta" },
  colaborador_creado: { icon: Users, color: "#3b82f6", label: "Colaborador" },
  colaborador_editado: { icon: Users, color: "#f59e0b", label: "Colaborador" },
  colaborador_eliminado: { icon: Users, color: "#ef4444", label: "Colaborador" },
  evento_creado: { icon: CalendarPlus, color: "#36afc0", label: "Evento" },
  evento_eliminado: { icon: CalendarX, color: "#ef4444", label: "Evento" },
};

const FILTERS = [
  { value: "all", label: "Todo" },
  { value: "usuario", label: "Usuarios" },
  { value: "password_cambiada", label: "Contraseñas" },
  { value: "meta", label: "Metas" },
  { value: "colaborador", label: "Colaboradores" },
  { value: "evento", label: "Eventos" },
  { value: "login", label: "Sesiones" },
];

const PAGE_SIZE = 10;
const RETENTION_DAYS = 15;

function fmtFecha(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

const pageBtn: React.CSSProperties = {
  minWidth: "1.9rem",
  height: "1.9rem",
  padding: "0 0.4rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.5rem",
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text-secondary)",
  fontSize: "0.78rem",
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function NotificacionesPage() {
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      const d = await apiGet<{ actividad: Actividad[] }>("/api/panel/notificaciones");
      setActividad(d.actividad || []);
    } catch (e) {
      setError((e as Error).message === "unauthorized" ? "Sesión expirada" : (e as Error).message || "No se pudieron cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchData, 0);
    return () => clearTimeout(t);
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (filter === "all") return actividad;
    if (filter === "usuario") return actividad.filter((a) => a.tipo.startsWith("usuario") || a.tipo === "rol_cambiado");
    if (filter === "meta") return actividad.filter((a) => a.tipo.startsWith("meta"));
    if (filter === "colaborador") return actividad.filter((a) => a.tipo.startsWith("colaborador"));
    if (filter === "evento") return actividad.filter((a) => a.tipo.startsWith("evento"));
    return actividad.filter((a) => a.tipo === filter);
  }, [actividad, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  return (
    <PanelShell title="Notificaciones">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "52rem", margin: "0 auto" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bell size={20} color="var(--gold)" /> Notificaciones
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
            Registro de actividad del sistema. Solo visible para el superadministrador. Las notificaciones se conservan {RETENTION_DAYS} días.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  borderRadius: "9999px",
                  border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
                  background: active ? "var(--gold-soft)" : "var(--surface)",
                  color: active ? "var(--gold)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : error ? (
          <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--danger)", background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "0.875rem" }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "0.875rem" }}>
            <Bell size={30} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
            <p style={{ fontSize: "0.9rem", margin: 0 }}>Sin actividad registrada por ahora.</p>
          </div>
        ) : (
          <>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {paginated.map((a) => {
                const meta = TYPE_META[a.tipo] || { icon: Bell, color: "var(--text-muted)", label: "Actividad" };
                const Icon = meta.icon;
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.8rem 0.9rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem" }}>
                    <div style={{ width: "2.1rem", height: "2.1rem", borderRadius: "0.6rem", background: `${meta.color}1f`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={17} color={meta.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.35 }}>{a.mensaje}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.66rem", fontWeight: 700, color: meta.color, background: `${meta.color}1f`, padding: "0.05rem 0.45rem", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                          {meta.label}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{fmtFecha(a.created_at)}</span>
                        {a.actor && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>· por {a.actor}</span>}
                      </div>
                      {a.detalle && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{a.detalle}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ ...pageBtn, opacity: safePage === 1 ? 0.4 : 1, cursor: safePage === 1 ? "default" : "pointer" }}
                  title="Anterior"
                >
                  <ChevronLeft size={15} />
                </button>
                {pageNumbers(safePage, totalPages).map((p, i) =>
                  p === "…" ? (
                    <span key={`e${i}`} style={{ color: "var(--text-muted)", fontSize: "0.78rem", padding: "0 0.15rem" }}>
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        ...pageBtn,
                        border: `1px solid ${p === safePage ? "var(--gold)" : "var(--border)"}`,
                        background: p === safePage ? "var(--gold-soft)" : "var(--surface)",
                        color: p === safePage ? "var(--gold)" : "var(--text-secondary)",
                        fontWeight: p === safePage ? 700 : 600,
                      }}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ ...pageBtn, opacity: safePage === totalPages ? 0.4 : 1, cursor: safePage === totalPages ? "default" : "pointer" }}
                  title="Siguiente"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </PanelShell>
  );
}
