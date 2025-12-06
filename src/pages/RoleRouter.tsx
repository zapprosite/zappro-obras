import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

/**
 * Routes users to their appropriate dashboard based on role
 */
const RoleRouter = () => {
  const { role, loading, hasNoRole, isCivilEngineer, isTeamLeader } = useUserRole();

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

  if (isCivilEngineer) {
    return <Navigate to="/engineer/dashboard" replace />;
  }

  if (isTeamLeader) {
    return <Navigate to="/leader/dashboard" replace />;
  }

  // Fallback to pending role if no valid role
  return <Navigate to="/pending-role" replace />;
};

export default RoleRouter;
