import { CalendarDays } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PlaceholderSection from "@/components/panel/PlaceholderSection";

export default function CalendarioPage() {
  return (
    <PanelShell title="Calendario">
      <PlaceholderSection title="Calendario" desc="Agenda sincronizada con Google Calendar del equipo." icon={CalendarDays} />
    </PanelShell>
  );
}
