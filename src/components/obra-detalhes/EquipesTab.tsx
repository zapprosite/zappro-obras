import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Equipe {
  id: string;
  nome: string;
  horario_inicio: string;
  horario_fim: string;
  dias_trabalho: string[];
  descricao: string | null;
}

interface Profissional {
  id: string;
  nome: string;
  profissao_principal: string;
}

interface EquipeProfissional {
  id: string;
  profissional_id: string;
  profissionais: Profissional;
  data_entrada: string;
  data_saida: string | null;
}

export const EquipesTab = ({ obraId }: { obraId: string }) => {
  const { toast } = useToast();
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [equipeProfissionais, setEquipeProfissionais] = useState<Record<string, EquipeProfissional[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEquipe, setSelectedEquipe] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    horario_inicio: "08:00",
    horario_fim: "18:00",
    dias_trabalho: ["seg", "ter", "qua", "qui", "sex", "sab"],
    descricao: "",
  });
  const [selectedProfissional, setSelectedProfissional] = useState("");

  useEffect(() => {
    fetchEquipes();
    fetchProfissionais();
  }, [obraId]);

  const fetchEquipes = async () => {
    const { data, error } = await supabase
      .from("equipes")
      .select("*")
      .eq("obra_id", obraId)
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar equipes",
        description: error.message,
      });
    } else {
      setEquipes(data || []);
      data?.forEach(equipe => fetchEquipeProfissionais(equipe.id));
    }
    setLoading(false);
  };

  const fetchProfissionais = async () => {
    const { data, error } = await supabase
      .from("profissionais")
      .select("*")
      .eq("disponivel", true)
      .eq("deleted", false)
      .order("nome");

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar profissionais",
        description: error.message,
      });
    } else {
      setProfissionais(data || []);
    }
  };

  const fetchEquipeProfissionais = async (equipeId: string) => {
    const { data, error } = await supabase
      .from("equipe_profissionais")
      .select(`
        *,
        profissionais (
          id,
          nome,
          profissao_principal
        )
      `)
      .eq("equipe_id", equipeId)
      .is("data_saida", null);

    if (!error && data) {
      setEquipeProfissionais(prev => ({ ...prev, [equipeId]: data as any }));
    }
  };

  const handleCreateEquipe = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("equipes").insert([
      {
        obra_id: obraId,
        ...formData,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar equipe",
        description: error.message,
      });
    } else {
      toast({
        title: "Equipe criada!",
        description: "A equipe foi criada com sucesso.",
      });
      setDialogOpen(false);
      setFormData({
        nome: "",
        horario_inicio: "08:00",
        horario_fim: "18:00",
        dias_trabalho: ["seg", "ter", "qua", "qui", "sex", "sab"],
        descricao: "",
      });
      fetchEquipes();
    }
  };

  const handleAssignProfissional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipe || !selectedProfissional) return;

    const { error } = await supabase.from("equipe_profissionais").insert([
      {
        equipe_id: selectedEquipe,
        profissional_id: selectedProfissional,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atribuir profissional",
        description: error.message,
      });
    } else {
      toast({
        title: "Profissional atribuído!",
        description: "O profissional foi atribuído à equipe.",
      });
      setAssignDialogOpen(false);
      setSelectedProfissional("");
      fetchEquipeProfissionais(selectedEquipe);
    }
  };

  const handleRemoveProfissional = async (id: string, equipeId: string) => {
    const { error } = await supabase
      .from("equipe_profissionais")
      .update({ data_saida: new Date().toISOString().split('T')[0] })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover profissional",
        description: error.message,
      });
    } else {
      toast({
        title: "Profissional removido",
        description: "O profissional foi removido da equipe.",
      });
      fetchEquipeProfissionais(equipeId);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando equipes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Equipes da Obra</h3>
          <p className="text-sm text-muted-foreground">Gerencie as equipes e seus profissionais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Equipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateEquipe}>
              <DialogHeader>
                <DialogTitle>Criar Nova Equipe</DialogTitle>
                <DialogDescription>Preencha os dados da nova equipe</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Equipe *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horario_inicio">Horário Início</Label>
                    <Input
                      id="horario_inicio"
                      type="time"
                      value={formData.horario_inicio}
                      onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horario_fim">Horário Fim</Label>
                    <Input
                      id="horario_fim"
                      type="time"
                      value={formData.horario_fim}
                      onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
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
                <Button type="submit">Criar Equipe</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {equipes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma equipe cadastrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando a primeira equipe para esta obra
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {equipes.map((equipe) => (
            <Card key={equipe.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{equipe.nome}</CardTitle>
                    <CardDescription>
                      {equipe.horario_inicio} - {equipe.horario_fim}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEquipe(equipe.id);
                      setAssignDialogOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {equipe.descricao && (
                  <p className="text-sm text-muted-foreground">{equipe.descricao}</p>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Profissionais:</p>
                  {equipeProfissionais[equipe.id]?.length > 0 ? (
                    equipeProfissionais[equipe.id].map((ep) => (
                      <div key={ep.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{ep.profissionais.nome}</p>
                          <p className="text-xs text-muted-foreground">{ep.profissionais.profissao_principal}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveProfissional(ep.id, equipe.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum profissional atribuído</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAssignProfissional}>
            <DialogHeader>
              <DialogTitle>Atribuir Profissional</DialogTitle>
              <DialogDescription>Selecione um profissional para adicionar à equipe</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="profissional">Profissional *</Label>
              <Select value={selectedProfissional} onValueChange={setSelectedProfissional}>
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
            <DialogFooter>
              <Button type="submit">Atribuir</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
