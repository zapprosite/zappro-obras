import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  LogOut,
  FileText,
  Settings,
  UserCog,
  DollarSign
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { APP_NAME } from "@/constants/branding";

interface EngineerLayoutProps {
  children: ReactNode;
}

export const EngineerLayout = ({ children }: EngineerLayoutProps) => {
  const { signOut, user } = useAuth();
  const { isAdmin } = useUserRole();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/engineer/dashboard", icon: LayoutDashboard },
    { name: "Projetos", href: "/engineer/projects", icon: Building2 },
    { name: "Equipes", href: "/engineer/teams", icon: Users },
    { name: "Financeiro", href: "/engineer/finance", icon: DollarSign },
    { name: "Relatórios", href: "/engineer/reports", icon: FileText },
  ];

  const adminNav = isAdmin ? [
    { name: "Usuários", href: "/engineer/users", icon: UserCog },
  ] : [];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/engineer/dashboard" className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
              </Link>
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {[...navigation, ...adminNav].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
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
              <Badge variant="secondary" className="hidden sm:flex">
                Engenheiro Civil
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
