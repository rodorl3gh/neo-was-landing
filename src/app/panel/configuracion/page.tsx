"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, CheckCircle2, Play, Upload, Trash2, Smartphone, Volume2 } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { useNotifications, type NotifPrefs } from "@/components/panel/NotificationsProvider";
import { SOUND_PRESETS, playSound } from "@/components/panel/sounds";

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.875rem",
  padding: "1.25rem",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

function SoundOption({
  active,
  label,
  description,
  onSelect,
  onPreview,
  previewable,
}: {
  active: boolean;
  label: string;
  description?: string;
  onSelect: () => void;
  onPreview?: () => void;
  previewable?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 0.9rem",
        borderRadius: "0.75rem",
        border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
        background: active ? "var(--gold-soft)" : "var(--surface-2)",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `2px solid ${active ? "var(--gold)" : "var(--border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {active && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)" }} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{label}</div>
        {description && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{description}</div>}
      </div>
      {previewable && onPreview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          title="Escuchar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.3rem 0.6rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          <Play size={12} /> Escuchar
        </button>
      )}
    </div>
  );
}

export default function ConfiguracionPage() {
  const { prefs, permission, subscribed, savePrefs, enablePush, disablePush } = useNotifications();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const ua = navigator.userAgent;
      setIsIos(/iPad|iPhone|iPod/.test(ua));
      const nav = navigator as Navigator & { standalone?: boolean };
      setStandalone(window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  async function update(next: Partial<NotifPrefs>) {
    setError("");
    try {
      await savePrefs(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("No se pudieron guardar los cambios.");
    }
  }

  async function togglePush() {
    setError("");
    setBusy(true);
    try {
      if (subscribed) await disablePush();
      else await enablePush();
    } catch (e) {
      setError((e as Error).message || "No se pudo cambiar el estado de las notificaciones.");
    } finally {
      setBusy(false);
    }
  }

  function onFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Selecciona un archivo de audio válido.");
      return;
    }
    if (file.size > 1_400_000) {
      setError("El audio debe pesar menos de 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      void update({ sound: "custom", sound_data: dataUrl, sound_name: file.name });
    };
    reader.readAsDataURL(file);
  }

  const permissionLabel =
    permission === "granted"
      ? "Permitidas"
      : permission === "denied"
        ? "Bloqueadas"
        : permission === "unsupported"
          ? "No soportadas"
          : "Sin definir";

  const permissionColor =
    permission === "granted" ? "var(--success)" : permission === "denied" ? "var(--danger)" : "var(--text-muted)";

  return (
    <PanelShell title="Configuración">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "46rem", margin: "0 auto" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bell size={20} color="var(--gold)" /> Configuración
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
            Personaliza cómo quieres recibir las notificaciones del sistema.
          </p>
        </div>

        {error && (
          <div style={{ padding: "0.75rem 1rem", color: "var(--danger)", background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "0.75rem", fontSize: "0.82rem" }}>
            {error}
          </div>
        )}

        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h3 style={sectionTitle}>
                {subscribed ? <Bell size={17} color="var(--gold)" /> : <BellOff size={17} color="var(--text-muted)" />}
                Notificaciones en este dispositivo
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.3rem 0 0" }}>
                Permiso: <span style={{ color: permissionColor, fontWeight: 600 }}>{permissionLabel}</span>
                {subscribed ? " · activas" : " · inactivas"}
              </p>
            </div>
            <button
              onClick={togglePush}
              disabled={busy || permission === "unsupported"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.55rem 1rem",
                fontSize: "0.82rem",
                fontWeight: 600,
                borderRadius: "0.625rem",
                border: "1px solid var(--gold)",
                background: subscribed ? "var(--surface)" : "var(--gold-soft)",
                color: "var(--gold)",
                cursor: busy || permission === "unsupported" ? "not-allowed" : "pointer",
                opacity: busy || permission === "unsupported" ? 0.6 : 1,
                fontFamily: "inherit",
              }}
            >
              {subscribed ? "Desactivar en este dispositivo" : "Activar notificaciones"}
            </button>
          </div>

          {isIos && !standalone && (
            <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.9rem", padding: "0.7rem 0.85rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "0.75rem" }}>
              <Smartphone size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                En iPhone/iPad primero agrega el panel a la pantalla de inicio (Safari → Compartir → Agregar a pantalla de inicio) y ábrelo desde ahí para poder activar las notificaciones.
              </p>
            </div>
          )}
        </section>

        <section style={card}>
          <h3 style={sectionTitle}>
            <Volume2 size={17} color="var(--gold)" /> Sonido de notificación
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.3rem 0 0.9rem" }}>
            Se usa cuando el panel está abierto. Con la app cerrada, el teléfono reproduce su propio sonido de notificación.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <SoundOption
              active={prefs.sound === "device"}
              label="Sonido del dispositivo"
              description="El tono predeterminado de tu teléfono"
              onSelect={() => void update({ sound: "device" })}
            />

            {SOUND_PRESETS.map((s) => (
              <SoundOption
                key={s.id}
                active={prefs.sound === s.id}
                label={s.label}
                onSelect={() => void update({ sound: s.id })}
                onPreview={() => playSound(s.id)}
                previewable
              />
            ))}

            <SoundOption
              active={prefs.sound === "custom"}
              label={prefs.sound_name ? `Personalizado: ${prefs.sound_name}` : "Sonido personalizado"}
              description="Sube un audio desde tu dispositivo"
              onSelect={() => {
                if (prefs.sound_data) void update({ sound: "custom" });
                else fileRef.current?.click();
              }}
              onPreview={prefs.sound_data ? () => playSound("custom", prefs.sound_data) : undefined}
              previewable={!!prefs.sound_data}
            />

            <SoundOption
              active={prefs.sound === "silent"}
              label="Silencio"
              description="Sin sonido, solo el aviso visual"
              onSelect={() => void update({ sound: "silent" })}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
            <input ref={fileRef} type="file" accept="audio/*" onChange={onFile} style={{ display: "none" }} />
            <button
              onClick={() => fileRef.current?.click()}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.85rem", fontSize: "0.78rem", fontWeight: 600, borderRadius: "0.625rem", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}
            >
              <Upload size={14} /> {prefs.sound_data ? "Cambiar audio" : "Subir audio"}
            </button>
            {prefs.sound_data && (
              <button
                onClick={() => void update({ sound: prefs.sound === "custom" ? "device" : prefs.sound, sound_data: "", sound_name: "" })}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.85rem", fontSize: "0.78rem", fontWeight: 600, borderRadius: "0.625rem", border: "1px solid var(--danger)", background: "var(--danger-soft)", color: "var(--danger)", cursor: "pointer", fontFamily: "inherit" }}
              >
                <Trash2 size={14} /> Quitar audio
              </button>
            )}
            {saved && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: "var(--success)", fontWeight: 600 }}>
                <CheckCircle2 size={15} /> Guardado
              </span>
            )}
          </div>
        </section>
      </div>
    </PanelShell>
  );
}
