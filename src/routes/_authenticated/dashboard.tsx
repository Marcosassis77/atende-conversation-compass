import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, Clock, CheckCircle2, Users, Bot, LineChart, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { emptyMetrics, type ActivityItem, type PeriodPoint } from "@/features/dashboard/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AtendeAI" },
      { name: "description", content: "Visão geral de conversas, atendimentos, clientes e desempenho da IA." },
      { property: "og:title", content: "Dashboard — AtendeAI" },
      { property: "og:description", content: "Visão geral de conversas, atendimentos, clientes e desempenho da IA." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  // Sem fonte de dados conectada: os indicadores permanecem vazios em vez de exibir números fictícios.
  const m = emptyMetrics;
  const series: PeriodPoint[] = [];
  const activity: ActivityItem[] = [];
  const pct = m.aiResolutionRate === null ? null : `${Math.round(m.aiResolutionRate * 100)}%`;

  return (
    <>
      <PageHeader title="Dashboard" description="Acompanhe o desempenho do atendimento da sua empresa." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total de conversas" value={m.totalConversations} icon={MessagesSquare} />
        <StatCard label="Em andamento" value={m.inProgress} icon={Clock} />
        <StatCard label="Concluídos" value={m.completed} icon={CheckCircle2} />
        <StatCard label="Clientes cadastrados" value={m.customers} icon={Users} />
        <StatCard label="Resolução pela IA" value={pct} icon={Bot} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="gap-4 p-5 shadow-card lg:col-span-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">Atendimentos por período</h2>
            <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
          </div>
          {series.length === 0 && (
            <EmptyState icon={LineChart} title="Nenhum atendimento registrado" description="O gráfico aparecerá aqui assim que os primeiros atendimentos forem realizados." className="h-64" />
          )}
        </Card>
        <Card className="gap-4 p-5 shadow-card">
          <h2 className="text-base font-semibold text-foreground">Atividades recentes</h2>
          {activity.length === 0 && (
            <EmptyState icon={Activity} title="Sem atividades" description="Novas conversas, clientes e ações da equipe serão listadas aqui." className="h-64" />
          )}
        </Card>
      </div>
    </>
  );
}
