import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CurrentCompany {
  id: string;
  name: string;
  role: "owner" | "admin" | "agent";
}

export const currentCompanyQuery = queryOptions({
  queryKey: ["current-company"],
  queryFn: async (): Promise<CurrentCompany | null> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await supabase
      .from("company_members")
      .select("role, companies(id, name)")
      .eq("user_id", auth.user.id)
      .order("created_at")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data?.companies) return null;
    return { id: data.companies.id, name: data.companies.name, role: data.role };
  },
});

export function useCurrentCompany() {
  return useSuspenseQuery(currentCompanyQuery).data;
}

/** Use only inside the company gate, where a company is guaranteed. */
export function useCompany(): CurrentCompany {
  const c = useCurrentCompany();
  if (!c) throw new Error("Empresa não encontrada");
  return c;
}
