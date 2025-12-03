import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Material, UpdateMaterialDTO, CATEGORIA_LABELS, UNIDADE_OPTIONS, MaterialCategoria, MaterialStatus } from "@/types/materials";

const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(255),
  descricao: z.string().max(1000).optional().nullable(),
  categoria: z.enum(['Estrutura', 'Acabamento', 'Hidráulica', 'Elétrica', 'Outros']),
  quantidade: z.coerce.number().min(0.001, "Quantidade deve ser positiva").max(999999.999),
  unidade: z.string().min(1, "Selecione uma unidade"),
  custo_unitario: z.coerce.number().min(0.01, "Custo deve ser positivo"),
  fornecedor_id: z.string().optional().nullable(),
  data_entrega_estimada: z.date().optional().nullable(),
  data_entrega_real: z.date().optional().nullable(),
  status: z.enum(['solicitado', 'encomendado', 'em_transito', 'entregue', 'cancelado']),
  notas: z.string().max(1000).optional().nullable(),
  lote: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface EditMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
  fornecedores: { id: string; nome: string }[];
  onSubmit: (id: string, data: UpdateMaterialDTO) => Promise<void>;
}

export function EditMaterialModal({ open, onOpenChange, material, fornecedores, onSubmit }: EditMaterialModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      categoria: "Outros",
      quantidade: 1,
      unidade: "un",
      custo_unitario: 0,
      status: "solicitado",
    },
  });

  useEffect(() => {
    if (material) {
      form.reset({
        nome: material.nome,
        descricao: material.descricao,
        categoria: (material.categoria as MaterialCategoria) || "Outros",
        quantidade: material.quantidade,
        unidade: material.unidade_medida || material.unidade || "un",
        custo_unitario: material.custo_unitario || 0,
        fornecedor_id: material.fornecedor_id,
        data_entrega_estimada: material.data_entrega_estimada ? parseISO(material.data_entrega_estimada) : undefined,
        data_entrega_real: material.data_entrega_real ? parseISO(material.data_entrega_real) : undefined,
        status: material.status,
        notas: material.notas,
        lote: material.lote,
      });
    }
  }, [material, form]);

  const handleSubmit = async (data: FormData) => {
    if (!material) return;
    setLoading(true);
    try {
      await onSubmit(material.id, {
        nome: data.nome,
        descricao: data.descricao || undefined,
        categoria: data.categoria as MaterialCategoria,
        quantidade: data.quantidade,
        unidade: data.unidade,
        unidade_medida: data.unidade,
        custo_unitario: data.custo_unitario,
        fornecedor_id: data.fornecedor_id || undefined,
        data_entrega_estimada: data.data_entrega_estimada?.toISOString().split('T')[0],
        data_entrega_real: data.data_entrega_real?.toISOString().split('T')[0],
        status: data.status as MaterialStatus,
        notas: data.notas || undefined,
        lote: data.lote || undefined,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const custoTotal = (form.watch("quantidade") || 0) * (form.watch("custo_unitario") || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="solicitado">Pendente</SelectItem>
                        <SelectItem value="encomendado">Encomendado</SelectItem>
                        <SelectItem value="em_transito">Em Trânsito</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" min="0.001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIDADE_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="custo_unitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Unitário (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col justify-end">
                <FormLabel className="mb-2">Custo Total</FormLabel>
                <div className="h-10 flex items-center px-3 bg-muted rounded-md font-semibold">
                  R$ {custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <FormField
                control={form.control}
                name="fornecedor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fornecedores.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_entrega_estimada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Entrega Estimada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          locale={ptBR}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_entrega_real"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Entrega Real</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          locale={ptBR}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
