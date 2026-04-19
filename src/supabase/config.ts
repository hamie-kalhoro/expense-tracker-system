import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail gracefully instead of crashing the UI entirely if not configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase missing required environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Helper type for tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // matches auth.users UUID
          email: string;
          username: string;
          display_name: string;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          display_name?: string;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string;
          photo_url?: string | null;
        };
      };
      friendships: {
        Row: {
          id: string;
          user_id1: string; // sender
          user_id2: string; // receiver
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
        };
        Insert: {
          user_id1: string;
          user_id2: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'accepted' | 'rejected';
        };
      };
      expenses: {
        Row: {
          id: string;
          description: string;
          amount: number;
          paid_by: string; // user id
          category: string;
          created_at: string;
          group_id: string;
        };
        Insert: {
          description: string;
          amount: number;
          paid_by: string;
          category?: string;
          created_at?: string;
          group_id?: string;
        };
      };
      expense_participants: {
        Row: {
          expense_id: string;
          user_id: string;
        };
        Insert: {
          expense_id: string;
          user_id: string;
        };
      };
    }
  }
};
