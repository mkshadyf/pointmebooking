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
      business_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          message: string | null
          severity: string | null
          stack: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          message?: string | null
          severity?: string | null
          stack?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          message?: string | null
          severity?: string | null
          stack?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          amenities: string[] | null
          business_category: string | null
          business_images: string[] | null
          business_name: string | null
          business_type: string | null
          city: string | null
          contact_email: string | null
          contact_number: string | null
          created_at: string
          description: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string
          location: string | null
          logo_url: string | null
          onboarding_completed: boolean | null
          phone: string | null
          postal_code: string | null
          preferences: Json | null
          role: string
          services: Json | null
          social_media: Json | null
          state: string | null
          updated_at: string
          verification_code: string | null
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          business_category?: string | null
          business_images?: string[] | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          contact_email?: string | null
          contact_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          location?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          role: string
          services?: Json | null
          social_media?: Json | null
          state?: string | null
          updated_at?: string
          verification_code?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          business_category?: string | null
          business_images?: string[] | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          contact_email?: string | null
          contact_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          role?: string
          services?: Json | null
          social_media?: Json | null
          state?: string | null
          updated_at?: string
          verification_code?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          business_id: string | null
          created_at: string | null
          day_of_week: number | null
          end_time: string | null
          id: string
          is_closed: boolean | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          is_closed?: boolean | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          is_closed?: boolean | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          business_id: string
          category_id: string
          created_at: string | null
          description: string | null
          duration: number
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          category_id: string
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          category_id?: string
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey1"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_business_id_fkey1"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          business_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      businesses: {
        Row: {
          address: string | null
          business_category: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          contact_email: string | null
          contact_number: string | null
          created_at: string | null
          description: string | null
          email: string | null
          full_name: string | null
          id: string | null
          location: string | null
          onboarding_completed: boolean | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string | null
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          business_category?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          contact_email?: string | null
          contact_number?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          business_category?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          contact_email?: string | null
          contact_number?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      service_details: {
        Row: {
          business_address: string | null
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
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey1"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_business_id_fkey1"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      delete_user_data: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      get_business_metrics: {
        Args: {
          business_id: string
        }
        Returns: Json
      }
      get_category_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          category_id: string
          count: number
          avg_price: number
          total_revenue: number
          active_services: number
        }[]
      }
      init_error_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "super_admin" | "admin" | "provider" | "client"
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
