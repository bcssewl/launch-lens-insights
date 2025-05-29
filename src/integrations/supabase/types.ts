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
      competitors: {
        Row: {
          competitor_data: Json | null
          created_at: string
          description: string | null
          funding_amount: number | null
          funding_stage: string | null
          id: string
          market_position: string | null
          name: string
          report_id: string
          similarity_score: number | null
          strengths: string[] | null
          weaknesses: string[] | null
          website: string | null
        }
        Insert: {
          competitor_data?: Json | null
          created_at?: string
          description?: string | null
          funding_amount?: number | null
          funding_stage?: string | null
          id?: string
          market_position?: string | null
          name: string
          report_id: string
          similarity_score?: number | null
          strengths?: string[] | null
          weaknesses?: string[] | null
          website?: string | null
        }
        Update: {
          competitor_data?: Json | null
          created_at?: string
          description?: string | null
          funding_amount?: number | null
          funding_stage?: string | null
          id?: string
          market_position?: string | null
          name?: string
          report_id?: string
          similarity_score?: number | null
          strengths?: string[] | null
          weaknesses?: string[] | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitors_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "validation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          created_at: string
          endpoint_url: string | null
          error_message: string | null
          fetched_at: string | null
          id: string
          query_parameters: Json | null
          report_id: string
          response_data: Json | null
          source_name: string
          source_type: string
          status: string
        }
        Insert: {
          created_at?: string
          endpoint_url?: string | null
          error_message?: string | null
          fetched_at?: string | null
          id?: string
          query_parameters?: Json | null
          report_id: string
          response_data?: Json | null
          source_name: string
          source_type: string
          status?: string
        }
        Update: {
          created_at?: string
          endpoint_url?: string | null
          error_message?: string | null
          fetched_at?: string | null
          id?: string
          query_parameters?: Json | null
          report_id?: string
          response_data?: Json | null
          source_name?: string
          source_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_sources_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "validation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_validations: {
        Row: {
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
      market_metrics: {
        Row: {
          confidence_level: number | null
          created_at: string
          data_source: string | null
          geographic_scope: string[] | null
          id: string
          metric_type: string
          metric_unit: string | null
          metric_value: number | null
          raw_data: Json | null
          report_id: string
          time_period: string | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          data_source?: string | null
          geographic_scope?: string[] | null
          id?: string
          metric_type: string
          metric_unit?: string | null
          metric_value?: number | null
          raw_data?: Json | null
          report_id: string
          time_period?: string | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          data_source?: string | null
          geographic_scope?: string[] | null
          id?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number | null
          raw_data?: Json | null
          report_id?: string
          time_period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_metrics_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "validation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_logs: {
        Row: {
          agent_name: string
          created_at: string
          error_details: Json | null
          execution_id: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          report_id: string
          status: string
          step_name: string
          workflow_id: string | null
        }
        Insert: {
          agent_name: string
          created_at?: string
          error_details?: Json | null
          execution_id?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          report_id: string
          status: string
          step_name: string
          workflow_id?: string | null
        }
        Update: {
          agent_name?: string
          created_at?: string
          error_details?: Json | null
          execution_id?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          report_id?: string
          status?: string
          step_name?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_logs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "validation_reports"
            referencedColumns: ["id"]
          },
        ]
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
      report_sections: {
        Row: {
          agent_name: string | null
          created_at: string
          id: string
          processing_time_ms: number | null
          report_id: string
          section_data: Json
          section_type: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_name?: string | null
          created_at?: string
          id?: string
          processing_time_ms?: number | null
          report_id: string
          section_data?: Json
          section_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_name?: string | null
          created_at?: string
          id?: string
          processing_time_ms?: number | null
          report_id?: string
          section_data?: Json
          section_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_sections_report_id_fkey"
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
          generated_at: string | null
          id: string
          overall_score: number | null
          recommendation: string | null
          report_data: Json
          report_version: number
          status: string
          updated_at: string
          validation_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          generated_at?: string | null
          id?: string
          overall_score?: number | null
          recommendation?: string | null
          report_data?: Json
          report_version?: number
          status?: string
          updated_at?: string
          validation_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          generated_at?: string | null
          id?: string
          overall_score?: number | null
          recommendation?: string | null
          report_data?: Json
          report_version?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
