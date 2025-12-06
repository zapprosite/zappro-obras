import { useState, useEffect } from "react";
import { EngineerLayout } from "@/components/layouts/EngineerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/formatters";
import { User, UserCog, Shield, HardHat, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserWithRole {
  id: string;
  email: string;
  nome: string;
  created_at: string;
  role: string | null;
}

const UserManagement = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  const fetchUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, nome, created_at");

      if (profilesError) throw profilesError;

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Merge data
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      
      const usersWithRoles = (profiles || []).map(p => ({
        ...p,
        role: roleMap.get(p.id) || null,
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAssignRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setAssigning(true);
    try {
      const roleValue = newRole as "admin" | "civil_engineer" | "team_leader";
      
      // Check if role already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", selectedUser.id)
        .single();

      if (existing) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ 
            role: roleValue, 
            assigned_by: user?.id, 
            assigned_at: new Date().toISOString() 
          })
          .eq("user_id", selectedUser.id);

        if (error) throw error;
      } else {
        // Insert new role - use raw SQL via RPC or direct insert
        const { error } = await supabase
          .from("user_roles")
          .insert([{ 
            user_id: selectedUser.id, 
            role: roleValue, 
            assigned_by: user?.id 
          }]);

        if (error) throw error;
      }

      toast({
        title: "Função atribuída!",
        description: `${selectedUser.nome} agora é ${getRoleLabel(newRole)}.`,
      });

      setSelectedUser(null);
      setNewRole("");
      fetchUsers();
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atribuir função",
        description: error.message,
      });
    } finally {
      setAssigning(false);
    }
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case "admin": return "Administrador";
      case "civil_engineer": return "Engenheiro Civil";
      case "team_leader": return "Líder de Equipe";
      default: return "Sem Função";
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500/10 text-purple-500">Administrador</Badge>;
      case "civil_engineer":
        return <Badge className="bg-primary/10 text-primary">Engenheiro Civil</Badge>;
      case "team_leader":
        return <Badge className="bg-amber-500/10 text-amber-500">Líder de Equipe</Badge>;
      default:
        return <Badge variant="outline">Sem Função</Badge>;
    }
  };

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <EngineerLayout>
        <div className="text-center py-20">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar usuários.
          </p>
        </div>
      </EngineerLayout>
    );
  }

  return (
    <EngineerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Atribua funções aos usuários da plataforma
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Usuários Cadastrados</CardTitle>
                <CardDescription>{users.length} usuários na plataforma</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{u.nome}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getRoleBadge(u.role)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          setNewRole(u.role || "");
                        }}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        {u.role ? "Alterar" : "Atribuir"}
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum usuário encontrado</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Assignment Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Função</DialogTitle>
            <DialogDescription>
              Selecione a função para {selectedUser?.nome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Função</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil_engineer">
                    <div className="flex items-center gap-2">
                      <HardHat className="h-4 w-4" />
                      Engenheiro Civil
                    </div>
                  </SelectItem>
                  <SelectItem value="team_leader">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Líder de Equipe
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignRole} disabled={!newRole || assigning}>
              {assigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EngineerLayout>
  );
};

export default UserManagement;
