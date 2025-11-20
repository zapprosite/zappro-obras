import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Users, ClipboardList, Package, Clock, DollarSign } from "lucide-react";
import { EquipesTab } from "@/components/obra-detalhes/EquipesTab";
import { TarefasTab } from "@/components/obra-detalhes/TarefasTab";
import { MateriaisTab } from "@/components/obra-detalhes/MateriaisTab";
import { PontoTab } from "@/components/obra-detalhes/PontoTab";

interface Obra {
  id: string;
  nome: string;
  status: string;
  orcamento: number | null;
  data_inicio: string | null;
  data_fim: string | null;
  descricao: string | null;
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

const ObraDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchObra();
  }, [id, user]);

  const fetchObra = async () => {
    if (!id || !user) return;

    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar obra",
        description: error.message,
      });
      navigate("/obras");
    } else {
      setObra(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando obra...</p>
        </div>
      </Layout>
    );
  }

  if (!obra) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Obra não encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/obras")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{obra.nome}</h1>
              <Badge className={statusColors[obra.status]}>
                {statusLabels[obra.status]}
              </Badge>
            </div>
            {obra.descricao && (
              <p className="text-muted-foreground mt-2">{obra.descricao}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {obra.orcamento && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orçamento</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {obra.orcamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          )}
          {obra.data_inicio && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Início</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(obra.data_inicio).toLocaleDateString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          )}
          {obra.data_fim && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Fim</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(obra.data_fim).toLocaleDateString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="equipes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="equipes">
              <Users className="h-4 w-4 mr-2" />
              Equipes
            </TabsTrigger>
            <TabsTrigger value="tarefas">
              <ClipboardList className="h-4 w-4 mr-2" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="materiais">
              <Package className="h-4 w-4 mr-2" />
              Materiais
            </TabsTrigger>
            <TabsTrigger value="ponto">
              <Clock className="h-4 w-4 mr-2" />
              Ponto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipes">
            <EquipesTab obraId={id!} />
          </TabsContent>

          <TabsContent value="tarefas">
            <TarefasTab obraId={id!} />
          </TabsContent>

          <TabsContent value="materiais">
            <MateriaisTab obraId={id!} />
          </TabsContent>

          <TabsContent value="ponto">
            <PontoTab obraId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ObraDetalhes;
