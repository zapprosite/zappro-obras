import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock } from "lucide-react";

interface RegistroPonto {
  id: string;
  profissional_id: string;
  data: string;
  hora_entrada: string | null;
  hora_saida: string | null;
  horas_trabalhadas: number;
  profissionais: {
    nome: string;
    profissao_principal: string;
  };
}

interface Profissional {
  id: string;
  nome: string;
  profissao_principal: string;
}

export const PontoTab = ({ obraId }: { obraId: string }) => {
  const { toast } = useToast();
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    profissional_id: "",
    data: new Date().toISOString().split("T")[0],
    hora_entrada: "",
    hora_saida: "",
  });

  useEffect(() => {
    fetchRegistros();
    fetchProfissionais();
  }, [obraId]);

  const fetchRegistros = async () => {
    const { data, error } = await supabase
      .from("registros_ponto")
      .select(`
        *,
        profissionais (
          nome,
          profissao_principal
        )
      `)
      .eq("obra_id", obraId)
      .order("data", { ascending: false })
      .order("hora_entrada", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar registros",
        description: error.message,
      });
    } else {
      setRegistros(data || []);
    }
    setLoading(false);
  };

  const fetchProfissionais = async () => {
    const { data, error } = await supabase
      .from("profissionais")
      .select("id, nome, profissao_principal")
      .eq("disponivel", true);

    if (!error && data) {
      setProfissionais(data);
    }
  };

  const handleCreateRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("registros_ponto").insert([
      {
        obra_id: obraId,
        profissional_id: formData.profissional_id,
        data: formData.data,
        hora_entrada: formData.hora_entrada || null,
        hora_saida: formData.hora_saida || null,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar registro",
        description: error.message,
      });
    } else {
      toast({
        title: "Registro criado!",
        description: "O registro de ponto foi criado com sucesso.",
      });
      setDialogOpen(false);
      setFormData({
        profissional_id: "",
        data: new Date().toISOString().split("T")[0],
        hora_entrada: "",
        hora_saida: "",
      });
      fetchRegistros();
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando registros...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Controle de Ponto</h3>
          <p className="text-sm text-muted-foreground">Registre entrada e saída dos profissionais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateRegistro}>
              <DialogHeader>
                <DialogTitle>Criar Registro de Ponto</DialogTitle>
                <DialogDescription>Registre entrada e saída de um profissional</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Profissional *</Label>
                  <Select
                    value={formData.profissional_id}
                    onValueChange={(value) => setFormData({ ...formData, profissional_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {profissionais.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.nome} - {prof.profissao_principal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hora_entrada">Hora Entrada</Label>
                    <Input
                      id="hora_entrada"
                      type="time"
                      value={formData.hora_entrada}
                      onChange={(e) => setFormData({ ...formData, hora_entrada: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora_saida">Hora Saída</Label>
                    <Input
                      id="hora_saida"
                      type="time"
                      value={formData.hora_saida}
                      onChange={(e) => setFormData({ ...formData, hora_saida: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Criar Registro</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {registros.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum registro cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece registrando o ponto dos profissionais
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(
            registros.reduce((acc, reg) => {
              if (!acc[reg.data]) acc[reg.data] = [];
              acc[reg.data].push(reg);
              return acc;
            }, {} as Record<string, RegistroPonto[]>)
          ).map(([data, regs]) => (
            <Card key={data}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {regs.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{reg.profissionais.nome}</p>
                      <p className="text-sm text-muted-foreground">{reg.profissionais.profissao_principal}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {reg.hora_entrada || "--:--"} - {reg.hora_saida || "--:--"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reg.horas_trabalhadas.toFixed(2)}h trabalhadas
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
