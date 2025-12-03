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
  const custoTotal = data.quantidade * data.custo_unitario;
  
  const { data: result, error } = await supabase
    .from("materiais")
    .insert({
      ...data,
      custo_total: custoTotal,
      unidade: data.unidade || data.unidade_medida || 'un',
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
  const updateData: any = { ...data };
  
  if (data.quantidade !== undefined && data.custo_unitario !== undefined) {
    updateData.custo_total = data.quantidade * data.custo_unitario;
  }

  const { data: result, error } = await supabase
    .from("materiais")
    .update(updateData)
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
