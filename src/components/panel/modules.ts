import {
  LayoutDashboard,
  LayoutGrid,
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
  Settings,
  Building2,
  History,
  type LucideIcon,
} from "lucide-react";

export interface Module {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  superadminOnly?: boolean;
  children?: Module[];
}

export const MODULES: Module[] = [
  { href: "/panel", label: "Dashboard", desc: "Resumen general de la operación", icon: LayoutDashboard },
  { href: "/panel/enlaces", label: "Enlaces", desc: "Accesos y recursos del equipo", icon: Link2 },
  { href: "/panel/metas", label: "Metas", desc: "Metas y actividades por colaborador", icon: Target, children: [
    { href: "/panel/metas", label: "Activas", desc: "Metas pendientes y en proceso", icon: Target },
    { href: "/panel/metas/historial", label: "Historial", desc: "Metas cumplidas y desempeño", icon: History },
  ] },
  { href: "/panel/contabilidad", label: "Contabilidad", desc: "Ingresos, egresos y facturación", icon: Wallet },
  {
    href: "/panel/directorio",
    label: "Directorio",
    desc: "Clientes y prospectos por nicho de mercado",
    icon: Building2,
    children: [
      { href: "/panel/directorio", label: "Todos", desc: "Todos los registros", icon: LayoutGrid },
      { href: "/panel/clientes", label: "Clientes", desc: "Clientes activos", icon: Users },
      { href: "/panel/prospectos", label: "Prospectos", desc: "Pipeline de prospectos", icon: UserPlus },
    ],
  },
  { href: "/panel/procesos", label: "Procesos", desc: "Trabajo activo con cada cliente", icon: Layers },
  { href: "/panel/contratos", label: "Contratos", desc: "Plantillas y contratos por cliente", icon: FileText },
  { href: "/panel/calendario", label: "Calendario", desc: "Metas y eventos del equipo", icon: CalendarDays },
  { href: "/panel/asistente", label: "Asistente", desc: "Trabaja por voz o mensaje", icon: MessageCircle },
  { href: "/panel/usuarios", label: "Usuarios", desc: "Cuentas y contraseñas del equipo", icon: UserCog },
  { href: "/panel/configuracion", label: "Configuración", desc: "Notificaciones y preferencias", icon: Settings },
  { href: "/panel/notificaciones", label: "Notificaciones", desc: "Registro de actividad del sistema", icon: Bell, superadminOnly: true },
];

export const ROLE_LABELS: Record<string, string> = {
  developer: "Superadministrador",
  admin: "Administrador",
  user: "Colaborador",
};
