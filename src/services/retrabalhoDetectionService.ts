import { supabase } from "@/integrations/supabase/client";
import { RetrabalhoAlert } from "@/types/adminMetrics";

export const retrabalhoDetectionService = {
  async detectRetrabalho(obra_id?: string): Promise<RetrabalhoAlert[]> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];

      let query = supabase
        .from('tarefas')
        .select('id, titulo, obra_id, created_at, obras(nome)')
        .order('created_at', { ascending: false });

      if (obra_id) {
        query = query.eq('obra_id', obra_id);
      }

      const { data: tarefas, error } = await query;

      if (error || !tarefas) return [];

      // Group by title and detect duplicates within 7 days
      const titleGroups = new Map<string, any[]>();
      
      tarefas.forEach(tarefa => {
        const key = `${tarefa.titulo.toLowerCase()}-${tarefa.obra_id}`;
        const group = titleGroups.get(key) || [];
        group.push(tarefa);
        titleGroups.set(key, group);
      });

      const alerts: RetrabalhoAlert[] = [];

      titleGroups.forEach((tasks, key) => {
        if (tasks.length > 1) {
          // Check if tasks are within 7 days of each other
          const sortedTasks = tasks.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          for (let i = 0; i < sortedTasks.length - 1; i++) {
            const diff = Math.abs(
              new Date(sortedTasks[i].created_at).getTime() - 
              new Date(sortedTasks[i + 1].created_at).getTime()
            );
            const daysDiff = diff / (1000 * 60 * 60 * 24);

            if (daysDiff <= 7) {
              alerts.push({
                tarefa_id: sortedTasks[i].id,
                tarefa_titulo: sortedTasks[i].titulo,
                obra_id: sortedTasks[i].obra_id,
                obra_nome: sortedTasks[i].obras?.nome || 'N/A',
                occurrence_count: tasks.length,
                last_occurrence: sortedTasks[0].created_at,
                estimated_cost: tasks.length * 500, // Rough estimate
              });
              break;
            }
          }
        }
      });

      return alerts;
    } catch (error) {
      console.error("Error detecting retrabalho:", error);
      return [];
    }
  },

  async getRetrabalhoStats(obra_id: string): Promise<{
    total_count: number;
    estimated_cost: number;
    recent_alerts: number;
  }> {
    const alerts = await this.detectRetrabalho(obra_id);
    const recentAlerts = alerts.filter(a => {
      const diff = Date.now() - new Date(a.last_occurrence).getTime();
      return diff < 30 * 24 * 60 * 60 * 1000; // Last 30 days
    });

    return {
      total_count: alerts.length,
      estimated_cost: alerts.reduce((sum, a) => sum + a.estimated_cost, 0),
      recent_alerts: recentAlerts.length,
    };
  },
};
