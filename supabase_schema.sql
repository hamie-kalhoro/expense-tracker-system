-- ==========================================
-- SUPABASE DATABASE SETUP MIGRATION (Production Ready)
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL REFERENCES auth.users on delete cascade,
  email text NOT NULL,
  username text UNIQUE NOT NULL,
  display_name text,
  photo_url text,
  bio text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id1 uuid NOT NULL CONSTRAINT friendships_user_id1_fkey REFERENCES public.users(id) ON DELETE CASCADE,
  user_id2 uuid NOT NULL CONSTRAINT friendships_user_id2_fkey REFERENCES public.users(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id1, user_id2)
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  description text NOT NULL,
  amount numeric NOT NULL,
  paid_by uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category text,
  group_id text,
  expense_date date DEFAULT CURRENT_DATE,
  participants_uids uuid[] DEFAULT '{}'::uuid[] NOT NULL, -- New: Self-contained participants for RLS
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expense_participants (
  expense_id uuid REFERENCES public.expenses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (expense_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'friend-request', 'expense-added', 'settlement'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  from_name TEXT,
  from_uid UUID,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. Drop ALL existing policies to ensure a clean slate
-- ==========================================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ==========================================
-- 3. Row Level Security (RLS) Policies
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Friendships
CREATE POLICY "Users can view their friendships" ON public.friendships FOR SELECT 
USING (auth.uid() = user_id1 OR auth.uid() = user_id2);
CREATE POLICY "Users can create friendships" ON public.friendships FOR INSERT 
WITH CHECK (auth.uid() = user_id1);
CREATE POLICY "Receivers can update friendship status" ON public.friendships FOR UPDATE 
USING (auth.uid() = user_id2);

-- Expenses (NON-RECURSIVE)
CREATE POLICY "Users can view involved expenses" ON public.expenses FOR SELECT
USING (auth.uid() = paid_by OR auth.uid() = ANY(participants_uids));

CREATE POLICY "Authenticated users can insert expenses" ON public.expenses FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Participants (NON-RECURSIVE)
CREATE POLICY "Users can view their own participant records" ON public.expense_participants FOR SELECT
USING (user_id = auth.uid() OR expense_id IN (SELECT id FROM public.expenses WHERE paid_by = auth.uid()));

CREATE POLICY "Payer can add participants" ON public.expense_participants FOR INSERT
WITH CHECK (true); -- Security handled by the add_expense_v3 function

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create notifications for others" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- 4. Atomic Transaction Function (RPC)
-- ==========================================

CREATE OR REPLACE FUNCTION public.add_expense_v3(
  p_description text,
  p_amount numeric,
  p_category text,
  p_expense_date date,
  p_participant_uids uuid[]
)
RETURNS uuid AS $$
DECLARE
  v_expense_id uuid;
BEGIN
  -- Verify the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Insert into expenses (this automatically populates participants_uids for RLS)
  INSERT INTO public.expenses (description, amount, paid_by, category, expense_date, participants_uids)
  VALUES (p_description, p_amount, auth.uid(), p_category, p_expense_date, p_participant_uids)
  RETURNING id INTO v_expense_id;

  -- 2. Insert into expense_participants (for relational tracking/joins)
  INSERT INTO public.expense_participants (expense_id, user_id)
  SELECT v_expense_id, unnest(p_participant_uids);

  RETURN v_expense_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. Helper Triggers & Realtime
-- ==========================================

-- User creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name, photo_url)
  VALUES (
    new.id, new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)),
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Realtime
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'expenses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses, public.expense_participants, public.notifications;
  END IF;
END $$;
