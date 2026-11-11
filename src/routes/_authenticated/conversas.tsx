import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { getModule } from "@/config/navigation";

const m = getModule("conversas");

export const Route = createFileRoute("/_authenticated/conversas")({
  head: () => ({
    meta: [
      { title: "Conversas — AtendeAI" },
      { name: "description", content: m.description },
      { property: "og:title", content: "Conversas — AtendeAI" },
      { property: "og:description", content: m.description },
    ],
  }),
  component: Page,
});

function Page() {
  return <ModulePage moduleKey="conversas" />;
}
