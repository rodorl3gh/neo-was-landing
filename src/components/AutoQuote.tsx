"use client";

import { useState } from "react";
import { FileText, Users, Briefcase, ArrowRight, Check, Sparkles } from "lucide-react";

const businessTypes = [
  "Restaurante / Cafeteria",
  "Tienda / Ecommerce",
  "Servicio profesional",
  "Salud / Clinica",
  "Belleza / Estetica",
  "Inmobiliaria",
  "Educacion",
  "Otro",
];

const services = [
  "Redes Sociales",
  "Pagina Web",
  "Publicidad (Facebook/Instagram)",
  "Marketing Digital Completo",
  "Consultoria",
  "No estoy seguro",
];

export default function AutoQuote() {
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState("");
  const [employees, setEmployees] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [quoteVisible, setQuoteVisible] = useState(false);

  const reset = () => {
    setStep(0);
    setBusinessType("");
    setEmployees("");
    setSelectedServices([]);
    setQuoteVisible(false);
  };

  const nextStep = () => {
    if (step === 0 && businessType) setStep(1);
    else if (step === 1 && employees) setStep(2);
    else if (step === 2 && selectedServices.length > 0) setQuoteVisible(true);
  };

  const estimatedPrice = () => {
    const base = selectedServices.length * 2500;
    const employeeMultiplier = employees === "1-5"
      ? 1
      : employees === "6-20"
        ? 1.3
        : employees === "21-50"
          ? 1.6
          : 2;
    const months = selectedServices.length >= 3 ? 3 : 1;
    return Math.round(base * employeeMultiplier * months);
  };

  return (
    <section id="cotizacion" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05),transparent_60%)]" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileText size={14} />
            COTIZACION AUTOMATICA
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Obten una{" "}
            <span className="gradient-text-green">propuesta</span> en segundos
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Responde unas preguntas y recibe una cotizacion aproximada al
            instante.
          </p>
        </div>

        <div className="glass-card p-8">
          {!quoteVisible ? (
            <>
              <div className="flex items-center gap-2 mb-8">
                {[0, 1, 2].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                      step >= s ? "bg-emerald-500" : "bg-obsidian-600"
                    }`}
                  />
                ))}
              </div>

              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-xl text-white mb-4">
                    Que tipo de negocio tienes?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {businessTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setBusinessType(t)}
                        className={`p-4 rounded-xl text-left text-sm transition-all duration-300 ${
                          businessType === t
                            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-medium"
                            : "bg-obsidian-800 border border-obsidian-600 text-text-secondary hover:text-white hover:bg-obsidian-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-xl text-white mb-4">
                    Cuantos empleados tiene tu negocio?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["1-5", "6-20", "21-50", "50+"].map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmployees(e)}
                        className={`p-4 rounded-xl text-center transition-all duration-300 ${
                          employees === e
                            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-medium"
                            : "bg-obsidian-800 border border-obsidian-600 text-text-secondary hover:text-white hover:bg-obsidian-700"
                        }`}
                      >
                        <Users size={20} className="mx-auto mb-2" />
                        <span className="font-mono text-lg">{e}</span>
                        <span className="block text-xs text-text-muted">
                          empleados
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-xl text-white mb-4">
                    Que servicios necesitas?
                  </h3>
                  <div className="space-y-2">
                    {services.map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setSelectedServices((prev) =>
                            prev.includes(s)
                              ? prev.filter((x) => x !== s)
                              : [...prev, s]
                          )
                        }
                        className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all duration-300 ${
                          selectedServices.includes(s)
                            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-medium"
                            : "bg-obsidian-800 border border-obsidian-600 text-text-secondary hover:text-white hover:bg-obsidian-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                            selectedServices.includes(s)
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-obsidian-500"
                          }`}
                        >
                          {selectedServices.includes(s) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-text-secondary font-medium hover:text-white hover:bg-obsidian-700 transition-all duration-300"
                  >
                    Atras
                  </button>
                )}
                <button
                  onClick={nextStep}
                  disabled={
                    (step === 0 && !businessType) ||
                    (step === 1 && !employees) ||
                    (step === 2 && selectedServices.length === 0)
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {step === 2 ? "Calcular cotizacion" : "Siguiente"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto animate-float">
                <Sparkles size={28} className="text-emerald-400" />
              </div>

              <div>
                <h3 className="font-display font-bold text-2xl text-white mb-2">
                  Tu propuesta estimada
                </h3>
                <p className="text-text-secondary">
                  Basado en {businessType.toLowerCase()} con {employees}{" "}
                  empleados
                </p>
              </div>

              <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-text-muted text-sm mb-2">
                  Inversion mensual estimada desde
                </p>
                <p className="font-display font-bold text-4xl text-emerald-400">
                  ${(estimatedPrice() / 3).toLocaleString("es-MX")} MXN
                  <span className="text-text-muted text-lg font-normal ml-1">
                    /mes
                  </span>
                </p>
                <p className="text-text-muted text-xs mt-2">
                  *Precio estimado. Cotizacion final tras asesoria gratuita.
                  Plan recomendado de {selectedServices.length >= 3 ? "3" : "1"}{" "}
                  mes(es).
                </p>
              </div>

              <div className="text-left space-y-2">
                <p className="text-text-secondary text-sm font-medium">
                  Servicios incluidos:
                </p>
                {selectedServices.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 text-emerald-400 text-sm"
                  >
                    <Check size={14} />
                    {s}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="px-6 py-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-text-secondary font-medium hover:text-white hover:bg-obsidian-700 transition-all duration-300"
                >
                  Recalcular
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("cita")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-semibold transition-all duration-300 hover:scale-[1.02]"
                >
                  Quiero esta cotizacion
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
