import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Users, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateTarefa, deleteTarefa } from "@/services/tarefaService";
import type { TarefaKanban, Equipe, TarefaStatus, TarefaPrioridade, TarefaLane } from "@/types/kanban";
import { STATUS_LABELS, PRIORIDADE_LABELS, LANE_LABELS } from "@/types/kanban";

interface EditTarefaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarefa: TarefaKanban | null;
  equipes: Equipe[];
  onSuccess: () => void;
}

interface Material {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  status: string;
}

interface Documento {
  id: string;
  file_name: string;
  file_size: number;
  upload_date: string;
}

export function EditTarefaModal({
  open,
  onOpenChange,
  tarefa,
  equipes,
  onSuccess,
}: EditTarefaModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    status: "pendente" as TarefaStatus,
    prioridade: "media" as TarefaPrioridade,
    lane: "backlog" as TarefaLane,
    data_inicio: "",
    data_fim: "",
    equipe_id: "",
    observacoes: "",
  });

  useEffect(() => {
    if (tarefa) {
      setFormData({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || "",
        status: tarefa.status,
        prioridade: tarefa.prioridade,
        lane: tarefa.lane,
        data_inicio: tarefa.data_inicio ? tarefa.data_inicio.slice(0, 16) : "",
        data_fim: tarefa.data_fim ? tarefa.data_fim.slice(0, 16) : "",
        equipe_id: tarefa.equipe_id || "",
        observacoes: tarefa.observacoes || "",
      });
      fetchRelatedData(tarefa.id);
    }
  }, [tarefa]);

  const fetchRelatedData = async (tarefaId: string) => {
    // Fetch materials linked to this task
    const { data: materiaisData } = await supabase
      .from("materiais")
      .select("*")
      .eq("tarefa_id", tarefaId)
      .eq("deleted", false);
    setMateriais(materiaisData || []);

    // Fetch documents (would need tarefa_id in documents table, simplified for now)
    setDocumentos([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarefa) return;

    setLoading(true);
    try {
      await updateTarefa(tarefa.id, {
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        status: formData.status,
        prioridade: formData.prioridade,
        lane: formData.lane,
        data_inicio: formData.data_inicio || null,
        data_fim: formData.data_fim || null,
        equipe_id: formData.equipe_id || null,
        observacoes: formData.observacoes || undefined,
      });

      toast({
        title: "Tarefa atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar tarefa",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tarefa) return;

    setDeleting(true);
    try {
      await deleteTarefa(tarefa.id);
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso.",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir tarefa",
        description: error.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>
            Atualize os detalhes da tarefa e visualize informações relacionadas
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="detalhes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="materiais">
              <Package className="h-4 w-4 mr-1" />
              Materiais ({materiais.length})
            </TabsTrigger>
            <TabsTrigger value="documentos">
              <FileText className="h-4 w-4 mr-1" />
              Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: TarefaStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(STATUS_LABELS) as [TarefaStatus, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value: TarefaPrioridade) => setFormData({ ...formData, prioridade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(PRIORIDADE_LABELS) as [TarefaPrioridade, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lane</Label>
                  <Select
                    value={formData.lane}
                    onValueChange={(value: TarefaLane) => setFormData({ ...formData, lane: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(LANE_LABELS) as [TarefaLane, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Equipe</Label>
                <Select
                  value={formData.equipe_id}
                  onValueChange={(value) => setFormData({ ...formData, equipe_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipes.map((equipe) => (
                      <SelectItem key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data/Hora Início</Label>
                  <Input
                    id="data_inicio"
                    type="datetime-local"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data/Hora Fim</Label>
                  <Input
                    id="data_fim"
                    type="datetime-local"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={2}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || loading}
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Excluir
                </Button>
                <Button type="submit" disabled={loading || deleting}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="materiais" className="mt-4">
            {materiais.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum material vinculado a esta tarefa</p>
              </div>
            ) : (
              <div className="space-y-2">
                {materiais.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{material.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.quantidade} {material.unidade}
                      </p>
                    </div>
                    <Badge variant="secondary">{material.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documentos" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Upload de documentos disponível em breve</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
