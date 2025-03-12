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
      account_lockouts: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string | null
          failed_attempts: number
          id: string
          locked_until: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string | null
          failed_attempts?: number
          id?: string
          locked_until?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string | null
          failed_attempts?: number
          id?: string
          locked_until?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          business_id: string
          created_at: string | null
          customer_id: string
          customer_name: string | null
          date: string
          end_time: string
          id: string
          notes: string | null
          service_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          customer_id: string
          customer_name?: string | null
          date: string
          end_time: string
          id?: string
          notes?: string | null
          service_id: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          customer_id?: string
          customer_name?: string | null
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          service_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          banner_url: string | null
          business_type: string | null
          category_id: string | null
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          name: string
          owner_id: string
          phone: string | null
          state: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
          website: string | null
          working_hours: Json | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          business_type?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name: string
          owner_id: string
          phone?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          website?: string | null
          working_hours?: Json | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          business_type?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          owner_id?: string
          phone?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          website?: string | null
          working_hours?: Json | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_business_category_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_owner_profile_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          error_code: string
          error_message: string
          id: string
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error_code: string
          error_message: string
          id?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error_code?: string
          error_message?: string
          id?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          business_id: string
          created_at: string
          data: Json
          id: string
          step_number: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          data?: Json
          id?: string
          step_number: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          data?: Json
          id?: string
          step_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          id: string
          payment_status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          id?: string
          payment_status: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          id?: string
          payment_status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cover_image_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string | null
          customer_id: string
          id: string
          rating: number
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          rating: number
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          business_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          staff_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          staff_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          staff_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          business_category_id: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          business_category_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          business_category_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_business_category_id_fkey"
            columns: ["business_category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          admin_notes: string | null
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_at: string | null
          approved_by_id: string | null
          business_id: string
          category_id: string | null
          created_at: string | null
          created_by_id: string | null
          description: string | null
          duration: number
          featured: boolean | null
          featured_order: number | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by_id?: string | null
          business_id: string
          category_id?: string | null
          created_at?: string | null
          created_by_id?: string | null
          description?: string | null
          duration: number
          featured?: boolean | null
          featured_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by_id?: string | null
          business_id?: string
          category_id?: string | null
          created_at?: string | null
          created_by_id?: string | null
          description?: string | null
          duration?: number
          featured?: boolean | null
          featured_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_active_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_active_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_active_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          role: string
          services: string[] | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          role: string
          services?: string[] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          role?: string
          services?: string[] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa: {
        Row: {
          backup_codes: Json | null
          created_at: string
          enabled: boolean
          id: string
          last_used_at: string | null
          totp_secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          last_used_at?: string | null
          totp_secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          last_used_at?: string | null
          totp_secret?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_lockouts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_backup_codes: {
        Args: {
          p_user_id: string
          p_count?: number
        }
        Returns: string[]
      }
      get_user_active_sessions: {
        Args: {
          p_user_id: string
        }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_active_at: string
          user_agent: string | null
          user_id: string
        }[]
      }
      has_2fa_enabled: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      invalidate_all_sessions: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      is_email_verified: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_event_type: string
          p_details?: Json
        }
        Returns: string
      }
      update_session_activity: {
        Args: {
          p_session_id: string
        }
        Returns: boolean
      }
      verify_backup_code: {
        Args: {
          p_user_id: string
          p_code: string
        }
        Returns: boolean
      }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no-show"
        | "rescheduled"
        | "in-progress"
      service_status: "active" | "inactive" | "deleted" | "draft" | "archived"
      user_role: "customer" | "business" | "admin" | "staff"
      user_status: "active" | "inactive" | "suspended" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
