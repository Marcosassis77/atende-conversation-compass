import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { getModule } from "@/config/navigation";

const m = getModule("assistente-ia");

export const Route = createFileRoute("/_authenticated/assistente-ia")({
  head: () => ({
    meta: [
      { title: "Assistente IA — AtendeAI" },
      { name: "description", content: m.description },
      { property: "og:title", content: "Assistente IA — AtendeAI" },
      { property: "og:description", content: m.description },
    ],
  }),
  component: Page,
});

function Page() {
  return <ModulePage moduleKey="assistente-ia" />;
}
