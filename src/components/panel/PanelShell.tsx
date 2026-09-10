"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, LogOut, Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
  const [userColor, setUserColor] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("wasito_sidebar_collapsed") === "1";
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("wasito_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/panel/login");
      return;
    }
    apiGet<{ valid: boolean; username: string | null; role: string | null; color: string | null }>("/api/panel/auth")
      .then((d) => {
        if (!d.valid) {
          clearToken();
          router.replace("/panel/login");
        } else {
          setUsername(d.username || "");
          setRole(d.role || "");
          setUserColor(d.color || "");
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

  const renderSidebar = (isCollapsed: boolean, showToggle: boolean) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: isCollapsed ? "1rem 0.55rem" : "1.25rem",
        gap: "0.25rem",
        background: "var(--sidebar)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start", gap: "0.7rem", marginBottom: "1.4rem", padding: isCollapsed ? 0 : "0 0.25rem" }}>
        <div
          style={{
            width: isCollapsed ? "2.4rem" : "2.6rem",
            height: isCollapsed ? "2.4rem" : "2.6rem",
            borderRadius: "0.7rem",
            background: "#050506",
            border: "1px solid rgba(212,175,55,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <Image src="/logo-mark.png" alt="Neo Was" width={42} height={42} style={{ objectFit: "cover" }} priority />
        </div>
        {!isCollapsed && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.15rem", color: "var(--sidebar-text)", lineHeight: 1.1 }}>
              Wasito
            </span>
            <span style={{ fontSize: "0.66rem", color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Neo Was</span>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem", overflowY: "auto", overflowX: "hidden" }}>
        {MODULES.filter((m) => !m.superadminOnly || role === "developer").map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              title={isCollapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: "0.7rem",
                width: "100%",
                padding: isCollapsed ? "0.62rem 0" : "0.62rem 0.75rem",
                borderRadius: "0.625rem",
                border: "none",
                background: isActive ? "rgba(212,175,55,0.16)" : "transparent",
                color: isActive ? "var(--gold)" : "var(--sidebar-text)",
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
                    background: "var(--gold)",
                  }}
                />
              )}
              <Icon size={18} color={isActive ? "var(--gold)" : "var(--sidebar-muted)"} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--sidebar-border)", paddingTop: "0.7rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {showToggle && (
          <button onClick={toggleCollapsed} style={{ ...footerBtn, justifyContent: isCollapsed ? "center" : "flex-start", padding: isCollapsed ? "0.6rem 0" : footerBtn.padding }} title={isCollapsed ? "Expandir menú" : "Comprimir menú"}>
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!isCollapsed && <span>Comprimir menú</span>}
          </button>
        )}
        <button onClick={toggle} style={{ ...footerBtn, justifyContent: isCollapsed ? "center" : "flex-start", padding: isCollapsed ? "0.6rem 0" : footerBtn.padding }} title={theme === "dark" ? "Modo claro" : "Modo oscuro"}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {!isCollapsed && <span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>}
        </button>
        <button onClick={handleLogout} style={{ ...footerBtn, justifyContent: isCollapsed ? "center" : "flex-start", padding: isCollapsed ? "0.6rem 0" : footerBtn.padding, color: "var(--sidebar-muted)" }} title="Cerrar sesión">
          <LogOut size={18} />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );

  const roleLabel = ROLE_LABELS[role] || role;
  const badgeColor = userColor || "var(--gold)";
  const badgeIsHex = badgeColor.startsWith("#");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{ display: "none", width: collapsed ? "4.6rem" : "16rem", height: "100vh", position: "sticky", top: 0, flexShrink: 0, background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)", transition: "width 0.2s ease" }}
        className="sidebar-desktop"
      >
        {renderSidebar(collapsed, true)}
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
          {renderSidebar(false, false)}
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
                    color: badgeColor,
                    background: badgeIsHex ? `${badgeColor}22` : "var(--gold-soft)",
                    border: badgeIsHex ? `1px solid ${badgeColor}55` : "1px solid rgba(212,175,55,0.35)",
                    padding: "0.15rem 0.55rem",
                    borderRadius: "9999px",
                  }}
                >
                  {roleLabel}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--sidebar-text)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: userColor || "var(--mint)" }} />
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
