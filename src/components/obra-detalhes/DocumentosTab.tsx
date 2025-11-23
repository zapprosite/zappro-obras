import { useState, useEffect } from "react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { Document } from "@/types/documents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUploadDialog } from "@/components/DocumentUploadDialog";
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

interface DocumentosTabProps {
  obraId: string;
}

const documentTypeLabels: Record<string, string> = {
  contract: "Contrato",
  budget: "Orçamento",
  rdo: "RDO",
  other: "Outro",
};

export const DocumentosTab = ({ obraId }: DocumentosTabProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setLoading(true);
    const docs = await supabaseStorageService.getDocuments(obraId);
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [obraId]);

  const handleUploadSuccess = () => {
    fetchDocuments();
    setUploadDialogOpen(false);
  };

  const handleDownload = async (doc: Document) => {
    const url = await supabaseStorageService.getDocumentUrl(doc.file_path);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao baixar documento",
        description: "Não foi possível obter o link do documento.",
      });
    }
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    setDeleting(true);
    const success = await supabaseStorageService.deleteDocument(
      documentToDelete.id,
      documentToDelete.file_path
    );

    if (success) {
      toast({
        title: "Documento removido",
        description: "O documento foi removido com sucesso.",
      });
      fetchDocuments();
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao remover documento",
        description: "Não foi possível remover o documento.",
      });
    }

    setDeleting(false);
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documentos do Projeto</h3>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Carregar Documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum documento carregado ainda.</p>
              <p className="text-sm mt-1">
                Clique em "Carregar Documento" para adicionar arquivos.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">
                    {documentTypeLabels[doc.document_type]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {doc.file_name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(doc.file_size)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc.upload_date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Baixar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(doc)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        obraId={obraId}
        onSuccess={handleUploadSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja deletar este documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O documento será permanentemente
              removido do sistema.
              {documentToDelete && (
                <div className="mt-2 font-medium">
                  {documentToDelete.file_name}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
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
    </div>
  );
};
