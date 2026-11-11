import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/features/company/useCompany";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const company = useCompany();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger aria-label="Alternar menu lateral" />
          <Separator orientation="vertical" className="h-5" />
          <span className="truncate text-sm font-medium text-foreground">{company.name}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={signOut}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </header>
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
