export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          service_id: string
          business_id: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          payment_status: string | null
          payment_id: string | null
          customer_name: string | null
          date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          service_id: string
          business_id: string
          start_time: string
          end_time: string
          status?: string
          notes?: string | null
          payment_status?: string | null
          payment_id?: string | null
          customer_name?: string | null
          date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          service_id?: string
          business_id?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          payment_status?: string | null
          payment_id?: string | null
          customer_name?: string | null
          date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      business_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          icon: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          icon?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          icon?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          owner_id: string
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          banner_url: string | null
          category_id: string | null
          status: string
          working_hours: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          owner_id: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          banner_url?: string | null
          category_id?: string | null
          status?: string
          working_hours?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          owner_id?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          banner_url?: string | null
          category_id?: string | null
          status?: string
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      error_logs: {
        Row: {
          id: string
          created_at: string
          error_type: string
          error_message: string
          error_stack: string | null
          user_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          error_type: string
          error_message: string
          error_stack?: string | null
          user_id?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          error_type?: string
          error_message?: string
          error_stack?: string | null
          user_id?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          phone: string | null
          role: string
          status: string
          preferences: Json | null
          email_verified: boolean | null
          onboarding_completed: boolean | null
          business_name: string | null
          business_type: string | null
          description: string | null
          address: string | null
          city: string | null
          state: string | null
          working_hours: Json | null
          social_media: Json | null
          verification_code: string | null
          verification_attempts: number | null
          logo_url: string | null
          full_name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: string
          status?: string
          preferences?: Json | null
          email_verified?: boolean | null
          onboarding_completed?: boolean | null
          business_name?: string | null
          business_type?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          working_hours?: Json | null
          social_media?: Json | null
          verification_code?: string | null
          verification_attempts?: number | null
          logo_url?: string | null
          full_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: string
          status?: string
          preferences?: Json | null
          email_verified?: boolean | null
          onboarding_completed?: boolean | null
          business_name?: string | null
          business_type?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          working_hours?: Json | null
          social_media?: Json | null
          verification_code?: string | null
          verification_attempts?: number | null
          logo_url?: string | null
          full_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      schedules: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          business_id: string
          service_id: string | null
          staff_id: string | null
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
          max_bookings: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          business_id: string
          service_id?: string | null
          staff_id?: string | null
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean
          max_bookings?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          business_id?: string
          service_id?: string | null
          staff_id?: string | null
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean
          max_bookings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_staff_id_fkey"
            columns: ["staff_id"]
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      service_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          icon: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          icon?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          icon?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number
          duration: number
          business_id: string
          category_id: string | null
          image_url: string | null
          status: string
          max_capacity: number | null
          location: string | null
          is_available: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: number
          duration: number
          business_id: string
          category_id?: string | null
          image_url?: string | null
          status?: string
          max_capacity?: number | null
          location?: string | null
          is_available?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number
          business_id?: string
          category_id?: string | null
          image_url?: string | null
          status?: string
          max_capacity?: number | null
          location?: string | null
          is_available?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      staff: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          business_id: string
          user_id: string
          role: string
          status: string
          services: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          business_id: string
          user_id: string
          role?: string
          status?: string
          services?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          business_id?: string
          user_id?: string
          role?: string
          status?: string
          services?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
      service_status: 'active' | 'inactive' | 'draft' | 'archived'
      user_role: 'admin' | 'business' | 'customer' | 'staff'
      user_status: 'active' | 'inactive' | 'pending' | 'suspended'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Relationships<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Relationships']
