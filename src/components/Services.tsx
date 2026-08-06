"use client";

import {
  Smartphone,
  Globe,
  Target,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Briefcase,
} from "lucide-react";

const services = [
  {
    icon: Smartphone,
    title: "Redes Sociales",
    description:
      "Gestion profesional de Facebook, Instagram, TikTok y mas. Contenido que conecta con tu audiencia.",
    color: "blue",
  },
  {
    icon: Globe,
    title: "Paginas Web",
    description:
      "Sitios web modernos, rapidos y optimizados para convertir visitantes en clientes.",
    color: "green",
  },
  {
    icon: Target,
    title: "Publicidad en Facebook e Instagram",
    description:
      "Campañas segmentadas que llegan a las personas correctas y maximizan tu inversion.",
    color: "orange",
  },
  {
    icon: Sparkles,
    title: "Inteligencia Artificial",
    description:
      "Automatizacion inteligente con chatbots, analisis predictivo y contenido generado por IA.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Marketing Digital",
    description:
      "Estrategias integrales que combinan SEO, email marketing, contenido y conversion.",
    color: "pink",
  },
  {
    icon: GraduationCap,
    title: "Capacitaciones",
    description:
      "Talleres y cursos para tu equipo sobre ventas digitales, IA y herramientas modernas.",
    color: "red",
  },
  {
    icon: Briefcase,
    title: "Consultoria",
    description:
      "Analisis personalizado de tu negocio para identificar oportunidades de crecimiento digital.",
    color: "yellow",
  },
];

const colorMap: Record<
  string,
  { bg: string; text: string; border: string; light: string }
> = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    light: "bg-blue-400/10",
  },
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    light: "bg-emerald-400/10",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
    light: "bg-orange-400/10",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    light: "bg-purple-400/10",
  },
  pink: {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/30",
    light: "bg-pink-400/10",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    light: "bg-red-400/10",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    light: "bg-yellow-400/10",
  },
};

export default function Services() {
  return (
    <section id="servicios" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Briefcase size={14} />
            LO QUE HACEMOS
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Servicios que{" "}
            <span className="gradient-text-blue">transforman</span> tu negocio
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Soluciones digitales completas para cada etapa de crecimiento de tu
            empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => {
            const c = colorMap[service.color];
            return (
              <div
                key={i}
                className={`glass-card p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group cursor-default`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                  <service.icon size={24} />
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <div className="glass-card p-4 flex items-center justify-center gap-2 text-text-muted text-sm">
            <Sparkles size={16} className="text-purple-400" />
            <span>
              Servicios personalizados segun las necesidades de tu negocio
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
