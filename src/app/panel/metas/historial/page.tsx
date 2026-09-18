"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  History,
  CheckCircle2,
  CalendarCheck,
  Timer,
  Activity,
  Search,
  RotateCcw,
  Loader2,
  Flag,
  Users,
} from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { apiGet, apiSend } from "@/lib/panel/api";
import { ColaboradorAvatar, type ColaboradorLite } from "@/components/panel/ColaboradorBadge";
import { tipoInfo, prioridadInfo, formatFechaCorta } from "@/components/panel/metaUtils";

interface Paso {
  id: number;
  meta_id: number;
  texto: string;
  done: number;
  orden: number;
  done_at: number | null;
}

interface Meta {
  id: number;
  titulo: string;
  descripcion: string;
  colaboradores: number[];
  colaborador_id: number | null;
  tipo: string;
  prioridad: string;
  fecha_limite: string;
  estado: string;
  completado_at: number | null;
  created_at: number;
  pasos: Paso[];
}

interface ColabStat {
  colaborador_id: number | null;
  completadas: number;
  aTiempo: number;
  tarde: number;
  promedioDias: number;
  activas: number;
  puntualidad: number;
  cumplimiento: number;
}

interface Stats {
  porColaborador: ColabStat[];
  totales: {
    completadas: number;
    aTiempo: number;
    tarde: number;
    promedioDias: number;
    activas: number;
    puntualidad: number;
    cumplimiento: number;
  };
}

function metaColabIds(m: Meta): number[] {
  if (m.colaboradores && m.colaboradores.length > 0) return m.colaboradores;
  return m.colaborador_id != null ? [m.colaborador_id] : [];
}

function fmtCompletado(ts: number | null): string {
  const t = ts ? ts * 1000 : null;
  if (!t) return "Sin fecha";
  return new Date(t).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default function HistorialMetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [retencion, setRetencion] = useState(30);
  const [colaboradores, setColaboradores] = useState<ColaboradorLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterColab, setFilterColab] = useState("all");
  const [reopening, setReopening] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([
        apiGet<{ metas: Meta[]; stats: Stats; retencionDias: number }>("/api/panel/metas/historial"),
        apiGet<{ colaboradores: ColaboradorLite[] }>("/api/panel/colaboradores"),
      ]);
      setMetas(h.metas || []);
      setStats(h.stats || null);
      setRetencion(h.retencionDias || 30);
      setColaboradores(c.colaboradores || []);
    } catch {
      /* 401 manejado por PanelShell */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchData, 0);
    return () => clearTimeout(t);
  }, [fetchData]);

  const colabById = useMemo(() => {
    const map = new Map<number, ColaboradorLite>();
    for (const c of colaboradores) map.set(c.id, c);
    return map;
  }, [colaboradores]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return metas.filter((m) => {
      if (filterColab !== "all") {
        const ids = metaColabIds(m);
        if (filterColab === "none" ? ids.length > 0 : !ids.includes(Number(filterColab))) return false;
      }
      if (!q) return true;
      return m.titulo.toLowerCase().includes(q) || m.descripcion.toLowerCase().includes(q);
    });
  }, [metas, query, filterColab]);

  async function reopen(m: Meta) {
    setReopening(m.id);
    try {
      await apiSend(`/api/panel/metas/${m.id}`, "PATCH", { estado: "pendiente" });
      await fetchData();
    } finally {
      setReopening(null);
    }
  }

  const totales = stats?.totales;

  return (
    <PanelShell title="Historial de metas">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "78rem", margin: "0 auto" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <History size={20} color="var(--gold)" /> Historial de metas
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
            Metas cumplidas de los últimos {retencion} días y desempeño del equipo.
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <>
            {/* Indicadores globales */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(8.5rem, 1fr))", gap: "0.7rem" }}>
              <StatCard icon={<CheckCircle2 size={16} />} label="Completadas" value={String(totales?.completadas ?? 0)} color="var(--success)" />
              <StatCard icon={<CalendarCheck size={16} />} label="A tiempo" value={`${totales?.puntualidad ?? 0}%`} color="#3b82f6" />
              <StatCard icon={<Timer size={16} />} label="Prom. días" value={String(totales?.promedioDias ?? 0)} color="#f59e0b" />
              <StatCard icon={<Activity size={16} />} label="Activas" value={String(totales?.activas ?? 0)} color="var(--cyan)" />
            </div>

            {/* Desempeño por integrante */}
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.6rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <Users size={17} color="var(--gold)" /> Desempeño por integrante
              </h3>
              {!stats || stats.porColaborador.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "0.875rem", fontSize: "0.85rem" }}>
                  Aún no hay metas cumplidas en los últimos {retencion} días.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 19rem), 1fr))", gap: "0.75rem" }}>
                  {stats.porColaborador.map((s) => {
                    const colab = s.colaborador_id != null ? colabById.get(s.colaborador_id) || null : null;
                    const color = colab?.color || "var(--text-muted)";
                    return (
                      <div key={String(s.colaborador_id)} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid ${color}`, borderRadius: "0.85rem", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          {colab ? <ColaboradorAvatar colaborador={colab} size={38} /> : <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}><Users size={18} /></div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)" }}>{colab?.nombre || "Sin asignar"}</div>
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                              {s.completadas} completada{s.completadas !== 1 ? "s" : ""} · {s.activas} activa{s.activas !== 1 ? "s" : ""}
                            </div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1.35rem", fontWeight: 800, color, fontFamily: "var(--font-display)", lineHeight: 1 }}>{s.completadas}</div>
                            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Logradas</div>
                          </div>
                        </div>

                        <Bar label="Puntualidad" value={s.puntualidad} color={s.puntualidad >= 80 ? "var(--success)" : s.puntualidad >= 50 ? "#f59e0b" : "var(--danger)"} hint={`${s.aTiempo} a tiempo · ${s.tarde} tarde`} />
                        <Bar label="Cumplimiento" value={s.cumplimiento} color="var(--cyan)" hint={`${s.completadas} de ${s.completadas + s.activas}`} />

                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                          <Timer size={12} /> Promedio: {s.promedioDias} día{s.promedioDias !== 1 ? "s" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lista de metas cumplidas */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem", marginBottom: "0.6rem" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                  Metas cumplidas
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar meta..." style={{ ...inputStyle, paddingLeft: "1.9rem", width: "13rem" }} />
                  </div>
                  <select value={filterColab} onChange={(e) => setFilterColab(e.target.value)} style={selectStyle}>
                    <option value="all">Todo el equipo</option>
                    {colaboradores.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                    ))}
                    <option value="none">Sin asignar</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "0.875rem", fontSize: "0.85rem" }}>
                  {metas.length === 0 ? `No hay metas cumplidas en los últimos ${retencion} días.` : "Sin resultados para el filtro."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {filtered.map((m) => {
                    const tInfo = tipoInfo(m.tipo);
                    const pInfo = prioridadInfo(m.prioridad);
                    const colabs = metaColabIds(m).map((id) => colabById.get(id)).filter((c): c is ColaboradorLite => Boolean(c));
                    return (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.75rem 0.9rem", background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid var(--success)`, borderRadius: "0.75rem", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "12rem" }}>
                          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>{m.titulo}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
                            <span style={chip(tInfo.color)}>{tInfo.label}</span>
                            <span style={chip(pInfo.color)}><Flag size={10} /> {pInfo.label}</span>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Cumplida {fmtCompletado(m.completado_at)}</span>
                            {m.fecha_limite && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>· Límite {formatFechaCorta(m.fecha_limite)}</span>}
                          </div>
                        </div>
                        {colabs.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {colabs.slice(0, 4).map((c, i) => (
                              <div key={c.id} style={{ marginLeft: i === 0 ? 0 : "-0.45rem", zIndex: colabs.length - i }}>
                                <ColaboradorAvatar colaborador={c} size={24} />
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => reopen(m)}
                          disabled={reopening === m.id}
                          style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.75rem", fontSize: "0.76rem", fontWeight: 600, borderRadius: "0.6rem", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", cursor: reopening === m.id ? "wait" : "pointer", fontFamily: "inherit", flexShrink: 0 }}
                          title="Volver a activar esta meta"
                        >
                          {reopening === m.id ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <RotateCcw size={13} />}
                          Reabrir
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                Las metas cumplidas se conservan {retencion} días; después se eliminan automáticamente.
              </p>
            </div>
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "0.75rem 0.9rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>{value}</span>
    </div>
  );
}

function Bar({ label, value, color, hint }: { label: string; value: number; color: string; hint?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem" }}>
        <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", background: color, transition: "width 0.3s ease" }} />
      </div>
      {hint && <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>{hint}</span>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.45rem 0.65rem",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--text)",
  fontSize: "0.8rem",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  padding: "0.45rem 0.6rem",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--text)",
  fontSize: "0.78rem",
  outline: "none",
  fontFamily: "inherit",
  cursor: "pointer",
};

function chip(color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.1rem 0.45rem",
    borderRadius: "9999px",
    fontSize: "0.66rem",
    fontWeight: 600,
    background: color.startsWith("#") ? `${color}1f` : "var(--surface-2)",
    color: color.startsWith("#") ? color : "var(--text-secondary)",
  };
}
