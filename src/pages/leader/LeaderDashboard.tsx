import { useEffect, useState, useCallback } from "react";
import { TeamLeaderLayout } from "@/components/layouts/TeamLeaderLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { formatCurrency } from "@/lib/formatters";
import { 
  ClipboardList, 
  Users, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface LeaderStats {
  assignedProject: any | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  teamMembers: number;
  projectBudget: number;
  projectSpent: number;
}

const LeaderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LeaderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      // Get user's assigned project
      const { data: assignments } = await supabase
        .from("team_assignments")
        .select("obra_id, equipe_id")
        .eq("user_id", user.id)
        .limit(1);

      if (!assignments || assignments.length === 0) {
        setStats({
          assignedProject: null,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          blockedTasks: 0,
          teamMembers: 0,
          projectBudget: 0,
          projectSpent: 0,
        });
        setLoading(false);
        return;
      }

      const obraId = assignments[0].obra_id;

      const [obraRes, tarefasRes, equipesRes, materiaisRes] = await Promise.all([
        supabase.from("obras").select("*").eq("id", obraId).single(),
        supabase.from("tarefas").select("id, titulo, status, lane, prioridade, data_fim")
          .eq("obra_id", obraId).eq("deleted", false),
        supabase.from("equipes").select("id").eq("obra_id", obraId).eq("deleted", false),
        supabase.from("materiais").select("custo_total").eq("obra_id", obraId).eq("deleted", false),
      ]);

      const tarefas = tarefasRes.data || [];
      const totalSpent = (materiaisRes.data || []).reduce((sum, m) => sum + (m.custo_total || 0), 0);

      setStats({
        assignedProject: obraRes.data,
        totalTasks: tarefas.length,
        completedTasks: tarefas.filter(t => t.lane === "done").length,
        inProgressTasks: tarefas.filter(t => t.lane === "doing").length,
        blockedTasks: tarefas.filter(t => t.lane === "blocked").length,
        teamMembers: equipesRes.data?.length || 0,
        projectBudget: obraRes.data?.orcamento || 0,
        projectSpent: totalSpent,
      });

      setRecentTasks(tarefas.filter(t => t.lane !== "done").slice(0, 5));
    } catch (error) {
      console.error("Error fetching leader dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useRealtimeSubscription("tarefas", fetchStats);
  useRealtimeSubscription("materiais", fetchStats);

  if (loading) {
    return (
      <TeamLeaderLayout>
        <DashboardSkeleton />
      </TeamLeaderLayout>
    );
  }

  if (!stats?.assignedProject) {
    return (
      <TeamLeaderLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Nenhum Projeto Atribuído</h2>
          <p className="text-muted-foreground max-w-md">
            Você ainda não foi atribuído a nenhum projeto. 
            Entre em contato com o engenheiro responsável para solicitar acesso.
          </p>
        </div>
      </TeamLeaderLayout>
    );
  }

  const taskProgress = stats.totalTasks > 0 
    ? (stats.completedTasks / stats.totalTasks) * 100 
    : 0;

  const budgetProgress = stats.projectBudget > 0
    ? Math.min((stats.projectSpent / stats.projectBudget) * 100, 100)
    : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgente": return "bg-red-500";
      case "alta": return "bg-orange-500";
      case "media": return "bg-amber-500";
      default: return "bg-emerald-500";
    }
  };

  return (
    <TeamLeaderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meu Painel</h1>
            <p className="text-muted-foreground mt-1">
              Projeto: <span className="font-medium text-foreground">{stats.assignedProject.nome}</span>
            </p>
          </div>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
            <Link to="/leader/tasks">
              <ClipboardList className="h-4 w-4 mr-2" />
              Ver Kanban
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                de {stats.totalTasks} tarefas
              </p>
              <Progress value={taskProgress} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">tarefas ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bloqueadas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.blockedTasks}</div>
              <p className="text-xs text-muted-foreground">requerem atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orçamento do Projeto</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.projectBudget)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.projectSpent)} utilizado
              </p>
              <Progress value={budgetProgress} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </div>

        {/* Active Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tarefas Ativas</CardTitle>
              <CardDescription>Tarefas pendentes e em andamento</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/leader/tasks">
                Ver Todas
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.prioridade)}`} />
                    <div>
                      <p className="font-medium text-sm">{task.titulo}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {task.lane === "doing" ? "Em Andamento" :
                         task.lane === "todo" ? "A Fazer" :
                         task.lane === "blocked" ? "Bloqueada" :
                         task.lane === "backlog" ? "Backlog" : task.lane}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    task.lane === "blocked" ? "destructive" :
                    task.lane === "doing" ? "default" : "secondary"
                  }>
                    {task.prioridade}
                  </Badge>
                </div>
              ))}

              {recentTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Todas as tarefas foram concluídas!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeamLeaderLayout>
  );
};

export default LeaderDashboard;
