import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profissionalNome: string;
  taskCount: number;
  onConfirm: () => void;
  loading: boolean;
}

export const DeleteConfirmationModal = ({
  open,
  onOpenChange,
  profissionalNome,
  taskCount,
  onConfirm,
  loading,
}: DeleteConfirmationModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deseja deletar {profissionalNome}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {taskCount > 0 ? (
              <span className="text-destructive font-medium">
                ⚠️ Este profissional tem {taskCount} tarefa{taskCount > 1 ? "s" : ""} ativa{taskCount > 1 ? "s" : ""}.
              </span>
            ) : (
              <span>Esta ação removerá o profissional do diretório.</span>
            )}
            <div className="text-muted-foreground mt-2">
              O profissional não será permanentemente excluído, apenas removido da lista.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deletando...
              </>
            ) : (
              "Deletar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
