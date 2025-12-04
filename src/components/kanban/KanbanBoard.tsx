import { useState, useEffect, useCallback, useMemo } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchTarefasByObra, updateTarefa, deleteTarefa } from "@/services/tarefaService";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { ScheduleFiltersBar } from "./ScheduleFiltersBar";
import { KanbanColumn } from "./KanbanColumn";
import { EditTarefaModal } from "./EditTarefaModal";
import { CreateTarefaModal } from "./CreateTarefaModal";
import { KanbanSkeleton } from "@/components/ui/skeleton-loaders";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { TarefaKanban, Equipe, TarefaLane } from "@/types/kanban";

interface KanbanBoardProps {
  obraId: string;
}

const LANES: TarefaLane[] = ["backlog", "todo", "doing", "done", "blocked"];

export function KanbanBoard({ obraId }: KanbanBoardProps) {
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<TarefaKanban[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarefa, setSelectedTarefa] = useState<TarefaKanban | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tarefaToDelete, setTarefaToDelete] = useState<TarefaKanban | null>(null);
  const [createLane, setCreateLane] = useState<TarefaLane>("backlog");

  // Filters
  const [selectedEquipe, setSelectedEquipe] = useState("all");
  const [selectedLane, setSelectedLane] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOverdue, setShowOverdue] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [tarefasData, equipesData] = await Promise.all([
        fetchTarefasByObra(obraId),
        supabase
          .from("equipes")
          .select("*")
          .eq("obra_id", obraId)
          .eq("deleted", false)
          .order("nome"),
      ]);

      setTarefas(tarefasData);
      setEquipes((equipesData.data as Equipe[]) || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [obraId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useRealtimeSubscription("tarefas", fetchData, [obraId]);

  // Filter tasks
  const filteredTarefas = useMemo(() => {
    return tarefas.filter((tarefa) => {
      if (selectedEquipe !== "all" && tarefa.equipe_id !== selectedEquipe) return false;
      if (selectedLane !== "all" && tarefa.lane !== selectedLane) return false;
      if (searchQuery && !tarefa.titulo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (showOverdue && tarefa.data_fim) {
        const endDate = new Date(tarefa.data_fim);
        if (endDate >= new Date() || tarefa.lane === "done") return false;
      }
      return true;
    });
  }, [tarefas, selectedEquipe, selectedLane, searchQuery, showOverdue]);

  // Group tasks by lane
  const tasksByLane = useMemo(() => {
    const grouped: Record<TarefaLane, TarefaKanban[]> = {
      backlog: [],
      todo: [],
      doing: [],
      done: [],
      blocked: [],
    };

    filteredTarefas.forEach((tarefa) => {
      grouped[tarefa.lane].push(tarefa);
    });

    // Sort by sort_order within each lane
    Object.keys(grouped).forEach((lane) => {
      grouped[lane as TarefaLane].sort((a, b) => a.sort_order - b.sort_order);
    });

    return grouped;
  }, [filteredTarefas]);

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const tarefa = tarefas.find((t) => t.id === draggableId);
    if (!tarefa) return;

    const sourceLane = source.droppableId as TarefaLane;
    const destinationLane = destination.droppableId as TarefaLane;

    // Create new tasks array
    const newTarefas = Array.from(tarefas);
    const taskIndex = newTarefas.findIndex((t) => t.id === draggableId);
    
    if (taskIndex === -1) return;

    // Update the task
    newTarefas[taskIndex] = {
      ...newTarefas[taskIndex],
      lane: destinationLane,
      sort_order: destination.index,
    };

    // Auto-update status based on lane
    let newStatus = tarefa.status;
    if (destinationLane === "done") newStatus = "concluida";
    else if (destinationLane === "doing") newStatus = "em_andamento";
    else if (destinationLane === "blocked") newStatus = "cancelada";
    else if (destinationLane === "todo" || destinationLane === "backlog") newStatus = "pendente";

    if (newStatus !== tarefa.status) {
      newTarefas[taskIndex].status = newStatus;
    }

    // Optimistic update
    setTarefas(newTarefas);

    try {
      await updateTarefa(draggableId, {
        lane: destinationLane,
        sort_order: destination.index,
        status: newStatus,
      });

      toast({
        title: "Tarefa movida!",
        description: `Tarefa movida para ${destinationLane}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao mover tarefa",
        description: error.message,
      });
      fetchData();
    }
  };

  // Handle task edit
  const handleTaskEdit = (tarefa: TarefaKanban) => {
    setSelectedTarefa(tarefa);
    setEditModalOpen(true);
  };

  // Handle task delete
  const handleTaskDelete = (tarefa: TarefaKanban) => {
    setTarefaToDelete(tarefa);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!tarefaToDelete) return;

    try {
      await deleteTarefa(tarefaToDelete.id);
      toast({
        title: "Tarefa excluída!",
        description: "A tarefa foi removida com sucesso.",
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir tarefa",
        description: error.message,
      });
    } finally {
      setDeleteModalOpen(false);
      setTarefaToDelete(null);
    }
  };

  // Handle create task
  const handleCreateTask = (lane: TarefaLane) => {
    setCreateLane(lane);
    setCreateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted/20 rounded animate-pulse flex-1" />
          ))}
        </div>
        <KanbanSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <ScheduleFiltersBar
        equipes={equipes}
        selectedEquipe={selectedEquipe}
        onEquipeChange={setSelectedEquipe}
        selectedLane={selectedLane}
        onLaneChange={setSelectedLane}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showOverdue={showOverdue}
        onShowOverdueChange={setShowOverdue}
        currentWeek={new Date()}
        onWeekChange={() => {}}
        hideWeekNavigation
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
          {LANES.map((lane) => (
            <KanbanColumn
              key={lane}
              lane={lane}
              tasks={tasksByLane[lane]}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onCreateTask={handleCreateTask}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Edit Modal */}
      <EditTarefaModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        tarefa={selectedTarefa}
        equipes={equipes}
        onSuccess={fetchData}
      />

      {/* Create Modal */}
      <CreateTarefaModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        obraId={obraId}
        equipes={equipes}
        initialSlot={null}
        initialLane={createLane}
        onSuccess={fetchData}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tarefa "{tarefaToDelete?.titulo}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
