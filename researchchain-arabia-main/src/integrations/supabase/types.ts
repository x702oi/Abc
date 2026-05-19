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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          application_status: Database["public"]["Enums"]["application_status"]
          id: string
          notes: string | null
          participant_id: string
          study_id: string
          submission_date: string
        }
        Insert: {
          application_status?: Database["public"]["Enums"]["application_status"]
          id?: string
          notes?: string | null
          participant_id: string
          study_id: string
          submission_date?: string
        }
        Update: {
          application_status?: Database["public"]["Enums"]["application_status"]
          id?: string
          notes?: string | null
          participant_id?: string
          study_id?: string
          submission_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "research_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_ledger: {
        Row: {
          blockchain_hash: string
          consent_timestamp: string
          id: string
          participant_id: string
          study_id: string
        }
        Insert: {
          blockchain_hash: string
          consent_timestamp?: string
          id?: string
          participant_id: string
          study_id: string
        }
        Update: {
          blockchain_hash?: string
          consent_timestamp?: string
          id?: string
          participant_id?: string
          study_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_ledger_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "research_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_status: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_status?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_status?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          id: string
          target_user: string | null
          timestamp: string
        }
        Insert: {
          action: string
          admin_id: string
          id?: string
          target_user?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          admin_id?: string
          id?: string
          target_user?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      fraud_reports: {
        Row: {
          bot_probability: number | null
          created_at: string
          duplicate_identity_score: number | null
          id: string
          report_reason: string
          risk_level: number
          status: string
          user_id: string
        }
        Insert: {
          bot_probability?: number | null
          created_at?: string
          duplicate_identity_score?: number | null
          id?: string
          report_reason: string
          risk_level?: number
          status?: string
          user_id: string
        }
        Update: {
          bot_probability?: number | null
          created_at?: string
          duplicate_identity_score?: number | null
          id?: string
          report_reason?: string
          risk_level?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          setting_name: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_name: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_name?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          issue: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          issue: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          issue?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          participant_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          study_id: string
          transaction_hash: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          participant_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          study_id: string
          transaction_hash: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          participant_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          study_id?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "research_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          email: string
          full_name: string
          gender: string | null
          id: string
          nationality: string | null
          trust_score: number
          updated_at: string
          wallet_balance: number
          account_status: string
          verification_status: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          email?: string
          full_name?: string
          gender?: string | null
          id: string
          nationality?: string | null
          trust_score?: number
          updated_at?: string
          wallet_balance?: number
          account_status?: string
          verification_status?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          nationality?: string | null
          trust_score?: number
          updated_at?: string
          wallet_balance?: number
          account_status?: string
          verification_status?: string
        }
        Relationships: []
      }
      research_studies: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          max_participants: number
          researcher_id: string
          reward_amount: number
          status: Database["public"]["Enums"]["study_status"]
          target_demographics: Json
          title: string
          total_participants: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          max_participants?: number
          researcher_id: string
          reward_amount?: number
          status?: Database["public"]["Enums"]["study_status"]
          target_demographics?: Json
          title: string
          total_participants?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          max_participants?: number
          researcher_id?: string
          reward_amount?: number
          status?: Database["public"]["Enums"]["study_status"]
          target_demographics?: Json
          title?: string
          total_participants?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "researcher" | "participant" | "admin"
      application_status: "pending" | "approved" | "rejected" | "completed"
      payment_status: "pending" | "processing" | "completed" | "failed"
      study_status: "draft" | "open" | "in_progress" | "completed" | "cancelled"
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
      app_role: ["researcher", "participant", "admin"],
      application_status: ["pending", "approved", "rejected", "completed"],
      payment_status: ["pending", "processing", "completed", "failed"],
      study_status: ["draft", "open", "in_progress", "completed", "cancelled"],
    },
  },
} as const
