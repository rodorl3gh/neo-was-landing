"use client";

import { useState } from "react";
import { Calendar, Clock, Video, MapPin, ArrowRight } from "lucide-react";

const durations = [
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
];

const modalities = [
  {
    value: "zoom",
    label: "Zoom",
    icon: Video,
    description: "Reunion virtual desde cualquier lugar",
  },
  {
    value: "presencial",
    label: "Presencial",
    icon: MapPin,
    description: "Nos reunimos en tu negocio u oficina",
  },
];

export default function Booking() {
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedModality, setSelectedModality] = useState("zoom");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="cita" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent_60%)]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Calendar size={14} />
            AGENDA TU CITA
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Hablemos de{" "}
            <span className="gradient-text-blue">tu negocio</span>
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Reserva una asesoria gratuita y descubre como podemos ayudarte a
            crecer.
          </p>
        </div>

        {submitted ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-emerald-400" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-2">
              Solicitud recibida
            </h3>
            <p className="text-text-secondary">
              Nos pondremos en contacto contigo en las proximas 24 horas para
              confirmar tu cita.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-white placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Correo electronico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-white placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Telefono / WhatsApp
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 000 000 0000"
                className="w-full px-4 py-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-white placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-all duration-300"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-3">
                <Clock size={16} className="text-blue-400" />
                Duracion de la cita
              </label>
              <div className="flex gap-2">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setSelectedDuration(d.value)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                      selectedDuration === d.value
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                        : "bg-obsidian-800 border border-obsidian-600 text-text-secondary hover:text-white hover:bg-obsidian-700"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-3">
                <Video size={16} className="text-blue-400" />
                Modalidad
              </label>
              <div className="grid grid-cols-2 gap-3">
                {modalities.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setSelectedModality(m.value)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 ${
                      selectedModality === m.value
                        ? "bg-blue-500/10 border border-blue-500/40 text-white"
                        : "bg-obsidian-800 border border-obsidian-600 text-text-secondary hover:text-white hover:bg-obsidian-700"
                    }`}
                  >
                    <m.icon size={20} className="mb-2 text-blue-400" />
                    <span className="font-display font-semibold text-sm block">
                      {m.label}
                    </span>
                    <span className="text-xs text-text-muted">
                      {m.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-display font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25"
            >
              Agendar cita gratuita
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
