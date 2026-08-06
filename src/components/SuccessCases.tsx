"use client";

import { useState } from "react";
import { Play, TrendingUp, Star } from "lucide-react";

const cases = [
  {
    id: 1,
    client: "LARK SEEDS",
    sector: "Agricultura / Semillas",
    before: "Sin presencia digital. Ventas solo por telefono y visitas.",
    after: "Pagina web + campanas en Facebook. Ventas aumentaron 150%.",
    results: "+150% ventas | +300% trafico web | +45% leads",
    color: "orange",
    image: null,
  },
  {
    id: 2,
    client: "Agencias de Viajes",
    sector: "Turismo",
    before: "Solo promocion en WhatsApp y boca a boca.",
    after: "Estrategia digital con paquetes, videos y remarketing.",
    results: "+85% reservas | +200% alcance | +60% clientes nuevos",
    color: "blue",
    image: null,
  },
  {
    id: 3,
    client: "Kari",
    sector: "Belleza / Estetica",
    before: "Redes sociales sin estrategia ni contenido constante.",
    after: "Calendario editorial + anuncios segmentados + IA para citas.",
    results: "+120% citas | +90% engagement | +40% facturacion",
    color: "pink",
    image: null,
  },
  {
    id: 4,
    client: "Proximos clientes",
    sector: "Varios",
    before: "Tu negocio podria ser el siguiente caso de exito.",
    after: "Estrategia personalizada con resultados medibles.",
    results: "Resultados garantizados con metodologia probada.",
    color: "purple",
    image: null,
  },
];

const colorMap: Record<string, { text: string; border: string; bg: string }> = {
  orange: {
    text: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/10",
  },
  blue: {
    text: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
  },
  pink: {
    text: "text-pink-400",
    border: "border-pink-500/30",
    bg: "bg-pink-500/10",
  },
  purple: {
    text: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
  },
};

export default function SuccessCases() {
  const [active, setActive] = useState(0);

  return (
    <section id="casos" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.05),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Play size={14} />
            CASOS DE EXITO
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Resultados{" "}
            <span className="gradient-text-orange">reales</span> que hablan
            por si solos
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Negocios que confiaron en nosotros y ahora disfrutan de un
            crecimiento constante.
          </p>
        </div>

        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          {cases.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                active === i
                  ? `${colorMap[c.color].bg} ${colorMap[c.color].text} border ${colorMap[c.color].border}`
                  : "text-text-secondary hover:text-white hover:bg-obsidian-700/50"
              }`}
            >
              {c.client}
            </button>
          ))}
        </div>

        <div className="glass-card p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
              <span className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-3 block">
                Antes
              </span>
              <p className="text-text-secondary leading-relaxed">
                {cases[active].before}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-3 block">
                Despues
              </span>
              <p className="text-text-secondary leading-relaxed">
                {cases[active].after}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-3 block">
                Resultados
              </span>
              <div className="space-y-2">
                {cases[active].results.split(" | ").map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-emerald-400 text-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp size={12} />
                    </div>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-text-muted text-sm flex items-center justify-center gap-2">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            Todos los resultados son verificables con cada cliente
          </p>
        </div>
      </div>
    </section>
  );
}
