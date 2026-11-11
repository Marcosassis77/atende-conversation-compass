import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { getModule } from "@/config/navigation";

const m = getModule("integracoes");

export const Route = createFileRoute("/_authenticated/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrações — AtendeAI" },
      { name: "description", content: m.description },
      { property: "og:title", content: "Integrações — AtendeAI" },
      { property: "og:description", content: m.description },
    ],
  }),
  component: Page,
});

function Page() {
  return <ModulePage moduleKey="integracoes" />;
}
