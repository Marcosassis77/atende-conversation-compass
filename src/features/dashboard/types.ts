/** Contrato dos indicadores do dashboard. Será preenchido pela camada de dados (Lovable Cloud) por empresa. */
export interface DashboardMetrics {
  totalConversations: number | null;
  inProgress: number | null;
  completed: number | null;
  customers: number | null;
  aiResolutionRate: number | null; // 0–1
}
export interface PeriodPoint { label: string; total: number }
export interface ActivityItem { id: string; description: string; at: string }

export const emptyMetrics: DashboardMetrics = {
  totalConversations: null, inProgress: null, completed: null, customers: null, aiResolutionRate: null,
};
