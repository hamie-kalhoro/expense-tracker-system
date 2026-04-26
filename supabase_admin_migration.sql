-- ==========================================
-- ADMIN SYSTEM MIGRATION
-- Run this AFTER the main supabase_schema.sql
-- ==========================================

-- 1. Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. To make a user an admin, run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';

-- ==========================================
-- 3. Admin RPC Functions (SECURITY DEFINER)
-- All functions verify caller has admin role
-- ==========================================

-- Helper: Check if calling user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Get all users with activity stats
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  username text,
  display_name text,
  photo_url text,
  bio text,
  role text,
  created_at timestamptz,
  expense_count bigint,
  total_paid numeric,
  friend_count bigint
) AS $$
BEGIN
  -- Verify admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.username,
    u.display_name,
    u.photo_url,
    u.bio,
    u.role,
    u.created_at,
    COALESCE((SELECT count(*) FROM public.expense_participants ep WHERE ep.user_id = u.id), 0) AS expense_count,
    COALESCE((SELECT sum(e.amount) FROM public.expenses e WHERE e.paid_by = u.id), 0) AS total_paid,
    COALESCE((
      SELECT count(*) FROM public.friendships f 
      WHERE (f.user_id1 = u.id OR f.user_id2 = u.id) AND f.status = 'accepted'
    ), 0) AS friend_count
  FROM public.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Get all expenses with payer and participant details
CREATE OR REPLACE FUNCTION public.admin_get_all_expenses()
RETURNS TABLE (
  id uuid,
  description text,
  amount numeric,
  paid_by uuid,
  payer_username text,
  payer_email text,
  category text,
  expense_date date,
  created_at timestamptz,
  participant_count bigint,
  participant_names text
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    e.id,
    e.description,
    e.amount,
    e.paid_by,
    u.username AS payer_username,
    u.email AS payer_email,
    e.category,
    e.expense_date,
    e.created_at,
    (SELECT count(*) FROM public.expense_participants ep WHERE ep.expense_id = e.id) AS participant_count,
    (SELECT string_agg(pu.username, ', ') FROM public.expense_participants ep 
     JOIN public.users pu ON pu.id = ep.user_id WHERE ep.expense_id = e.id) AS participant_names
  FROM public.expenses e
  JOIN public.users u ON u.id = e.paid_by
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Get all friendships
CREATE OR REPLACE FUNCTION public.admin_get_all_friendships()
RETURNS TABLE (
  id uuid,
  user1_username text,
  user1_email text,
  user2_username text,
  user2_email text,
  status text,
  created_at timestamptz
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    f.id,
    u1.username AS user1_username,
    u1.email AS user1_email,
    u2.username AS user2_username,
    u2.email AS user2_email,
    f.status,
    f.created_at
  FROM public.friendships f
  JOIN public.users u1 ON u1.id = f.user_id1
  JOIN public.users u2 ON u2.id = f.user_id2
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Get all reviews
CREATE OR REPLACE FUNCTION public.admin_get_all_reviews()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  reviewer_username text,
  reviewer_email text,
  rating integer,
  suggestion text,
  created_at timestamptz
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    COALESCE(u.username, 'deleted_user') AS reviewer_username,
    COALESCE(u.email, '') AS reviewer_email,
    r.rating,
    r.suggestion,
    r.created_at
  FROM public.reviews r
  LEFT JOIN public.users u ON u.id = r.user_id
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Get comprehensive platform stats
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS TABLE (
  total_users bigint,
  admin_users bigint,
  total_expenses bigint,
  total_expense_amount numeric,
  total_friendships bigint,
  pending_friendships bigint,
  accepted_friendships bigint,
  total_reviews bigint,
  avg_rating numeric,
  users_today bigint,
  expenses_today bigint,
  users_this_week bigint,
  expenses_this_week bigint
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM public.users)::bigint,
    (SELECT count(*) FROM public.users WHERE role = 'admin')::bigint,
    (SELECT count(*) FROM public.expenses)::bigint,
    COALESCE((SELECT sum(amount) FROM public.expenses), 0)::numeric,
    (SELECT count(*) FROM public.friendships)::bigint,
    (SELECT count(*) FROM public.friendships WHERE status = 'pending')::bigint,
    (SELECT count(*) FROM public.friendships WHERE status = 'accepted')::bigint,
    (SELECT count(*) FROM public.reviews)::bigint,
    COALESCE((SELECT avg(rating) FROM public.reviews), 0)::numeric,
    (SELECT count(*) FROM public.users WHERE created_at >= CURRENT_DATE)::bigint,
    (SELECT count(*) FROM public.expenses WHERE created_at >= CURRENT_DATE)::bigint,
    (SELECT count(*) FROM public.users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::bigint,
    (SELECT count(*) FROM public.expenses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
