import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ClipboardList, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  status: "pendente" | "em_andamento" | "concluida" | "cancelada";
  prioridade: "baixa" | "media" | "alta" | "urgente";
  data_inicio: string | null;
  data_fim: string | null;
  equipe_id: string | null;
  equipes?: { nome: string } | null;
}

interface Equipe {
  id: string;
  nome: string;
}

const statusColors: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground",
  em_andamento: "bg-primary text-primary-foreground",
  concluida: "bg-success text-success-foreground",
  cancelada: "bg-destructive text-destructive-foreground",
};

const prioridadeColors: Record<string, string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-blue-500 text-white",
  alta: "bg-warning text-warning-foreground",
  urgente: "bg-destructive text-destructive-foreground",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const prioridadeLabels: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const TarefasTab = ({ obraId }: { obraId: string }) => {
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    status: "pendente" as "pendente" | "em_andamento" | "concluida" | "cancelada",
    prioridade: "media" as "baixa" | "media" | "alta" | "urgente",
    data_inicio: "",
    data_fim: "",
    equipe_id: "",
  });

  useEffect(() => {
    fetchTarefas();
    fetchEquipes();
  }, [obraId]);

  const fetchTarefas = async () => {
    const { data, error } = await supabase
      .from("tarefas")
      .select(`
        *,
        equipes (nome)
      `)
      .eq("obra_id", obraId)
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar tarefas",
        description: error.message,
      });
    } else {
      setTarefas(data as any || []);
    }
    setLoading(false);
  };

  const fetchEquipes = async () => {
    const { data, error } = await supabase
      .from("equipes")
      .select("*")
      .eq("obra_id", obraId)
      .eq("deleted", false)
      .order("nome");

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar equipes",
        description: error.message,
      });
    } else {
      setEquipes(data || []);
    }
  };

  const handleCreateTarefa = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("tarefas").insert([
      {
        obra_id: obraId,
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        status: formData.status,
        prioridade: formData.prioridade,
        data_inicio: formData.data_inicio || null,
        data_fim: formData.data_fim || null,
        equipe_id: formData.equipe_id || null,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar tarefa",
        description: error.message,
      });
    } else {
      toast({
        title: "Tarefa criada!",
        description: "A tarefa foi criada com sucesso.",
      });
      setDialogOpen(false);
      setFormData({
        titulo: "",
        descricao: "",
        status: "pendente",
        prioridade: "media",
        data_inicio: "",
        data_fim: "",
        equipe_id: "",
      });
      fetchTarefas();
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando tarefas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Tarefas da Obra</h3>
          <p className="text-sm text-muted-foreground">Gerencie as tarefas e atividades</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateTarefa}>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
                <DialogDescription>Preencha os dados da nova tarefa</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "pendente" | "em_andamento" | "concluida" | "cancelada") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
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
                      onValueChange={(value: "baixa" | "media" | "alta" | "urgente") =>
                        setFormData({ ...formData, prioridade: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(prioridadeLabels).map(([value, label]) => (
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
                  <Select value={formData.equipe_id} onValueChange={(value) => setFormData({ ...formData, equipe_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma equipe (opcional)" />
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
                    <Label htmlFor="data_inicio">Data Início</Label>
                    <Input
                      id="data_inicio"
                      type="datetime-local"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data Fim</Label>
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
                <Button type="submit">Criar Tarefa</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tarefas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa cadastrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando a primeira tarefa para esta obra
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tarefas.map((tarefa) => (
            <Card key={tarefa.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{tarefa.titulo}</CardTitle>
                    {tarefa.descricao && (
                      <CardDescription className="mt-2">{tarefa.descricao}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={prioridadeColors[tarefa.prioridade]}>
                      {prioridadeLabels[tarefa.prioridade]}
                    </Badge>
                    <Badge className={statusColors[tarefa.status]}>
                      {statusLabels[tarefa.status]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {tarefa.equipes && (
                  <p className="text-sm text-muted-foreground">
                    Equipe: {tarefa.equipes.nome}
                  </p>
                )}
                {(tarefa.data_inicio || tarefa.data_fim) && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {tarefa.data_inicio && (
                      <span>Início: {new Date(tarefa.data_inicio).toLocaleString("pt-BR")}</span>
                    )}
                    {tarefa.data_fim && (
                      <span>Fim: {new Date(tarefa.data_fim).toLocaleString("pt-BR")}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
