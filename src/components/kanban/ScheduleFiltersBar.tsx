import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Search, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Equipe, TarefaLane } from "@/types/kanban";
import { LANE_LABELS } from "@/types/kanban";

interface ScheduleFiltersBarProps {
  equipes: Equipe[];
  selectedEquipe: string;
  onEquipeChange: (value: string) => void;
  selectedLane: string;
  onLaneChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showOverdue: boolean;
  onShowOverdueChange: (value: boolean) => void;
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  hideWeekNavigation?: boolean;
}

export function ScheduleFiltersBar({
  equipes,
  selectedEquipe,
  onEquipeChange,
  selectedLane,
  onLaneChange,
  searchQuery,
  onSearchChange,
  showOverdue,
  onShowOverdueChange,
  currentWeek,
  onWeekChange,
  hideWeekNavigation = false,
}: ScheduleFiltersBarProps) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const goToPreviousWeek = () => onWeekChange(subWeeks(currentWeek, 1));
  const goToNextWeek = () => onWeekChange(addWeeks(currentWeek, 1));
  const goToCurrentWeek = () => onWeekChange(new Date());

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      {!hideWeekNavigation && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              <Calendar className="h-4 w-4 mr-2" />
              Hoje
            </Button>
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-foreground">
              {format(weekStart, "d 'de' MMMM", { locale: ptBR })} -{" "}
              {format(weekEnd, "d 'de' MMMM, yyyy", { locale: ptBR })}
            </h3>
          </div>

          <div className="w-[120px]" /> {/* Spacer for alignment */}
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Equipe Filter */}
        <Select value={selectedEquipe} onValueChange={onEquipeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas as equipes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as equipes</SelectItem>
            {equipes.map((equipe) => (
              <SelectItem key={equipe.id} value={equipe.id}>
                {equipe.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lane Filter */}
        <Select value={selectedLane} onValueChange={onLaneChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {(Object.entries(LANE_LABELS) as [TarefaLane, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Overdue Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="show-overdue"
            checked={showOverdue}
            onCheckedChange={onShowOverdueChange}
          />
          <Label htmlFor="show-overdue" className="text-sm text-muted-foreground cursor-pointer">
            Atrasadas
          </Label>
        </div>
      </div>
    </div>
  );
}
