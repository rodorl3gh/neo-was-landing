"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Users } from "lucide-react";

export default function Calculator() {
  const [clients, setClients] = useState(10);
  const [ticketValue, setTicketValue] = useState(1000);
  const [percentage, setPercentage] = useState(30);

  const currentRevenue = clients * ticketValue;
  const projectedClients = Math.round(clients * (1 + percentage / 100));
  const projectedRevenue = projectedClients * ticketValue;
  const gain = projectedRevenue - currentRevenue;

  const formatMXN = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <section id="calculadora" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.06),transparent_60%)]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-badge bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp size={14} />
            CALCULADORA
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight text-balance">
            Calcula cuanto estas{" "}
            <span className="gradient-text-green">perdiendo</span>
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Descubre el potencial de crecimiento de tu negocio con estrategias
            digitales.
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-text-secondary text-sm font-medium">
                <Users size={16} className="text-emerald-400" />
                Clientes al mes
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={clients}
                onChange={(e) => setClients(Number(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-white text-lg font-mono focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
              />
              <input
                type="range"
                min={0}
                max={500}
                value={clients}
                onChange={(e) => setClients(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-text-secondary text-sm font-medium">
                <DollarSign size={16} className="text-emerald-400" />
                Valor de cada venta (MXN)
              </label>
              <input
                type="number"
                min={1}
                max={1000000}
                step={100}
                value={ticketValue}
                onChange={(e) => setTicketValue(Number(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-obsidian-800 border border-obsidian-600 text-white text-lg font-mono focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
              />
              <input
                type="range"
                min={10}
                max={100000}
                step={100}
                value={ticketValue}
                onChange={(e) => setTicketValue(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-text-secondary text-sm font-medium">
                <TrendingUp size={16} className="text-emerald-400" />
                Aumento estimado (%)
              </label>
              <div className="flex gap-2">
                {[15, 30, 50].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPercentage(p)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      percentage === p
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-obsidian-800 border border-obsidian-600 text-text-secondary hover:text-white"
                    }`}
                  >
                    +{p}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={5}
                max={100}
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-emerald-400 font-mono text-sm">
                +{percentage}%
              </span>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
            <p className="text-text-secondary text-sm mb-2">
              Si aumentamos un {percentage}% tus clientes, podrias ganar...
            </p>
            <p className="font-display font-bold text-3xl sm:text-4xl text-emerald-400">
              {formatMXN(gain)}
              <span className="text-text-muted text-lg font-normal ml-1">
                /mes extra
              </span>
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div>
                <span className="text-text-muted">Actualmente: </span>
                <span className="text-text-secondary font-mono">
                  {formatMXN(currentRevenue)}/mes
                </span>
              </div>
              <div>
                <span className="text-text-muted">Potencial: </span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {formatMXN(projectedRevenue)}/mes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
