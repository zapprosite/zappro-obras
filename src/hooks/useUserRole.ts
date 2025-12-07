import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "civil_engineer" | "team_leader" | null;

interface UserRoleState {
  role: AppRole;
  loading: boolean;
  error: string | null;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [state, setState] = useState<UserRoleState>({
    role: null,
    loading: true,
    error: null,
  });
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger((prev) => prev + 1);

  useEffect(() => {
    if (!user) {
      setState({ role: null, loading: false, error: null });
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_role', { _user_id: user.id });

        if (error) throw error;

        setState({
          role: data as AppRole,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("Error fetching user role:", err);
        setState({
          role: null,
          loading: false,
          error: err.message,
        });
      }
    };

    fetchRole();

    // Subscribe to role changes
    const channel = supabase
      .channel('user-role-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchRole()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetchTrigger]);

  const isAdmin = state.role === "admin";
  const isCivilEngineer = state.role === "civil_engineer" || isAdmin;
  const isTeamLeader = state.role === "team_leader";
  const hasNoRole = !state.loading && state.role === null;

  return {
    ...state,
    isAdmin,
    isCivilEngineer,
    isTeamLeader,
    hasNoRole,
    refetch,
  };
};
