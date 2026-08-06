"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  Send,
  Check,
  BookOpen,
  CalendarDays,
  ListChecks,
  TrendingUp,
} from "lucide-react";

const resources = [
  {
    icon: FileText,
    title: "Guia de Facebook Ads",
    description: "Aprende a crear campanas efectivas desde cero con esta guia practica paso a paso.",
    color: "blue",
    pages: "24 paginas",
  },
  {
    icon: BookOpen,
    title: "Guia WhatsApp Business",
    description: "Configura tu WhatsApp Business como un profesional y automatiza tus respuestas.",
    color: "green",
    pages: "18 paginas",
  },
  {
    icon: CalendarDays,
    title: "Calendario de contenido",
    description: "Plantilla de 30 dias con ideas de publicaciones para tus redes sociales.",
    color: "orange",
    pages: "Plantilla",
  },
  {
    icon: ListChecks,
    title: "Checklist para vender mas",
    description: "10 pasos comprobados para aumentar tus ventas usando herramientas digitales.",
    color: "purple",
    pages: "15 paginas",
  },
];

const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  blue: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  green: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  orange: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
};

export default function Resources() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedResource, setSelectedResource] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="recursos" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.05),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Download size={14} />
            RECURSOS DESCARGABLES
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Herramientas{" "}
            <span className="gradient-text-orange">gratuitas</span> para tu
            negocio
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Descarga guias, plantillas y checklists que te ayudaran a vender mas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {resources.map((r, i) => {
            const c = colorMap[r.color];
            return (
              <div
                key={i}
                className={`glass-card p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer ${
                  selectedResource === i ? "ring-2 ring-orange-500/50" : ""
                }`}
                onClick={() => setSelectedResource(i)}
              >
                <div
                  className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center mb-4`}
                >
                  <r.icon size={20} />
                </div>
                <h3 className="font-display font-semibold text-white text-sm mb-2">
                  {r.title}
                </h3>
                <p className="text-text-muted text-xs leading-relaxed mb-3">
                  {r.description}
                </p>
                <span className="text-xs font-mono text-orange-400">
                  {r.pages}
                </span>
              </div>
            );
          })}
        </div>

        {submitted ? (
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <Check size={22} className="text-emerald-400" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-1">
              Recursos enviados
            </h3>
            <p className="text-text-secondary text-sm">
              Revisa tu correo electronico. Te hemos enviado los recursos
              seleccionados.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <Send
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-white placeholder:text-text-muted focus:outline-none focus:border-orange-500/50 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-display font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/25 flex items-center justify-center gap-2 shrink-0"
              >
                <Download size={16} />
                Descargar gratis
              </button>
            </div>
            <p className="mt-3 text-text-muted text-xs flex items-center gap-1">
              <TrendingUp size={12} className="text-orange-400" />
              Al compartir tu correo recibiras contenido exclusivo y tips
              semanales para hacer crecer tu negocio. Sin spam.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
