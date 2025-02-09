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
          role: 'customer' | 'business' | 'admin'
          email_verified: boolean
          verification_code?: string
          verification_attempts: number
          last_verification_attempt?: string
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
          avatar_url?: string
          logo_url?: string
          cover_image_url?: string
          status: 'active' | 'inactive' | 'suspended'
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string
          role?: 'customer' | 'business' | 'admin'
          email_verified?: boolean
          verification_code?: string
          business_name?: string
          status?: 'active' | 'inactive' | 'suspended'
          onboarding_completed?: boolean
        }
        Update: {
          email?: string
          full_name?: string
          role?: 'customer' | 'business' | 'admin'
          email_verified?: boolean
          verification_code?: string
          business_name?: string
          status?: 'active' | 'inactive' | 'suspended'
          onboarding_completed?: boolean
        }
      }
      services: {
        Row: {
          id: string
          business_id: string
          category_id: string
          name: string
          description: string
          price: number
          duration: number
          image_url?: string
          status: 'active' | 'inactive' | 'deleted'
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          category_id: string
          name: string
          description: string
          price: number
          duration: number
          image_url?: string
          status?: 'active' | 'inactive' | 'deleted'
          is_available?: boolean
        }
        Update: {
          name?: string
          description?: string
          price?: number
          duration?: number
          image_url?: string
          status?: 'active' | 'inactive' | 'deleted'
          is_available?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          service_id: string
          customer_id: string
          business_id: string
          customer_name: string
          date: string
          start_time: string
          end_time: string
          total_amount: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          customer_id: string
          business_id: string
          customer_name: string
          date: string
          start_time: string
          end_time: string
          total_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string
        }
      }
    }
    Views: {
      service_details: {
        Row: {
          id: string
          business_id: string
          category_id: string
          name: string
          description: string
          price: number
          duration: number
          image_url?: string
          status: 'active' | 'inactive' | 'deleted'
          is_available: boolean
          business_name: string
          business_address?: string
          business_city?: string
          business_state?: string
          business_phone?: string
          business_email?: string
          category_name: string
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      handle_new_user: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'customer' | 'business' | 'admin'
      user_status: 'active' | 'inactive' | 'suspended'
      service_status: 'active' | 'inactive' | 'deleted'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    }
  }
}
