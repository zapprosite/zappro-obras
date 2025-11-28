// Kanban board types for construction task scheduling

export type TarefaStatus = "pendente" | "em_andamento" | "concluida" | "cancelada";
export type TarefaPrioridade = "baixa" | "media" | "alta" | "urgente";
export type TarefaLane = "backlog" | "todo" | "doing" | "done" | "blocked";

export interface Equipe {
  id: string;
  nome: string;
  horario_inicio: string;
  horario_fim: string;
  dias_trabalho: string[];
}

export interface TarefaKanban {
  id: string;
  titulo: string;
  descricao: string | null;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  lane: TarefaLane;
  sort_order: number;
  data_inicio: string | null;
  data_fim: string | null;
  observacoes: string | null;
  equipe_id: string | null;
  obra_id: string;
  equipes?: { nome: string } | null;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  hour: number;
  label: string;
}

export interface DayColumn {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
}

export interface ScheduleCell {
  dayIndex: number;
  hour: number;
  tasks: TarefaKanban[];
}

// Working hours: 07:00 - 19:00 (12 hours)
export const WORK_HOURS_START = 7;
export const WORK_HOURS_END = 19;

// Working days: Monday (1) to Saturday (6)
export const WORKING_DAYS = [1, 2, 3, 4, 5, 6];

export const TIME_SLOTS: TimeSlot[] = Array.from(
  { length: WORK_HOURS_END - WORK_HOURS_START },
  (_, i) => ({
    hour: WORK_HOURS_START + i,
    label: `${String(WORK_HOURS_START + i).padStart(2, "0")}:00`,
  })
);

export const DAY_NAMES: Record<number, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

export const LANE_LABELS: Record<TarefaLane, string> = {
  backlog: "Backlog",
  todo: "A Fazer",
  doing: "Fazendo",
  done: "Concluído",
  blocked: "Bloqueado",
};

export const LANE_COLORS: Record<TarefaLane, string> = {
  backlog: "bg-muted text-muted-foreground",
  todo: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  doing: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  done: "bg-green-500/20 text-green-700 dark:text-green-300",
  blocked: "bg-red-500/20 text-red-700 dark:text-red-300",
};

export const STATUS_LABELS: Record<TarefaStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const PRIORIDADE_LABELS: Record<TarefaPrioridade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORIDADE_COLORS: Record<TarefaPrioridade, string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-blue-500 text-white",
  alta: "bg-warning text-warning-foreground",
  urgente: "bg-destructive text-destructive-foreground",
};
