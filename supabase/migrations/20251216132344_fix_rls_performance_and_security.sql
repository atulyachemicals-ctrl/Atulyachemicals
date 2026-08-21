/*
  # Fix RLS Performance and Security Issues

  1. Changes to user_profiles RLS Policies
    - Drop and recreate all RLS policies with optimized `(select auth.uid())` syntax
    - This prevents re-evaluation of auth.uid() for each row, improving query performance at scale

  2. Changes to cart_items RLS Policies
    - Drop and recreate all authenticated user RLS policies with optimized `(select auth.uid())` syntax
    - Anonymous user policies remain unchanged as they don't use auth.uid()

  3. Function Security Fix
    - Drop and recreate `update_updated_at_column()` function with secure search_path
    - Add `SECURITY DEFINER` and explicit `search_path` to prevent search path manipulation attacks
    - Recreate all dependent triggers

  4. Important Notes
    - Performance: Using `(select auth.uid())` evaluates the function once per query instead of per row
    - Security: Setting search_path prevents malicious schema manipulation
    - All triggers are recreated to maintain automatic timestamp updates
*/

-- ============================================================================
-- Fix user_profiles RLS Policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Recreate with optimized syntax
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- Fix cart_items RLS Policies
-- ============================================================================

-- Drop existing authenticated user policies
DROP POLICY IF EXISTS "Authenticated users can read own cart" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can insert own cart" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can delete own cart" ON cart_items;

-- Recreate with optimized syntax
CREATE POLICY "Authenticated users can read own cart"
  ON cart_items
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Authenticated users can insert own cart"
  ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Authenticated users can update own cart"
  ON cart_items
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Authenticated users can delete own cart"
  ON cart_items
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- Fix Function Security
-- ============================================================================

-- Drop existing function with CASCADE to remove dependent triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate with secure search_path and SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = pg_catalog, public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Recreate triggers for cart_items
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();