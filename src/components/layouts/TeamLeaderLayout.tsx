import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  LogOut,
  FileText,
  Calendar
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { APP_NAME } from "@/constants/branding";

interface TeamLeaderLayoutProps {
  children: ReactNode;
}

export const TeamLeaderLayout = ({ children }: TeamLeaderLayoutProps) => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Meu Painel", href: "/leader/dashboard", icon: LayoutDashboard },
    { name: "Tarefas", href: "/leader/tasks", icon: ClipboardList },
    { name: "Equipe", href: "/leader/team", icon: Users },
    { name: "Cronograma", href: "/leader/schedule", icon: Calendar },
    { name: "Documentos", href: "/leader/documents", icon: FileText },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/leader/dashboard" className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3">
                  <Building2 className="h-5 w-5 text-amber-500" />
                </div>
                <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
              </Link>
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-amber-500/10 text-amber-500"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="hidden sm:flex bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                Líder de Equipe
              </Badge>
              <span className="text-sm text-muted-foreground hidden lg:block">
                {user?.email}
              </span>
              <ThemeSwitcher />
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
