import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Briefcase, ClipboardList, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface Stats {
  totalObras: number;
  obrasEmAndamento: number;
  totalProfissionais: number;
  totalEquipes: number;
  tarefasPendentes: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalObras: 0,
    obrasEmAndamento: 0,
    totalProfissionais: 0,
    totalEquipes: 0,
    tarefasPendentes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;

    const [obrasResult, profissionaisResult] = await Promise.all([
      supabase
        .from("obras")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("deleted", false),
      supabase
        .from("profissionais")
        .select("id", { count: "exact", head: true })
        .eq("deleted", false),
    ]);

    const obras = obrasResult.data || [];
    const obrasEmAndamento = obras.filter((o) => o.status === "in_progress").length;
    const obraIds = obras.map((o) => o.id);

    // Count equipes
    const { count: equipesCount } = await supabase
      .from("equipes")
      .select("*", { count: "exact", head: true })
      .in("obra_id", obraIds)
      .eq("deleted", false);

    // Count tarefas pendentes
    const { count: tarefasPendentesCount } = await supabase
      .from("tarefas")
      .select("*", { count: "exact", head: true })
      .in("obra_id", obraIds)
      .in("status", ["pendente", "em_andamento"])
      .eq("deleted", false);

    setStats({
      totalObras: obras.length,
      obrasEmAndamento,
      totalProfissionais: profissionaisResult.count || 0,
      totalEquipes: equipesCount || 0,
      tarefasPendentes: tarefasPendentesCount || 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Realtime subscriptions for dashboard updates
  useRealtimeSubscription("obras", fetchStats);
  useRealtimeSubscription("profissionais", fetchStats);
  useRealtimeSubscription("equipes", fetchStats);
  useRealtimeSubscription("tarefas", fetchStats);

  const statCards = [
    {
      title: "Total de Obras",
      value: stats.totalObras,
      description: `${stats.obrasEmAndamento} em andamento`,
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Equipes Ativas",
      value: stats.totalEquipes,
      description: "Trabalhando nas obras",
      icon: UserCheck,
      color: "text-success",
    },
    {
      title: "Tarefas Ativas",
      value: stats.tarefasPendentes,
      description: "Pendentes/Em andamento",
      icon: ClipboardList,
      color: "text-warning",
    },
    {
      title: "Profissionais",
      value: stats.totalProfissionais,
      description: "Cadastrados na plataforma",
      icon: Users,
      color: "text-accent",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral das suas obras, equipes e tarefas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {loading ? "..." : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Suas Obras</CardTitle>
              <CardDescription>
                Gerencie projetos de construção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/obras">
                <Button className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  Ver Obras
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Diretório de Profissionais</CardTitle>
              <CardDescription>
                Encontre e gerencie profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/profissionais">
                <Button className="w-full" variant="secondary">
                  <Users className="h-4 w-4 mr-2" />
                  Ver Profissionais
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
