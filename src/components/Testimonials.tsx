"use client";

import { Play, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendez",
    business: "LARK SEEDS",
    text: "Desde que trabajamos con Neo Was, nuestras ventas han crecido como nunca. La estrategia digital que implementaron transformo nuestro negocio.",
    color: "purple",
  },
  {
    name: "Maria Garcia",
    business: "Agencia de Viajes Sol",
    text: "No sabiamos como llegar a mas clientes. Neo Was nos ayudo a crear una presencia digital que realmente funciona. Ahora recibimos reservas todos los dias.",
    color: "blue",
  },
  {
    name: "Karina Lopez",
    business: "Kari Beauty Studio",
    text: "El chat con IA que implementaron para agendar citas fue un exito total. Mis clientas aman la facilidad y yo ahorro horas de trabajo.",
    color: "pink",
  },
];

const colorMap: Record<string, { text: string; bg: string }> = {
  purple: { text: "text-purple-400", bg: "bg-purple-500/10" },
  blue: { text: "text-blue-400", bg: "bg-blue-500/10" },
  pink: { text: "text-pink-400", bg: "bg-pink-500/10" },
};

export default function Testimonials() {
  return (
    <section id="testimonios" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-red-500/10 border border-red-500/20 text-red-400">
            <Play size={14} />
            TESTIMONIOS
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Lo que dicen{" "}
            <span className="gradient-text-red">nuestros clientes</span>
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Nada habla mejor de nuestro trabajo que las palabras de quienes
            confian en nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => {
            const c = colorMap[t.color];
            return (
              <div
                key={i}
                className="glass-card p-6 group hover:scale-[1.02] transition-all duration-300 relative"
              >
                <Quote
                  size={32}
                  className={`absolute top-4 right-4 ${c.text} opacity-20`}
                />

                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${c.bg} ${c.text} flex items-center justify-center shrink-0`}
                  >
                    <Play size={18} className="ml-0.5" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-white text-sm">
                      {t.name}
                    </p>
                    <p className="text-text-muted text-xs">{t.business}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-text-muted text-sm mb-4">
            Mira mas testimonios en video de nuestros clientes
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-display font-semibold text-sm transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02]">
            <Play size={16} />
            Ver testimonios en video
          </button>
        </div>
      </div>
    </section>
  );
}
