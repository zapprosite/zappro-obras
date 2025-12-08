import { Toaster } from "@/components/ui/toaster";
import ResetPassword from "@/pages/ResetPassword";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { ThemeProvider } from "@/providers/ThemeProvider";

// Auth pages
import Auth from "./pages/Auth";
import PendingRole from "./pages/PendingRole";
import RoleRouter from "./pages/RoleRouter";

// Engineer pages
import EngineerDashboard from "./pages/engineer/EngineerDashboard";
import UserManagement from "./pages/engineer/UserManagement";

// Leader pages
import LeaderDashboard from "./pages/leader/LeaderDashboard";

// Legacy pages (will redirect based on role)
import Dashboard from "./pages/Dashboard";
import Obras from "./pages/Obras";
import ObraDetalhes from "./pages/ObraDetalhes";
import Profissionais from "./pages/Profissionais";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected: Role router */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RoleRouter />
                  </ProtectedRoute>
                }
              />
              
              {/* Pending role */}
              <Route
                path="/pending-role"
                element={
                  <ProtectedRoute>
                    <PendingRole />
                  </ProtectedRoute>
                }
              />

              {/* Engineer routes */}
              <Route
                path="/engineer/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["admin", "civil_engineer"]}>
                      <EngineerDashboard />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/engineer/projects"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["admin", "civil_engineer"]}>
                      <Obras />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/engineer/projects/:id"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["admin", "civil_engineer"]}>
                      <ObraDetalhes />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/engineer/teams"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["admin", "civil_engineer"]}>
                      <Profissionais />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/engineer/users"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["admin"]}>
                      <UserManagement />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />

              {/* Team Leader routes */}
              <Route
                path="/leader/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["team_leader"]}>
                      <LeaderDashboard />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leader/tasks"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["team_leader"]}>
                      <Obras />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />

              {/* Legacy redirects */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/obras" element={<Navigate to="/engineer/projects" replace />} />
              <Route path="/obras/:id" element={<Navigate to="/engineer/projects/:id" replace />} />
              <Route path="/profissionais" element={<Navigate to="/engineer/teams" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
