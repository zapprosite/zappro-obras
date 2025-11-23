import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obraId: string;
  onSuccess: () => void;
}

export const DocumentUploadDialog = ({
  open,
  onOpenChange,
  obraId,
  onSuccess,
}: DocumentUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("other");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione um arquivo.",
      });
      return;
    }

    setUploading(true);

    const result = await supabaseStorageService.uploadDocument({
      obra_id: obraId,
      file: file,
      document_type: documentType as any,
    });

    if (result) {
      toast({
        title: "Documento carregado",
        description: "O documento foi carregado com sucesso.",
      });
      setFile(null);
      setDocumentType("other");
      onSuccess();
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao carregar documento",
        description: "Não foi possível carregar o documento.",
      });
    }

    setUploading(false);
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setDocumentType("other");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carregar Documento</DialogTitle>
          <DialogDescription>
            Faça upload de documentos relacionados ao projeto (PDF, imagens, Word, Excel).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Tipo de Documento</Label>
            <Select
              value={documentType}
              onValueChange={setDocumentType}
              disabled={uploading}
            >
              <SelectTrigger id="document-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contrato</SelectItem>
                <SelectItem value="budget">Orçamento</SelectItem>
                <SelectItem value="rdo">RDO</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Carregar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
