import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { Material, STATUS_LABELS, STATUS_COLORS, CATEGORIA_LABELS, MaterialCategoria, MaterialStatus } from "@/types/materials";
import { formatDate, formatCurrency, formatNumber } from "@/lib/formatters";

type SortField = 'nome' | 'categoria' | 'quantidade' | 'custo_unitario' | 'custo_total' | 'status' | 'data_entrega_estimada';
type SortDirection = 'asc' | 'desc';

interface MaterialsTableProps {
  materiais: Material[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export function MaterialsTable({ materiais, onEdit, onDelete }: MaterialsTableProps) {
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMateriais = [...materiais].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'data_entrega_estimada') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  if (materiais.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum material encontrado com os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><SortHeader field="nome">Nome</SortHeader></TableHead>
            <TableHead><SortHeader field="categoria">Categoria</SortHeader></TableHead>
            <TableHead className="text-right"><SortHeader field="quantidade">Qtd</SortHeader></TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead className="text-right"><SortHeader field="custo_unitario">Custo Unit.</SortHeader></TableHead>
            <TableHead className="text-right"><SortHeader field="custo_total">Custo Total</SortHeader></TableHead>
            <TableHead><SortHeader field="status">Status</SortHeader></TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead><SortHeader field="data_entrega_estimada">Entrega Est.</SortHeader></TableHead>
            <TableHead className="w-[70px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMateriais.map((material) => (
            <TableRow key={material.id}>
              <TableCell className="font-medium">{material.nome}</TableCell>
              <TableCell>
                {material.categoria && CATEGORIA_LABELS[material.categoria as MaterialCategoria]}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(material.quantidade, 3)}
              </TableCell>
              <TableCell>{material.unidade_medida || material.unidade}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(material.custo_unitario)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(material.custo_total)}
              </TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[material.status as MaterialStatus]}>
                  {STATUS_LABELS[material.status as MaterialStatus]}
                </Badge>
              </TableCell>
              <TableCell>{material.fornecedores?.nome || '-'}</TableCell>
              <TableCell>{formatDate(material.data_entrega_estimada)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(material)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(material)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
