import { Droppable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanTaskCard } from "./KanbanTaskCard";
import type { TarefaKanban, TarefaLane } from "@/types/kanban";
import { LANE_LABELS, LANE_COLORS } from "@/types/kanban";

interface KanbanColumnProps {
  lane: TarefaLane;
  tasks: TarefaKanban[];
  onTaskEdit: (task: TarefaKanban) => void;
  onTaskDelete: (task: TarefaKanban) => void;
  onCreateTask: (lane: TarefaLane) => void;
}

const COLUMN_STYLES: Record<TarefaLane, string> = {
  backlog: "bg-muted/30 border-muted",
  todo: "bg-blue-500/5 border-blue-500/20",
  doing: "bg-amber-500/5 border-amber-500/20",
  done: "bg-green-500/5 border-green-500/20",
  blocked: "bg-red-500/5 border-red-500/20",
};

export function KanbanColumn({
  lane,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onCreateTask,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full min-w-[280px] flex-1">
      {/* Column Header */}
      <div className={cn(
        "rounded-t-lg border-2 border-b-0 p-3 flex items-center justify-between",
        COLUMN_STYLES[lane]
      )}>
        <div className="flex items-center gap-2">
          <h3 className={cn("font-semibold text-sm", LANE_COLORS[lane])}>
            {LANE_LABELS[lane]}
          </h3>
          <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onCreateTask(lane)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={lane}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 border-2 rounded-b-lg p-3 space-y-3 overflow-y-auto min-h-[500px]",
              "transition-colors",
              COLUMN_STYLES[lane],
              snapshot.isDraggingOver && "bg-primary/10 border-primary"
            )}
          >
            {tasks.map((task, index) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
              />
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p className="text-sm">Nenhuma tarefa</p>
                <p className="text-xs mt-1">Arraste tarefas aqui</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
