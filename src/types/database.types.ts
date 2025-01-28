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
          email: string
          full_name: string
          avatar_url?: string
          logo_url?: string
          cover_image_url?: string
          phone?: string
          role: 'customer' | 'business' | 'admin'
          email_verified: boolean
          verification_code?: string
          onboarding_completed: boolean
          business_name?: string
          business_type?: string
          business_category?: string
          description?: string
          location?: string
          contact_number?: string
          contact_email?: string
          website?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name: string
          avatar_url?: string
          logo_url?: string
          cover_image_url?: string
          phone?: string
          role?: 'customer' | 'business' | 'admin'
          email_verified?: boolean
          verification_code?: string
          onboarding_completed?: boolean
          business_name?: string
          business_type?: string
          business_category?: string
          description?: string
          location?: string
          contact_number?: string
          contact_email?: string
          website?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          avatar_url?: string
          logo_url?: string
          cover_image_url?: string
          phone?: string
          role?: 'customer' | 'business' | 'admin'
          email_verified?: boolean
          verification_code?: string
          onboarding_completed?: boolean
          business_name?: string
          business_type?: string
          business_category?: string
          description?: string
          location?: string
          contact_number?: string
          contact_email?: string
          website?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string
          price: number
          duration: number
          category_id: string
          image_url?: string
          status: 'active' | 'inactive' | 'deleted'
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description: string
          price: number
          duration: number
          category_id: string
          image_url?: string
          status?: 'active' | 'inactive' | 'deleted'
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string
          price?: number
          duration?: number
          category_id?: string
          image_url?: string
          status?: 'active' | 'inactive' | 'deleted'
          is_available?: boolean
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
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string
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
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string
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
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string
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
