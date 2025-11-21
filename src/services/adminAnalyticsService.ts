import { supabase } from "@/integrations/supabase/client";
import { ObraFinancials, ProfitMargin, CostBreakdown } from "@/types/adminMetrics";

export const adminAnalyticsService = {
  async calculateObraFinancials(obra_id: string): Promise<ObraFinancials | null> {
    try {
      // Get obra details
      const { data: obra } = await supabase
        .from('obras')
        .select('nome, orcamento')
        .eq('id', obra_id)
        .single();

      if (!obra) return null;

      // Calculate total spent from materiais
      const { data: materiais } = await supabase
        .from('materiais')
        .select('custo_total')
        .eq('tarefa_id', obra_id);

      const totalSpent = materiais?.reduce((sum, m) => sum + (Number(m.custo_total) || 0), 0) || 0;
      const budget = Number(obra.orcamento) || 0;
      const profitMargin = budget - totalSpent;
      const profitMarginPercent = budget > 0 ? (profitMargin / budget) * 100 : 0;

      // Count rework tasks (duplicate titles within 7 days)
      const { data: tarefas } = await supabase
        .from('tarefas')
        .select('titulo, created_at')
        .eq('obra_id', obra_id)
        .order('created_at', { ascending: false });

      let retrabalhoCount = 0;
      const titleMap = new Map<string, string[]>();
      
      tarefas?.forEach(t => {
        const dates = titleMap.get(t.titulo) || [];
        dates.push(t.created_at);
        titleMap.set(t.titulo, dates);
      });

      titleMap.forEach(dates => {
        if (dates.length > 1) {
          for (let i = 0; i < dates.length - 1; i++) {
            const diff = Math.abs(new Date(dates[i]).getTime() - new Date(dates[i + 1]).getTime());
            if (diff < 7 * 24 * 60 * 60 * 1000) {
              retrabalhoCount++;
            }
          }
        }
      });

      return {
        id: obra_id,
        obra_id,
        obra_nome: obra.nome,
        total_budget: budget,
        total_spent: totalSpent,
        profit_margin_percent: profitMarginPercent,
        rework_tasks_count: retrabalhoCount,
        month: new Date().toISOString().slice(0, 7),
      };
    } catch (error) {
      console.error("Error calculating obra financials:", error);
      return null;
    }
  },

  async getAllObrasFinancials(): Promise<ObraFinancials[]> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];

      const { data: obras } = await supabase
        .from('obras')
        .select('id')
        .eq('user_id', user.id);

      if (!obras) return [];

      const financials = await Promise.all(
        obras.map(o => this.calculateObraFinancials(o.id))
      );

      return financials.filter((f): f is ObraFinancials => f !== null);
    } catch (error) {
      console.error("Error fetching all obras financials:", error);
      return [];
    }
  },

  async getProfitMargins(): Promise<ProfitMargin[]> {
    const financials = await this.getAllObrasFinancials();
    
    return financials.map(f => ({
      obra_id: f.obra_id,
      obra_nome: f.obra_nome,
      budget: f.total_budget,
      spent: f.total_spent,
      margin: f.total_budget - f.total_spent,
      margin_percent: f.profit_margin_percent,
    }));
  },

  async getCostBreakdown(obra_id: string): Promise<CostBreakdown[]> {
    const { data: materiais } = await supabase
      .from('materiais')
      .select('nome, custo_total')
      .eq('tarefa_id', obra_id);

    if (!materiais || materiais.length === 0) return [];

    const total = materiais.reduce((sum, m) => sum + (Number(m.custo_total) || 0), 0);
    
    const breakdown = materiais.reduce((acc, m) => {
      const category = m.nome || 'Outros';
      const existing = acc.find(b => b.category === category);
      const amount = Number(m.custo_total) || 0;

      if (existing) {
        existing.amount += amount;
      } else {
        acc.push({
          category,
          amount,
          percentage: 0,
        });
      }
      return acc;
    }, [] as CostBreakdown[]);

    // Calculate percentages
    breakdown.forEach(b => {
      b.percentage = total > 0 ? (b.amount / total) * 100 : 0;
    });

    return breakdown.sort((a, b) => b.amount - a.amount);
  },
};
