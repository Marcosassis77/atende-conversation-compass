import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

/** value === null indica ausência de dados (exibe "—"), nunca um número inventado. */
export function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string | number | null; icon: LucideIcon; hint?: string }) {
  return (
    <Card className="gap-0 p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-foreground">{value ?? "—"}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint ?? (value === null ? "Sem dados ainda" : "")}</p>
    </Card>
  );
}
