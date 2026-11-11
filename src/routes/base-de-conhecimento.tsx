import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { getModule } from "@/config/navigation";

const m = getModule("base-de-conhecimento");

export const Route = createFileRoute("/base-de-conhecimento")({
  head: () => ({
    meta: [
      { title: "Base de conhecimento — AtendeAI" },
      { name: "description", content: m.description },
      { property: "og:title", content: "Base de conhecimento — AtendeAI" },
      { property: "og:description", content: m.description },
    ],
  }),
  component: Page,
});

function Page() {
  return <ModulePage moduleKey="base-de-conhecimento" />;
}
