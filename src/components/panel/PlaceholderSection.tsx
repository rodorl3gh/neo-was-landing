import { Construction } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function PlaceholderSection({
  title,
  desc,
  icon: Icon,
}: {
  title: string;
  desc: string;
  icon: LucideIcon;
}) {
  return (
    <div style={{ maxWidth: "48rem", margin: "0 auto", paddingTop: "1rem" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          textAlign: "center",
          padding: "4rem 2rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
        }}
      >
        <div
          style={{
            width: "4rem",
            height: "4rem",
            borderRadius: "1rem",
            background: "var(--accent-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={30} color="var(--accent)" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0, maxWidth: "24rem" }}>{desc}</p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--cyan)",
            background: "var(--cyan-soft)",
            border: "1px solid var(--cyan)",
            padding: "0.3rem 0.8rem",
            borderRadius: "9999px",
            letterSpacing: "0.03em",
          }}
        >
          <Construction size={13} /> Módulo en desarrollo
        </span>
      </div>
    </div>
  );
}
