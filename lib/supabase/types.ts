export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: "admin" | "agent" | "user"
          status: "available" | "busy" | "away" | "offline"
          provider: "email" | "google"
          phone: string | null
          company: string | null
          department: string | null
          bio: string | null
          preferences: Json
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "admin" | "agent" | "user"
          status?: "available" | "busy" | "away" | "offline"
          provider?: "email" | "google"
          phone?: string | null
          company?: string | null
          department?: string | null
          bio?: string | null
          preferences?: Json
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "admin" | "agent" | "user"
          status?: "available" | "busy" | "away" | "offline"
          provider?: "email" | "google"
          phone?: string | null
          company?: string | null
          department?: string | null
          bio?: string | null
          preferences?: Json
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
      agent_interactions: {
        Row: {
          id: string
          user_id: string | null
          agent_type: string
          interaction_type: "chat" | "call" | "email" | "support"
          session_id: string | null
          duration_seconds: number
          satisfaction_rating: number | null
          feedback: string | null
          metadata: Json
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          agent_type: string
          interaction_type: "chat" | "call" | "email" | "support"
          session_id?: string | null
          duration_seconds?: number
          satisfaction_rating?: number | null
          feedback?: string | null
          metadata?: Json
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          agent_type?: string
          interaction_type?: "chat" | "call" | "email" | "support"
          session_id?: string | null
          duration_seconds?: number
          satisfaction_rating?: number | null
          feedback?: string | null
          metadata?: Json
          created_at?: string
          completed_at?: string | null
        }
      }
      service_requests: {
        Row: {
          id: string
          user_id: string | null
          service_type: "ai_support" | "sales_automation" | "social_media" | "appointment" | "workflow"
          title: string
          description: string | null
          priority: "low" | "medium" | "high" | "urgent"
          status: "pending" | "in_progress" | "completed" | "cancelled"
          assigned_to: string | null
          due_date: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          service_type: "ai_support" | "sales_automation" | "social_media" | "appointment" | "workflow"
          title: string
          description?: string | null
          priority?: "low" | "medium" | "high" | "urgent"
          status?: "pending" | "in_progress" | "completed" | "cancelled"
          assigned_to?: string | null
          due_date?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          service_type?: "ai_support" | "sales_automation" | "social_media" | "appointment" | "workflow"
          title?: string
          description?: string | null
          priority?: "low" | "medium" | "high" | "urgent"
          status?: "pending" | "in_progress" | "completed" | "cancelled"
          assigned_to?: string | null
          due_date?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          title: string
          message: string
          type: "info" | "success" | "warning" | "error"
          read: boolean
          action_url: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          message: string
          type?: "info" | "success" | "warning" | "error"
          read?: boolean
          action_url?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          message?: string
          type?: "info" | "success" | "warning" | "error"
          read?: boolean
          action_url?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_last_seen: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      update_user_status: {
        Args: {
          user_uuid: string
          new_status: string
          user_ip?: string
          user_agent_string?: string
        }
        Returns: undefined
      }
      get_user_profile_with_stats: {
        Args: { user_uuid: string }
        Returns: Json
      }
    }
  }
}
