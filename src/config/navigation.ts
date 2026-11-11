import {
  LayoutDashboard, Headset, MessagesSquare, Users, Bot, BookOpen,
  BarChart3, Plug, Settings, CreditCard, type LucideIcon,
} from "lucide-react";

export type ModuleKey =
  | "dashboard" | "atendimento" | "conversas" | "clientes" | "assistente-ia"
  | "base-de-conhecimento" | "relatorios" | "integracoes" | "configuracoes" | "assinatura";

export interface AppModule {
  key: ModuleKey;
  title: string;
  url: string;
  icon: LucideIcon;
  group: "operacao" | "inteligencia" | "gestao";
  description: string;
  /** Recursos previstos — exibidos como roadmap, nunca como ações clicáveis. */
  planned: string[];
}

export const modules: AppModule[] = [
  { key: "dashboard", title: "Dashboard", url: "/", icon: LayoutDashboard, group: "operacao",
    description: "Visão geral do desempenho do atendimento.", planned: [] },
  { key: "atendimento", title: "Atendimento", url: "/atendimento", icon: Headset, group: "operacao",
    description: "Fila de atendimentos em tempo real, distribuição entre agentes e transferência entre IA e humanos.",
    planned: ["Fila de atendimentos por prioridade", "Atribuição automática a agentes", "Transferência IA → humano", "Status e SLA por atendimento"] },
  { key: "conversas", title: "Conversas", url: "/conversas", icon: MessagesSquare, group: "operacao",
    description: "Caixa de entrada unificada com o histórico completo de mensagens dos seus clientes.",
    planned: ["Caixa de entrada unificada", "Histórico por cliente", "Etiquetas e filtros", "Respostas rápidas"] },
  { key: "clientes", title: "Clientes", url: "/clientes", icon: Users, group: "operacao",
    description: "CRM com cadastro, segmentação e histórico de relacionamento de cada cliente.",
    planned: ["Cadastro e importação de contatos", "Segmentação por etiquetas", "Linha do tempo de interações", "Funil de oportunidades"] },
  { key: "assistente-ia", title: "Assistente IA", url: "/assistente-ia", icon: Bot, group: "inteligencia",
    description: "Configure a personalidade, o tom e as regras do assistente que responde seus clientes.",
    planned: ["Persona e tom de voz", "Regras de escalonamento para humanos", "Horários de atuação", "Testes em ambiente seguro"] },
  { key: "base-de-conhecimento", title: "Base de conhecimento", url: "/base-de-conhecimento", icon: BookOpen, group: "inteligencia",
    description: "Conteúdos que alimentam as respostas da IA: perguntas frequentes, documentos e políticas.",
    planned: ["Perguntas frequentes", "Upload de documentos", "Categorias e versões", "Indicação de lacunas de conhecimento"] },
  { key: "relatorios", title: "Relatórios", url: "/relatorios", icon: BarChart3, group: "inteligencia",
    description: "Indicadores de volume, tempo de resposta, satisfação e desempenho da IA e da equipe.",
    planned: ["Volume por canal e período", "Tempo médio de resposta", "Taxa de resolução pela IA", "Exportação de dados"] },
  { key: "integracoes", title: "Integrações", url: "/integracoes", icon: Plug, group: "gestao",
    description: "Conecte canais e serviços externos à sua conta.",
    planned: ["WhatsApp Business Platform", "Modelos de IA (Gemini)", "Webhooks", "API para sistemas próprios"] },
  { key: "configuracoes", title: "Configurações", url: "/configuracoes", icon: Settings, group: "gestao",
    description: "Dados da empresa, equipe, permissões e preferências da conta.",
    planned: ["Perfil da empresa", "Usuários e permissões", "Horário de funcionamento", "Segurança e auditoria"] },
  { key: "assinatura", title: "Assinatura e plano", url: "/assinatura", icon: CreditCard, group: "gestao",
    description: "Plano contratado, limites de uso, faturas e forma de pagamento.",
    planned: ["Planos e limites", "Consumo do período", "Histórico de faturas", "Forma de pagamento"] },
];

export const navGroups: { id: AppModule["group"]; label: string }[] = [
  { id: "operacao", label: "Operação" },
  { id: "inteligencia", label: "Inteligência" },
  { id: "gestao", label: "Gestão" },
];

export const getModule = (key: ModuleKey) => modules.find((m) => m.key === key)!;
