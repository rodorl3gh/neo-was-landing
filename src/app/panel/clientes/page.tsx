import { Users } from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PlaceholderSection from "@/components/panel/PlaceholderSection";

export default function ClientesPage() {
  return (
    <PanelShell title="Clientes">
      <PlaceholderSection title="Clientes" desc="Datos, servicios y seguimiento de cada cliente." icon={Users} />
    </PanelShell>
  );
}
