import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setHours, setMinutes, format } from "date-fns";
import { createTarefa } from "@/services/tarefaService";
import type { Equipe, TarefaStatus, TarefaPrioridade, TarefaLane } from "@/types/kanban";
import { STATUS_LABELS, PRIORIDADE_LABELS, LANE_LABELS } from "@/types/kanban";

interface CreateTarefaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obraId: string;
  equipes: Equipe[];
  initialSlot: { date: Date; hour: number } | null;
  initialLane?: TarefaLane;
  onSuccess: () => void;
}

export function CreateTarefaModal({
  open,
  onOpenChange,
  obraId,
  equipes,
  initialSlot,
  initialLane = "backlog",
  onSuccess,
}: CreateTarefaModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    status: "pendente" as TarefaStatus,
    prioridade: "media" as TarefaPrioridade,
    lane: initialLane,
    data_inicio: "",
    data_fim: "",
    equipe_id: "",
  });

  useEffect(() => {
    if (open) {
      if (initialSlot) {
        const startDate = setMinutes(setHours(initialSlot.date, initialSlot.hour), 0);
        const endDate = setMinutes(setHours(initialSlot.date, initialSlot.hour + 1), 0);

        setFormData((prev) => ({
          ...prev,
          lane: initialLane,
          data_inicio: format(startDate, "yyyy-MM-dd'T'HH:mm"),
          data_fim: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          lane: initialLane,
          data_inicio: "",
          data_fim: "",
        }));
      }
    }
  }, [open, initialSlot, initialLane]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createTarefa({
        obra_id: obraId,
        titulo: formData.titulo,
        descricao: formData.descricao || undefined,
        status: formData.status,
        prioridade: formData.prioridade,
        lane: formData.lane,
        data_inicio: formData.data_inicio || undefined,
        data_fim: formData.data_fim || undefined,
        equipe_id: formData.equipe_id || undefined,
      });

      toast({
        title: "Tarefa criada!",
        description: "A tarefa foi adicionada ao cronograma.",
      });

      // Reset form
      setFormData({
        titulo: "",
        descricao: "",
        status: "pendente",
        prioridade: "media",
        lane: "todo",
        data_inicio: "",
        data_fim: "",
        equipe_id: "",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar tarefa",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Crie uma nova tarefa para o cronograma
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Instalação elétrica sala 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Detalhes da tarefa..."
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
                onValueChange={(value) => setFormData({ ...formData, equipe_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem equipe</SelectItem>
                  {equipes.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Nenhuma equipe cadastrada
                    </div>
                  ) : (
                    equipes.map((equipe) => (
                      <SelectItem key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </SelectItem>
                    ))
                  )}
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Tarefa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
