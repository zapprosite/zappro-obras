import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut, Mail, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const PendingRole = () => {
  const { user, signOut } = useAuth();
  const { refetch } = useUserRole();
  const [canSelfAssign, setCanSelfAssign] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [accountAge, setAccountAge] = useState<string>("");

  useEffect(() => {
    const checkSelfAssign = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase.rpc('can_self_assign_role', { _user_id: user.id });
      if (!error && data) {
        setCanSelfAssign(true);
      }

      // Calculate account age
      if (user.created_at) {
        const created = new Date(user.created_at);
        const now = new Date();
        const hours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
        if (hours < 24) {
          setAccountAge(`${24 - hours} horas restantes`);
        }
      }
    };

    checkSelfAssign();
  }, [user?.id, user?.created_at]);

  const handleSelfAssign = async () => {
    if (!user?.id) return;
    
    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'civil_engineer' });

      if (error) throw error;

      toast.success("Função atribuída com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error("Erro ao atribuir função: " + error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-lg shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Aguardando Aprovação</CardTitle>
          <CardDescription className="text-base">
            Sua conta foi criada com sucesso, mas você ainda não possui uma função atribuída.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">
                Tempo estimado de aprovação: <strong>24-48 horas</strong>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Um administrador precisa atribuir uma função à sua conta antes que você possa acessar a plataforma.
            </p>
          </div>

          {/* Self-Assign Option */}
          {canSelfAssign && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Auto-atribuição disponível</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sua conta tem mais de 24 horas. Você pode se atribuir a função de Engenheiro Civil automaticamente.
              </p>
              <Button 
                onClick={handleSelfAssign} 
                disabled={isAssigning}
                className="w-full"
              >
                {isAssigning ? "Atribuindo..." : "Tornar-me Engenheiro Civil"}
              </Button>
            </div>
          )}

          {!canSelfAssign && accountAge && (
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">
                Auto-atribuição disponível em: <strong>{accountAge}</strong>
              </p>
            </div>
          )}

          {/* Contact Admin */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Precisa de acesso urgente? Entre em contato:
            </p>
            <a 
              href="mailto:admin@cloudready.com" 
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              <Mail className="h-4 w-4" />
              admin@cloudready.com
            </a>
          </div>

          {/* FAQ Section */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Por que preciso de aprovação?
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                A aprovação garante que apenas usuários autorizados acessem os dados do projeto. 
                Isso protege informações confidenciais sobre orçamentos, equipes e cronogramas.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Quais são as funções disponíveis?
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Engenheiro Civil:</strong> Acesso total a projetos, orçamentos e equipes</li>
                  <li><strong>Líder de Equipe:</strong> Acesso ao projeto atribuído e tarefas da equipe</li>
                  <li><strong>Administrador:</strong> Gerenciamento de usuários e configurações do sistema</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Posso solicitar uma função específica?
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Sim! Entre em contato com o administrador pelo email acima informando qual função você precisa 
                e o motivo. Inclua seu email de cadastro na mensagem.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingRole;
