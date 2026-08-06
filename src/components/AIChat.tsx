"use client";

import { MessageCircle, Bot, ArrowRight, Clock, Sparkles } from "lucide-react";

const sampleQuestions = [
  "Cuanto cuesta una pagina web?",
  "Que servicios ofrecen?",
  "Tienen casos de exito?",
  "Como agendo una cita?",
];

export default function AIChat() {
  return (
    <section className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_60%)]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Bot size={14} />
            CHAT CON IA
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Asistente{" "}
            <span className="gradient-text-purple">inteligente</span> 24/7
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Nuestro chat con IA responde tus dudas al instante sobre precios,
            servicios, horarios y mas.
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 animate-glow">
              <Bot size={20} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="bg-purple-500/10 rounded-2xl rounded-tl-sm p-4 text-text-secondary text-sm leading-relaxed">
                Hola, soy el asistente virtual de Neo Was. Estoy aqui para
                resolver tus dudas sobre nuestros servicios, precios, casos de
                exito y ayudarte a agendar una cita. En que puedo ayudarte hoy?
              </div>
              <span className="text-xs text-text-muted mt-1 block">
                <Clock size={10} className="inline mr-1" />
                Disponible 24/7
              </span>
            </div>
          </div>

          <p className="text-text-muted text-sm mb-4">
            Preguntas frecuentes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                className="p-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-text-secondary text-sm text-left hover:text-purple-400 hover:border-purple-500/40 transition-all duration-300"
              >
                <MessageCircle size={14} className="inline mr-2" />
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-4 py-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-white placeholder:text-text-muted focus:outline-none focus:border-purple-500/50 transition-all duration-300"
            />
            <button className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-display font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 flex items-center gap-2">
              <Sparkles size={16} />
              <span className="hidden sm:inline">Enviar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
