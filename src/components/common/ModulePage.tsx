import { CircleDashed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import { getModule, type ModuleKey } from "@/config/navigation";

export function ModulePage({ moduleKey }: { moduleKey: ModuleKey }) {
  const m = getModule(moduleKey);
  return (
    <>
      <PageHeader title={m.title} description={m.description} actions={<Badge variant="secondary">Em construção</Badge>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-2 shadow-card lg:col-span-2">
          <EmptyState icon={m.icon} title="Módulo ainda não disponível" description="Esta área será liberada nas próximas etapas. Nenhum dado é exibido até que exista informação real da sua empresa." />
        </Card>
        <Card className="gap-3 p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Recursos previstos</h2>
          <ul className="space-y-2.5">
            {m.planned.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CircleDashed className="mt-0.5 size-4 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
