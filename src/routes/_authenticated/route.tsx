import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { CreateCompany } from "@/features/company/CreateCompany";
import { currentCompanyQuery, useCurrentCompany } from "@/features/company/useCompany";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(currentCompanyQuery),
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const company = useCurrentCompany();
  if (!company) return <CreateCompany />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
