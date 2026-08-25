"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, LogOut, Menu, X } from "lucide-react";
import { useTheme } from "./theme";
import { apiGet, clearToken, getToken } from "@/lib/panel/api";
import { MODULES, ROLE_LABELS } from "./modules";

export default function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/panel/login");
      return;
    }
    apiGet<{ valid: boolean; username: string | null; role: string | null }>("/api/panel/auth")
      .then((d) => {
        if (!d.valid) {
          clearToken();
          router.replace("/panel/login");
        } else {
          setUsername(d.username || "");
          setRole(d.role || "");
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1.25rem", gap: "0.25rem", background: "var(--sidebar)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.4rem", padding: "0 0.25rem" }}>
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "0.7rem",
            background: "linear-gradient(135deg, #36afc0, #1be0b5)",
            color: "#04121a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            fontSize: "1.15rem",
            flexShrink: 0,
          }}
        >
          W
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.15rem", color: "var(--sidebar-text)", lineHeight: 1.1 }}>
            Wasito
          </span>
          <span style={{ fontSize: "0.66rem", color: "var(--sidebar-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Neo Was</span>
        </div>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem", overflowY: "auto" }}>
        {MODULES.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                width: "100%",
                padding: "0.62rem 0.75rem",
                borderRadius: "0.625rem",
                border: "none",
                background: isActive ? "rgba(54,175,192,0.14)" : "transparent",
                color: isActive ? "#4fd3e4" : "var(--sidebar-text)",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "left",
                fontFamily: "inherit",
                position: "relative",
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: "60%",
                    borderRadius: 999,
                    background: "var(--cyan)",
                  }}
                />
              )}
              <Icon size={18} color={isActive ? "#4fd3e4" : "var(--sidebar-muted)"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--sidebar-border)", paddingTop: "0.7rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <button onClick={toggle} style={footerBtn}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
        </button>
        <button onClick={handleLogout} style={{ ...footerBtn, color: "var(--sidebar-muted)" }}>
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  const roleLabel = ROLE_LABELS[role] || role;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ display: "none", width: "16rem", height: "100vh", position: "sticky", top: 0, flexShrink: 0, background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }} className="sidebar-desktop">
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
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
        className="sidebar-mobile"
      >
        <div style={{ position: "relative", height: "100%" }}>
          {sidebar}
          <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--sidebar-muted)", cursor: "pointer" }} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          className="panel-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "0.9rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--sidebar)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => setMobileOpen(true)} className="mobile-menu-btn" style={{ background: "none", border: "none", color: "var(--sidebar-text)", cursor: "pointer", padding: 0, display: "flex" }} aria-label="Abrir menú">
              <Menu size={20} />
            </button>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--sidebar-text)", margin: 0 }}>{title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
            {username && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span
                  className="role-badge"
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: "var(--cyan)",
                    background: "rgba(54,175,192,0.14)",
                    border: "1px solid rgba(54,175,192,0.35)",
                    padding: "0.15rem 0.55rem",
                    borderRadius: "9999px",
                  }}
                >
                  {roleLabel}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--sidebar-text)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mint)" }} />
                  <span className="username-text">{username}</span>
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="panel-main" style={{ flex: 1, padding: "1.5rem", background: "var(--bg)" }}>{children}</main>
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
          .panel-header { padding: 0.7rem 1rem !important; }
          .panel-main { padding: 1rem !important; }
          .role-badge { display: none !important; }
        }
        @media (max-width: 420px) {
          .username-text { display: none !important; }
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
  color: "var(--sidebar-text)",
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
  textAlign: "left",
};
