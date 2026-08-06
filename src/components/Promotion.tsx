"use client";

import { Gift, ArrowRight, Calendar } from "lucide-react";

export default function Promotion() {
  return (
    <section className="relative py-16 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.08),transparent_60%)]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="glass-card p-8 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <span className="section-badge bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 mb-4">
                <Gift size={14} />
                PROMOCION DEL MES
              </span>
              <h2 className="mt-4 font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white leading-tight text-balance">
                Este mes incluye una{" "}
                <span className="gradient-text-yellow">pagina web</span> al
                contratar tu plan de marketing
              </h2>
              <p className="mt-4 text-text-secondary text-base leading-relaxed max-w-lg">
                Aprovecha esta promocion por tiempo limitado. Plan de marketing
                digital + pagina web profesional sin costo adicional.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() =>
                    document
                      .getElementById("cita")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-display font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-500/25"
                >
                  <Calendar size={20} />
                  Aprovecha esta oferta
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
                <span className="text-text-muted text-sm self-center">
                  Valido hasta fin de mes
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                <div className="absolute inset-0 rounded-full bg-yellow-500/10 animate-glow" />
                <div className="absolute inset-2 rounded-full bg-yellow-500/5 border border-yellow-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <Gift size={36} className="text-yellow-400 mx-auto mb-2 animate-float" />
                    <span className="font-mono text-yellow-400 font-bold text-lg">
                      GRATIS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
