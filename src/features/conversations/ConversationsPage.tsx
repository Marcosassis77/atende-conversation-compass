import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessagesSquare, Sparkles, Send, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/features/company/useCompany";
import { suggestReply } from "./suggest.functions";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ConversationsPage() {
  const company = useCompany();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const convs = useQuery({
    queryKey: ["conversations", company.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("conversations").select("id, customer_name, updated_at").eq("company_id", company.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("conversations").insert({ company_id: company.id, customer_name: newName.trim() }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      setNewName("");
      setSelected(id);
      qc.invalidateQueries({ queryKey: ["conversations", company.id] });
    },
  });

  return (
    <>
      <PageHeader title="Conversas" description="Registre mensagens de clientes e revise a resposta sugerida pela IA antes de enviar." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="gap-3 p-4 shadow-card">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (newName.trim()) create.mutate(); }}>
            <Input placeholder="Nome do cliente" value={newName} maxLength={120} onChange={(e) => setNewName(e.target.value)} />
            <Button type="submit" size="icon" disabled={!newName.trim() || create.isPending} aria-label="Nova conversa"><Plus className="size-4" /></Button>
          </form>
          {create.error && <p className="text-sm text-destructive">Não foi possível criar a conversa.</p>}
          <div className="space-y-1">
            {convs.data?.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma conversa ainda.</p>}
            {convs.data?.map((c) => (
              <button key={c.id} onClick={() => setSelected(c.id)} className={cn("w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted", selected === c.id && "bg-muted font-medium")}>
                {c.customer_name}
              </button>
            ))}
          </div>
        </Card>
        <Card className="p-4 shadow-card lg:col-span-2">
          {selected ? <Thread key={selected} conversationId={selected} companyId={company.id} /> : (
            <EmptyState icon={MessagesSquare} title="Selecione uma conversa" description="Crie ou escolha uma conversa para registrar mensagens do cliente." />
          )}
        </Card>
      </div>
    </>
  );
}

function Thread({ conversationId, companyId }: { conversationId: string; companyId: string }) {
  const qc = useQueryClient();
  const key = ["messages", conversationId];
  const [incoming, setIncoming] = useState("");
  const [draft, setDraft] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);

  const msgs = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("id, direction, content, ai_suggestion, created_at").eq("conversation_id", conversationId).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async ({ direction, content }: { direction: "inbound" | "outbound"; content: string }) => {
      const { data, error } = await supabase.from("messages").insert({ company_id: companyId, conversation_id: conversationId, direction, content }).select("id").single();
      if (error) throw error;
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
      return { id: data.id, direction };
    },
    onSuccess: async ({ id, direction }) => {
      await qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["conversations", companyId] });
      if (direction === "inbound") {
        setIncoming("");
        suggest.mutate(id);
      } else setDraft("");
    },
  });

  const suggest = useMutation({
    mutationFn: async (messageId: string) => suggestReply({ data: { messageId } }),
    onMutate: () => setAiError(null),
    onSuccess: (r) => {
      if (r.ok) setDraft(r.suggestion);
      else setAiError(r.error);
      qc.invalidateQueries({ queryKey: key });
    },
    onError: () => setAiError("Não foi possível gerar a sugestão agora."),
  });

  const lastInbound = [...(msgs.data ?? [])].reverse().find((m) => m.direction === "inbound");

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[420px] space-y-2 overflow-y-auto">
        {msgs.data?.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma mensagem nesta conversa.</p>}
        {msgs.data?.map((m) => (
          <div key={m.id} className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", m.direction === "inbound" ? "bg-muted" : "ml-auto bg-primary text-primary-foreground")}>
            {m.content}
          </div>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (incoming.trim()) add.mutate({ direction: "inbound", content: incoming.trim() }); }}>
        <Input placeholder="Registrar mensagem recebida do cliente" value={incoming} maxLength={4000} onChange={(e) => setIncoming(e.target.value)} />
        <Button type="submit" variant="outline" disabled={!incoming.trim() || add.isPending}>Registrar</Button>
      </form>
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium"><Sparkles className="size-4 text-primary" />Resposta (revise antes de enviar)</span>
          {lastInbound && (
            <Button size="sm" variant="ghost" disabled={suggest.isPending} onClick={() => suggest.mutate(lastInbound.id)}>
              {suggest.isPending ? "Gerando..." : "Sugerir novamente"}
            </Button>
          )}
        </div>
        {aiError && <p className="text-sm text-destructive">{aiError}</p>}
        <Textarea rows={4} value={draft} maxLength={4000} placeholder={suggest.isPending ? "Gerando sugestão..." : "Escreva ou edite a resposta"} onChange={(e) => setDraft(e.target.value)} />
        <div className="flex justify-end">
          <Button disabled={!draft.trim() || add.isPending} onClick={() => add.mutate({ direction: "outbound", content: draft.trim() })}>
            <Send className="size-4" />Salvar resposta enviada
          </Button>
        </div>
      </div>
    </div>
  );
}
