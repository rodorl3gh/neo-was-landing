import {
  LayoutDashboard,
  Link2,
  Target,
  Wallet,
  Users,
  UserPlus,
  FileText,
  CalendarDays,
  MessageCircle,
  Layers,
  type LucideIcon,
} from "lucide-react";

export interface Module {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

export const MODULES: Module[] = [
  { href: "/panel", label: "Dashboard", desc: "Resumen general de la operación", icon: LayoutDashboard },
  { href: "/panel/enlaces", label: "Enlaces", desc: "Accesos y recursos del equipo", icon: Link2 },
  { href: "/panel/metas", label: "Metas", desc: "Objetivos por integrante y área", icon: Target },
  { href: "/panel/contabilidad", label: "Contabilidad", desc: "Ingresos, egresos y facturación", icon: Wallet },
  { href: "/panel/clientes", label: "Clientes", desc: "Datos y servicios de cada cliente", icon: Users },
  { href: "/panel/prospectos", label: "Prospectos", desc: "Pipeline de nuevos prospectos", icon: UserPlus },
  { href: "/panel/procesos", label: "Procesos", desc: "Trabajo activo con cada cliente", icon: Layers },
  { href: "/panel/contratos", label: "Contratos", desc: "Plantillas y contratos por cliente", icon: FileText },
  { href: "/panel/calendario", label: "Calendario", desc: "Agenda sincronizada con Google", icon: CalendarDays },
  { href: "/panel/asistente", label: "Asistente", desc: "Trabaja por voz o mensaje", icon: MessageCircle },
];

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  developer: "Desarrollador",
};
