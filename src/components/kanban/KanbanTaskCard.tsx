import { memo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MoreVertical, Pencil, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TarefaKanban } from "@/types/kanban";
import { PRIORIDADE_COLORS, PRIORIDADE_LABELS } from "@/types/kanban";

interface KanbanTaskCardProps {
  task: TarefaKanban;
  index: number;
  onEdit: (task: TarefaKanban) => void;
  onDelete: (task: TarefaKanban) => void;
}

export const KanbanTaskCard = memo(function KanbanTaskCard({
  task,
  index,
  onEdit,
  onDelete,
}: KanbanTaskCardProps) {
  const isOverdue = task.data_fim && new Date(task.data_fim) < new Date() && task.lane !== "done";

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-card border border-border rounded-lg p-3 shadow-sm",
            "hover:shadow-md transition-all duration-200 cursor-pointer group",
            snapshot.isDragging && "shadow-lg ring-2 ring-primary rotate-2",
            isOverdue && "border-l-4 border-l-destructive"
          )}
        >
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-2 text-foreground flex-1">
                {task.titulo}
              </h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(task)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {task.descricao && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.descricao}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1">
              <Badge
                variant="secondary"
                className={cn("text-xs px-2 py-0", PRIORIDADE_COLORS[task.prioridade])}
              >
                {PRIORIDADE_LABELS[task.prioridade]}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs px-2 py-0">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Atrasada
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {task.data_fim && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.data_fim), "dd/MM", { locale: ptBR })}
                  </span>
                )}
              </div>
              {task.equipes && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {task.equipes.nome.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});
