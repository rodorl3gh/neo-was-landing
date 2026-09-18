"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Search, Phone, Mail, Building2, Tag, User } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { apiGet, apiSend } from "@/lib/panel/api";
import { NICHOS, TIPOS, TIPO_LABELS } from "@/lib/panel/nichos";

interface Entrada {
  id: number;
  tipo: string;
  nicho: string;
  negocio: string;
  contacto: string;
  telefono: string;
  correo: string;
  notas: string;
}

const TIPO_COLORS: Record<string, string> = {
  prospecto: "#f59e0b",
  cliente: "#22c55e",
};

export default function Directorio({ fixedTipo }: { fixedTipo?: "prospecto" | "cliente" }) {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Entrada | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterNicho, setFilterNicho] = useState("");

  const [formTipo, setFormTipo] = useState<string>(fixedTipo || "prospecto");
  const [formNicho, setFormNicho] = useState("");
  const [formNegocio, setFormNegocio] = useState("");
  const [formContacto, setFormContacto] = useState("");
  const [formTelefono, setFormTelefono] = useState("");
  const [formCorreo, setFormCorreo] = useState("");
  const [formNotas, setFormNotas] = useState("");

  const title = fixedTipo === "prospecto" ? "Prospectos" : fixedTipo === "cliente" ? "Clientes" : "Directorio";
  const desc =
    fixedTipo === "prospecto"
      ? "Directorio de prospectos por nicho de mercado."
      : fixedTipo === "cliente"
        ? "Directorio de clientes por nicho de mercado."
        : "Prospectos y clientes organizados por nicho de mercado.";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ entradas: Entrada[] }>("/api/panel/directorio");
      setEntradas(res.entradas || []);
    } catch {
      /* 401 manejado por PanelShell */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entradas.filter((e) => {
      if (fixedTipo && e.tipo !== fixedTipo) return false;
      if (filterTipo && e.tipo !== filterTipo) return false;
      if (filterNicho && e.nicho !== filterNicho) return false;
      if (!q) return true;
      return [e.negocio, e.contacto, e.telefono, e.correo, e.nicho].join(" ").toLowerCase().includes(q);
    });
  }, [entradas, query, filterTipo, filterNicho, fixedTipo]);

  function resetForm() {
    setFormTipo(fixedTipo || "prospecto");
    setFormNicho("");
    setFormNegocio("");
    setFormContacto("");
    setFormTelefono("");
    setFormCorreo("");
    setFormNotas("");
    setEditing(null);
    setError("");
    setShowForm(false);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(e: Entrada) {
    setEditing(e);
    setFormTipo(e.tipo);
    setFormNicho(e.nicho);
    setFormNegocio(e.negocio);
    setFormContacto(e.contacto);
    setFormTelefono(e.telefono);
    setFormCorreo(e.correo);
    setFormNotas(e.notas);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (!formNicho) {
      setError("Selecciona el nicho de mercado");
      return;
    }
    if (!formNegocio.trim()) {
      setError("Ingresa el nombre del negocio");
      return;
    }
    setSaving(true);
    try {
      const body = {
        tipo: fixedTipo || formTipo,
        nicho: formNicho,
        negocio: formNegocio.trim(),
        contacto: formContacto.trim(),
        telefono: formTelefono.trim(),
        correo: formCorreo.trim(),
        notas: formNotas.trim(),
      };
      if (editing) {
        await apiSend(`/api/panel/directorio/${editing.id}`, "PATCH", body);
      } else {
        await apiSend("/api/panel/directorio", "POST", body);
      }
      resetForm();
      fetchData();
    } catch (e) {
      setError((e as Error).message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este registro del directorio?")) return;
    try {
      await apiSend(`/api/panel/directorio/${id}`, "DELETE");
      fetchData();
    } catch (e) {
      alert((e as Error).message || "Error al eliminar");
    }
  }

  return (
    <PanelShell title={title}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "60rem", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>{desc}</p>
          </div>
          <button onClick={openCreate} style={primaryBtn}>
            <Plus size={18} />
            <span>{fixedTipo === "cliente" ? "Nuevo cliente" : fixedTipo === "prospecto" ? "Nuevo prospecto" : "Nuevo registro"}</span>
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ position: "relative", flex: "1 1 14rem", minWidth: "12rem" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar negocio, contacto, teléfono..."
              style={{ ...input, paddingLeft: "2rem" }}
            />
          </div>
          {!fixedTipo && (
            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={{ ...input, flex: "0 0 9rem", width: "auto" }}>
              <option value="">Todo</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}s
                </option>
              ))}
            </select>
          )}
          <select value={filterNicho} onChange={(e) => setFilterNicho(e.target.value)} style={{ ...input, flex: "0 0 12rem", width: "auto" }}>
            <option value="">Todos los nichos</option>
            {NICHOS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "0.875rem" }}>
            <p style={{ fontSize: "0.9rem", margin: 0 }}>{entradas.length === 0 ? "Aún no hay registros. Agrega el primero." : "Sin resultados para el filtro."}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))", gap: "0.75rem" }}>
            {filtered.map((e) => {
              const color = TIPO_COLORS[e.tipo] || "var(--gold)";
              return (
                <div key={e.id} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.875rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                    <div style={{ width: "2.3rem", height: "2.3rem", borderRadius: "0.65rem", background: `${color}1f`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Building2 size={17} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", lineHeight: 1.25 }}>{e.negocio}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                        {!fixedTipo && (
                          <span style={{ fontSize: "0.62rem", fontWeight: 700, color, background: `${color}1f`, padding: "0.08rem 0.45rem", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                            {TIPO_LABELS[e.tipo] || e.tipo}
                          </span>
                        )}
                        {e.nicho && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", fontSize: "0.68rem", color: "var(--text-muted)", background: "var(--surface-2)", padding: "0.08rem 0.45rem", borderRadius: "9999px", border: "1px solid var(--border)" }}>
                            <Tag size={10} /> {e.nicho}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
                      <button onClick={() => openEdit(e)} style={iconBtn} title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} style={{ ...iconBtn, color: "var(--danger)" }} title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", borderTop: "1px solid var(--border)", paddingTop: "0.6rem" }}>
                    {e.contacto && (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        <User size={13} color="var(--text-muted)" /> {e.contacto}
                      </span>
                    )}
                    {e.telefono && (
                      <a href={`tel:${e.telefono.replace(/\s+/g, "")}`} style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", color: "var(--text-secondary)", textDecoration: "none" }}>
                        <Phone size={13} color="var(--text-muted)" /> {e.telefono}
                      </a>
                    )}
                    {e.correo && (
                      <a href={`mailto:${e.correo}`} style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", color: "var(--text-secondary)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Mail size={13} color="var(--text-muted)" /> {e.correo}
                      </a>
                    )}
                  </div>
                  {e.notas && <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{e.notas}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 90 }} onClick={resetForm} />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "1rem",
              padding: "1.5rem",
              zIndex: 91,
              width: "min(92vw, 28rem)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "var(--text)", margin: 0 }}>
                {editing ? "Editar registro" : fixedTipo === "cliente" ? "Nuevo cliente" : fixedTipo === "prospecto" ? "Nuevo prospecto" : "Nuevo registro"}
              </h3>
              <button onClick={resetForm} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {!fixedTipo && (
                <div style={fieldGroup}>
                  <label style={lbl}>Tipo</label>
                  <select style={input} value={formTipo} onChange={(e) => setFormTipo(e.target.value)}>
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div style={fieldGroup}>
                <label style={lbl}>Nicho de mercado *</label>
                <select style={input} value={formNicho} onChange={(e) => setFormNicho(e.target.value)} autoFocus>
                  <option value="">Selecciona un nicho</option>
                  {NICHOS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div style={fieldGroup}>
                <label style={lbl}>Nombre del negocio *</label>
                <input style={input} value={formNegocio} onChange={(e) => setFormNegocio(e.target.value)} placeholder="Ej. Viajes Paraíso" />
              </div>
              <div style={fieldGroup}>
                <label style={lbl}>Persona de contacto</label>
                <input style={input} value={formContacto} onChange={(e) => setFormContacto(e.target.value)} placeholder="Nombre de quien nos atiende" />
              </div>
              <div style={fieldGroup}>
                <label style={lbl}>Teléfono</label>
                <input style={input} value={formTelefono} onChange={(e) => setFormTelefono(e.target.value)} placeholder="222 123 4567" inputMode="tel" />
              </div>
              <div style={fieldGroup}>
                <label style={lbl}>Correo electrónico</label>
                <input style={input} value={formCorreo} onChange={(e) => setFormCorreo(e.target.value)} placeholder="contacto@negocio.com" inputMode="email" />
              </div>
              <div style={fieldGroup}>
                <label style={lbl}>Notas</label>
                <textarea style={{ ...input, resize: "vertical", lineHeight: 1.5 }} rows={2} value={formNotas} onChange={(e) => setFormNotas(e.target.value)} placeholder="Detalles, seguimiento..." />
              </div>

              {error && (
                <div style={{ padding: "0.5rem 0.75rem", background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "0.5rem", color: "var(--danger)", fontSize: "0.82rem", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={saving} style={{ ...primaryBtn, width: "100%", justifyContent: "center", marginTop: "0.25rem", opacity: saving ? 0.6 : 1 }}>
                {saving ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar al directorio"}
              </button>
            </form>
          </div>
        </>
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

const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.6rem 1.1rem",
  background: "var(--accent)",
  color: "var(--accent-fg)",
  border: "none",
  borderRadius: "0.625rem",
  fontWeight: 600,
  fontSize: "0.875rem",
  cursor: "pointer",
  fontFamily: "var(--font-display)",
};

const iconBtn: React.CSSProperties = {
  width: "1.9rem",
  height: "1.9rem",
  borderRadius: "0.5rem",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-secondary)",
  cursor: "pointer",
  flexShrink: 0,
};

const fieldGroup: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.3rem" };
const lbl: React.CSSProperties = { fontSize: "0.78rem", fontWeight: 500, color: "var(--text-secondary)" };
const input: React.CSSProperties = {
  padding: "0.55rem 0.75rem",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};
