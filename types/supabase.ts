export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      papers: {
        Row: {
          id: string
          title: string
          abstract: string
          year: number
          authors: string[]
          url: string | null
          pdf_url: string | null
          user_id: string
          created_at: string
          updated_at: string
          source: string | null
          tags: string[] | null
          is_favorite: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          title: string
          abstract: string
          year: number
          authors: string[]
          url?: string | null
          pdf_url?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
          source?: string | null
          tags?: string[] | null
          is_favorite?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          title?: string
          abstract?: string
          year?: number
          authors?: string[]
          url?: string | null
          pdf_url?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          source?: string | null
          tags?: string[] | null
          is_favorite?: boolean
          notes?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_papers: {
        Row: {
          id: string
          project_id: string
          paper_id: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          paper_id: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          paper_id?: string
          created_at?: string
        }
      }
      summaries: {
        Row: {
          id: string
          content: string
          paper_ids: string[]
          user_id: string
          created_at: string
          updated_at: string
          title: string
        }
        Insert: {
          id?: string
          content: string
          paper_ids: string[]
          user_id: string
          created_at?: string
          updated_at?: string
          title: string
        }
        Update: {
          id?: string
          content?: string
          paper_ids?: string[]
          user_id?: string
          created_at?: string
          updated_at?: string
          title?: string
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          messages: Json[]
          created_at: string
          updated_at: string
          title: string | null
        }
        Insert: {
          id?: string
          user_id: string
          messages: Json[]
          created_at?: string
          updated_at?: string
          title?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          messages?: Json[]
          created_at?: string
          updated_at?: string
          title?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          research_interests: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          research_interests?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          research_interests?: string[] | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Paper = Database["public"]["Tables"]["papers"]["Row"]
export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type Summary = Database["public"]["Tables"]["summaries"]["Row"]
export type ChatHistory = Database["public"]["Tables"]["chat_history"]["Row"]
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]
