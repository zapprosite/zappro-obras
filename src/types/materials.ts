export type MaterialStatus = 'solicitado' | 'encomendado' | 'em_transito' | 'entregue' | 'cancelado';
export type MaterialCategoria = 'Estrutura' | 'Acabamento' | 'Hidráulica' | 'Elétrica' | 'Outros';
export type UnidadeMedida = 'm' | 'm2' | 'm3' | 'kg' | 'l' | 'un';

export interface Material {
  id: string;
  obra_id: string | null;
  tarefa_id: string | null;
  nome: string;
  descricao: string | null;
  quantidade: number;
  unidade: string;
  unidade_medida: string | null;
  custo_unitario: number | null;
  custo_total: number | null;
  status: MaterialStatus;
  categoria: MaterialCategoria | null;
  fornecedor_id: string | null;
  data_entrega_estimada: string | null;
  data_entrega_real: string | null;
  lote: string | null;
  notas: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted: boolean | null;
  fornecedores?: {
    nome: string;
  } | null;
  tarefas?: {
    titulo: string;
  } | null;
}

export interface CreateMaterialDTO {
  obra_id: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  unidade: string;
  unidade_medida?: string;
  custo_unitario: number;
  status?: MaterialStatus;
  categoria?: MaterialCategoria;
  fornecedor_id?: string;
  data_entrega_estimada?: string;
  lote?: string;
  notas?: string;
  tarefa_id?: string;
  created_by?: string;
}

export interface UpdateMaterialDTO extends Partial<CreateMaterialDTO> {
  data_entrega_real?: string;
}

export const STATUS_LABELS: Record<MaterialStatus, string> = {
  solicitado: 'Pendente',
  encomendado: 'Encomendado',
  em_transito: 'Em Trânsito',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const STATUS_COLORS: Record<MaterialStatus, string> = {
  solicitado: 'bg-muted text-muted-foreground',
  encomendado: 'bg-blue-500/20 text-blue-400',
  em_transito: 'bg-amber-500/20 text-amber-400',
  entregue: 'bg-green-500/20 text-green-400',
  cancelado: 'bg-red-500/20 text-red-400',
};

export const CATEGORIA_LABELS: Record<MaterialCategoria, string> = {
  Estrutura: 'Estrutura',
  Acabamento: 'Acabamento',
  Hidráulica: 'Hidráulica',
  Elétrica: 'Elétrica',
  Outros: 'Outros',
};

export const UNIDADE_OPTIONS: { value: UnidadeMedida; label: string }[] = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'm', label: 'Metro (m)' },
  { value: 'm2', label: 'Metro² (m²)' },
  { value: 'm3', label: 'Metro³ (m³)' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'l', label: 'Litro (l)' },
];
