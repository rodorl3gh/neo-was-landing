import { UserPlus } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PlaceholderSection from "@/components/panel/PlaceholderSection";

export default function ProspectosPage() {
  return (
    <PanelShell title="Prospectos">
      <PlaceholderSection title="Prospectos" desc="Pipeline de nuevos prospectos con etapas y seguimiento." icon={UserPlus} />
    </PanelShell>
  );
}
