import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { modules, navGroups } from "@/config/navigation";

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => (pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sidebar-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <p className="font-display text-base font-semibold text-sidebar-accent-foreground">AtendeAI</p>
            <p className="text-xs text-sidebar-foreground/60">Atendimento inteligente</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((g) => (
          <SidebarGroup key={g.id}>
            <SidebarGroupLabel className="text-sidebar-foreground/50">{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {modules.filter((m) => m.group === g.id).map((m) => (
                  <SidebarMenuItem key={m.key}>
                    <SidebarMenuButton asChild isActive={isActive(m.url)} tooltip={m.title}>
                      <Link to={m.url}>
                        <m.icon />
                        <span>{m.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:hidden">
        <p className="rounded-lg border border-sidebar-border px-3 py-2 text-xs text-sidebar-foreground/60">
          WhatsApp ainda não conectado
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
