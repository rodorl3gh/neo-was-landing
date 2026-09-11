export interface TipoMeta {
  value: string;
  label: string;
  color: string;
}

export const TIPOS_META: TipoMeta[] = [
  { value: "trabajo", label: "Trabajo", color: "#3b82f6" },
  { value: "capacitacion", label: "Capacitación", color: "#a855f7" },
  { value: "taller_ponencia", label: "Taller o Ponencia", color: "#8b5cf6" },
  { value: "clientes", label: "Clientes", color: "#0ea5e9" },
  { value: "prospeccion", label: "Prospección", color: "#f59e0b" },
  { value: "administracion", label: "Administración", color: "#14b8a6" },
  { value: "personal", label: "Personal", color: "#ec4899" },
  { value: "otro", label: "Otro", color: "#94a3b8" },
];

export function tipoInfo(value: string | null | undefined): TipoMeta {
  return TIPOS_META.find((t) => t.value === value) || { value: value || "otro", label: value || "Otro", color: "#94a3b8" };
}

export const PRIORIDADES = [
  { value: "alta", label: "Alta", color: "#ef4444" },
  { value: "media", label: "Media", color: "#f59e0b" },
  { value: "baja", label: "Baja", color: "#22c55e" },
];

export function prioridadInfo(value: string | null | undefined) {
  return PRIORIDADES.find((p) => p.value === value) || { value: "media", label: "Media", color: "#f59e0b" };
}

export type EstadoMeta = "pendiente" | "progreso" | "completada";

export const ESTADOS: { value: EstadoMeta; label: string; color: string }[] = [
  { value: "pendiente", label: "Pendiente", color: "#94a3b8" },
  { value: "progreso", label: "En progreso", color: "#3b82f6" },
  { value: "completada", label: "Completada", color: "#22c55e" },
];

export function estadoInfo(value: string | null | undefined) {
  return ESTADOS.find((e) => e.value === value) || ESTADOS[0];
}

// ------------------------------------------------------------------
// Utilidades de fecha (trabajan con strings YYYY-MM-DD en horario local)
// ------------------------------------------------------------------
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS_CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function formatFechaLarga(iso: string): string {
  if (!iso) return "Sin fecha";
  const d = parseISO(iso);
  return `${DIAS_CORTOS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatFechaCorta(iso: string): string {
  if (!iso) return "Sin fecha";
  const d = parseISO(iso);
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
}

export function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const hoy = parseISO(todayISO()).getTime();
  const target = parseISO(iso).getTime();
  return Math.round((target - hoy) / 86400000);
}

export function vencimientoLabel(iso: string): { label: string; color: string } | null {
  const diff = daysUntil(iso);
  if (diff === null) return null;
  if (diff < 0) return { label: `Vencida hace ${Math.abs(diff)}d`, color: "#ef4444" };
  if (diff === 0) return { label: "Vence hoy", color: "#ef4444" };
  if (diff === 1) return { label: "Vence mañana", color: "#f59e0b" };
  if (diff <= 7) return { label: `En ${diff} días`, color: "#f59e0b" };
  return { label: `En ${diff} días`, color: "var(--text-muted)" };
}
