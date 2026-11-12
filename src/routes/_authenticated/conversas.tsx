import { createFileRoute } from "@tanstack/react-router";
import { ConversationsPage } from "@/features/conversations/ConversationsPage";
import { getModule } from "@/config/navigation";

const m = getModule("conversas");

export const Route = createFileRoute("/_authenticated/conversas")({
  head: () => ({
    meta: [
      { title: "Conversas — AtendeAI" },
      { name: "description", content: m.description },
      { property: "og:title", content: "Conversas — AtendeAI" },
      { property: "og:description", content: m.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return <ConversationsPage />;
}
