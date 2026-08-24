"use client";

import "./globals.css";
import { ThemeProvider } from "@/components/panel/theme";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "var(--font-body)",
          transition: "background 0.2s ease, color 0.2s ease",
        }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
