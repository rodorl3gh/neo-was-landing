"use client";

import { ArrowRight, Calendar, MessageCircle } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-obsidian-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(16,185,129,0.05),transparent_50%)]" />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:40px_40px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20">
        <div className="animate-fade-in-up">
          <span className="section-badge bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6">
            <SparklesIcon size={14} />
            AGENCIA DE MARKETING DIGITAL
          </span>
        </div>

        <h1 className="animate-fade-in-up stagger-1 font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-none tracking-tight text-balance mt-6">
          Impulsamos negocios con{" "}
          <span className="gradient-text-purple">estrategias digitales</span>{" "}
          que generan clientes y ventas.
        </h1>

        <p className="animate-fade-in-up stagger-2 mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Redes sociales, paginas web, publicidad, inteligencia artificial y
          consultoria para negocios que quieren resultados reales.
        </p>

        <div className="animate-fade-in-up stagger-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() =>
              document
                .getElementById("cita")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-display font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25"
          >
            <Calendar size={20} />
            Agenda una asesoria gratis
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>

          <a
            href="https://wa.me/524111158128"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 font-display font-semibold text-base transition-all duration-300 hover:bg-green-500/20 hover:border-green-500/50 hover:scale-[1.02]"
          >
            <MessageCircle size={20} />
            Escribenos por WhatsApp
          </a>
        </div>

        <div className="animate-fade-in-up stagger-4 mt-16 flex items-center justify-center gap-8 text-text-muted text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>+50 clientes activos</span>
          </div>
          <div className="w-px h-4 bg-obsidian-500" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-green-400 font-semibold">98%</span>
            <span>satisfaccion</span>
          </div>
          <div className="w-px h-4 bg-obsidian-500" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-green-400 font-semibold">3+</span>
            <span>años de experiencia</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40 hover:opacity-80 transition-opacity duration-500">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">
          Descubre mas
        </span>
        <div className="w-5 h-8 rounded-full border border-text-muted/30 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-purple-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

function SparklesIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
