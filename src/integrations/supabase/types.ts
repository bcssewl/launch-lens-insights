export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audio_recordings: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          processing_status: string
          transcription_completed_at: string | null
          transcription_text: string | null
          updated_at: string
          user_id: string
          validation_id: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          processing_status?: string
          transcription_completed_at?: string | null
          transcription_text?: string | null
          updated_at?: string
          user_id: string
          validation_id?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          processing_status?: string
          transcription_completed_at?: string | null
          transcription_text?: string | null
          updated_at?: string
          user_id?: string
          validation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_recordings_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "idea_validations"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_documents: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      canvas_versions: {
        Row: {
          content: string
          created_at: string
          created_by_user: boolean
          document_id: string
          id: string
          title: string
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by_user?: boolean
          document_id: string
          id?: string
          title: string
          version_number: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by_user?: boolean
          document_id?: string
          id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "canvas_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "canvas_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      idea_validations: {
        Row: {
          archived_at: string | null
          created_at: string
          form_data: Json
          id: string
          idea_name: string
          one_line_description: string
          problem_statement: string
          processed_at: string | null
          solution_description: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          form_data: Json
          id?: string
          idea_name: string
          one_line_description: string
          problem_statement: string
          processed_at?: string | null
          solution_description: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          form_data?: Json
          id?: string
          idea_name?: string
          one_line_description?: string
          problem_statement?: string
          processed_at?: string | null
          solution_description?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_canvas_documents: {
        Row: {
          created_at: string
          created_by: string
          document_id: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          document_id: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          document_id?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_canvas_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "canvas_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_chat_history: {
        Row: {
          created_at: string
          id: string
          message: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "n8n_chat_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_deck_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          processing_status: string
          transcription_completed_at: string | null
          transcription_text: string | null
          updated_at: string
          user_id: string
          validation_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          processing_status?: string
          transcription_completed_at?: string | null
          transcription_text?: string | null
          updated_at?: string
          user_id: string
          validation_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          processing_status?: string
          transcription_completed_at?: string | null
          transcription_text?: string | null
          updated_at?: string
          user_id?: string
          validation_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_shares: {
        Row: {
          access_level: string
          created_at: string
          expires_at: string | null
          id: string
          report_id: string
          share_token: string | null
          shared_by: string
          shared_with: string | null
          updated_at: string
        }
        Insert: {
          access_level: string
          created_at?: string
          expires_at?: string | null
          id?: string
          report_id: string
          share_token?: string | null
          shared_by: string
          shared_with?: string | null
          updated_at?: string
        }
        Update: {
          access_level?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          report_id?: string
          share_token?: string | null
          shared_by?: string
          shared_with?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_shares_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "validation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_reports: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          overall_score: number | null
          recommendation: string | null
          report_data: Json
          status: string
          updated_at: string
          validation_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          overall_score?: number | null
          recommendation?: string | null
          report_data?: Json
          status?: string
          updated_at?: string
          validation_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          overall_score?: number | null
          recommendation?: string | null
          report_data?: Json
          status?: string
          updated_at?: string
          validation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_reports_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "idea_validations"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          referral_source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          referral_source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          referral_source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_report_share: {
        Args: {
          p_report_id: string
          p_shared_with?: string
          p_access_level?: string
          p_expires_in_days?: number
        }
        Returns: {
          share_id: string
          share_token: string
          share_url: string
        }[]
      }
      get_shared_report: {
        Args: { p_share_token: string }
        Returns: {
          report_id: string
          validation_id: string
          status: string
          overall_score: number
          recommendation: string
          completed_at: string
          created_at: string
          report_data: Json
          idea_name: string
          one_line_description: string
          access_level: string
          expires_at: string
        }[]
      }
      verify_user: {
        Args: { jwt_token: string } | { user_id: string }
        Returns: {
          id: string
          email: string
          full_name: string
          created_at: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
