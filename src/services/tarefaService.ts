import { supabase } from "@/integrations/supabase/client";
import type { TarefaKanban, TarefaLane, TarefaStatus, TarefaPrioridade } from "@/types/kanban";

export interface CreateTarefaDTO {
  obra_id: string;
  titulo: string;
  descricao?: string;
  status?: TarefaStatus;
  prioridade?: TarefaPrioridade;
  lane?: TarefaLane;
  data_inicio?: string;
  data_fim?: string;
  equipe_id?: string;
  observacoes?: string;
  sort_order?: number;
}

export interface UpdateTarefaDTO {
  titulo?: string;
  descricao?: string;
  status?: TarefaStatus;
  prioridade?: TarefaPrioridade;
  lane?: TarefaLane;
  data_inicio?: string | null;
  data_fim?: string | null;
  equipe_id?: string | null;
  observacoes?: string;
  sort_order?: number;
}

// Fetch all tasks for an obra with equipe join
export async function fetchTarefasByObra(obraId: string): Promise<TarefaKanban[]> {
  const { data, error } = await supabase
    .from("tarefas")
    .select(`
      *,
      equipes (nome)
    `)
    .eq("obra_id", obraId)
    .eq("deleted", false)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as TarefaKanban[]) || [];
}

// Fetch tasks for a specific week
export async function fetchTarefasByWeek(
  obraId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<TarefaKanban[]> {
  const { data, error } = await supabase
    .from("tarefas")
    .select(`
      *,
      equipes (nome)
    `)
    .eq("obra_id", obraId)
    .eq("deleted", false)
    .or(`data_inicio.gte.${weekStart.toISOString()},data_inicio.lte.${weekEnd.toISOString()}`)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as TarefaKanban[]) || [];
}

// Fetch tasks by lane/status
export async function fetchTarefasByLane(
  obraId: string,
  lane: TarefaLane
): Promise<TarefaKanban[]> {
  const { data, error } = await supabase
    .from("tarefas")
    .select(`
      *,
      equipes (nome)
    `)
    .eq("obra_id", obraId)
    .eq("lane", lane)
    .eq("deleted", false)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as TarefaKanban[]) || [];
}

// Create a new task
export async function createTarefa(data: CreateTarefaDTO): Promise<TarefaKanban> {
  const { data: result, error } = await supabase
    .from("tarefas")
    .insert([{
      ...data,
      lane: data.lane || "backlog",
      status: data.status || "pendente",
      prioridade: data.prioridade || "media",
      sort_order: data.sort_order || 0,
    }])
    .select(`
      *,
      equipes (nome)
    `)
    .single();

  if (error) throw error;
  return result as TarefaKanban;
}

// Update a task (for drag-drop and edit)
export async function updateTarefa(
  tarefaId: string,
  data: UpdateTarefaDTO
): Promise<TarefaKanban> {
  const { data: result, error } = await supabase
    .from("tarefas")
    .update(data)
    .eq("id", tarefaId)
    .select(`
      *,
      equipes (nome)
    `)
    .single();

  if (error) throw error;
  return result as TarefaKanban;
}

// Update task position (lane, sort_order, date/time)
export async function updateTarefaPosition(
  tarefaId: string,
  updates: {
    lane?: TarefaLane;
    sort_order?: number;
    data_inicio?: string | null;
    data_fim?: string | null;
  }
): Promise<TarefaKanban> {
  return updateTarefa(tarefaId, updates);
}

// Batch update sort orders for multiple tasks
export async function batchUpdateSortOrder(
  updates: Array<{ id: string; sort_order: number }>
): Promise<void> {
  // Use Promise.all for batch updates
  await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from("tarefas").update({ sort_order }).eq("id", id)
    )
  );
}

// Soft delete a task
export async function deleteTarefa(tarefaId: string): Promise<void> {
  const { error } = await supabase
    .from("tarefas")
    .update({ deleted: true })
    .eq("id", tarefaId);

  if (error) throw error;
}
