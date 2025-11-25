import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateObra } from "@/services/obraService";
import { Loader2 } from "lucide-react";

interface Obra {
  id: string;
  nome: string;
  status: string;
  orcamento: number | null;
  data_inicio: string | null;
  data_fim: string | null;
  descricao: string | null;
}

interface EditObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obra: Obra;
  onSuccess: () => void;
}

const statusOptions = [
  { value: "planning", label: "Planejamento" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "paused", label: "Pausada" },
  { value: "completed", label: "Concluída" },
  { value: "cancelled", label: "Cancelada" },
];

export const EditObraDialog = ({ open, onOpenChange, obra, onSuccess }: EditObraDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: obra.nome,
    status: obra.status,
    orcamento: obra.orcamento?.toString() || "",
    data_inicio: obra.data_inicio || "",
    data_fim: obra.data_fim || "",
    descricao: obra.descricao || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateObra(obra.id, {
        nome: formData.nome,
        status: formData.status as any,
        orcamento: formData.orcamento ? parseFloat(formData.orcamento) : null,
        data_inicio: formData.data_inicio || null,
        data_fim: formData.data_fim || null,
        descricao: formData.descricao || null,
      });

      toast({
        title: "Obra atualizada com sucesso",
        description: "As informações da obra foram atualizadas.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar obra",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Obra</DialogTitle>
          <DialogDescription>
            Atualize as informações da obra
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Obra *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orcamento">Orçamento (R$)</Label>
            <Input
              id="orcamento"
              type="number"
              step="0.01"
              value={formData.orcamento}
              onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
              />
            </div>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Atualizar Obra
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
