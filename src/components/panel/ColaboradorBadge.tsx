"use client";

import { User } from "lucide-react";
import { COLABORADOR_ICONS } from "./colaboradorIcons";

export interface ColaboradorLite {
  id: number;
  nombre: string;
  puesto: string;
  icono: string;
  color: string;
  activo: number;
}

export function ColaboradorAvatar({
  colaborador,
  size = 36,
}: {
  colaborador: ColaboradorLite | null | undefined;
  size?: number;
}) {
  const Icon = COLABORADOR_ICONS[colaborador?.icono || ""] || User;
  const color = colaborador?.color || "#94a3b8";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "0.6rem",
        background: `${color}22`,
        border: `1px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={Math.round(size * 0.5)} color={color} />
    </div>
  );
}

export default function ColaboradorBadge({
  colaborador,
  size = 34,
  showPuesto = true,
}: {
  colaborador: ColaboradorLite | null | undefined;
  size?: number;
  showPuesto?: boolean;
}) {
  if (!colaborador) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
        <span
          style={{
            width: size,
            height: size,
            borderRadius: "0.6rem",
            background: "var(--surface-2)",
            border: "1px dashed var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
          }}
        >
          ?
        </span>
        Sin asignar
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.55rem", minWidth: 0 }}>
      <ColaboradorAvatar colaborador={colaborador} size={size} />
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.15 }}>{colaborador.nombre}</span>
        {showPuesto && colaborador.puesto && (
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.2 }}>{colaborador.puesto}</span>
        )}
      </span>
    </span>
  );
}
