import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SuggestResult = { ok: true; suggestion: string } | { ok: false; error: string };

/** Gera uma sugestão de resposta para uma mensagem recebida. O atendente sempre revisa antes de enviar. */
export const suggestReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { messageId: string }) => {
    if (typeof input?.messageId !== "string" || input.messageId.length > 64) throw new Error("Entrada inválida");
    return input;
  })
  .handler(async ({ data, context }): Promise<SuggestResult> => {
    const { supabase } = context;
    // RLS garante que só membros da empresa leem a mensagem.
    const { data: msg } = await supabase
      .from("messages")
      .select("id, conversation_id, direction, company_id")
      .eq("id", data.messageId)
      .maybeSingle();
    if (!msg || msg.direction !== "inbound") return { ok: false, error: "Mensagem não encontrada." };

    const [{ data: company }, { data: conv }, { data: history }] = await Promise.all([
      supabase.from("companies").select("name").eq("id", msg.company_id).maybeSingle(),
      supabase.from("conversations").select("customer_name").eq("id", msg.conversation_id).maybeSingle(),
      supabase
        .from("messages")
        .select("direction, content, created_at")
        .eq("conversation_id", msg.conversation_id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const transcript = (history ?? []).reverse().map((m) => ({
      role: m.direction === "inbound" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

    const { generateTextViaGateway, AiGatewayError } = await import("@/lib/ai/gateway.server");
    try {
      const suggestion = await generateTextViaGateway({
        system: [
          `Você é um assistente de atendimento da empresa "${company?.name ?? "empresa"}".`,
          `O cliente se chama ${conv?.customer_name ?? "cliente"}.`,
          "Escreva em português brasileiro uma resposta curta, cordial e objetiva para a última mensagem do cliente.",
          "Não invente preços, prazos, políticas ou informações que não estejam na conversa; se faltar informação, diga que vai verificar.",
          "Responda apenas com o texto da mensagem, sem aspas nem comentários.",
        ].join("\n"),
        messages: transcript,
      });
      await supabase.from("messages").update({ ai_suggestion: suggestion }).eq("id", msg.id);
      return { ok: true, suggestion };
    } catch (e) {
      return { ok: false, error: e instanceof AiGatewayError ? e.message : "Não foi possível gerar a sugestão agora." };
    }
  });
