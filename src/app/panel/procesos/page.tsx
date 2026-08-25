import { Layers } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PlaceholderSection from "@/components/panel/PlaceholderSection";

export default function ProcesosPage() {
  return (
    <PanelShell title="Procesos">
      <PlaceholderSection title="Procesos" desc="Trabajo activo, entregables y responsables por cliente." icon={Layers} />
    </PanelShell>
  );
}
