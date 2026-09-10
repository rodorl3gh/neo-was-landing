"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Trash2, Loader2, Check, Clock, Flag } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { apiGet, apiSend } from "@/lib/panel/api";
import { ColaboradorAvatar, type ColaboradorLite } from "@/components/panel/ColaboradorBadge";
import { COLABORADOR_COLORS, COLABORADOR_ICONS } from "@/components/panel/colaboradorIcons";
import { formatFechaLarga, toISO, todayISO, tipoInfo, estadoInfo, prioridadInfo } from "@/components/panel/metaUtils";

interface Meta {
  id: number;
  titulo: string;
  colaborador_id: number | null;
  tipo: string;
  prioridad: string;
  fecha_limite: string;
  estado: string;
}

interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  colaborador_id: number | null;
  color: string;
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarioPage() {
  const hoy = todayISO();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState(hoy);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorLite[]>([]);
  const [loading, setLoading] = useState(true);

  // Form evento
  const [showEventoForm, setShowEventoForm] = useState(false);
  const [evTitulo, setEvTitulo] = useState("");
  const [evHora, setEvHora] = useState("09:00");
  const [evColaborador, setEvColaborador] = useState("");
  const [evColor, setEvColor] = useState(COLABORADOR_COLORS[5]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [m, e, c] = await Promise.all([
        apiGet<{ metas: Meta[] }>("/api/panel/metas"),
        apiGet<{ eventos: Evento[] }>("/api/panel/eventos"),
        apiGet<{ colaboradores: ColaboradorLite[] }>("/api/panel/colaboradores"),
      ]);
      setMetas(m.metas || []);
      setEventos(e.eventos || []);
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

  const metasByDay = useMemo(() => {
    const map = new Map<string, Meta[]>();
    for (const m of metas) {
      if (!m.fecha_limite) continue;
      if (!map.has(m.fecha_limite)) map.set(m.fecha_limite, []);
      map.get(m.fecha_limite)!.push(m);
    }
    return map;
  }, [metas]);

  const eventosByDay = useMemo(() => {
    const map = new Map<string, Evento[]>();
    for (const e of eventos) {
      if (!map.has(e.fecha)) map.set(e.fecha, []);
      map.get(e.fecha)!.push(e);
    }
    return map;
  }, [eventos]);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const arr: (string | null)[] = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(toISO(new Date(cursor.year, cursor.month, d)));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToday() {
    const d = new Date();
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(hoy);
  }

  const selectedMetas = metasByDay.get(selected) || [];
  const selectedEventos = eventosByDay.get(selected) || [];

  function resetEvento() {
    setEvTitulo("");
    setEvHora("09:00");
    setEvColaborador("");
    setEvColor(COLABORADOR_COLORS[5]);
    setError("");
    setShowEventoForm(false);
  }

  async function saveEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!evTitulo.trim()) {
      setError("Ingresa un título");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiSend("/api/panel/eventos", "POST", {
        titulo: evTitulo.trim(),
        fecha: selected,
        hora: evHora,
        colaborador_id: evColaborador ? Number(evColaborador) : null,
        color: evColor,
      });
      resetEvento();
      fetchData();
    } catch (err) {
      setError((err as Error).message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvento(id: number) {
    if (!confirm("¿Eliminar este evento?")) return;
    await apiSend(`/api/panel/eventos/${id}`, "DELETE");
    fetchData();
  }

  const monthLabel = `${MESES[cursor.month]} ${cursor.year}`;

  return (
    <PanelShell title="Calendario">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "78rem", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Calendario</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Metas por fecha límite y eventos particulares del equipo.
            </p>
          </div>
          <button onClick={goToday} style={secondaryBtn}>
            <CalendarDays size={16} /> Hoy
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "1rem", alignItems: "start" }} className="cal-grid">
          {/* Calendario */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
              <button onClick={() => shift(-1)} style={navBtn} aria-label="Mes anterior">
                <ChevronLeft size={18} />
              </button>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", margin: 0, fontFamily: "var(--font-display)" }}>{monthLabel}</h3>
              <button onClick={() => shift(1)} style={navBtn} aria-label="Mes siguiente">
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {DIAS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", padding: "0.25rem 0", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  {d}
                </div>
              ))}
              {cells.map((iso, i) => {
                if (!iso) return <div key={i} />;
                const isToday = iso === hoy;
                const isSelected = iso === selected;
                const dayMetas = metasByDay.get(iso) || [];
                const dayEventos = eventosByDay.get(iso) || [];
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(iso)}
                    style={{
                      minHeight: "5rem",
                      textAlign: "left",
                      padding: "0.35rem",
                      borderRadius: "0.5rem",
                      border: `1px solid ${isSelected ? "var(--cyan)" : "var(--border)"}`,
                      background: isSelected ? "var(--cyan-soft)" : "var(--surface-2)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.2rem",
                      overflow: "hidden",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: isToday || isSelected ? 800 : 600,
                        color: isToday ? "var(--accent-fg)" : "var(--text)",
                        background: isToday ? "var(--accent)" : "transparent",
                        width: "1.3rem",
                        height: "1.3rem",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {Number(iso.slice(8, 10))}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      {dayMetas.slice(0, 3).map((m) => {
                        const colab = m.colaborador_id != null ? colabById.get(m.colaborador_id) : null;
                        const color = colab?.color || "#94a3b8";
                        return (
                          <span
                            key={`m${m.id}`}
                            style={{
                              fontSize: "0.62rem",
                              fontWeight: 600,
                              color,
                              background: `${color}1f`,
                              borderRadius: "0.3rem",
                              padding: "0.05rem 0.3rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textDecoration: m.estado === "completada" ? "line-through" : "none",
                            }}
                          >
                            {m.titulo}
                          </span>
                        );
                      })}
                      {dayMetas.length > 3 && <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>+{dayMetas.length - 3} metas</span>}
                      {dayEventos.slice(0, 2).map((ev) => (
                        <span key={`e${ev.id}`} style={{ fontSize: "0.62rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.2rem", overflow: "hidden" }}>
                          <Clock size={9} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.titulo}</span>
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detalle del día */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", margin: 0, fontFamily: "var(--font-display)" }}>{formatFechaLarga(selected)}</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.15rem 0 0" }}>
                {selectedMetas.length} meta{selectedMetas.length !== 1 ? "s" : ""} · {selectedEventos.length} evento{selectedEventos.length !== 1 ? "s" : ""}
              </p>
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  <span style={sectionLabel}>Metas con esta fecha límite</span>
                  {selectedMetas.length === 0 ? (
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>Sin metas para este día.</p>
                  ) : (
                    selectedMetas.map((m) => {
                      const colab = m.colaborador_id != null ? colabById.get(m.colaborador_id) : null;
                      const tInfo = tipoInfo(m.tipo);
                      const eInfo = estadoInfo(m.estado);
                      const pInfo = prioridadInfo(m.prioridad);
                      return (
                        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.6rem", borderRadius: "0.55rem", background: "var(--surface-2)", borderLeft: `3px solid ${colab?.color || tInfo.color}` }}>
                          {colab ? <ColaboradorAvatar colaborador={colab} size={26} /> : null}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", textDecoration: m.estado === "completada" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.titulo}</div>
                            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.15rem", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.62rem", fontWeight: 600, color: tInfo.color }}>{tInfo.label}</span>
                              <span style={{ fontSize: "0.62rem", color: eInfo.color, fontWeight: 600 }}>· {eInfo.label}</span>
                              <span style={{ fontSize: "0.62rem", color: pInfo.color, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 2 }}>
                                · <Flag size={9} /> {pInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  <span style={sectionLabel}>Eventos particulares</span>
                  {selectedEventos.length === 0 ? (
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>Sin eventos para este día.</p>
                  ) : (
                    selectedEventos.map((ev) => {
                      const colab = ev.colaborador_id != null ? colabById.get(ev.colaborador_id) : null;
                      const color = ev.color || colab?.color || "var(--cyan)";
                      const Icon = colab ? COLABORADOR_ICONS[colab.icono] || Clock : Clock;
                      return (
                        <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.6rem", borderRadius: "0.55rem", background: "var(--surface-2)", borderLeft: `3px solid ${color}` }}>
                          <div style={{ width: "1.6rem", height: "1.6rem", borderRadius: "0.5rem", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {colab ? <Icon size={13} color={color} /> : <Clock size={13} color={color} />}                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.titulo}</div>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                              {ev.hora}
                              {colab ? ` · ${colab.nombre}` : ""}
                            </div>
                          </div>
                          <button onClick={() => deleteEvento(ev.id)} style={iconBtn} title="Eliminar evento">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {showEventoForm ? (
                  <form onSubmit={saveEvento} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "0.7rem" }}>
                    <input style={inputStyle} value={evTitulo} onChange={(e) => setEvTitulo(e.target.value)} placeholder="Título del evento" autoFocus />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <input style={inputStyle} type="time" value={evHora} onChange={(e) => setEvHora(e.target.value)} />
                      <select style={inputStyle} value={evColaborador} onChange={(e) => setEvColaborador(e.target.value)}>
                        <option value="">Sin asignar</option>
                        {colaboradores.map((c) => (
                          <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", alignItems: "center" }}>
                      {COLABORADOR_COLORS.map((col) => (
                        <button key={col} type="button" onClick={() => setEvColor(col)} style={{ width: "1.3rem", height: "1.3rem", borderRadius: "50%", background: col, border: evColor === col ? "2px solid var(--text)" : "2px solid transparent", cursor: "pointer" }} aria-label={`Color ${col}`} />
                      ))}
                    </div>
                    {error && <div style={errorBox}>{error}</div>}
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button type="button" onClick={resetEvento} style={secondaryBtn}>
                        Cancelar
                      </button>
                      <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
                        {saving ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={15} />}
                        Agregar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowEventoForm(true)} style={{ ...secondaryBtn, justifyContent: "center", width: "100%" }}>
                    <Plus size={15} /> Agregar evento
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 900px) {
          .cal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PanelShell>
  );
}

const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.5rem 0.9rem",
  background: "var(--accent)",
  color: "var(--accent-fg)",
  border: "none",
  borderRadius: "0.5rem",
  fontWeight: 600,
  fontSize: "0.8rem",
  cursor: "pointer",
  fontFamily: "var(--font-display)",
};

const secondaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.5rem 0.9rem",
  background: "var(--surface)",
  color: "var(--text-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  fontWeight: 600,
  fontSize: "0.8rem",
  cursor: "pointer",
  fontFamily: "inherit",
};

const navBtn: React.CSSProperties = {
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  width: "2rem",
  height: "2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-secondary)",
  cursor: "pointer",
};

const iconBtn: React.CSSProperties = {
  width: "1.6rem",
  height: "1.6rem",
  borderRadius: "0.4rem",
  background: "transparent",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-muted)",
  cursor: "pointer",
  flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.7rem",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--text)",
  fontSize: "0.82rem",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const errorBox: React.CSSProperties = {
  padding: "0.45rem 0.7rem",
  background: "var(--danger-soft)",
  border: "1px solid var(--danger)",
  borderRadius: "0.5rem",
  color: "var(--danger)",
  fontSize: "0.78rem",
  fontWeight: 500,
};

const sectionLabel: React.CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};
