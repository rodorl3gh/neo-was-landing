import { FileText } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PlaceholderSection from "@/components/panel/PlaceholderSection";

export default function ContratosPage() {
  return (
    <PanelShell title="Contratos">
      <PlaceholderSection title="Contratos" desc="Plantillas, generación y vencimientos de contratos." icon={FileText} />
    </PanelShell>
  );
}
