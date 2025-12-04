import { supabase } from "@/integrations/supabase/client";
import { Material, CreateMaterialDTO, UpdateMaterialDTO } from "@/types/materials";

export async function fetchMateriaisByObra(obraId: string): Promise<Material[]> {
  // Fetch materials directly linked to obra
  const { data: directMateriais, error: directError } = await supabase
    .from("materiais")
    .select(`
      *,
      fornecedores (nome),
      tarefas (titulo)
    `)
    .eq("obra_id", obraId)
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (directError) throw directError;

  // Fetch materials linked via tarefas
  const { data: taskMateriais, error: taskError } = await supabase
    .from("materiais")
    .select(`
      *,
      fornecedores (nome),
      tarefas!inner (titulo, obra_id)
    `)
    .eq("tarefas.obra_id", obraId)
    .eq("deleted", false)
    .is("obra_id", null)
    .order("created_at", { ascending: false });

  if (taskError) throw taskError;

  // Combine and deduplicate
  const allMateriais = [...(directMateriais || []), ...(taskMateriais || [])];
  const uniqueMap = new Map(allMateriais.map(m => [m.id, m]));
  return Array.from(uniqueMap.values()) as Material[];
}

export async function createMaterial(data: CreateMaterialDTO): Promise<Material> {
  const { data: result, error } = await supabase
    .from("materiais")
    .insert({
      nome: data.nome,
      descricao: data.descricao,
      quantidade: data.quantidade,
      unidade: data.unidade || data.unidade_medida || 'un',
      unidade_medida: data.unidade_medida,
      custo_unitario: data.custo_unitario,
      status: data.status || 'solicitado',
      categoria: data.categoria,
      fornecedor_id: data.fornecedor_id,
      data_entrega_estimada: data.data_entrega_estimada,
      lote: data.lote,
      notas: data.notas,
      obra_id: data.obra_id,
      tarefa_id: data.tarefa_id,
      created_by: data.created_by,
    })
    .select(`
      *,
      fornecedores (nome),
      tarefas (titulo)
    `)
    .single();

  if (error) throw error;
  return result as Material;
}

export async function updateMaterial(id: string, data: UpdateMaterialDTO): Promise<Material> {
  // Remove custo_total from update data - it's a computed column
  const { ...updateData } = data;
  
  const { data: result, error } = await supabase
    .from("materiais")
    .update({
      nome: updateData.nome,
      descricao: updateData.descricao,
      quantidade: updateData.quantidade,
      unidade: updateData.unidade || updateData.unidade_medida,
      unidade_medida: updateData.unidade_medida,
      custo_unitario: updateData.custo_unitario,
      status: updateData.status,
      categoria: updateData.categoria,
      fornecedor_id: updateData.fornecedor_id,
      data_entrega_estimada: updateData.data_entrega_estimada,
      data_entrega_real: updateData.data_entrega_real,
      lote: updateData.lote,
      notas: updateData.notas,
      obra_id: updateData.obra_id,
      tarefa_id: updateData.tarefa_id,
    })
    .eq("id", id)
    .select(`
      *,
      fornecedores (nome),
      tarefas (titulo)
    `)
    .single();

  if (error) throw error;
  return result as Material;
}

export async function deleteMaterial(id: string): Promise<void> {
  const { error } = await supabase
    .from("materiais")
    .update({ deleted: true })
    .eq("id", id);

  if (error) throw error;
}

export async function fetchFornecedores(userId?: string) {
  const { data, error } = await supabase
    .from("fornecedores")
    .select("id, nome")
    .order("nome");

  if (error) throw error;
  return data || [];
}

export function generateLote(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `LOT-${dateStr}-${random}`;
}

export function calculateMaterialStats(materiais: Material[]) {
  const total = materiais.reduce((acc, m) => acc + (m.custo_total || 0), 0);
  const entregue = materiais
    .filter(m => m.status === 'entregue')
    .reduce((acc, m) => acc + (m.custo_total || 0), 0);
  const pendente = total - entregue;
  
  return { total, entregue, pendente };
}
