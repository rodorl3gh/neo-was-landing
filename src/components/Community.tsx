"use client";

import {
  Users,
  Play,
  FileText,
  Sparkles,
  MessageCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

const communityItems = [
  {
    icon: Play,
    title: "Cursos exclusivos",
    description: "Capacitaciones grabadas sobre marketing, ventas y tecnologia para tu negocio.",
    color: "purple",
  },
  {
    icon: Sparkles,
    title: "Masterclass mensuales",
    description: "Sesiones en vivo con expertos en marketing digital, IA y estrategia de negocios.",
    color: "blue",
  },
  {
    icon: FileText,
    title: "Plantillas premium",
    description: "Calendarios, guiones, briefs y mas recursos listos para usar.",
    color: "green",
  },
  {
    icon: Sparkles,
    title: "Prompts de IA",
    description: "Coleccion de prompts optimizados para crear contenido, analizar datos y automatizar.",
    color: "pink",
  },
  {
    icon: MessageCircle,
    title: "Foro de comunidad",
    description: "Conecta con otros emprendedores, comparte experiencias y resuelve dudas.",
    color: "orange",
  },
  {
    icon: HelpCircle,
    title: "Preguntas frecuentes",
    description: "Respuestas rapidas a las dudas mas comunes de nuestros clientes.",
    color: "yellow",
  },
];

const colorMap: Record<string, { text: string; bg: string }> = {
  purple: { text: "text-purple-400", bg: "bg-purple-500/10" },
  blue: { text: "text-blue-400", bg: "bg-blue-500/10" },
  green: { text: "text-emerald-400", bg: "bg-emerald-500/10" },
  pink: { text: "text-pink-400", bg: "bg-pink-500/10" },
  orange: { text: "text-orange-400", bg: "bg-orange-500/10" },
  yellow: { text: "text-yellow-400", bg: "bg-yellow-500/10" },
};

export default function Community() {
  return (
    <section id="comunidad" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.05),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <Users size={14} />
            COMUNIDAD NEO WAS
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Exclusivo para{" "}
            <span className="gradient-text-pink">nuestros clientes</span>
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Un espacio donde compartimos conocimiento, herramientas y experiencias
            para que tu negocio siga creciendo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communityItems.map((item, i) => {
            const c = colorMap[item.color];
            return (
              <div
                key={i}
                className="glass-card p-6 group hover:scale-[1.02] transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center mb-4`}
                >
                  <item.icon size={20} />
                </div>
                <h3 className="font-display font-semibold text-white text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-display font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/25">
            <Users size={20} />
            Unete a la comunidad
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
          <p className="text-text-muted text-sm mt-3">
            Acceso exclusivo para clientes Neo Was
          </p>
        </div>
      </div>
    </section>
  );
}
