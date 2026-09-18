"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Wallet,
  FileText,
  Users,
  UserPlus,
  CalendarPlus,
  Tag,
  ArrowRight,
  Clock,
  CircleDollarSign,
  Receipt,
  FileSignature,
  FileClock,
} from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import { apiGet } from "@/lib/panel/api";

interface Entrada {
  id: number;
  tipo: string;
  nicho: string;
  negocio: string;
  servicio: string;
  fecha_alta: string;
  created_at: number;
}

export default function AdministracionPage() {
  const router = useRouter();
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const d = await apiGet<{ entradas: Entrada[] }>("/api/panel/directorio");
      setEntradas(d.entradas || []);
    } catch {
      /* 401 manejado por PanelShell */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchData, 0);
    return () => clearTimeout(t);
  }, [fetchData]);

  const resumen = useMemo(() => {
    const clientes = entradas.filter((e) => e.tipo === "cliente");
    const prospectos = entradas.filter((e) => e.tipo === "prospecto");
    const mesActual = new Date().toISOString().slice(0, 7);
    const altasMes = entradas.filter((e) => e.fecha_alta && e.fecha_alta.startsWith(mesActual)).length;
    const conServicio = clientes.filter((e) => e.servicio.trim() !== "").length;
    const servicios = new Set(clientes.map((e) => e.servicio.trim()).filter((s) => s !== ""));
    return {
      clientes: clientes.length,
      prospectos: prospectos.length,
      altasMes,
      conServicio,
      servicios: servicios.size,
    };
  }, [entradas]);

  return (
    <PanelShell title="Administración">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "72rem", margin: "0 auto" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Briefcase size={20} color="var(--gold)" /> Administración
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
            Resumen administrativo: contabilidad y contratos de la operación.
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <>
            {/* Resumen general */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(8.5rem, 1fr))", gap: "0.7rem" }}>
              <Stat icon={<Users size={15} />} label="Clientes" value={resumen.clientes} color="var(--success)" />
              <Stat icon={<UserPlus size={15} />} label="Prospectos" value={resumen.prospectos} color="#f59e0b" />
              <Stat icon={<CalendarPlus size={15} />} label="Altas del mes" value={resumen.altasMes} color="#3b82f6" />
              <Stat icon={<Tag size={15} />} label="Servicios" value={resumen.servicios} color="var(--cyan)" />
            </div>

            {/* Paneles de subsecciones */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))", gap: "0.9rem" }}>
              <SectionPanel
                icon={<Wallet size={18} color="var(--gold)" />}
                title="Contabilidad"
                desc="Ingresos, egresos, facturación e impuestos."
                onOpen={() => router.push("/panel/contabilidad")}
              >
                <Indicator icon={<Users size={14} />} label="Clientes facturables" value={String(resumen.clientes)} />
                <Indicator icon={<Tag size={14} />} label="Servicios distintos" value={String(resumen.servicios)} />
                <Indicator icon={<CircleDollarSign size={14} />} label="Ingresos del mes" value="—" pending />
                <Indicator icon={<Receipt size={14} />} label="Egresos del mes" value="—" pending />
              </SectionPanel>

              <SectionPanel
                icon={<FileText size={18} color="var(--gold)" />}
                title="Contratos"
                desc="Plantillas, generación y vencimientos."
                onOpen={() => router.push("/panel/contratos")}
              >
                <Indicator icon={<Users size={14} />} label="Clientes" value={String(resumen.clientes)} />
                <Indicator icon={<FileSignature size={14} />} label="Con servicio registrado" value={String(resumen.conServicio)} />
                <Indicator icon={<FileClock size={14} />} label="Activos" value="—" pending />
                <Indicator icon={<Clock size={14} />} label="Por vencer (30 días)" value="—" pending />
              </SectionPanel>
            </div>

            <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", margin: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={13} /> Los indicadores de ingresos, egresos, contratos activos y vencimientos se habilitarán al completar los módulos de Contabilidad y Contratos.
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </PanelShell>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "0.75rem 0.9rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>{value}</span>
    </div>
  );
}

function SectionPanel({
  icon,
  title,
  desc,
  onOpen,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.9rem", padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
        <div style={{ width: "2.2rem", height: "2.2rem", borderRadius: "0.65rem", background: "var(--gold-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>{title}</div>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{desc}</div>
        </div>
        <button
          onClick={onOpen}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.75rem", fontSize: "0.76rem", fontWeight: 600, borderRadius: "0.6rem", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
        >
          Abrir <ArrowRight size={13} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(8.5rem, 1fr))", gap: "0.55rem" }}>{children}</div>
    </div>
  );
}

function Indicator({ icon, label, value, pending }: { icon: React.ReactNode; label: string; value: string; pending?: boolean }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "0.65rem", padding: "0.6rem 0.7rem", display: "flex", flexDirection: "column", gap: "0.2rem", opacity: pending ? 0.7 : 1 }}>
      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>
        {icon} {label}
        {pending && <span style={{ marginLeft: "auto", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--gold)", background: "var(--gold-soft)", padding: "0.05rem 0.35rem", borderRadius: "9999px" }}>Próx.</span>}
      </span>
      <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>{value}</span>
    </div>
  );
}
