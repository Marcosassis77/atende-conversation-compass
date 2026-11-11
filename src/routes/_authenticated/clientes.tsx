import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { getModule } from "@/config/navigation";

const m = getModule("clientes");

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — AtendeAI" },
      { name: "description", content: m.description },
      { property: "og:title", content: "Clientes — AtendeAI" },
      { property: "og:description", content: m.description },
    ],
  }),
  component: Page,
});

function Page() {
  return <ModulePage moduleKey="clientes" />;
}
