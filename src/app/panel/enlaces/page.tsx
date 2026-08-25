"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Pencil, X, ExternalLink, Link2, Loader2 } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { apiGet, apiSend } from "@/lib/panel/api";

interface Enlace {
  id: number;
  titulo: string;
  url: string;
  descripcion: string;
  icono: string;
  orden: number;
}

export default function EnlacesPage() {
  const [enlaces, setEnlaces] = useState<Enlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Enlace | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formTitulo, setFormTitulo] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ enlaces: Enlace[] }>("/api/panel/enlaces");
      setEnlaces(res.enlaces || []);
    } catch {
      /* 401 manejado por PanelShell */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function resetForm() {
    setFormTitulo("");
    setFormUrl("");
    setFormDesc("");
    setEditing(null);
    setError("");
    setShowForm(false);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(e: Enlace) {
    setEditing(e);
    setFormTitulo(e.titulo);
    setFormUrl(e.url === "#" ? "" : e.url);
    setFormDesc(e.descripcion);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (!formTitulo.trim()) {
      setError("Ingresa un título");
      return;
    }
    setSaving(true);
    try {
      const body = { titulo: formTitulo.trim(), url: formUrl.trim(), descripcion: formDesc.trim() };
      if (editing) {
        await apiSend(`/api/panel/enlaces/${editing.id}`, "PATCH", body);
      } else {
        await apiSend("/api/panel/enlaces", "POST", body);
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
    if (!confirm("¿Eliminar este enlace?")) return;
    try {
      await apiSend(`/api/panel/enlaces/${id}`, "DELETE");
      fetchData();
    } catch (e) {
      alert((e as Error).message || "Error al eliminar");
    }
  }

  return (
    <PanelShell title="Enlaces">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "56rem", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Enlaces</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>Accesos y recursos del equipo.</p>
          </div>
          <button onClick={openCreate} style={primaryBtn}>
            <Plus size={18} />
            <span>Nuevo enlace</span>
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : enlaces.length === 0 ? (
          <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "0.875rem" }}>
            <p style={{ fontSize: "0.9rem", margin: 0 }}>Aún no hay enlaces. Agrega el primero.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {enlaces.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.9rem 1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.875rem" }}>
                <div style={{ width: "2.4rem", height: "2.4rem", borderRadius: "0.7rem", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Link2 size={18} color="var(--accent)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{e.titulo}</div>
                  {e.descripcion && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>{e.descripcion}</div>}
                  {e.url && e.url !== "#" && (
                    <div style={{ fontSize: "0.72rem", color: "var(--cyan)", marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.url}</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                  {e.url && e.url !== "#" && (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" style={iconBtn} title="Abrir">
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button onClick={() => openEdit(e)} style={iconBtn} title="Editar">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(e.id)} style={{ ...iconBtn, color: "var(--danger)" }} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
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
              width: "min(90vw, 26rem)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "var(--text)", margin: 0 }}>{editing ? "Editar enlace" : "Nuevo enlace"}</h3>
              <button onClick={resetForm} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={fieldGroup}>
                <label style={lbl}>Título *</label>
                <input style={input} value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)} placeholder="Nombre del recurso" autoFocus />
              </div>
              <div style={fieldGroup}>
                <label style={lbl}>URL</label>
                <input style={input} value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div style={fieldGroup}>
                <label style={lbl}>Descripción</label>
                <textarea style={{ ...input, resize: "vertical", lineHeight: 1.5 }} rows={2} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Detalle del enlace..." />
              </div>

              {error && (
                <div style={{ padding: "0.5rem 0.75rem", background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "0.5rem", color: "var(--danger)", fontSize: "0.82rem", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={saving} style={{ ...primaryBtn, width: "100%", justifyContent: "center", marginTop: "0.25rem", opacity: saving ? 0.6 : 1 }}>
                {saving ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar enlace"}
              </button>
            </form>
          </div>
        </>
      )}

      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  width: "2rem",
  height: "2rem",
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
