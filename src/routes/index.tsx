import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AtendeAI — Atendimento inteligente para sua empresa" },
      { name: "description", content: "Atendimento com IA, WhatsApp e CRM para pequenas e médias empresas." },
      { property: "og:title", content: "AtendeAI — Atendimento inteligente para sua empresa" },
      { property: "og:description", content: "Atendimento com IA, WhatsApp e CRM para pequenas e médias empresas." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/dashboard" : "/auth" });
  },
});
