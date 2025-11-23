import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeleteProfessional = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [taskCount, setTaskCount] = useState(0);

  const checkProfessionalTasks = async (profissionalId: string) => {
    // Check if professional has active tasks
    const { data: obraProfissionais } = await supabase
      .from("obra_profissionais")
      .select("obra_id")
      .eq("profissional_id", profissionalId);

    if (!obraProfissionais || obraProfissionais.length === 0) {
      setTaskCount(0);
      return 0;
    }

    // Check for tasks assigned to this professional through equipes
    const { data: equipeProfissionais } = await supabase
      .from("equipe_profissionais")
      .select("equipe_id")
      .eq("profissional_id", profissionalId)
      .is("data_saida", null);

    if (!equipeProfissionais || equipeProfissionais.length === 0) {
      setTaskCount(0);
      return 0;
    }

    const equipeIds = equipeProfissionais.map((ep) => ep.equipe_id);

    const { data: tarefas, error } = await supabase
      .from("tarefas")
      .select("id")
      .in("equipe_id", equipeIds)
      .neq("status", "concluida");

    const count = tarefas?.length || 0;
    setTaskCount(count);
    return count;
  };

  const deleteProfessional = async (profissionalId: string) => {
    setLoading(true);

    try {
      // Soft delete - set deleted flag to true
      const { error } = await supabase
        .from("profissionais")
        .update({ deleted: true })
        .eq("id", profissionalId);

      if (error) throw error;

      toast({
        title: "Profissional removido",
        description: "O profissional foi removido do diretório com sucesso.",
      });

      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover profissional",
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    taskCount,
    checkProfessionalTasks,
    deleteProfessional,
  };
};
