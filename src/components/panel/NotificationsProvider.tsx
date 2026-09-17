"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { apiGet, apiSend, getToken } from "@/lib/panel/api";
import { playSound } from "./sounds";

export interface NotifPrefs {
  notif_enabled: boolean;
  sound: string;
  sound_data: string;
  sound_name: string;
}

const DEFAULT_PREFS: NotifPrefs = { notif_enabled: true, sound: "device", sound_data: "", sound_name: "" };

interface NotifContextValue {
  prefs: NotifPrefs;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  savePrefs: (next: Partial<NotifPrefs>) => Promise<void>;
  enablePush: () => Promise<void>;
  disablePush: () => Promise<void>;
}

const NotifContext = createContext<NotifContextValue | null>(null);

export function useNotifications(): NotifContextValue {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  return ctx;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

interface Toast {
  id: number;
  mensaje: string;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [subscribed, setSubscribed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastIdRef = useRef<number | null>(null);
  const prefsRef = useRef<NotifPrefs>(DEFAULT_PREFS);
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  const pushPrefsToSw = useCallback((p: NotifPrefs) => {
    const reg = swRef.current;
    if (reg && reg.active) {
      reg.active.postMessage({ type: "prefs", sound: p.sound, enabled: p.notif_enabled });
    }
  }, []);

  const showToast = useCallback((mensaje: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, mensaje }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 8000);
  }, []);

  const handleNew = useCallback(
    (mensaje: string) => {
      const p = prefsRef.current;
      if (p.notif_enabled) playSound(p.sound, p.sound_data);
      showToast(mensaje);
    },
    [showToast]
  );

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  // Registro del service worker
  useEffect(() => {
    if (typeof window === "undefined" || !pushSupported()) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        swRef.current = reg;
        await navigator.serviceWorker.ready;
        setPermission("Notification" in window ? Notification.permission : "unsupported");
        pushPrefsToSw(prefsRef.current);
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      })
      .catch(() => {
        /* sin service worker */
      });
  }, [pushPrefsToSw]);

  // Preferencias del usuario
  const loadPrefs = useCallback(async () => {
    if (!getToken()) return;
    try {
      const d = await apiGet<{ prefs: NotifPrefs }>("/api/panel/prefs");
      setPrefs(d.prefs);
      prefsRef.current = d.prefs;
      pushPrefsToSw(d.prefs);
    } catch {
      /* sesión no válida */
    }
  }, [pushPrefsToSw]);

  useEffect(() => {
    const t = setTimeout(loadPrefs, 0);
    return () => clearTimeout(t);
  }, [loadPrefs]);

  // Polling de actividad para sonido + aviso con la app abierta
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function init() {
      if (!getToken()) return;
      try {
        const d = await apiGet<{ latestId: number }>("/api/panel/actividad");
        lastIdRef.current = d.latestId;
      } catch {
        return;
      }
      poll();
      timer = setInterval(poll, 12000);
    }

    async function poll() {
      if (stopped || !getToken()) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      const since = lastIdRef.current;
      if (since == null) return;
      try {
        const d = await apiGet<{ actividad: { id: number; mensaje: string }[]; latestId: number }>(
          `/api/panel/actividad?since=${since}`
        );
        lastIdRef.current = d.latestId;
        if (d.actividad && d.actividad.length > 0) {
          handleNew(d.actividad[0].mensaje);
        }
      } catch {
        /* ignorar errores de red */
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };

    const t = setTimeout(init, 0);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(t);
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [handleNew]);

  // Mensajes del service worker (push recibido con la app enfocada)
  useEffect(() => {
    if (typeof window === "undefined" || !pushSupported()) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data || {};
      if (data.type === "push") {
        const payload = data.data || {};
        if (typeof payload.id === "number") {
          if (lastIdRef.current != null && payload.id <= lastIdRef.current) return;
          lastIdRef.current = payload.id;
        }
        handleNew(payload.body || "Nueva actividad en el panel");
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [handleNew]);

  const savePrefs = useCallback(
    async (next: Partial<NotifPrefs>) => {
      const merged = { ...prefsRef.current, ...next };
      setPrefs(merged);
      prefsRef.current = merged;
      pushPrefsToSw(merged);
      await apiSend("/api/panel/prefs", "PUT", merged);
    },
    [pushPrefsToSw]
  );

  const enablePush = useCallback(async () => {
    if (!pushSupported()) throw new Error("Este dispositivo no soporta notificaciones");
    const reg = swRef.current || (await navigator.serviceWorker.ready);
    swRef.current = reg;
    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") throw new Error("Permiso de notificaciones denegado");
    const { publicKey } = await apiGet<{ publicKey: string }>("/api/panel/push/key");
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }
    await apiSend("/api/panel/push/subscribe", "POST", sub.toJSON());
    setSubscribed(true);
  }, []);

  const disablePush = useCallback(async () => {
    if (!pushSupported()) return;
    const reg = swRef.current || (await navigator.serviceWorker.ready);
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await apiSend("/api/panel/push/unsubscribe", "POST", { endpoint: sub.endpoint });
      await sub.unsubscribe();
    }
    setSubscribed(false);
  }, []);

  return (
    <NotifContext.Provider value={{ prefs, permission, subscribed, savePrefs, enablePush, disablePush }}>
      {children}
      {toasts.length > 0 && (
        <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 100, display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "20rem" }}>
          {toasts.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
                padding: "0.75rem 0.85rem",
                background: "var(--surface)",
                border: "1px solid var(--gold)",
                borderRadius: "0.75rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              <Bell size={16} color="var(--gold)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Notificación</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.35 }}>{t.mensaje}</div>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0, display: "flex" }}
                aria-label="Cerrar"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </NotifContext.Provider>
  );
}
