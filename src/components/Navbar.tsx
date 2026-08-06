"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sparkles } from "lucide-react";

const navItems = [
  { id: "inicio", label: "Inicio" },
  { id: "servicios", label: "Servicios" },
  { id: "calculadora", label: "Calculadora" },
  { id: "casos", label: "Casos de exito" },
  { id: "biblioteca", label: "Biblioteca" },
  { id: "blog", label: "Blog" },
  { id: "cita", label: "Agenda" },
  { id: "cotizacion", label: "Cotizacion" },
  { id: "recursos", label: "Recursos" },
  { id: "testimonios", label: "Testimonios" },
  { id: "comunidad", label: "Comunidad" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = navItems.map((item) => document.getElementById(item.id));
      const scrollPos = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-obsidian-950/90 backdrop-blur-xl border-b border-obsidian-600/40 shadow-lg shadow-purple-500/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => scrollTo("inicio")}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              NEO<span className="text-purple-400">WAS</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? "bg-purple-500/15 text-purple-400"
                    : "text-text-secondary hover:text-white hover:bg-obsidian-700/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-obsidian-700/50 transition-all duration-300"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-obsidian-950/98 backdrop-blur-xl border-b border-obsidian-600/40">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? "bg-purple-500/15 text-purple-400"
                    : "text-text-secondary hover:text-white hover:bg-obsidian-700/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
