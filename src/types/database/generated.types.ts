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
            referencedRelation: "business_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "business_details"
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
            referencedRelation: "service_details"
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
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          business_category: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          contact_email: string | null
          contact_number: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          email: string
          email_verified: boolean | null
          full_name: string | null
          id: string
          last_verification_attempt: string | null
          location: string | null
          logo_url: string | null
          onboarding_completed: boolean | null
          phone: string | null
          postal_code: string | null
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
          working_hours: Json | null
          preferences: Json | null
          social_media: Json | null
          user_id: string
          verification_attempts: number | null
          verification_code: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          business_category?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          contact_email?: string | null
          contact_number?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_verification_attempt?: string | null
          location?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          user_id: string
          verification_attempts?: number | null
          verification_code?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          business_category?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          contact_email?: string | null
          contact_number?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_verification_attempt?: string | null
          location?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          user_id?: string
          verification_attempts?: number | null
          verification_code?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_category_fkey"
            columns: ["business_category"]
            isOneToOne: false
            referencedRelation: "business_categories"
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
            referencedRelation: "business_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          business_id: string
          category_id: string | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string | null
        }
        Insert: {
          business_id: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number
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
            referencedRelation: "business_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      staff: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          role: string
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          role: string
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          role?: string
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      business_details: {
        Row: {
          address: string | null
          avatar_url: string | null
          business_category: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          contact_email: string | null
          contact_number: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string | null
          last_verification_attempt: string | null
          location: string | null
          logo_url: string | null
          onboarding_completed: boolean | null
          phone: string | null
          postal_code: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          service_count: number | null
          staff_count: number | null
          state: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string | null
          verification_attempts: number | null
          verification_code: string | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_category_fkey"
            columns: ["business_category"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_details: {
        Row: {
          business_address: string | null
          business_category_icon: string | null
          business_category_name: string | null
          business_city: string | null
          business_description: string | null
          business_email: string | null
          business_id: string | null
          business_logo_url: string | null
          business_name: string | null
          business_phone: string | null
          category_icon: string | null
          category_id: string | null
          category_name: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string | null
          image_url: string | null
          is_available: boolean | null
          name: string | null
          price: number | null
          status: Database["public"]["Enums"]["service_status"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      service_status: "active" | "inactive" | "deleted"
      user_role: "customer" | "business" | "admin"
      user_status: "active" | "inactive" | "suspended"
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
