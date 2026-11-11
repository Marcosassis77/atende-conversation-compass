import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const DEFAULT_CHAT_MODEL = "openai/gpt-6-astra";

export class AiGatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Streams a Responses call and returns the final text (server-only). */
export async function generateTextViaGateway(opts: { system: string; messages: ModelMessage[] }) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiGatewayError(401, "IA não configurada.");
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses(DEFAULT_CHAT_MODEL),
    system: opts.system,
    messages: opts.messages,
    maxRetries: 0,
    onError: ({ error }) => {
      failure = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  let text = "";
  try {
    text = await result.text;
  } catch (e) {
    failure ??= e;
  }
  if (failure || !text.trim()) throw toGatewayError(failure);
  return text.trim();
}

function toGatewayError(error: unknown): AiGatewayError {
  const status =
    (error as { statusCode?: number })?.statusCode ??
    (error as { status?: number })?.status ??
    500;
  console.error("AI gateway error", status, error);
  const messages: Record<number, string> = {
    402: "Créditos de IA esgotados. Adicione créditos ao workspace para continuar.",
    403: "O uso de IA está bloqueado para esta conta no momento.",
    429: "Muitas solicitações à IA. Aguarde alguns instantes e tente novamente.",
  };
  return new AiGatewayError(status, messages[status] ?? "Não foi possível gerar a sugestão agora.");
}
