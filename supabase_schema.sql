-- ==========================================
-- SUPABASE DATABASE SETUP MIGRATION
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create Tables (Using IF NOT EXISTS so it doesn't fail)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL REFERENCES auth.users on delete cascade,
  email text NOT NULL,
  username text UNIQUE NOT NULL,
  display_name text,
  photo_url text,
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
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expense_participants (
  expense_id uuid REFERENCES public.expenses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (expense_id, user_id)
);

-- ==========================================
-- 2. Setup Triggers for Automatic User Creation
-- ==========================================

-- This function automatically creates a record in public.users whenever a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name, photo_url)
  VALUES (
    new.id,
    new.email,
    -- use provided username from google oauth or email signup, otherwise generate random
    COALESCE(
      new.raw_user_meta_data->>'username', 
      split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)
    ),
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING; -- Gracefully handle if profile already exists
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 3. Row Level Security (RLS) Policies
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;

-- Drop policies safely before recreating them to avoid duplicate policy errors
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON public.friendships;
DROP POLICY IF EXISTS "Receivers can update friendship status" ON public.friendships;
DROP POLICY IF EXISTS "Users can view relevant expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Participants viewable to involved users" ON public.expense_participants;
DROP POLICY IF EXISTS "Payer can add participants" ON public.expense_participants;

-- Users can read everyone's profile (so you can find friends)
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.users FOR SELECT
  USING ( true );

-- Users can only update their own profile
CREATE POLICY "Users can update own profile."
  ON public.users FOR UPDATE
  USING ( auth.uid() = id );

-- Friendships are viewable by either user involved
CREATE POLICY "Users can view their friendships"
  ON public.friendships FOR SELECT
  USING ( auth.uid() = user_id1 OR auth.uid() = user_id2 );

-- Users can create friendships if they are sender
CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK ( auth.uid() = user_id1 );

-- Only the receiver can update the status (accept/reject)
CREATE POLICY "Receivers can update friendship status"
  ON public.friendships FOR UPDATE
  USING ( auth.uid() = user_id2 );

-- Expenses can be viewed by whoever paid it or whoever is a participant
CREATE POLICY "Users can view relevant expenses"
  ON public.expenses FOR SELECT
  USING (
    auth.uid() = paid_by OR 
    id IN (SELECT expense_id FROM public.expense_participants WHERE user_id = auth.uid())
  );

-- Users can insert expenses if they authenticate
CREATE POLICY "Authenticated users can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

-- Expense participants can be viewed if you are part of the expense
CREATE POLICY "Participants viewable to involved users"
  ON public.expense_participants FOR SELECT
  USING (
    expense_id IN (
      SELECT id FROM public.expenses WHERE paid_by = auth.uid()
    ) OR user_id = auth.uid()
  );

-- Only the person who paid the expense can add participants
CREATE POLICY "Payer can add participants"
  ON public.expense_participants FOR INSERT
  WITH CHECK (
    expense_id IN (
      SELECT id FROM public.expenses WHERE paid_by = auth.uid()
    )
  );

-- Ensure Realtime is enabled for these tables (so dashboard works)
-- We use DO blocks with metadata checks to ensure idempotency across all Supabase environments
DO $$ 
BEGIN
  -- public.users
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'users') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;

  -- public.friendships
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'friendships') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
  END IF;

  -- public.expenses
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'expenses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
  END IF;

  -- public.expense_participants
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'expense_participants') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_participants;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════
-- NOTIFICATIONS TABLE (New)
-- ═══════════════════════════════════════════════════════
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

-- RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can create notifications for others"
  ON public.notifications FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

-- Real-time for notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
