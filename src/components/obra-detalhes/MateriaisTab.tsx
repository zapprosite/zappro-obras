import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Download } from "lucide-react";
import { Material, CreateMaterialDTO, UpdateMaterialDTO, STATUS_LABELS, CATEGORIA_LABELS } from "@/types/materials";
import {
  fetchMateriaisByObra,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  fetchFornecedores,
  calculateMaterialStats,
} from "@/services/materialService";
import { AddMaterialModal } from "@/components/materiais/AddMaterialModal";
import { EditMaterialModal } from "@/components/materiais/EditMaterialModal";
import { DeleteMaterialDialog } from "@/components/materiais/DeleteMaterialDialog";
import { MaterialsStatsCards } from "@/components/materiais/MaterialsStatsCards";
import { MaterialsFilters } from "@/components/materiais/MaterialsFilters";
import { MaterialsTable } from "@/components/materiais/MaterialsTable";
import { MaterialsTableSkeleton } from "@/components/ui/skeleton-loaders";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { escapeCSVValue, formatDate, formatCurrency } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";

export const MateriaisTab = ({ obraId }: { obraId: string }) => {
  const { toast } = useToast();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [fornecedores, setFornecedores] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      const [materiaisData, fornecedoresData] = await Promise.all([
        fetchMateriaisByObra(obraId),
        fetchFornecedores(),
      ]);
      setMateriais(materiaisData);
      setFornecedores(fornecedoresData);
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
    loadData();
  }, [loadData]);

  // Realtime subscription for materials
  useRealtimeSubscription("materiais", loadData, [obraId]);

  const filteredMateriais = useMemo(() => {
    return materiais.filter((m) => {
      const matchesSearch = m.nome.toLowerCase().includes(search.toLowerCase());
      const matchesCategoria = categoriaFilter === "all" || m.categoria === categoriaFilter;
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesCategoria && matchesStatus;
    });
  }, [materiais, search, categoriaFilter, statusFilter]);

  const stats = useMemo(() => calculateMaterialStats(filteredMateriais), [filteredMateriais]);

  const handleCreate = async (data: CreateMaterialDTO) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const newMaterial = await createMaterial({
        ...data,
        created_by: user?.id,
      });
      setMateriais((prev) => [newMaterial, ...prev]);
      toast({
        title: "Material adicionado com sucesso!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar material",
        description: error.message,
      });
      throw error;
    }
  };

  const handleUpdate = async (id: string, data: UpdateMaterialDTO) => {
    try {
      const updated = await updateMaterial(id, data);
      setMateriais((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast({
        title: "Material atualizado com sucesso!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar material",
        description: error.message,
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial(id);
      setMateriais((prev) => prev.filter((m) => m.id !== id));
      toast({
        title: "Material removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover material",
        description: error.message,
      });
      throw error;
    }
  };

  const handleExportCSV = () => {
    const headers = ["Nome", "Categoria", "Quantidade", "Unidade", "Custo Unitário", "Custo Total", "Status", "Fornecedor", "Data Entrega Estimada"];
    const rows = filteredMateriais.map((m) => [
      escapeCSVValue(m.nome),
      escapeCSVValue(m.categoria ? CATEGORIA_LABELS[m.categoria] || m.categoria : ""),
      m.quantidade,
      escapeCSVValue(m.unidade_medida || m.unidade),
      (m.custo_unitario || 0).toFixed(2).replace(".", ","),
      (m.custo_total || 0).toFixed(2).replace(".", ","),
      escapeCSVValue(STATUS_LABELS[m.status] || m.status),
      escapeCSVValue(m.fornecedores?.nome || ""),
      formatDate(m.data_entrega_estimada),
    ]);

    // BOM for UTF-8 Excel compatibility
    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `materiais-obra-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "Materiais exportados com sucesso!" });
  };

  const clearFilters = () => {
    setSearch("");
    setCategoriaFilter("all");
    setStatusFilter("all");
  };

  if (loading) {
    return <MaterialsTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Materiais da Obra</h3>
          <p className="text-sm text-muted-foreground">
            {materiais.length} {materiais.length === 1 ? "material" : "materiais"} cadastrados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={materiais.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Material
          </Button>
        </div>
      </div>

      {/* Stats */}
      <MaterialsStatsCards
        total={stats.total}
        entregue={stats.entregue}
        pendente={stats.pendente}
      />

      {/* Filters */}
      <MaterialsFilters
        search={search}
        onSearchChange={setSearch}
        categoria={categoriaFilter}
        onCategoriaChange={setCategoriaFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      {/* Table or Empty State */}
      {materiais.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum material cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Adicione materiais para acompanhar custos e entregas da obra.
            </p>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MaterialsTable
          materiais={filteredMateriais}
          onEdit={(material) => {
            setSelectedMaterial(material);
            setEditModalOpen(true);
          }}
          onDelete={(material) => {
            setSelectedMaterial(material);
            setDeleteDialogOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <AddMaterialModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        obraId={obraId}
        fornecedores={fornecedores}
        onSubmit={handleCreate}
      />

      <EditMaterialModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        material={selectedMaterial}
        fornecedores={fornecedores}
        onSubmit={handleUpdate}
      />

      <DeleteMaterialDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        material={selectedMaterial}
        onConfirm={handleDelete}
      />
    </div>
  );
};
