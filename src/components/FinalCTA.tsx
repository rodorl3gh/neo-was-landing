"use client";

import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 bg-obsidian-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      </div>

      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:32px_32px]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="animate-fade-in-up">
          <span className="section-badge bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles size={14} />
            HORA DE ACTUAR
          </span>
        </div>

        <h2 className="animate-fade-in-up stagger-1 mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-none tracking-tight text-balance">
          No necesitas mas publicaciones.
        </h2>
        <p className="animate-fade-in-up stagger-2 mt-4 text-xl sm:text-2xl text-text-secondary leading-relaxed text-balance">
          Necesitas una{" "}
          <span className="gradient-text-purple font-semibold">
            estrategia que convierta visitas en clientes
          </span>
          .
        </p>
        <p className="animate-fade-in-up stagger-3 mt-6 text-text-secondary text-lg max-w-xl mx-auto">
          Da el primer paso hoy. Nuestro equipo esta listo para transformar tu
          presencia digital en resultados medibles.
        </p>

        <div className="animate-fade-in-up stagger-4 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() =>
              document
                .getElementById("cita")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-display font-bold text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-500/30 animate-glow"
          >
            Quiero empezar ahora
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>

          <a
            href="https://wa.me/524111158128"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 font-display font-semibold text-base transition-all duration-300 hover:bg-green-500/20 hover:border-green-500/50 hover:scale-[1.02]"
          >
            Escribenos por WhatsApp
          </a>
        </div>

        <p className="animate-fade-in-up stagger-5 mt-10 text-text-muted text-sm">
          Sin compromisos. Asesoria 100% gratuita para conocer tu negocio.
        </p>
      </div>
    </section>
  );
}
