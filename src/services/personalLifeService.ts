import { supabase } from "@/integrations/supabase/client";
import { PersonalTask, PersonalTaskCreate, PersonalTaskUpdate, CategoryStats } from "@/types/personalLife";

export const personalLifeService = {
  async getTasks(): Promise<PersonalTask[]> {
    const { data, error } = await supabase
      .from('personal_tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching personal tasks:", error);
      return [];
    }

    return (data || []) as PersonalTask[];
  },

  async getTasksByCategory(category: string): Promise<PersonalTask[]> {
    const { data, error } = await supabase
      .from('personal_tasks')
      .select('*')
      .eq('category', category)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Error fetching tasks by category:", error);
      return [];
    }

    return (data || []) as PersonalTask[];
  },

  async createTask(task: PersonalTaskCreate): Promise<PersonalTask | null> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('personal_tasks')
      .insert({
        ...task,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating personal task:", error);
      return null;
    }

    return data as PersonalTask;
  },

  async updateTask(id: string, updates: PersonalTaskUpdate): Promise<boolean> {
    const updateData: any = { ...updates };
    
    if (updates.completed !== undefined && updates.completed) {
      updateData.completed_at = new Date().toISOString();
    } else if (updates.completed === false) {
      updateData.completed_at = null;
    }

    const { error } = await supabase
      .from('personal_tasks')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating personal task:", error);
      return false;
    }

    return true;
  },

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('personal_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting personal task:", error);
      return false;
    }

    return true;
  },

  async getCategoryStats(): Promise<CategoryStats[]> {
    const tasks = await this.getTasks();
    const categories = ['familia', 'treino', 'compromissos', 'lazer', 'saude'] as const;
    const now = new Date();

    return categories.map(category => {
      const categoryTasks = tasks.filter(t => t.category === category);
      const completed = categoryTasks.filter(t => t.completed).length;
      const pending = categoryTasks.filter(t => !t.completed).length;
      const overdue = categoryTasks.filter(t => 
        !t.completed && t.due_date && new Date(t.due_date) < now
      ).length;

      return {
        category,
        total: categoryTasks.length,
        completed,
        pending,
        overdue,
      };
    });
  },

  async getWeekTasks(): Promise<{ date: string; tasks: PersonalTask[] }[]> {
    const tasks = await this.getTasks();
    const today = new Date();
    const weekDays: { date: string; tasks: PersonalTask[] }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTasks = tasks.filter(t => t.due_date === dateStr);

      weekDays.push({
        date: dateStr,
        tasks: dayTasks,
      });
    }

    return weekDays;
  },
};
