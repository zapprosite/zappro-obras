import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Material {
  id: string;
  nome: string;
  unidade: string;
  quantidade: number;
  custo_unitario: number;
  custo_total: number;
  status: "solicitado" | "recebido" | "usado";
  tarefas: {
    titulo: string;
  };
}

const statusColors: Record<string, string> = {
  solicitado: "bg-muted text-muted-foreground",
  recebido: "bg-primary text-primary-foreground",
  usado: "bg-success text-success-foreground",
};

const statusLabels: Record<string, string> = {
  solicitado: "Solicitado",
  recebido: "Recebido",
  usado: "Usado",
};

export const MateriaisTab = ({ obraId }: { obraId: string }) => {
  const { toast } = useToast();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMateriais();
  }, [obraId]);

  const fetchMateriais = async () => {
    const { data, error } = await supabase
      .from("materiais")
      .select(`
        *,
        tarefas!inner (
          titulo,
          obra_id
        )
      `)
      .eq("tarefas.obra_id", obraId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar materiais",
        description: error.message,
      });
    } else {
      setMateriais(data as any || []);
    }
    setLoading(false);
  };

  const custoTotal = materiais.reduce((acc, mat) => acc + (mat.custo_total || 0), 0);

  if (loading) {
    return <div className="text-center py-12">Carregando materiais...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Materiais da Obra</h3>
          <p className="text-sm text-muted-foreground">
            Custo total: R$ {custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {materiais.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum material cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Os materiais são cadastrados através das tarefas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {materiais.map((material) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{material.nome}</CardTitle>
                    <CardDescription>Tarefa: {material.tarefas.titulo}</CardDescription>
                  </div>
                  <Badge className={statusColors[material.status]}>
                    {statusLabels[material.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantidade</p>
                    <p className="font-medium">
                      {material.quantidade} {material.unidade}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Custo Unit.</p>
                    <p className="font-medium">
                      R$ {material.custo_unitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Custo Total</p>
                  <p className="text-lg font-bold">
                    R$ {material.custo_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
