"use client";

import { Play, GraduationCap, ExternalLink } from "lucide-react";

const videos = [
  {
    title: "Que es Marketing Digital?",
    duration: "12 min",
    description: "Aprende los fundamentos del marketing digital y como aplicarlo a tu negocio.",
    color: "purple",
  },
  {
    title: "Como vender por Facebook",
    duration: "18 min",
    description: "Estrategias practicas para vender tus productos en Facebook e Instagram.",
    color: "blue",
  },
  {
    title: "Como usar WhatsApp Business",
    duration: "15 min",
    description: "Configura tu WhatsApp Business, catalogo, respuestas rapidas y etiquetas.",
    color: "green",
  },
  {
    title: "IA para negocios",
    duration: "22 min",
    description: "Descubre como la inteligencia artificial puede automatizar y hacer crecer tu negocio.",
    color: "purple",
  },
  {
    title: "Como conseguir clientes",
    duration: "20 min",
    description: "Tecnicas comprobadas para atraer clientes nuevos todos los dias.",
    color: "orange",
  },
];

const colorMap: Record<string, { text: string; border: string; bg: string }> = {
  purple: { text: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  blue: { text: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  green: { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  orange: { text: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10" },
};

export default function FreeLibrary() {
  return (
    <section id="biblioteca" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.05),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <GraduationCap size={14} />
            BIBLIOTECA GRATUITA
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Aprende a tu ritmo con{" "}
            <span className="gradient-text-pink">contenido gratuito</span>
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Mientras mas aprendas de marketing digital, mas confianza tendras en
            lo que podemos hacer juntos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, i) => {
            const c = colorMap[video.color];
            return (
              <div
                key={i}
                className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
              >
                <div className={`relative h-48 ${c.bg} flex items-center justify-center`}>
                  <div
                    className={`w-14 h-14 rounded-full ${c.bg} border ${c.border} flex items-center justify-center ${c.text} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Play size={24} className="ml-1" />
                  </div>
                  <span className="absolute bottom-3 right-3 text-xs font-mono text-white/60 bg-black/40 px-2 py-1 rounded-md">
                    {video.duration}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-white text-lg mb-2">
                    {video.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 font-display font-semibold text-sm transition-all duration-300 hover:bg-pink-500/20 hover:border-pink-500/50 hover:scale-[1.02]">
            Ver biblioteca completa
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
