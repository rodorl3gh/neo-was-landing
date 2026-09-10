"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatFechaLarga, parseISO, toISO, todayISO } from "./metaUtils";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

export default function CalendarPicker({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  compact = false,
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const base = value ? parseISO(value) : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggleOpen() {
    if (!open && value) {
      const d = parseISO(value);
      setCursor({ year: d.getFullYear(), month: d.getMonth() });
    }
    setOpen((v) => !v);
  }

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const startOffset = (first.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const arr: (string | null)[] = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(toISO(new Date(cursor.year, cursor.month, d)));
    return arr;
  }, [cursor]);

  const hoy = todayISO();

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div ref={ref} style={{ position: "relative", width: compact ? "auto" : "100%" }}>
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: compact ? "auto" : "100%",
          padding: compact ? "0.35rem 0.6rem" : "0.55rem 0.75rem",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "0.5rem",
          color: value ? "var(--text)" : "var(--text-muted)",
          fontSize: compact ? "0.78rem" : "0.9rem",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <CalendarDays size={compact ? 14 : 16} color="var(--cyan)" style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value ? formatFechaLarga(value) : placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                onChange("");
              }
            }}
            style={{ display: "flex", color: "var(--text-muted)", flexShrink: 0 }}
            title="Quitar fecha"
          >
            <X size={compact ? 13 : 14} />
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.35rem)",
            left: 0,
            zIndex: 120,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "0.7rem",
            boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
            width: "16rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <button type="button" onClick={() => shift(-1)} style={navBtn} aria-label="Mes anterior">
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
              {MESES[cursor.month]} {cursor.year}
            </span>
            <button type="button" onClick={() => shift(1)} style={navBtn} aria-label="Mes siguiente">
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 2 }}>
            {DIAS.map((d, i) => (
              <span key={i} style={{ textAlign: "center", fontSize: "0.66rem", fontWeight: 700, color: "var(--text-muted)", padding: "0.15rem 0" }}>
                {d}
              </span>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {cells.map((iso, i) => {
              if (!iso) return <span key={i} />;
              const selected = iso === value;
              const isToday = iso === hoy;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  style={{
                    aspectRatio: "1",
                    border: isToday && !selected ? "1px solid var(--cyan)" : "1px solid transparent",
                    borderRadius: "0.45rem",
                    background: selected ? "var(--accent)" : "transparent",
                    color: selected ? "var(--accent-fg)" : "var(--text)",
                    fontSize: "0.78rem",
                    fontWeight: selected || isToday ? 700 : 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onMouseOver={(e) => {
                    if (!selected) e.currentTarget.style.background = "var(--surface-2)";
                  }}
                  onMouseOut={(e) => {
                    if (!selected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {Number(iso.slice(8, 10))}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.55rem" }}>
            <button
              type="button"
              onClick={() => {
                onChange(hoy);
                setOpen(false);
              }}
              style={{ ...linkBtn, color: "var(--cyan)" }}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              style={linkBtn}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "0.4rem",
  width: "1.7rem",
  height: "1.7rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-secondary)",
  cursor: "pointer",
};

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  cursor: "pointer",
  padding: "0.2rem 0.3rem",
  fontFamily: "inherit",
};
