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

interface DeleteObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obraNome: string;
  onConfirm: () => void;
  loading: boolean;
}

export const DeleteObraDialog = ({
  open,
  onOpenChange,
  obraNome,
  onConfirm,
  loading,
}: DeleteObraDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja deletar {obraNome}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="text-destructive font-medium">
              ⚠️ Aviso: Todas as equipes, tarefas, materiais e documentos associados serão arquivados.
            </span>
            <div className="text-muted-foreground mt-2">
              Esta ação pode ser revertida, mas os dados não ficarão visíveis até serem restaurados.
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
              "Deletar Permanentemente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
