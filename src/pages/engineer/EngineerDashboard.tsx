import { useEffect, useState, useCallback } from "react";
import { EngineerLayout } from "@/components/layouts/EngineerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { formatCurrency } from "@/lib/formatters";
import { 
  Building2, 
  Users, 
  ClipboardList, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTeams: number;
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  totalSpent: number;
  pendingMaterials: number;
}

const EngineerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const [obrasRes, equipesRes, tarefasRes, materiaisRes] = await Promise.all([
        supabase.from("obras").select("id, nome, status, orcamento, data_inicio, data_fim").eq("deleted", false),
        supabase.from("equipes").select("id").eq("deleted", false),
        supabase.from("tarefas").select("id, status, lane").eq("deleted", false),
        supabase.from("materiais").select("id, status, custo_total").eq("deleted", false),
      ]);

      const obras = obrasRes.data || [];
      const tarefas = tarefasRes.data || [];
      const materiais = materiaisRes.data || [];

      const totalBudget = obras.reduce((sum, o) => sum + (o.orcamento || 0), 0);
      const totalSpent = materiais.reduce((sum, m) => sum + (m.custo_total || 0), 0);

      setStats({
        totalProjects: obras.length,
        activeProjects: obras.filter(o => o.status === "in_progress").length,
        totalTeams: equipesRes.data?.length || 0,
        totalTasks: tarefas.length,
        completedTasks: tarefas.filter(t => t.lane === "done").length,
        totalBudget,
        totalSpent,
        pendingMaterials: materiais.filter(m => m.status === "solicitado").length,
      });

      setRecentProjects(obras.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useRealtimeSubscription("obras", fetchStats);
  useRealtimeSubscription("tarefas", fetchStats);
  useRealtimeSubscription("materiais", fetchStats);

  if (loading) {
    return (
      <EngineerLayout>
        <DashboardSkeleton />
      </EngineerLayout>
    );
  }

  const budgetProgress = stats?.totalBudget 
    ? Math.min((stats.totalSpent / stats.totalBudget) * 100, 100) 
    : 0;

  const taskProgress = stats?.totalTasks 
    ? (stats.completedTasks / stats.totalTasks) * 100 
    : 0;

  return (
    <EngineerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral de todos os projetos e métricas
            </p>
          </div>
          <Button asChild>
            <Link to="/engineer/projects">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
              <p className="text-xs text-muted-foreground">
                de {stats?.totalProjects || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Equipes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTeams || 0}</div>
              <p className="text-xs text-muted-foreground">
                equipes ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedTasks || 0}</div>
              <p className="text-xs text-muted-foreground">
                de {stats?.totalTasks || 0} concluídas
              </p>
              <Progress value={taskProgress} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalBudget || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats?.totalSpent || 0)} gasto
              </p>
              <Progress value={budgetProgress} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Recent Projects */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alertas
              </CardTitle>
              <CardDescription>Itens que requerem atenção</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetProgress > 80 && (
                <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Orçamento Crítico</p>
                    <p className="text-xs text-muted-foreground">
                      {budgetProgress.toFixed(0)}% do orçamento total já foi utilizado
                    </p>
                  </div>
                </div>
              )}
              
              {(stats?.pendingMaterials || 0) > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Materiais Pendentes</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.pendingMaterials} materiais aguardando aprovação
                    </p>
                  </div>
                </div>
              )}

              {budgetProgress <= 80 && (stats?.pendingMaterials || 0) === 0 && (
                <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Tudo em Ordem</p>
                    <p className="text-xs text-muted-foreground">
                      Nenhum alerta crítico no momento
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projetos Recentes</CardTitle>
                <CardDescription>Últimos projetos atualizados</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/engineer/projects">
                  Ver Todos
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/engineer/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{project.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(project.orcamento || 0)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      project.status === "in_progress" ? "default" :
                      project.status === "completed" ? "secondary" : "outline"
                    }>
                      {project.status === "in_progress" ? "Em Andamento" :
                       project.status === "completed" ? "Concluído" :
                       project.status === "planning" ? "Planejamento" : project.status}
                    </Badge>
                  </Link>
                ))}

                {recentProjects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhum projeto cadastrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EngineerLayout>
  );
};

export default EngineerDashboard;
