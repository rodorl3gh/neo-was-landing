import { MessageCircle } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PlaceholderSection from "@/components/panel/PlaceholderSection";

export default function AsistentePage() {
  return (
    <PanelShell title="Asistente">
      <PlaceholderSection title="Asistente" desc="Asistente personal para trabajar por voz o mensaje." icon={MessageCircle} />
    </PanelShell>
  );
}
