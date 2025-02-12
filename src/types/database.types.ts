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
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          role: string
          email_verified: boolean
          verification_code?: string
          business_name?: string
          business_type?: string
          business_category?: string
          description?: string
          location?: string
          contact_number?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          contact_email?: string
          website?: string
          avatar_url?: string
          logo_url?: string
          cover_image_url?: string
          status: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
          working_hours?: Json
        }
        Insert: {
          id: string
          user_id?: string
          full_name?: string
          email: string
          role: string
          email_verified?: boolean
          verification_code?: string
          business_name?: string
          business_type?: string
          business_category?: string
          description?: string
          location?: string
          contact_number?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          contact_email?: string
          website?: string
          avatar_url?: string
          logo_url?: string
          cover_image_url?: string
          status?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          working_hours?: Json
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          role?: string
          email_verified?: boolean
          verification_code?: string
          business_name?: string
          business_type?: string
          business_category?: string
          description?: string
          location?: string
          contact_number?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          contact_email?: string
          website?: string
          avatar_url?: string
          logo_url?: string
          cover_image_url?: string
          status?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          working_hours?: Json
        }
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          price: number
          duration: number
          image_url: string | null
          is_available: boolean
          created_at: string
          updated_at: string
          status: string
          category_id: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          price: number
          duration: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
          status?: string
          category_id: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
          status?: string
          category_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          service_id: string
          customer_id: string
          business_id: string
          date: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          customer_id: string
          business_id: string
          date: string
          start_time: string
          end_time: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          customer_id?: string
          business_id?: string
          date?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
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
  }
}
