import { Target } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PlaceholderSection from "@/components/panel/PlaceholderSection";

export default function MetasPage() {
  return (
    <PanelShell title="Metas">
      <PlaceholderSection title="Metas" desc="Objetivos por integrante y área con KPIs y seguimiento de avance." icon={Target} />
    </PanelShell>
  );
}
