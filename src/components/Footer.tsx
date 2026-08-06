"use client";

import { Sparkles, MapPin, Phone, Mail, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative py-16 px-6 border-t border-obsidian-600/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                NEO<span className="text-purple-400">WAS</span>
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-4">
              Impulsamos negocios con estrategias digitales que generan clientes
              y ventas.
            </p>
            <div className="flex items-center gap-2 text-text-muted text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Disponible Lun-Vie 9AM-6PM
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">
              Servicios
            </h4>
            <ul className="space-y-2 text-text-muted text-sm">
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Redes Sociales</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Paginas Web</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Publicidad</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Inteligencia Artificial</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Consultoria</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">
              Recursos
            </h4>
            <ul className="space-y-2 text-text-muted text-sm">
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Biblioteca gratuita</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Blog</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Guias descargables</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Calculadora</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">Comunidad</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">
              Contacto
            </h4>
            <ul className="space-y-3 text-text-muted text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-purple-400 shrink-0" />
                <span>Hidalgo, Mexico</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-purple-400 shrink-0" />
                <a href="tel:+524111158128" className="hover:text-purple-400 transition-colors">
                  +52 411 115 8128
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-purple-400 shrink-0" />
                <a href="mailto:contacto@neowas.com" className="hover:text-purple-400 transition-colors">
                  contacto@neowas.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-obsidian-600/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            {new Date().getFullYear()} Neo Was. Todos los derechos reservados.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-text-muted text-xs hover:text-purple-400 transition-colors duration-300"
          >
            Volver arriba
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
