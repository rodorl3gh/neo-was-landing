"use client";

import { ArrowRight, Calendar, Clock } from "lucide-react";

const posts = [
  {
    title: "10 errores que hacen perder clientes",
    excerpt:
      "Descubre los errores mas comunes que alejan a tus clientes y como corregirlos hoy mismo.",
    date: "Hace 3 dias",
    readTime: "5 min",
    color: "blue",
  },
  {
    title: "Como vender mas en Facebook",
    excerpt:
      "Estrategias actualizadas para aumentar tus ventas usando Facebook Ads y contenido organico.",
    date: "Hace 1 semana",
    readTime: "7 min",
    color: "purple",
  },
  {
    title: "Como conseguir clientes desde Google",
    excerpt:
      "Guia practica de SEO local y Google My Business para atraer clientes que te estan buscando.",
    date: "Hace 2 semanas",
    readTime: "6 min",
    color: "green",
  },
  {
    title: "Tendencias de IA para negocios en 2025",
    excerpt:
      "Las herramientas de inteligencia artificial que todo negocio deberia estar usando este ano.",
    date: "Hace 3 semanas",
    readTime: "8 min",
    color: "orange",
  },
];

const colorMap: Record<string, { text: string; border: string }> = {
  blue: { text: "text-blue-400", border: "border-blue-500/30" },
  purple: { text: "text-purple-400", border: "border-purple-500/30" },
  green: { text: "text-emerald-400", border: "border-emerald-500/30" },
  orange: { text: "text-orange-400", border: "border-orange-500/30" },
};

export default function Blog() {
  return (
    <section id="blog" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.05),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Calendar size={14} />
            BLOG
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Contenido{" "}
            <span className="gradient-text-purple">nuevo</span> cada semana
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Articulos practicos para ayudarte a vender mas y entender el mundo
            digital.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post, i) => {
            const c = colorMap[post.color];
            return (
              <div
                key={i}
                className="glass-card p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4 text-xs text-text-muted">
                  <span className={`${c.text} font-medium`}>Articulo</span>
                  <div className="w-1 h-1 rounded-full bg-obsidian-500" />
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTime}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-obsidian-500" />
                  <span>{post.date}</span>
                </div>

                <h3 className="font-display font-semibold text-xl text-white mb-3 group-hover:text-purple-400 transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                <button className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300">
                  Leer articulo
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-display font-semibold text-sm transition-all duration-300 hover:bg-purple-500/20 hover:border-purple-500/50 hover:scale-[1.02]">
            Ver todos los articulos
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
