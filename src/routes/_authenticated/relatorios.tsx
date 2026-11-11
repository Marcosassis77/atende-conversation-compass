import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { getModule } from "@/config/navigation";

const m = getModule("relatorios");

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — AtendeAI" },
      { name: "description", content: m.description },
      { property: "og:title", content: "Relatórios — AtendeAI" },
      { property: "og:description", content: m.description },
    ],
  }),
  component: Page,
});

function Page() {
  return <ModulePage moduleKey="relatorios" />;
}
