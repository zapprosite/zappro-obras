export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_metrics: {
        Row: {
          created_at: string
          id: string
          month: string
          obra_id: string
          profit_margin_percent: number | null
          rework_tasks_count: number | null
          total_budget: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          obra_id: string
          profit_margin_percent?: number | null
          rework_tasks_count?: number | null
          total_budget?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          obra_id?: string
          profit_margin_percent?: number | null
          rework_tasks_count?: number | null
          total_budget?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_metrics_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      clt_payroll: {
        Row: {
          created_at: string
          decimo_terceiro_accrual: number | null
          fgts: number
          gross_salary: number
          id: string
          inss: number
          irrf: number
          month: string
          net_salary: number
          profissional_id: string
          user_id: string
          vacation_days_accrued: number | null
        }
        Insert: {
          created_at?: string
          decimo_terceiro_accrual?: number | null
          fgts?: number
          gross_salary?: number
          id?: string
          inss?: number
          irrf?: number
          month: string
          net_salary?: number
          profissional_id: string
          user_id: string
          vacation_days_accrued?: number | null
        }
        Update: {
          created_at?: string
          decimo_terceiro_accrual?: number | null
          fgts?: number
          gross_salary?: number
          id?: string
          inss?: number
          irrf?: number
          month?: string
          net_salary?: number
          profissional_id?: string
          user_id?: string
          vacation_days_accrued?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clt_payroll_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          obra_id: string
          upload_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          obra_id: string
          upload_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          obra_id?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      equipe_profissionais: {
        Row: {
          created_at: string
          data_entrada: string
          data_saida: string | null
          equipe_id: string
          id: string
          profissional_id: string
        }
        Insert: {
          created_at?: string
          data_entrada?: string
          data_saida?: string | null
          equipe_id: string
          id?: string
          profissional_id: string
        }
        Update: {
          created_at?: string
          data_entrada?: string
          data_saida?: string | null
          equipe_id?: string
          id?: string
          profissional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipe_profissionais_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipe_profissionais_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes: {
        Row: {
          created_at: string
          deleted: boolean | null
          descricao: string | null
          dias_trabalho: string[] | null
          horario_fim: string
          horario_inicio: string
          id: string
          nome: string
          obra_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted?: boolean | null
          descricao?: string | null
          dias_trabalho?: string[] | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          nome: string
          obra_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted?: boolean | null
          descricao?: string | null
          dias_trabalho?: string[] | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          nome?: string
          obra_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          contato: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contato?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contato?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          created_at: string
          custo_total: number | null
          custo_unitario: number | null
          deleted: boolean | null
          fornecedor_id: string | null
          id: string
          nome: string
          observacoes: string | null
          quantidade: number
          status: string
          tarefa_id: string
          unidade: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custo_total?: number | null
          custo_unitario?: number | null
          deleted?: boolean | null
          fornecedor_id?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          quantidade?: number
          status?: string
          tarefa_id: string
          unidade?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custo_total?: number | null
          custo_unitario?: number | null
          deleted?: boolean | null
          fornecedor_id?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          quantidade?: number
          status?: string
          tarefa_id?: string
          unidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      obra_profissionais: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          obra_id: string
          profissao_id: string | null
          profissional_id: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          obra_id: string
          profissao_id?: string | null
          profissional_id: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          obra_id?: string
          profissao_id?: string | null
          profissional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "obra_profissionais_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_profissionais_profissao_id_fkey"
            columns: ["profissao_id"]
            isOneToOne: false
            referencedRelation: "profissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_profissionais_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          deleted: boolean | null
          descricao: string | null
          id: string
          nome: string
          orcamento: number | null
          status: Database["public"]["Enums"]["obra_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          deleted?: boolean | null
          descricao?: string | null
          id?: string
          nome: string
          orcamento?: number | null
          status?: Database["public"]["Enums"]["obra_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          deleted?: boolean | null
          descricao?: string | null
          id?: string
          nome?: string
          orcamento?: number | null
          status?: Database["public"]["Enums"]["obra_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "obras_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_tasks: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pj_invoices: {
        Row: {
          created_at: string
          gross_value: number
          id: string
          inss_prolabore: number | null
          invoice_date: string
          invoice_number: string
          irrf: number | null
          iss: number | null
          net_value: number
          payment_date: string | null
          profissional_id: string
          service_description: string | null
          taxes_paid: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          gross_value?: number
          id?: string
          inss_prolabore?: number | null
          invoice_date: string
          invoice_number: string
          irrf?: number | null
          iss?: number | null
          net_value?: number
          payment_date?: string | null
          profissional_id: string
          service_description?: string | null
          taxes_paid?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          gross_value?: number
          id?: string
          inss_prolabore?: number | null
          invoice_date?: string
          invoice_number?: string
          irrf?: number | null
          iss?: number | null
          net_value?: number
          payment_date?: string | null
          profissional_id?: string
          service_description?: string | null
          taxes_paid?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pj_invoices_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          plano: Database["public"]["Enums"]["user_plan"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nome: string
          plano?: Database["public"]["Enums"]["user_plan"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          plano?: Database["public"]["Enums"]["user_plan"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          created_at: string
          deleted: boolean | null
          disponivel: boolean | null
          email: string | null
          id: string
          nome: string
          profissao_principal: string
          rating: number | null
          salario_mensal: number | null
          skills: string[] | null
          telefone: string | null
          tipo_contratacao: string | null
          updated_at: string
          user_id: string | null
          valor_hora: number | null
        }
        Insert: {
          created_at?: string
          deleted?: boolean | null
          disponivel?: boolean | null
          email?: string | null
          id?: string
          nome: string
          profissao_principal: string
          rating?: number | null
          salario_mensal?: number | null
          skills?: string[] | null
          telefone?: string | null
          tipo_contratacao?: string | null
          updated_at?: string
          user_id?: string | null
          valor_hora?: number | null
        }
        Update: {
          created_at?: string
          deleted?: boolean | null
          disponivel?: boolean | null
          email?: string | null
          id?: string
          nome?: string
          profissao_principal?: string
          rating?: number | null
          salario_mensal?: number | null
          skills?: string[] | null
          telefone?: string | null
          tipo_contratacao?: string | null
          updated_at?: string
          user_id?: string | null
          valor_hora?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profissoes: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          obra_id: string
          quantidade_necessaria: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          obra_id: string
          quantidade_necessaria?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          obra_id?: string
          quantidade_necessaria?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profissoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      registros_ponto: {
        Row: {
          created_at: string
          data: string
          hora_entrada: string | null
          hora_saida: string | null
          horas_trabalhadas: number | null
          id: string
          obra_id: string
          observacoes: string | null
          profissional_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          hora_entrada?: string | null
          hora_saida?: string | null
          horas_trabalhadas?: number | null
          id?: string
          obra_id: string
          observacoes?: string | null
          profissional_id: string
        }
        Update: {
          created_at?: string
          data?: string
          hora_entrada?: string | null
          hora_saida?: string | null
          horas_trabalhadas?: number | null
          id?: string
          obra_id?: string
          observacoes?: string | null
          profissional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_ponto_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_ponto_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          deleted: boolean | null
          descricao: string | null
          equipe_id: string | null
          id: string
          obra_id: string
          observacoes: string | null
          prioridade: string
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          deleted?: boolean | null
          descricao?: string | null
          equipe_id?: string | null
          id?: string
          obra_id: string
          observacoes?: string | null
          prioridade?: string
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          deleted?: boolean | null
          descricao?: string | null
          equipe_id?: string | null
          id?: string
          obra_id?: string
          observacoes?: string | null
          prioridade?: string
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      obra_status:
        | "planning"
        | "in_progress"
        | "paused"
        | "completed"
        | "cancelled"
      user_plan: "free" | "basic" | "premium" | "enterprise"
      user_status: "active" | "inactive" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      obra_status: [
        "planning",
        "in_progress",
        "paused",
        "completed",
        "cancelled",
      ],
      user_plan: ["free", "basic", "premium", "enterprise"],
      user_status: ["active", "inactive", "suspended"],
    },
  },
} as const
