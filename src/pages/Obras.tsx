import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Calendar, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Obra {
  id: string;
  nome: string;
  status: string;
  orcamento: number | null;
  data_inicio: string | null;
  data_fim: string | null;
  descricao: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  in_progress: "bg-primary text-primary-foreground",
  paused: "bg-warning text-warning-foreground",
  completed: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const statusLabels: Record<string, string> = {
  planning: "Planejamento",
  in_progress: "Em Andamento",
  paused: "Pausada",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const Obras = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    status: "planning" as "planning" | "in_progress" | "paused" | "completed" | "cancelled",
    orcamento: "",
    data_inicio: "",
    data_fim: "",
    descricao: "",
  });

  const fetchObras = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .eq("user_id", user.id)
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar obras",
        description: error.message,
      });
    } else {
      setObras(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchObras();
  }, [user]);

  const handleCreateObra = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("obras").insert([
      {
        user_id: user?.id,
        nome: formData.nome,
        status: formData.status,
        orcamento: formData.orcamento ? parseFloat(formData.orcamento) : null,
        data_inicio: formData.data_inicio || null,
        data_fim: formData.data_fim || null,
        descricao: formData.descricao || null,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar obra",
        description: error.message,
      });
    } else {
      toast({
        title: "Obra criada!",
        description: "A obra foi criada com sucesso.",
      });
      setDialogOpen(false);
      setFormData({
        nome: "",
        status: "planning",
        orcamento: "",
        data_inicio: "",
        data_fim: "",
        descricao: "",
      });
      fetchObras();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Obras</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus projetos de construção
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreateObra}>
                <DialogHeader>
                  <DialogTitle>Criar Nova Obra</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova obra
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as "planning" | "in_progress" | "paused" | "completed" | "cancelled" })}
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
                      <Label htmlFor="data_inicio">Data Início</Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={formData.data_inicio}
                        onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data_fim">Data Fim</Label>
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
                </div>
                <DialogFooter>
                  <Button type="submit">Criar Obra</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando obras...</p>
          </div>
        ) : obras.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma obra cadastrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece criando sua primeira obra
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {obras.map((obra) => (
              <Link key={obra.id} to={`/obras/${obra.id}`}>
                <Card className="border-border/50 hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{obra.nome}</CardTitle>
                      <Badge className={statusColors[obra.status]}>
                        {statusLabels[obra.status]}
                      </Badge>
                    </div>
                    {obra.descricao && (
                      <CardDescription className="line-clamp-2">
                        {obra.descricao}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {obra.orcamento && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-2" />
                        R$ {obra.orcamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    )}
                    {obra.data_inicio && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(obra.data_inicio).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Obras;
