import { Wallet } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PlaceholderSection from "@/components/panel/PlaceholderSection";

export default function ContabilidadPage() {
  return (
    <PanelShell title="Contabilidad">
      <PlaceholderSection title="Contabilidad" desc="Ingresos, egresos, facturación e impuestos centralizados." icon={Wallet} />
    </PanelShell>
  );
}
