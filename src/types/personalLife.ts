export type LifeCategory = 'familia' | 'treino' | 'compromissos' | 'lazer' | 'saude';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface PersonalTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: LifeCategory;
  priority: TaskPriority;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalTaskCreate {
  title: string;
  description?: string;
  category: LifeCategory;
  priority: TaskPriority;
  due_date?: string;
}

export interface PersonalTaskUpdate {
  title?: string;
  description?: string;
  category?: LifeCategory;
  priority?: TaskPriority;
  due_date?: string;
  completed?: boolean;
}

export interface CategoryStats {
  category: LifeCategory;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface WeekTask {
  date: string;
  tasks: PersonalTask[];
}

export const CATEGORY_LABELS: Record<LifeCategory, string> = {
  familia: 'Família',
  treino: 'Treino',
  compromissos: 'Compromissos',
  lazer: 'Lazer',
  saude: 'Saúde',
};

export const CATEGORY_ICONS: Record<LifeCategory, string> = {
  familia: '👨‍👩‍👧‍👦',
  treino: '💪',
  compromissos: '📅',
  lazer: '🎮',
  saude: '🏥',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};
