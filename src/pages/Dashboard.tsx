import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Briefcase, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Stats {
  totalObras: number;
  obrasEmAndamento: number;
  totalProfissionais: number;
  totalProfissoes: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalObras: 0,
    obrasEmAndamento: 0,
    totalProfissionais: 0,
    totalProfissoes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const [obrasResult, profissionaisResult] = await Promise.all([
        supabase
          .from("obras")
          .select("id, status")
          .eq("user_id", user.id),
        supabase
          .from("profissionais")
          .select("id", { count: "exact", head: true }),
      ]);

      const obras = obrasResult.data || [];
      const obrasEmAndamento = obras.filter((o) => o.status === "in_progress").length;

      // Count total profissoes across all user's obras
      const { count: profissoesCount } = await supabase
        .from("profissoes")
        .select("*", { count: "exact", head: true })
        .in("obra_id", obras.map((o) => o.id));

      setStats({
        totalObras: obras.length,
        obrasEmAndamento,
        totalProfissionais: profissionaisResult.count || 0,
        totalProfissoes: profissoesCount || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  const statCards = [
    {
      title: "Total de Obras",
      value: stats.totalObras,
      description: `${stats.obrasEmAndamento} em andamento`,
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Profissionais",
      value: stats.totalProfissionais,
      description: "Cadastrados na plataforma",
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Profissões",
      value: stats.totalProfissoes,
      description: "Nas suas obras",
      icon: Briefcase,
      color: "text-success",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral das suas obras e profissionais
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
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
