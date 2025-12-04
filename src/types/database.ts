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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          platform: 'zoom' | 'google_meet' | 'manual_upload'
          meeting_url: string | null
          meeting_id: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          start_time: string | null
          end_time: string | null
          duration: string | null
          participant_count: number
          audio_file_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          platform: 'zoom' | 'google_meet' | 'manual_upload'
          meeting_url?: string | null
          meeting_id?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          start_time?: string | null
          end_time?: string | null
          duration?: string | null
          participant_count?: number
          audio_file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          platform?: 'zoom' | 'google_meet' | 'manual_upload'
          meeting_url?: string | null
          meeting_id?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          start_time?: string | null
          end_time?: string | null
          duration?: string | null
          participant_count?: number
          audio_file_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          name: string
          email: string | null
          role: string
          joined_at: string | null
          left_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          name: string
          email?: string | null
          role?: string
          joined_at?: string | null
          left_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          name?: string
          email?: string | null
          role?: string
          joined_at?: string | null
          left_at?: string | null
          created_at?: string
        }
      }
      transcript_chunks: {
        Row: {
          id: string
          meeting_id: string
          speaker_name: string | null
          speaker_id: string | null
          start_time: string
          end_time: string
          text: string
          confidence: number | null
          status: 'processing' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          speaker_name?: string | null
          speaker_id?: string | null
          start_time: string
          end_time: string
          text: string
          confidence?: number | null
          status?: 'processing' | 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          speaker_name?: string | null
          speaker_id?: string | null
          start_time?: string
          end_time?: string
          text?: string
          confidence?: number | null
          status?: 'processing' | 'completed' | 'failed'
          created_at?: string
        }
      }
      ai_summaries: {
        Row: {
          id: string
          meeting_id: string
          summary_type: string
          content: string
          metadata: Json | null
          model_used: string | null
          processing_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          summary_type: string
          content: string
          metadata?: Json | null
          model_used?: string | null
          processing_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          summary_type?: string
          content?: string
          metadata?: Json | null
          model_used?: string | null
          processing_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audio_processing_queue: {
        Row: {
          id: string
          meeting_id: string
          audio_chunk_url: string
          status: 'processing' | 'completed' | 'failed'
          priority: number
          retry_count: number
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          audio_chunk_url: string
          status?: 'processing' | 'completed' | 'failed'
          priority?: number
          retry_count?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          audio_chunk_url?: string
          status?: 'processing' | 'completed' | 'failed'
          priority?: number
          retry_count?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
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
      meeting_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
      meeting_platform: 'zoom' | 'google_meet' | 'manual_upload'
      transcript_status: 'processing' | 'completed' | 'failed'
    }
  }
}
