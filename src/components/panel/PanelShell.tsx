"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link2,
  Target,
  Wallet,
  Users,
  UserPlus,
  FileText,
  CalendarDays,
  MessageCircle,
  Layers,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "./theme";
import { apiGet, clearToken, getToken } from "@/lib/panel/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  ready: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/panel", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/panel/enlaces", label: "Enlaces", icon: Link2, ready: true },
  { href: "#", label: "Metas", icon: Target, ready: false },
  { href: "#", label: "Contabilidad", icon: Wallet, ready: false },
  { href: "#", label: "Clientes", icon: Users, ready: false },
  { href: "#", label: "Prospectos", icon: UserPlus, ready: false },
  { href: "#", label: "Procesos", icon: Layers, ready: false },
  { href: "#", label: "Contratos", icon: FileText, ready: false },
  { href: "#", label: "Calendario", icon: CalendarDays, ready: false },
  { href: "#", label: "Asistente", icon: MessageCircle, ready: false },
];

export default function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/panel/login");
      return;
    }
    apiGet<{ valid: boolean; username: string | null }>("/api/panel/auth")
      .then((d) => {
        if (!d.valid) {
          clearToken();
          router.replace("/panel/login");
        } else {
          setUsername(d.username || "");
          setReady(true);
        }
      })
      .catch(() => {
        clearToken();
        router.replace("/panel/login");
      });
  }, [router]);

  function handleLogout() {
    clearToken();
    router.replace("/panel/login");
  }

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "3px solid var(--border)",
            borderTopColor: "var(--accent)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sidebar = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1.25rem", gap: "0.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.4rem", padding: "0 0.25rem" }}>
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "0.75rem",
            background: "var(--primary)",
            color: "var(--gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            flexShrink: 0,
          }}
        >
          W
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.15rem", color: "var(--text)", lineHeight: 1.1 }}>
            Wasito
          </span>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Neo Was
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.ready && (item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href));
          return (
            <button
              key={item.label}
              disabled={!item.ready}
              onClick={() => {
                if (item.ready) {
                  router.push(item.href);
                  setMobileOpen(false);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                width: "100%",
                padding: "0.62rem 0.75rem",
                borderRadius: "0.625rem",
                border: "none",
                background: isActive ? "var(--accent-soft)" : "transparent",
                color: isActive ? "var(--accent)" : item.ready ? "var(--text-secondary)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.875rem",
                cursor: item.ready ? "pointer" : "not-allowed",
                opacity: item.ready ? 1 : 0.6,
                transition: "all 0.15s ease",
                textAlign: "left",
                fontFamily: "inherit",
              }}
              onMouseOver={(e) => {
                if (item.ready && !isActive) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text)";
                }
              }}
              onMouseOut={(e) => {
                if (item.ready && !isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {!item.ready && (
                <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "0.1rem 0.4rem", borderRadius: "9999px" }}>
                  Pronto
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.7rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <button onClick={toggle} style={footerBtn}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
        </button>
        <button onClick={handleLogout} style={{ ...footerBtn, color: "var(--text-muted)" }}>
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ display: "none", width: "16rem", height: "100vh", position: "sticky", top: 0, flexShrink: 0, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }} className="sidebar-desktop">
        {sidebar}
      </aside>

      {mobileOpen && <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.5)" }} onClick={() => setMobileOpen(false)} />}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "16rem",
          zIndex: 50,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
        className="sidebar-mobile"
      >
        <div style={{ position: "relative", height: "100%" }}>
          {sidebar}
          <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "0.9rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => setMobileOpen(true)} className="mobile-menu-btn" style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 0, display: "flex" }} aria-label="Abrir menú">
              <Menu size={20} />
            </button>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {username && (
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mint)" }} />
                {username}
              </span>
            )}
          </div>
        </header>

        <main style={{ flex: 1, padding: "1.5rem" }}>{children}</main>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .sidebar-desktop { display: block !important; }
          .sidebar-mobile { display: none !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile { display: block !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

const footerBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.7rem",
  width: "100%",
  padding: "0.6rem 0.75rem",
  borderRadius: "0.625rem",
  border: "none",
  background: "transparent",
  color: "var(--text-secondary)",
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
  textAlign: "left",
};
