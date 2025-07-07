export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      client_file_versions: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          parent_file_id: string
          updated_at: string
          upload_date: string
          uploaded_by: string
          version_number: number
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          parent_file_id: string
          updated_at?: string
          upload_date?: string
          uploaded_by: string
          version_number: number
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          parent_file_id?: string
          updated_at?: string
          upload_date?: string
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_file_versions_parent_file_id_fkey"
            columns: ["parent_file_id"]
            isOneToOne: false
            referencedRelation: "client_files"
            referencedColumns: ["id"]
          },
        ]
      }
      client_files: {
        Row: {
          category: string | null
          client_id: string
          content_extracted_at: string | null
          content_keywords: string[] | null
          content_summary: string | null
          created_at: string
          current_version: number
          embedding_processed_at: string | null
          embedding_status: string | null
          file_content_text: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          has_versions: boolean
          id: string
          total_chunks: number | null
          updated_at: string
          upload_date: string
          user_id: string
          version_count: number
        }
        Insert: {
          category?: string | null
          client_id: string
          content_extracted_at?: string | null
          content_keywords?: string[] | null
          content_summary?: string | null
          created_at?: string
          current_version?: number
          embedding_processed_at?: string | null
          embedding_status?: string | null
          file_content_text?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          has_versions?: boolean
          id?: string
          total_chunks?: number | null
          updated_at?: string
          upload_date?: string
          user_id: string
          version_count?: number
        }
        Update: {
          category?: string | null
          client_id?: string
          content_extracted_at?: string | null
          content_keywords?: string[] | null
          content_summary?: string | null
          created_at?: string
          current_version?: number
          embedding_processed_at?: string | null
          embedding_status?: string | null
          file_content_text?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          has_versions?: boolean
          id?: string
          total_chunks?: number | null
          updated_at?: string
          upload_date?: string
          user_id?: string
          version_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reports: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          client_id: string
          created_at: string | null
          id: string
          report_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          report_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          report_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reports_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "validation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact_email: string | null
          contact_person: string | null
          created_at: string
          description: string | null
          engagement_start: string | null
          id: string
          industry: string | null
          name: string
          potential: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          engagement_start?: string | null
          id: string
          industry?: string | null
          name: string
          potential?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          engagement_start?: string | null
          id?: string
          industry?: string | null
          name?: string
          potential?: string | null
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
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
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
            foreignKeyName: "validation_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
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
      generate_question_hash: {
        Args: { question_text: string; file_id?: string }
        Returns: string
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
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      normalize_question: {
        Args: { question_text: string }
        Returns: string
      }
      search_file_embeddings: {
        Args: {
          query_embedding: string
          client_id: string
          user_id: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          file_id: string
          file_name: string
          file_type: string
          file_path: string
          file_size: number
          upload_date: string
          chunk_text: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
    Enums: {},
  },
} as const
