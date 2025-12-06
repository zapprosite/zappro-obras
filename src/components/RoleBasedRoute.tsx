import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  fallbackPath?: string;
}

export const RoleBasedRoute = ({
  children,
  allowedRoles,
  fallbackPath = "/pending-role",
}: RoleBasedRouteProps) => {
  const { role, loading, hasNoRole } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasNoRole) {
    return <Navigate to="/pending-role" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
