export interface ObraFinancials {
  id: string;
  obra_id: string;
  obra_nome: string;
  total_budget: number;
  total_spent: number;
  profit_margin_percent: number;
  rework_tasks_count: number;
  month: string;
}

export interface ProfitMargin {
  obra_id: string;
  obra_nome: string;
  budget: number;
  spent: number;
  margin: number;
  margin_percent: number;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface RetrabalhoAlert {
  tarefa_id: string;
  tarefa_titulo: string;
  obra_id: string;
  obra_nome: string;
  occurrence_count: number;
  last_occurrence: string;
  estimated_cost: number;
}

export interface AdminMetrics {
  id: string;
  obra_id: string;
  month: string;
  total_budget: number;
  total_spent: number;
  rework_tasks_count: number;
  profit_margin_percent: number;
  created_at: string;
  updated_at: string;
}
