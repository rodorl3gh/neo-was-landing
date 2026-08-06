"use client";

import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Image,
  Video,
  ArrowRight,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Resultados de campanas",
    description: "Alcance, engagement, clics y conversiones en tiempo real.",
    color: "blue",
  },
  {
    icon: Users,
    title: "Prospectos",
    description: "Base de datos con todos tus leads y su estado actual.",
    color: "green",
  },
  {
    icon: FileText,
    title: "Reportes y facturas",
    description: "Documentos organizados, descargables cuando los necesites.",
    color: "orange",
  },
  {
    icon: Image,
    title: "Archivos y disenos",
    description: "Todas tus imagenes, logos y creatividades en un solo lugar.",
    color: "purple",
  },
  {
    icon: Video,
    title: "Videos y multimedia",
    description: "Accede a todos los videos y contenido creado para tu marca.",
    color: "pink",
  },
];

const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  blue: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  green: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  orange: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  pink: { text: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/30" },
};

export default function Dashboard() {
  return (
    <section className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <LayoutDashboard size={14} />
            PROXIMAMENTE
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Dashboard para{" "}
            <span className="gradient-text-blue">clientes</span>
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Cada cliente tendra acceso a su panel personalizado con toda la
            informacion de sus campanas en un solo lugar.
          </p>
        </div>

        <div className="glass-card p-8 mb-6">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-obsidian-600/50">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Lock size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="font-display font-semibold text-white text-sm">
                Acceso exclusivo para clientes
              </p>
              <p className="text-text-muted text-xs">
                Inicia sesion con tu cuenta para ver tus resultados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <div
                  key={i}
                  className={`p-5 rounded-xl ${c.bg} border ${c.border} hover:scale-[1.02] transition-all duration-300`}
                >
                  <f.icon size={22} className={`${c.text} mb-3`} />
                  <h3 className="font-display font-semibold text-white text-sm mb-1">
                    {f.title}
                  </h3>
                  <p className="text-text-muted text-xs">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-display font-semibold text-sm transition-all duration-300 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-[1.02]">
            <Lock size={16} />
            Acceso a clientes (proximamente)
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
