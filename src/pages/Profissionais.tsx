import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Star, Phone, Mail, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { useDeleteProfessional } from "@/hooks/useDeleteProfessional";

interface Profissional {
  id: string;
  nome: string;
  profissao_principal: string;
  skills: string[];
  rating: number;
  telefone: string | null;
  email: string | null;
  disponivel: boolean;
}

const Profissionais = () => {
  const { toast } = useToast();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null);
  const { loading: deleteLoading, taskCount, checkProfessionalTasks, deleteProfessional } = useDeleteProfessional();
  const [formData, setFormData] = useState({
    nome: "",
    profissao_principal: "",
    skills: "",
    telefone: "",
    email: "",
  });

  const fetchProfissionais = async () => {
    const { data, error } = await supabase
      .from("profissionais")
      .select("*")
      .eq("disponivel", true)
      .eq("deleted", false)
      .order("rating", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar profissionais",
        description: error.message,
      });
    } else {
      setProfissionais(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfissionais();
  }, []);

  const handleCreateProfissional = async (e: React.FormEvent) => {
    e.preventDefault();

    const skills = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);

    const { error } = await supabase.from("profissionais").insert([
      {
        nome: formData.nome,
        profissao_principal: formData.profissao_principal,
        skills,
        telefone: formData.telefone || null,
        email: formData.email || null,
        disponivel: true,
        user_id: null,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar profissional",
        description: error.message,
      });
    } else {
      toast({
        title: "Profissional cadastrado!",
        description: "O profissional foi adicionado ao diretório.",
      });
      setDialogOpen(false);
      setFormData({
        nome: "",
        profissao_principal: "",
        skills: "",
        telefone: "",
        email: "",
      });
      fetchProfissionais();
    }
  };

  const handleDeleteClick = async (prof: Profissional) => {
    setSelectedProfissional(prof);
    await checkProfessionalTasks(prof.id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProfissional) return;
    
    const success = await deleteProfessional(selectedProfissional.id);
    if (success) {
      setDeleteModalOpen(false);
      setSelectedProfissional(null);
      fetchProfissionais();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profissionais</h1>
            <p className="text-muted-foreground mt-2">
              Diretório de profissionais disponíveis
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Profissional
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreateProfissional}>
                <DialogHeader>
                  <DialogTitle>Cadastrar Profissional</DialogTitle>
                  <DialogDescription>
                    Adicione um novo profissional ao diretório
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profissao">Profissão Principal *</Label>
                    <Input
                      id="profissao"
                      value={formData.profissao_principal}
                      onChange={(e) =>
                        setFormData({ ...formData, profissao_principal: e.target.value })
                      }
                      required
                      placeholder="Ex: Pedreiro, Eletricista, Encanador"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Habilidades</Label>
                    <Input
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="Separe por vírgulas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Cadastrar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando profissionais...</p>
          </div>
        ) : profissionais.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum profissional cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Cadastre o primeiro profissional no diretório
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profissionais.map((prof) => (
              <Card key={prof.id} className="border-border/50 hover:shadow-lg transition-shadow relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteClick(prof)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <div className="flex items-start justify-between pr-8">
                    <div>
                      <CardTitle className="text-lg">{prof.nome}</CardTitle>
                      <CardDescription>{prof.profissao_principal}</CardDescription>
                    </div>
                    {prof.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="font-medium">{prof.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prof.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {prof.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {prof.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{prof.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="space-y-1">
                    {prof.telefone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 mr-2" />
                        {prof.telefone}
                      </div>
                    )}
                    {prof.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 mr-2" />
                        {prof.email}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          profissionalNome={selectedProfissional?.nome || ""}
          taskCount={taskCount}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      </div>
    </Layout>
  );
};

export default Profissionais;
