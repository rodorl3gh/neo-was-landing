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
  UserCog,
  Bell,
  type LucideIcon,
} from "lucide-react";

export interface Module {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  superadminOnly?: boolean;
}

export const MODULES: Module[] = [
  { href: "/panel", label: "Dashboard", desc: "Resumen general de la operación", icon: LayoutDashboard },
  { href: "/panel/enlaces", label: "Enlaces", desc: "Accesos y recursos del equipo", icon: Link2 },
  { href: "/panel/metas", label: "Metas", desc: "Metas y actividades por colaborador", icon: Target },
  { href: "/panel/contabilidad", label: "Contabilidad", desc: "Ingresos, egresos y facturación", icon: Wallet },
  { href: "/panel/clientes", label: "Clientes", desc: "Datos y servicios de cada cliente", icon: Users },
  { href: "/panel/prospectos", label: "Prospectos", desc: "Pipeline de nuevos prospectos", icon: UserPlus },
  { href: "/panel/procesos", label: "Procesos", desc: "Trabajo activo con cada cliente", icon: Layers },
  { href: "/panel/contratos", label: "Contratos", desc: "Plantillas y contratos por cliente", icon: FileText },
  { href: "/panel/calendario", label: "Calendario", desc: "Metas y eventos del equipo", icon: CalendarDays },
  { href: "/panel/asistente", label: "Asistente", desc: "Trabaja por voz o mensaje", icon: MessageCircle },
  { href: "/panel/usuarios", label: "Usuarios", desc: "Cuentas y contraseñas del equipo", icon: UserCog },
  { href: "/panel/notificaciones", label: "Notificaciones", desc: "Registro de actividad del sistema", icon: Bell, superadminOnly: true },
];

export const ROLE_LABELS: Record<string, string> = {
  developer: "Superadministrador",
  admin: "Administrador",
  user: "Colaborador",
};
