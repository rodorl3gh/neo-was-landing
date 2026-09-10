"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, X, Loader2, Eye, EyeOff, KeyRound, ShieldCheck, User, Lock } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { apiGet, apiSend } from "@/lib/panel/api";
import { ColaboradorAvatar, type ColaboradorLite } from "@/components/panel/ColaboradorBadge";
import { ROLE_LABELS } from "@/components/panel/modules";

interface UsuarioItem {
  id: number;
  username: string;
  role: string;
  colaborador_id: number | null;
  colaborador_nombre: string | null;
  has_password: number;
  password: string | null;
  can_see_password: boolean;
  can_edit: boolean;
  can_edit_username: boolean;
  changes_this_month: number;
  limit: number | null;
}

interface Me {
  username: string | null;
  role: string | null;
  superadmin: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [colaboradores, setColaboradores] = useState<ColaboradorLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UsuarioItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fUsername, setFUsername] = useState("");
  const [fPassword, setFPassword] = useState("");
  const [fShowPass, setFShowPass] = useState(false);
  const [fRole, setFRole] = useState("user");
  const [fColaborador, setFColaborador] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [u, c] = await Promise.all([
        apiGet<{ usuarios: UsuarioItem[]; me: Me }>("/api/panel/usuarios"),
        apiGet<{ colaboradores: ColaboradorLite[] }>("/api/panel/colaboradores"),
      ]);
      setUsuarios(u.usuarios || []);
      setMe(u.me || null);
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

  function resetForm() {
    setEditing(null);
    setFUsername("");
    setFPassword("");
    setFShowPass(false);
    setFRole("user");
    setFColaborador("");
    setError("");
    setShowModal(false);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(u: UsuarioItem) {
    setEditing(u);
    setFUsername(u.username);
    setFPassword("");
    setFShowPass(false);
    setFRole(u.role);
    setFColaborador(u.colaborador_id != null ? String(u.colaborador_id) : "");
    setError("");
    setShowModal(true);
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) {
        const body: Record<string, unknown> = {};
        if (editing.can_edit_username && fUsername.trim() && fUsername.trim() !== editing.username) body.username = fUsername.trim();
        if (fPassword !== "") body.password = fPassword;
        if (me?.superadmin) {
          body.role = fRole;
          body.colaborador_id = fColaborador ? Number(fColaborador) : null;
        }
        await apiSend(`/api/panel/usuarios/${editing.id}`, "PATCH", body);
      } else {
        await apiSend("/api/panel/usuarios", "POST", {
          username: fUsername.trim(),
          password: fPassword,
          role: fRole,
          colaborador_id: fColaborador ? Number(fColaborador) : null,
        });
      }
      resetForm();
      fetchData();
    } catch (e) {
      setError((e as Error).message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function remove(u: UsuarioItem) {
    if (!confirm(`¿Eliminar al usuario ${u.username}?`)) return;
    try {
      await apiSend(`/api/panel/usuarios/${u.id}`, "DELETE");
      fetchData();
    } catch (e) {
      alert((e as Error).message || "Error al eliminar");
    }
  }

  return (
    <PanelShell title="Usuarios">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "60rem", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Usuarios</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              {me?.superadmin
                ? "Como superadministrador puedes ver y modificar todas las contraseñas."
                : "Solo puedes ver y cambiar tu propia contraseña."}
            </p>
          </div>
          {me?.superadmin && (
            <button onClick={openCreate} style={primaryBtn}>
              <Plus size={18} /> Nuevo usuario
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {usuarios.map((u) => {
              const colab = u.colaborador_id != null ? colabById.get(u.colaborador_id) : null;
              const isSelf = me?.username === u.username;
              const show = revealed[u.id];
              const limitReached = u.limit != null && u.changes_this_month >= u.limit;
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.9rem 1rem", background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid ${u.role === "developer" ? "var(--gold)" : "var(--border)"}`, borderRadius: "0.875rem", flexWrap: "wrap" }}>
                  {colab ? <ColaboradorAvatar colaborador={colab} size={40} /> : (
                    <div style={{ width: 40, height: 40, borderRadius: "0.6rem", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User size={20} color="var(--text-muted)" />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: "10rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>{u.username}</span>
                      {isSelf && <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--accent-fg)", background: "var(--accent)", padding: "0.05rem 0.45rem", borderRadius: "9999px" }}>Tú</span>}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.65rem", fontWeight: 600, color: u.role === "developer" ? "var(--gold)" : "var(--text-secondary)", background: u.role === "developer" ? "var(--gold-soft)" : "var(--surface-2)", padding: "0.1rem 0.5rem", borderRadius: "9999px" }}>
                        {u.role === "developer" && <ShieldCheck size={11} />}
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      {colab ? `${colab.nombre} · ${colab.puesto}` : "Sin colaborador vinculado"}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.35rem 0.6rem", minWidth: "11rem" }}>
                    <Lock size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, fontFamily: "monospace", fontSize: "0.82rem", color: u.can_see_password && u.has_password ? "var(--text)" : "var(--text-muted)", letterSpacing: u.can_see_password && show ? "0" : "0.12em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {!u.has_password
                        ? "no disponible"
                        : u.can_see_password
                        ? show
                          ? u.password
                          : "••••••••"
                        : "••••••••"}
                    </span>
                    {u.can_see_password && u.has_password ? (
                      <button onClick={() => setRevealed((r) => ({ ...r, [u.id]: !r[u.id] }))} style={miniBtn} title={show ? "Ocultar" : "Mostrar"}>
                        {show ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    ) : (
                      <Lock size={13} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                    )}
                  </div>

                  {u.limit != null && (
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: limitReached ? "var(--danger)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {u.changes_this_month}/{u.limit} cambios este mes
                    </span>
                  )}

                  <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                    {u.can_edit && (
                      <button onClick={() => openEdit(u)} style={iconBtn} title="Editar">
                        <Pencil size={16} />
                      </button>
                    )}
                    {me?.superadmin && !isSelf && (
                      <button onClick={() => remove(u)} style={{ ...iconBtn, color: "var(--danger)" }} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <Modal onClose={resetForm} title={editing ? `Editar ${editing.username}` : "Nuevo usuario"}>
          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Field label="Usuario">
              <input
                style={{ ...inputStyle, opacity: editing && !editing.can_edit_username ? 0.6 : 1 }}
                value={fUsername}
                onChange={(e) => setFUsername(e.target.value)}
                placeholder="usuario"
                disabled={Boolean(editing && !editing.can_edit_username)}
                autoFocus
              />
            </Field>
            <Field label={editing ? "Nueva contraseña (déjala vacía para no cambiarla)" : "Contraseña"}>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...inputStyle, paddingRight: "2.4rem" }}
                  type={fShowPass ? "text" : "password"}
                  value={fPassword}
                  onChange={(e) => setFPassword(e.target.value)}
                  placeholder={editing ? "••••••••" : "Contraseña"}
                />
                <button type="button" onClick={() => setFShowPass((v) => !v)} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
                  {fShowPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            {me?.superadmin && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                <Field label="Rol">
                  <select style={inputStyle} value={fRole} onChange={(e) => setFRole(e.target.value)}>
                    <option value="user">Colaborador</option>
                    <option value="admin">Administrador</option>
                    <option value="developer">Superadministrador</option>
                  </select>
                </Field>
                <Field label="Colaborador">
                  <select style={inputStyle} value={fColaborador} onChange={(e) => setFColaborador(e.target.value)}>
                    <option value="">Sin vincular</option>
                    {colaboradores.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {editing && editing.limit != null && (
              <div style={{ fontSize: "0.76rem", color: editing.changes_this_month >= editing.limit ? "var(--danger)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <KeyRound size={13} />
                Cambios de contraseña este mes: {editing.changes_this_month}/{editing.limit}
                {editing.changes_this_month >= editing.limit ? " — límite alcanzado" : ""}
              </div>
            )}

            {error && <div style={errorBox}>{error}</div>}
            <button type="submit" disabled={saving} style={{ ...primaryBtn, width: "100%", justifyContent: "center", opacity: saving ? 0.6 : 1 }}>
              {saving ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 90 }} onClick={onClose} />
      <div
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.4rem", zIndex: 91, width: "min(94vw, 28rem)", maxHeight: "92vh", overflowY: "auto" }}
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

const miniBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--text-muted)",
  cursor: "pointer",
  display: "flex",
  padding: 0,
  flexShrink: 0,
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

const errorBox: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  background: "var(--danger-soft)",
  border: "1px solid var(--danger)",
  borderRadius: "0.5rem",
  color: "var(--danger)",
  fontSize: "0.82rem",
  fontWeight: 500,
};
