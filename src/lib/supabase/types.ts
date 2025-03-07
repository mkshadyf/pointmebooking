/**
 * Supabase database types
 */

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
      businesses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          owner_id: string
          logo: string | null
          banner: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          country: string | null
          phone: string | null
          email: string | null
          website: string | null
          status: string
          category_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          owner_id: string
          logo?: string | null
          banner?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          status?: string
          category_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          owner_id?: string
          logo?: string | null
          banner?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          status?: string
          category_id?: string | null
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
      error_logs: {
        Row: {
          id: string
          created_at: string
          error_message: string
          error_stack: string | null
          error_type: string | null
          user_id: string | null
          context: Json | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          resolution_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          error_message: string
          error_stack?: string | null
          error_type?: string | null
          user_id?: string | null
          context?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          error_message?: string
          error_stack?: string | null
          error_type?: string | null
          user_id?: string | null
          context?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_resolved_by_fkey"
            columns: ["resolved_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          name: string | null
          avatar: string | null
          phone: string | null
          role: string
          status: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          name?: string | null
          avatar?: string | null
          phone?: string | null
          role?: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string | null
          avatar?: string | null
          phone?: string | null
          role?: string
          status?: string
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
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          business_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          business_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "schedules_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          price: number
          duration: number
          business_id: string
          category_id: string | null
          image: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          price: number
          duration: number
          business_id: string
          category_id?: string | null
          image?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          price?: number
          duration?: number
          business_id?: string
          category_id?: string | null
          image?: string | null
          status?: string
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
      sessions: {
        Row: {
          id: string
          user_id: string
          expires_at: string
          created_at: string
          last_active_at: string
          user_agent: string | null
          ip_address: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          expires_at: string
          created_at?: string
          last_active_at?: string
          user_agent?: string | null
          ip_address?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          expires_at?: string
          created_at?: string
          last_active_at?: string
          user_agent?: string | null
          ip_address?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      staff: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          business_id: string
          role: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          business_id: string
          role?: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          business_id?: string
          role?: string
          status?: string
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
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      business_status: "active" | "inactive" | "suspended"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      profile_status: "active" | "inactive" | "suspended"
      service_status: "active" | "inactive"
      staff_role: "admin" | "manager" | "staff"
      user_role: "user" | "business" | "admin" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 