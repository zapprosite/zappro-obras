import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, PackageCheck, Clock } from "lucide-react";

interface MaterialsStatsCardsProps {
  total: number;
  entregue: number;
  pendente: number;
}

export function MaterialsStatsCards({ total, entregue, pendente }: MaterialsStatsCardsProps) {
  const percentEntregue = total > 0 ? (entregue / total) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orçado</p>
              <p className="text-2xl font-bold">
                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <PackageCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Materiais Entregues</p>
              <p className="text-2xl font-bold text-green-500">
                R$ {entregue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-amber-500">
                R$ {pendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso de Entrega</span>
              <span className="font-medium">{percentEntregue.toFixed(1)}%</span>
            </div>
            <Progress value={percentEntregue} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
