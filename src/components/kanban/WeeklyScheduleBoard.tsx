import { useState, useEffect, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startOfWeek, addDays, isSameDay, setHours, setMinutes, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { fetchTarefasByObra, updateTarefaPosition, createTarefa } from "@/services/tarefaService";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { ScheduleFiltersBar } from "./ScheduleFiltersBar";
import { ScheduleTaskCard } from "./ScheduleTaskCard";
import { EditTarefaModal } from "./EditTarefaModal";
import { CreateTarefaModal } from "./CreateTarefaModal";
import type { TarefaKanban, Equipe, TarefaLane, DayColumn } from "@/types/kanban";
import { TIME_SLOTS, DAY_NAMES, WORKING_DAYS, WORK_HOURS_START } from "@/types/kanban";

interface WeeklyScheduleBoardProps {
  obraId: string;
}

export function WeeklyScheduleBoard({ obraId }: WeeklyScheduleBoardProps) {
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<TarefaKanban[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTarefa, setSelectedTarefa] = useState<TarefaKanban | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSlot, setCreateSlot] = useState<{ date: Date; hour: number } | null>(null);

  // Filters
  const [selectedEquipe, setSelectedEquipe] = useState("all");
  const [selectedLane, setSelectedLane] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOverdue, setShowOverdue] = useState(false);

  // Calculate week days (Mon-Sat)
  const weekDays = useMemo((): DayColumn[] => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return WORKING_DAYS.map((dayIndex) => {
      const date = addDays(weekStart, dayIndex - 1);
      return {
        date,
        dayName: DAY_NAMES[dayIndex],
        dayNumber: date.getDate(),
        isToday: isSameDay(date, new Date()),
      };
    });
  }, [currentWeek]);

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

  // Get tasks for a specific cell
  const getTasksForCell = useCallback(
    (date: Date, hour: number): TarefaKanban[] => {
      return filteredTarefas.filter((tarefa) => {
        if (!tarefa.data_inicio) return false;
        const taskDate = new Date(tarefa.data_inicio);
        return isSameDay(taskDate, date) && taskDate.getHours() === hour;
      });
    },
    [filteredTarefas]
  );

  // Backlog tasks (no date assigned)
  const backlogTarefas = useMemo(() => {
    return filteredTarefas.filter((tarefa) => !tarefa.data_inicio);
  }, [filteredTarefas]);

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const tarefa = tarefas.find((t) => t.id === draggableId);
    if (!tarefa) return;

    // Parse destination droppable ID
    // Format: "cell-{dayIndex}-{hour}" or "backlog"
    let newDataInicio: string | null = null;
    let newDataFim: string | null = null;

    if (destination.droppableId !== "backlog") {
      const [, dayIndexStr, hourStr] = destination.droppableId.split("-");
      const dayIndex = parseInt(dayIndexStr, 10);
      const hour = parseInt(hourStr, 10);
      const targetDate = weekDays[dayIndex].date;

      const startDate = setMinutes(setHours(targetDate, hour), 0);
      const endDate = setMinutes(setHours(targetDate, hour + 1), 0);

      newDataInicio = startDate.toISOString();
      newDataFim = endDate.toISOString();
    }

    // Optimistic update
    setTarefas((prev) =>
      prev.map((t) =>
        t.id === draggableId
          ? { ...t, data_inicio: newDataInicio, data_fim: newDataFim, sort_order: destination.index }
          : t
      )
    );

    try {
      await updateTarefaPosition(draggableId, {
        data_inicio: newDataInicio,
        data_fim: newDataFim,
        sort_order: destination.index,
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

  // Handle task click
  const handleTaskClick = (tarefa: TarefaKanban) => {
    setSelectedTarefa(tarefa);
    setEditModalOpen(true);
  };

  // Handle create task in slot
  const handleCreateInSlot = (date: Date, hour: number) => {
    setCreateSlot({ date, hour });
    setCreateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando cronograma...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4">
          {/* Backlog Column */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-foreground">
                  Backlog ({backlogTarefas.length})
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setCreateSlot(null);
                    setCreateModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Droppable droppableId="backlog">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "space-y-2 min-h-[200px] transition-colors rounded-md p-1",
                      snapshot.isDraggingOver && "bg-primary/10"
                    )}
                  >
                    {backlogTarefas.map((tarefa, index) => (
                      <ScheduleTaskCard
                        key={tarefa.id}
                        task={tarefa}
                        index={index}
                        onClick={handleTaskClick}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row - Days */}
              <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
                <div className="h-12" /> {/* Time column header */}
                {weekDays.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={cn(
                      "h-12 flex flex-col items-center justify-center rounded-t-lg",
                      day.isToday
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="text-sm font-semibold">{day.dayName}</span>
                    <span className="text-xs">{day.dayNumber}</span>
                  </div>
                ))}
              </div>

              {/* Time Rows */}
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot.hour}
                  className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1"
                >
                  {/* Time Label */}
                  <div className="h-20 flex items-start justify-end pr-2 pt-1">
                    <span className="text-xs text-muted-foreground font-medium">
                      {slot.label}
                    </span>
                  </div>

                  {/* Day Cells */}
                  {weekDays.map((day, dayIndex) => {
                    const cellTasks = getTasksForCell(day.date, slot.hour);
                    const droppableId = `cell-${dayIndex}-${slot.hour}`;

                    return (
                      <Droppable key={droppableId} droppableId={droppableId}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "h-20 border border-border rounded-md p-1 overflow-y-auto",
                              "transition-colors group relative",
                              snapshot.isDraggingOver && "bg-primary/10 border-primary",
                              day.isToday && "bg-primary/5"
                            )}
                          >
                            {cellTasks.map((tarefa, index) => (
                              <ScheduleTaskCard
                                key={tarefa.id}
                                task={tarefa}
                                index={index}
                                onClick={handleTaskClick}
                              />
                            ))}
                            {provided.placeholder}

                            {/* Add button on hover */}
                            {cellTasks.length === 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleCreateInSlot(day.date, slot.hour)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
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
        initialSlot={createSlot}
        onSuccess={fetchData}
      />
    </div>
  );
}
