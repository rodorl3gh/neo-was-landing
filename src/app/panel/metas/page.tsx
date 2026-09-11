"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Loader2,
  Target,
  LayoutGrid,
  KanbanSquare,
  Users,
  Filter,
  Flag,
  CalendarDays,
  ListChecks,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { apiGet, apiSend } from "@/lib/panel/api";
import ColaboradorBadge, { ColaboradorAvatar, type ColaboradorLite } from "@/components/panel/ColaboradorBadge";
import { COLABORADOR_COLORS, COLABORADOR_ICONS, ICON_KEYS } from "@/components/panel/colaboradorIcons";
import CalendarPicker from "@/components/panel/CalendarPicker";
import {
  TIPOS_META,
  ESTADOS,
  tipoInfo,
  prioridadInfo,
  estadoInfo,
  formatFechaCorta,
  vencimientoLabel,
  type EstadoMeta,
} from "@/components/panel/metaUtils";

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
  colaborador_id: number | null;
  tipo: string;
  prioridad: string;
  fecha_limite: string;
  estado: string;
  orden: number;
  completado_at: number | null;
  created_at: number;
  pasos: Paso[];
}

type ViewMode = "colaborador" | "kanban" | "equipo";

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("colaborador");

  const [filterColaborador, setFilterColaborador] = useState<string>("all");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterPrioridad, setFilterPrioridad] = useState<string>("all");

  // Modal meta
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mTitulo, setMTitulo] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mColaborador, setMColaborador] = useState<string>("");
  const [mTipo, setMTipo] = useState("trabajo");
  const [mPrioridad, setMPrioridad] = useState("media");
  const [mFecha, setMFecha] = useState("");
  const [mEstado, setMEstado] = useState<EstadoMeta>("pendiente");
  const [mPasos, setMPasos] = useState("");

  // Modal colaborador
  const [showColabModal, setShowColabModal] = useState(false);
  const [editingColab, setEditingColab] = useState<ColaboradorLite | null>(null);
  const [cNombre, setCNombre] = useState("");
  const [cPuesto, setCPuesto] = useState("");
  const [cIcono, setCIcono] = useState("user");
  const [cColor, setCColor] = useState(COLABORADOR_COLORS[5]);
  const [cActivo, setCActivo] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([
        apiGet<{ metas: Meta[] }>("/api/panel/metas"),
        apiGet<{ colaboradores: ColaboradorLite[] }>("/api/panel/colaboradores"),
      ]);
      setMetas(m.metas || []);
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
    return metas.filter((m) => {
      if (filterColaborador !== "all") {
        if (filterColaborador === "none" ? m.colaborador_id != null : String(m.colaborador_id) !== filterColaborador) return false;
      }
      if (filterTipo !== "all" && m.tipo !== filterTipo) return false;
      if (filterPrioridad !== "all" && m.prioridad !== filterPrioridad) return false;
      return true;
    });
  }, [metas, filterColaborador, filterTipo, filterPrioridad]);

  const stats = useMemo(() => {
    const total = metas.length;
    const completadas = metas.filter((m) => m.estado === "completada").length;
    const progreso = metas.filter((m) => m.estado === "progreso").length;
    const pendientes = total - completadas - progreso;
    return { total, completadas, progreso, pendientes };
  }, [metas]);

  const grouped = useMemo(() => {
    const groups = new Map<number | "none", Meta[]>();
    for (const m of filtered) {
      const key = m.colaborador_id ?? "none";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }
    const sortMetas = (arr: Meta[]) =>
      [...arr].sort((a, b) => {
        const aDone = a.estado === "completada";
        const bDone = b.estado === "completada";
        if (aDone !== bDone) return aDone ? 1 : -1;
        if (a.fecha_limite && b.fecha_limite && a.fecha_limite !== b.fecha_limite) return a.fecha_limite < b.fecha_limite ? -1 : 1;
        if (a.fecha_limite && !b.fecha_limite) return -1;
        if (!a.fecha_limite && b.fecha_limite) return 1;
        return a.orden - b.orden;
      });
    const order = colaboradores.filter((c) => groups.has(c.id)).map((c) => ({ key: c.id as number | "none", list: sortMetas(groups.get(c.id)!) }));
    if (groups.has("none")) order.push({ key: "none", list: sortMetas(groups.get("none")!) });
    return order;
  }, [filtered, colaboradores]);

  function resetMetaForm() {
    setEditingMeta(null);
    setMTitulo("");
    setMDesc("");
    setMColaborador("");
    setMTipo("trabajo");
    setMPrioridad("media");
    setMFecha("");
    setMEstado("pendiente");
    setMPasos("");
    setError("");
    setShowMetaModal(false);
  }

  function openCreateMeta() {
    resetMetaForm();
    if (filterColaborador !== "all" && filterColaborador !== "none") setMColaborador(filterColaborador);
    setShowMetaModal(true);
  }

  function openEditMeta(m: Meta) {
    setEditingMeta(m);
    setMTitulo(m.titulo);
    setMDesc(m.descripcion);
    setMColaborador(m.colaborador_id != null ? String(m.colaborador_id) : "");
    setMTipo(m.tipo);
    setMPrioridad(m.prioridad);
    setMFecha(m.fecha_limite);
    setMEstado(m.estado as EstadoMeta);
    setMPasos("");
    setError("");
    setShowMetaModal(true);
  }

  async function saveMeta(ev: React.FormEvent) {
    ev.preventDefault();
    if (!mTitulo.trim()) {
      setError("Ingresa un título");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        titulo: mTitulo.trim(),
        descripcion: mDesc.trim(),
        colaborador_id: mColaborador ? Number(mColaborador) : null,
        tipo: mTipo,
        prioridad: mPrioridad,
        fecha_limite: mFecha,
        estado: mEstado,
      };
      if (!editingMeta) {
        body.pasos = mPasos.split("\n").map((s) => s.trim()).filter(Boolean);
        await apiSend("/api/panel/metas", "POST", body);
      } else {
        await apiSend(`/api/panel/metas/${editingMeta.id}`, "PATCH", body);
      }
      resetMetaForm();
      fetchData();
    } catch (e) {
      setError((e as Error).message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMeta(id: number) {
    if (!confirm("¿Eliminar esta meta?")) return;
    await apiSend(`/api/panel/metas/${id}`, "DELETE");
    fetchData();
  }

  async function setEstado(m: Meta, estado: EstadoMeta) {
    setMetas((prev) => prev.map((x) => (x.id === m.id ? { ...x, estado } : x)));
    try {
      await apiSend(`/api/panel/metas/${m.id}`, "PATCH", { estado });
    } finally {
      fetchData();
    }
  }

  async function togglePaso(metaId: number, paso: Paso) {
    const next = paso.done ? 0 : 1;
    setMetas((prev) =>
      prev.map((m) => (m.id === metaId ? { ...m, pasos: m.pasos.map((p) => (p.id === paso.id ? { ...p, done: next } : p)) } : m))
    );
    try {
      await apiSend(`/api/panel/pasos/${paso.id}`, "PATCH", { done: !paso.done });
    } catch {
      fetchData();
    }
  }

  async function addPaso(metaId: number, texto: string) {
    if (!texto.trim()) return;
    await apiSend(`/api/panel/metas/${metaId}/pasos`, "POST", { texto: texto.trim() });
    fetchData();
  }

  async function deletePaso(metaId: number, pasoId: number) {
    setMetas((prev) => prev.map((m) => (m.id === metaId ? { ...m, pasos: m.pasos.filter((p) => p.id !== pasoId) } : m)));
    try {
      await apiSend(`/api/panel/pasos/${pasoId}`, "DELETE");
    } catch {
      fetchData();
    }
  }

  // ----- Colaboradores -----
  function resetColabForm() {
    setEditingColab(null);
    setCNombre("");
    setCPuesto("");
    setCIcono("user");
    setCColor(COLABORADOR_COLORS[5]);
    setCActivo(true);
    setError("");
    setShowColabModal(false);
  }

  function openCreateColab() {
    resetColabForm();
    setShowColabModal(true);
  }

  function openEditColab(c: ColaboradorLite) {
    setEditingColab(c);
    setCNombre(c.nombre);
    setCPuesto(c.puesto);
    setCIcono(c.icono);
    setCColor(c.color);
    setCActivo(Boolean(c.activo));
    setError("");
    setShowColabModal(true);
  }

  async function saveColab(ev: React.FormEvent) {
    ev.preventDefault();
    if (!cNombre.trim()) {
      setError("Ingresa un nombre");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = { nombre: cNombre.trim(), puesto: cPuesto.trim(), icono: cIcono, color: cColor, activo: cActivo };
      if (editingColab) {
        await apiSend(`/api/panel/colaboradores/${editingColab.id}`, "PATCH", body);
      } else {
        await apiSend("/api/panel/colaboradores", "POST", body);
      }
      resetColabForm();
      fetchData();
    } catch (e) {
      setError((e as Error).message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteColab(id: number) {
    if (!confirm("¿Eliminar este colaborador? Sus metas quedarán sin asignar.")) return;
    await apiSend(`/api/panel/colaboradores/${id}`, "DELETE");
    fetchData();
  }

  return (
    <PanelShell title="Metas">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "78rem", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Metas y actividades</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Asigna metas al equipo, define su fecha límite y da seguimiento a los pasos.
            </p>
          </div>
          <button onClick={openCreateMeta} style={primaryBtn}>
            <Plus size={18} />
            <span>Nueva meta</span>
          </button>
        </div>

        {/* Resumen */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))", gap: "0.7rem" }}>
          <StatCard label="Total" value={stats.total} color="var(--cyan)" />
          <StatCard label="Pendientes" value={stats.pendientes} color="#94a3b8" />
          <StatCard label="En progreso" value={stats.progreso} color="#3b82f6" />
          <StatCard label="Completadas" value={stats.completadas} color="var(--success)" />
        </div>

        {/* Controles */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.625rem", padding: "0.2rem", gap: "0.15rem" }}>
            <ViewTab active={view === "colaborador"} onClick={() => setView("colaborador")} icon={<Users size={15} />} label="Por colaborador" />
            <ViewTab active={view === "kanban"} onClick={() => setView("kanban")} icon={<KanbanSquare size={15} />} label="Kanban" />
            <ViewTab active={view === "equipo"} onClick={() => setView("equipo")} icon={<LayoutGrid size={15} />} label="Equipo" />
          </div>

          {view !== "equipo" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                <Filter size={14} /> Filtrar
              </span>
              <select style={selectStyle} value={filterColaborador} onChange={(e) => setFilterColaborador(e.target.value)}>
                <option value="all">Todo el equipo</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                ))}
                <option value="none">Sin asignar</option>
              </select>
              <select style={selectStyle} value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                <option value="all">Todos los tipos</option>
                {TIPOS_META.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select style={selectStyle} value={filterPrioridad} onChange={(e) => setFilterPrioridad(e.target.value)}>
                <option value="all">Toda prioridad</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : view === "equipo" ? (
          <EquipoView
            colaboradores={colaboradores}
            metas={metas}
            onCreate={openCreateColab}
            onEdit={openEditColab}
            onDelete={deleteColab}
          />
        ) : view === "kanban" ? (
          <KanbanView
            metas={filtered}
            colabById={colabById}
            onEstado={setEstado}
            onEdit={openEditMeta}
            onDelete={deleteMeta}
            onTogglePaso={togglePaso}
            onAddPaso={addPaso}
            onDeletePaso={deletePaso}
          />
        ) : grouped.length === 0 ? (
          <EmptyState onCreate={openCreateMeta} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
            {grouped.map(({ key, list }) => {
              const colab = key === "none" ? null : colabById.get(key) || null;
              const done = list.filter((m) => m.estado === "completada").length;
              return (
                <div key={String(key)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.7rem", flexWrap: "wrap" }}>
                    <ColaboradorBadge colaborador={colab} />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", padding: "0.1rem 0.5rem", borderRadius: "9999px" }}>
                      {done}/{list.length}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 21rem), 1fr))", gap: "0.8rem" }}>
                    {list.map((m) => (
                      <MetaCard
                        key={m.id}
                        meta={m}
                        colab={m.colaborador_id != null ? colabById.get(m.colaborador_id) || null : null}
                        collapsible
                        onEdit={() => openEditMeta(m)}
                        onDelete={() => deleteMeta(m.id)}
                        onEstado={(e) => setEstado(m, e)}
                        onTogglePaso={(p) => togglePaso(m.id, p)}
                        onAddPaso={(t) => addPaso(m.id, t)}
                        onDeletePaso={(pid) => deletePaso(m.id, pid)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal meta */}
      {showMetaModal && (
        <Modal onClose={resetMetaForm} title={editingMeta ? "Editar meta" : "Nueva meta"}>
          <form onSubmit={saveMeta} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Field label="Título *">
              <input style={inputStyle} value={mTitulo} onChange={(e) => setMTitulo(e.target.value)} placeholder="Ej. Preparar campaña de septiembre" autoFocus />
            </Field>
            <Field label="Descripción">
              <textarea style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} rows={2} value={mDesc} onChange={(e) => setMDesc(e.target.value)} placeholder="Detalle de la meta..." />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <Field label="Responsable">
                <select style={inputStyle} value={mColaborador} onChange={(e) => setMColaborador(e.target.value)}>
                  <option value="">Sin asignar</option>
                  {colaboradores.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.nombre} — {c.puesto}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo">
                <select style={inputStyle} value={mTipo} onChange={(e) => setMTipo(e.target.value)}>
                  {TIPOS_META.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Prioridad">
                <select style={inputStyle} value={mPrioridad} onChange={(e) => setMPrioridad(e.target.value)}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </Field>
              <Field label="Estado">
                <select style={inputStyle} value={mEstado} onChange={(e) => setMEstado(e.target.value as EstadoMeta)}>
                  {ESTADOS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Fecha límite">
              <CalendarPicker value={mFecha} onChange={setMFecha} />
            </Field>
            {!editingMeta && (
              <Field label="Pasos (uno por línea, opcional)">
                <textarea style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} rows={3} value={mPasos} onChange={(e) => setMPasos(e.target.value)} placeholder={"Investigar referencias\nDiseñar propuesta\nEnviar a revisión"} />
              </Field>
            )}
            {error && <div style={errorBox}>{error}</div>}
            <button type="submit" disabled={saving} style={{ ...primaryBtn, width: "100%", justifyContent: "center", opacity: saving ? 0.6 : 1 }}>
              {saving ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
              {saving ? "Guardando..." : editingMeta ? "Guardar cambios" : "Crear meta"}
            </button>
          </form>
        </Modal>
      )}

      {/* Modal colaborador */}
      {showColabModal && (
        <Modal onClose={resetColabForm} title={editingColab ? "Editar colaborador" : "Nuevo colaborador"}>
          <form onSubmit={saveColab} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "3rem", height: "3rem", borderRadius: "0.8rem", background: `${cColor}22`, border: `1px solid ${cColor}66`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {(() => {
                  const Icon = COLABORADOR_ICONS[cIcono] || COLABORADOR_ICONS.user;
                  return <Icon size={24} color={cColor} />;
                })()}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <input style={inputStyle} value={cNombre} onChange={(e) => setCNombre(e.target.value)} placeholder="Nombre" autoFocus />
                <input style={inputStyle} value={cPuesto} onChange={(e) => setCPuesto(e.target.value)} placeholder="Puesto o área" />
              </div>
            </div>

            <Field label="Icono">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(2.1rem, 1fr))", gap: "0.3rem", maxHeight: "8.5rem", overflowY: "auto", padding: "0.2rem" }}>
                {ICON_KEYS.map((k) => {
                  const Icon = COLABORADOR_ICONS[k];
                  const active = cIcono === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setCIcono(k)}
                      title={k}
                      style={{
                        aspectRatio: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "0.5rem",
                        border: active ? `1px solid ${cColor}` : "1px solid var(--border)",
                        background: active ? `${cColor}22` : "var(--surface-2)",
                        color: active ? cColor : "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Color">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
                {COLABORADOR_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setCColor(col)}
                    style={{
                      width: "1.6rem",
                      height: "1.6rem",
                      borderRadius: "50%",
                      background: col,
                      border: cColor === col ? "2px solid var(--text)" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                    aria-label={`Color ${col}`}
                  />
                ))}
                <input type="color" value={cColor} onChange={(e) => setCColor(e.target.value)} style={{ width: "2rem", height: "1.8rem", border: "none", background: "none", cursor: "pointer" }} title="Color personalizado" />
              </div>
            </Field>

            {editingColab && (
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                <input type="checkbox" checked={cActivo} onChange={(e) => setCActivo(e.target.checked)} />
                Colaborador activo
              </label>
            )}

            {error && <div style={errorBox}>{error}</div>}
            <button type="submit" disabled={saving} style={{ ...primaryBtn, width: "100%", justifyContent: "center", opacity: saving ? 0.6 : 1 }}>
              {saving ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
              {saving ? "Guardando..." : editingColab ? "Guardar cambios" : "Agregar colaborador"}
            </button>
          </form>
        </Modal>
      )}

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

// ------------------------------------------------------------------
// Subcomponentes
// ------------------------------------------------------------------
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "0.75rem 0.9rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
      <span style={{ fontSize: "1.5rem", fontWeight: 800, color, fontFamily: "var(--font-display)", lineHeight: 1.1 }}>{value}</span>
      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
    </div>
  );
}

function ViewTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.45rem 0.75rem",
        borderRadius: "0.5rem",
        border: "none",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--accent-fg)" : "var(--text-secondary)",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "0.875rem" }}>
      <Target size={34} style={{ opacity: 0.5, marginBottom: "0.5rem" }} />
      <p style={{ fontSize: "0.9rem", margin: 0 }}>Aún no hay metas. Crea la primera para el equipo.</p>
      <button onClick={onCreate} style={{ ...primaryBtn, margin: "1rem auto 0" }}>
        <Plus size={16} /> Nueva meta
      </button>
    </div>
  );
}

function MetaCard({
  meta,
  colab,
  collapsible = false,
  onEdit,
  onDelete,
  onEstado,
  onTogglePaso,
  onAddPaso,
  onDeletePaso,
}: {
  meta: Meta;
  colab: ColaboradorLite | null;
  collapsible?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onEstado: (e: EstadoMeta) => void;
  onTogglePaso: (p: Paso) => void;
  onAddPaso: (t: string) => void;
  onDeletePaso: (id: number) => void;
}) {
  const [newPaso, setNewPaso] = useState("");
  const [showPasoInput, setShowPasoInput] = useState(false);
  const [expanded, setExpanded] = useState(!collapsible);
  const tInfo = tipoInfo(meta.tipo);
  const pInfo = prioridadInfo(meta.prioridad);
  const eInfo = estadoInfo(meta.estado);
  const venc = meta.estado !== "completada" ? vencimientoLabel(meta.fecha_limite) : null;
  const doneCount = meta.pasos.filter((p) => p.done).length;
  const pct = meta.pasos.length > 0 ? Math.round((doneCount / meta.pasos.length) * 100) : 0;
  const isDone = meta.estado === "completada";

  if (collapsible && !expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(true);
          }
        }}
        title="Clic para ver el detalle"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: `3px solid ${colab?.color || tInfo.color}`,
          borderRadius: "0.6rem",
          padding: "0.5rem 0.65rem",
          display: "flex",
          alignItems: "center",
          gap: "0.45rem",
          cursor: "pointer",
          opacity: isDone ? 0.65 : 1,
        }}
      >
        <ChevronRight size={15} style={{ flexShrink: 0, color: "var(--text-muted)" }} />
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--text)",
            textDecoration: isDone ? "line-through" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {meta.titulo}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${colab?.color || tInfo.color}`,
        borderRadius: "0.75rem",
        padding: "0.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.55rem",
        opacity: isDone ? 0.65 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
        {collapsible && (
          <button onClick={() => setExpanded(false)} style={iconBtn} title="Contraer">
            <ChevronDown size={15} />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: "0.95rem", color: "var(--text)", margin: 0, textDecoration: isDone ? "line-through" : "none", wordBreak: "break-word" }}>{meta.titulo}</h3>
          {meta.descripcion && <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: "0.2rem 0 0", whiteSpace: "pre-wrap" }}>{meta.descripcion}</p>}
        </div>
        <div style={{ display: "flex", gap: "0.1rem", flexShrink: 0 }}>
          <button onClick={onEdit} style={iconBtn} title="Editar">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} style={{ ...iconBtn, color: "var(--danger)" }} title="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
        <span style={chip(tInfo.color)}>{tInfo.label}</span>
        <span style={chip(pInfo.color)}>
          <Flag size={11} /> {pInfo.label}
        </span>
        <span style={chip(eInfo.color)}>{eInfo.label}</span>
        {meta.fecha_limite && (
          <span style={chip(venc?.color || "var(--text-muted)")}>
            <CalendarDays size={11} /> {formatFechaCorta(meta.fecha_limite)}
            {venc ? ` · ${venc.label}` : ""}
          </span>
        )}
      </div>

      {colab && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ColaboradorAvatar colaborador={colab} size={22} />
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{colab.nombre}</span>
        </div>
      )}

      {meta.pasos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "var(--success)" : "var(--cyan)", transition: "width 0.3s ease" }} />
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: pct === 100 ? "var(--success)" : "var(--text-muted)" }}>
              {doneCount}/{meta.pasos.length}
            </span>
          </div>
          {meta.pasos.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => onTogglePaso(p)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "0.35rem",
                  border: p.done ? "none" : "2px solid var(--border-hover, var(--border))",
                  background: p.done ? "var(--success)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                {p.done ? <Check size={12} color="#fff" /> : null}
              </button>
              <span style={{ flex: 1, fontSize: "0.78rem", color: p.done ? "var(--text-muted)" : "var(--text)", textDecoration: p.done ? "line-through" : "none" }}>{p.texto}</span>
              <button onClick={() => onDeletePaso(p.id)} style={{ ...iconBtn, width: "1.3rem", height: "1.3rem", color: "var(--text-muted)" }} title="Eliminar paso">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showPasoInput ? (
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <input
            style={{ ...inputStyle, fontSize: "0.78rem", padding: "0.35rem 0.5rem" }}
            autoFocus
            value={newPaso}
            onChange={(e) => setNewPaso(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAddPaso(newPaso);
                setNewPaso("");
              }
              if (e.key === "Escape") setShowPasoInput(false);
            }}
            placeholder="Nuevo paso..."
          />
          <button
            onClick={() => {
              onAddPaso(newPaso);
              setNewPaso("");
            }}
            style={{ ...primaryBtn, padding: "0.35rem 0.6rem" }}
          >
            <Check size={14} />
          </button>
        </div>
      ) : (
        <button onClick={() => setShowPasoInput(true)} style={ghostBtn}>
          <Plus size={13} /> Agregar paso
        </button>
      )}

      <div style={{ display: "flex", gap: "0.35rem", borderTop: "1px solid var(--border)", paddingTop: "0.55rem" }}>
        {meta.estado === "pendiente" && (
          <button onClick={() => onEstado("progreso")} style={stateBtn("#3b82f6")}>
            <ChevronRight size={13} /> Iniciar
          </button>
        )}
        {meta.estado !== "completada" && (
          <button onClick={() => onEstado("completada")} style={stateBtn("var(--success)")}>
            <Check size={13} /> Completar
          </button>
        )}
        {meta.estado === "completada" && (
          <button onClick={() => onEstado("pendiente")} style={stateBtn("var(--text-secondary)")}>
            <ListChecks size={13} /> Reabrir
          </button>
        )}
      </div>
    </div>
  );
}

function KanbanView({
  metas,
  colabById,
  onEstado,
  onEdit,
  onDelete,
  onTogglePaso,
  onAddPaso,
  onDeletePaso,
}: {
  metas: Meta[];
  colabById: Map<number, ColaboradorLite>;
  onEstado: (m: Meta, e: EstadoMeta) => void;
  onEdit: (m: Meta) => void;
  onDelete: (id: number) => void;
  onTogglePaso: (metaId: number, p: Paso) => void;
  onAddPaso: (metaId: number, t: string) => void;
  onDeletePaso: (metaId: number, pid: number) => void;
}) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  function handleDrop(estado: EstadoMeta) {
    const m = metas.find((x) => x.id === dragId);
    if (m && m.estado !== estado) onEstado(m, estado);
    setDragId(null);
    setOverCol(null);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))", gap: "0.8rem", alignItems: "start" }}>
      {ESTADOS.map((col) => {
        const list = metas.filter((m) => m.estado === col.value);
        return (
          <div
            key={col.value}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.value);
            }}
            onDragLeave={() => setOverCol((c) => (c === col.value ? null : c))}
            onDrop={() => handleDrop(col.value)}
            style={{
              background: overCol === col.value ? "var(--surface-2)" : "var(--surface)",
              border: `1px solid ${overCol === col.value ? col.color : "var(--border)"}`,
              borderRadius: "0.85rem",
              padding: "0.7rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              minHeight: "8rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0 0.2rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col.label}</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", background: "var(--surface-2)", padding: "0.05rem 0.45rem", borderRadius: "9999px" }}>{list.length}</span>
            </div>
            {list.map((m) => (
              <div
                key={m.id}
                draggable
                onDragStart={() => setDragId(m.id)}
                onDragEnd={() => setDragId(null)}
                style={{ cursor: "grab", opacity: dragId === m.id ? 0.5 : 1 }}
              >
                <MetaCard
                  meta={m}
                  colab={m.colaborador_id != null ? colabById.get(m.colaborador_id) || null : null}
                  collapsible
                  onEdit={() => onEdit(m)}
                  onDelete={() => onDelete(m.id)}
                  onEstado={(e) => onEstado(m, e)}
                  onTogglePaso={(p) => onTogglePaso(m.id, p)}
                  onAddPaso={(t) => onAddPaso(m.id, t)}
                  onDeletePaso={(pid) => onDeletePaso(m.id, pid)}
                />
              </div>
            ))}
            {list.length === 0 && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", margin: "0.5rem 0" }}>Arrastra metas aquí</p>}
          </div>
        );
      })}
    </div>
  );
}

function EquipoView({
  colaboradores,
  metas,
  onCreate,
  onEdit,
  onDelete,
}: {
  colaboradores: ColaboradorLite[];
  metas: Meta[];
  onCreate: () => void;
  onEdit: (c: ColaboradorLite) => void;
  onDelete: (id: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedColab = selected != null ? colaboradores.find((c) => c.id === selected) || null : null;
  const selectedMetas = selected != null ? metas.filter((m) => m.colaborador_id === selected) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onCreate} style={primaryBtn}>
          <Plus size={16} /> Nuevo colaborador
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 17rem), 1fr))", gap: "0.7rem" }}>
        {colaboradores.map((c) => {
          const count = metas.filter((m) => m.colaborador_id === c.id).length;
          const done = metas.filter((m) => m.colaborador_id === c.id && m.estado === "completada").length;
          const isOpen = selected === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setSelected(isOpen ? null : c.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelected(isOpen ? null : c.id);
              }}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${c.color}`,
                borderRadius: "0.75rem",
                padding: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                opacity: c.activo ? 1 : 0.55,
                cursor: "pointer",
                boxShadow: isOpen ? `0 0 0 1px ${c.color}` : "none",
                transition: "box-shadow 0.15s ease",
              }}
            >
              <ColaboradorAvatar colaborador={c} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)" }}>{c.nombre}</span>
                  {!c.activo && <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "9999px", padding: "0.05rem 0.4rem" }}>Inactivo</span>}
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{c.puesto || "Sin puesto"}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                  {done}/{count} metas completadas
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center" }}>
                <button onClick={(e) => { e.stopPropagation(); onEdit(c); }} style={iconBtn} title="Editar">
                  <Pencil size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} style={{ ...iconBtn, color: "var(--danger)" }} title="Eliminar">
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={16} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s ease", color: "var(--text-muted)" }} />
              </div>
            </div>
          );
        })}
      </div>

      {selectedColab && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ColaboradorAvatar colaborador={selectedColab} size={34} />
            <div>
              <div style={{ fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>Metas de {selectedColab.nombre}</div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                {selectedMetas.length} meta{selectedMetas.length !== 1 ? "s" : ""}
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }} title="Cerrar">
              <X size={16} />
            </button>
          </div>
          {selectedMetas.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>Este colaborador no tiene metas asignadas.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {selectedMetas.map((m) => (
                <MiniMetaRow key={m.id} meta={m} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniMetaRow({ meta }: { meta: Meta }) {
  const tInfo = tipoInfo(meta.tipo);
  const eInfo = estadoInfo(meta.estado);
  const pInfo = prioridadInfo(meta.prioridad);
  const done = meta.pasos.filter((p) => p.done).length;
  const total = meta.pasos.length;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.55rem 0.7rem", borderRadius: "0.55rem", background: "var(--surface-2)", borderLeft: `3px solid ${tInfo.color}`, flexWrap: "wrap" }}>
      <span style={{ flex: 1, minWidth: "8rem", fontSize: "0.84rem", fontWeight: 600, color: "var(--text)", textDecoration: meta.estado === "completada" ? "line-through" : "none" }}>{meta.titulo}</span>
      <span style={chip(tInfo.color)}>{tInfo.label}</span>
      <span style={chip(eInfo.color)}>{eInfo.label}</span>
      {meta.fecha_limite && <span style={{ fontSize: "0.7rem", color: vencimientoLabel(meta.fecha_limite)?.color || "var(--text-muted)" }}>{formatFechaCorta(meta.fecha_limite)}</span>}
      {total > 0 && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{done}/{total}</span>}
      <span style={{ fontSize: "0.68rem", color: pInfo.color, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 2 }}>
        <Flag size={10} />
        {pInfo.label}
      </span>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 90 }} onClick={onClose} />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "1.4rem",
          zIndex: 91,
          width: "min(94vw, 30rem)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--text)", margin: 0, fontFamily: "var(--font-display)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.76rem", fontWeight: 500, color: "var(--text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

// ------------------------------------------------------------------
// Estilos
// ------------------------------------------------------------------
const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.6rem 1.1rem",
  background: "var(--accent)",
  color: "var(--accent-fg)",
  border: "none",
  borderRadius: "0.625rem",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
  fontFamily: "var(--font-display)",
};

const iconBtn: React.CSSProperties = {
  width: "1.7rem",
  height: "1.7rem",
  borderRadius: "0.45rem",
  background: "transparent",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-muted)",
  cursor: "pointer",
  flexShrink: 0,
};

const ghostBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.3rem",
  padding: "0.35rem",
  background: "transparent",
  border: "1px dashed var(--border)",
  borderRadius: "0.5rem",
  color: "var(--text-muted)",
  fontSize: "0.75rem",
  cursor: "pointer",
  fontFamily: "inherit",
};

const inputStyle: React.CSSProperties = {
  padding: "0.55rem 0.75rem",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--text)",
  fontSize: "0.88rem",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  padding: "0.4rem 0.6rem",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--text)",
  fontSize: "0.78rem",
  outline: "none",
  fontFamily: "inherit",
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  background: "var(--danger-soft)",
  border: "1px solid var(--danger)",
  borderRadius: "0.5rem",
  color: "var(--danger)",
  fontSize: "0.82rem",
  fontWeight: 500,
};

function chip(color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.12rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.68rem",
    fontWeight: 600,
    background: color.startsWith("#") ? `${color}1f` : "var(--surface-2)",
    color: color.startsWith("#") ? color : color,
    border: "1px solid transparent",
  };
}

function stateBtn(color: string): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.35rem 0.6rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
