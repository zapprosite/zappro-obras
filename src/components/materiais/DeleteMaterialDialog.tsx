import { useState } from "react";
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
import { Material } from "@/types/materials";

interface DeleteMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteMaterialDialog({ open, onOpenChange, material, onConfirm }: DeleteMaterialDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!material) return;
    setLoading(true);
    try {
      await onConfirm(material.id);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const custoTotal = material?.custo_total || 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Deseja realmente excluir o material <strong>"{material?.nome}"</strong>?</p>
            <p className="text-amber-500 font-medium">
              Esta ação removerá R$ {custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} do orçamento total.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir Material
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
