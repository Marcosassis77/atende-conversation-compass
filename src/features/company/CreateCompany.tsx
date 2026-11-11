import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function CreateCompany() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Informe o nome da empresa.");
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc("create_company", { _name: name.trim() });
    setBusy(false);
    if (error) return setError("Não foi possível cadastrar a empresa. Tente novamente.");
    await qc.invalidateQueries({ queryKey: ["current-company"] });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid px-4">
      <Card className="w-full max-w-md gap-5 p-8 shadow-card">
        <div className="flex size-11 items-center justify-center rounded-xl bg-brand text-primary-foreground">
          <Building2 className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Cadastre sua empresa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Os dados de cada empresa ficam separados e visíveis apenas para a sua equipe.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Nome da empresa</Label>
            <Input id="company" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoFocus />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Cadastrando..." : "Criar empresa"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
