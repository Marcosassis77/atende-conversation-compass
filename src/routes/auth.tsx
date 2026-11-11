import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — AtendeAI" },
      { name: "description", content: "Acesse sua conta AtendeAI ou crie uma nova." },
      { property: "og:title", content: "Entrar — AtendeAI" },
      { property: "og:description", content: "Acesse sua conta AtendeAI ou crie uma nova." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError("E-mail ou senha incorretos.");
      navigate({ to: "/dashboard", replace: true });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      });
      setBusy(false);
      if (error) return setError(error.message.includes("Password") ? "A senha precisa ter pelo menos 6 caracteres." : "Não foi possível criar a conta.");
      setInfo("Enviamos um link de confirmação para o seu e-mail. Confirme para entrar.");
    }
  }

  async function oauth(provider: "google" | "lovable") {
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) return setError("Não foi possível entrar. Tente novamente.");
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid px-4 py-10">
      <Card className="w-full max-w-md gap-6 p-8 shadow-card">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="font-display text-lg font-semibold">AtendeAI</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{mode === "signin" ? "Entrar na sua conta" : "Criar sua conta"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Atendimento inteligente para sua empresa.</p>
        </div>
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="space-y-2">
          <Button type="button" variant="outline" className="w-full" onClick={() => oauth("google")}>
            <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
            Continuar com Google
          </Button>
          <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>
            Continue with Lovable
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />ou com e-mail<span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-success">{info}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
