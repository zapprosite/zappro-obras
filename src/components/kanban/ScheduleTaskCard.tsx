import { memo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TarefaKanban } from "@/types/kanban";
import { LANE_COLORS, LANE_LABELS, PRIORIDADE_COLORS, PRIORIDADE_LABELS } from "@/types/kanban";

interface ScheduleTaskCardProps {
  task: TarefaKanban;
  index: number;
  onClick: (task: TarefaKanban) => void;
}

export const ScheduleTaskCard = memo(function ScheduleTaskCard({
  task,
  index,
  onClick,
}: ScheduleTaskCardProps) {
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "bg-card border border-border rounded-md p-2 shadow-sm cursor-pointer",
            "hover:shadow-md transition-shadow duration-200",
            "group relative",
            snapshot.isDragging && "shadow-lg ring-2 ring-primary/50"
          )}
          onClick={() => onClick(task)}
        >
          <div
            {...provided.dragHandleProps}
            className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="pl-4 space-y-1.5">
            <p className="text-sm font-medium line-clamp-2 text-foreground">
              {task.titulo}
            </p>

            <div className="flex flex-wrap gap-1">
              <Badge
                variant="secondary"
                className={cn("text-xs px-1.5 py-0", LANE_COLORS[task.lane])}
              >
                {LANE_LABELS[task.lane]}
              </Badge>
              <Badge
                variant="secondary"
                className={cn("text-xs px-1.5 py-0", PRIORIDADE_COLORS[task.prioridade])}
              >
                {PRIORIDADE_LABELS[task.prioridade]}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.equipes && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {task.equipes.nome}
                </span>
              )}
              {(task.data_inicio || task.data_fim) && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(task.data_inicio)}
                  {task.data_fim && ` - ${formatTime(task.data_fim)}`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});
