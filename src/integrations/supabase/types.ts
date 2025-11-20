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
          disponivel: boolean | null
          email: string | null
          id: string
          nome: string
          profissao_principal: string
          rating: number | null
          skills: string[] | null
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          disponivel?: boolean | null
          email?: string | null
          id?: string
          nome: string
          profissao_principal: string
          rating?: number | null
          skills?: string[] | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          disponivel?: boolean | null
          email?: string | null
          id?: string
          nome?: string
          profissao_principal?: string
          rating?: number | null
          skills?: string[] | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
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
