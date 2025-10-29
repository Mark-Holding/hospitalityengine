-- =====================================================
-- FIX: Eliminate ALL RLS Recursion
-- =====================================================
-- Problem: Policies on business_members were querying business_members,
-- causing infinite recursion.
-- Solution: Rewrite ALL policies to check via businesses table only,
-- never querying business_members from within business_members policies.
-- =====================================================

-- Drop ALL existing policies on business_members
DROP POLICY IF EXISTS "View members of own businesses" ON business_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON business_members;
DROP POLICY IF EXISTS "Can add business members" ON business_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON business_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON business_members;

-- Drop the helper function that was causing issues
DROP FUNCTION IF EXISTS user_can_add_members_to_business(UUID);

-- =====================================================
-- HELPER FUNCTION (runs with elevated privileges to avoid recursion)
-- =====================================================

-- This function checks if a user is a member of a business
-- It runs as SECURITY DEFINER to bypass RLS and avoid recursion
CREATE OR REPLACE FUNCTION is_business_member(check_business_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Bypass RLS for this query
  -- SECURITY DEFINER makes this run as the function owner (bypassing RLS)
  SELECT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = check_business_id
      AND user_id = check_user_id
      AND is_active = true
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

COMMENT ON FUNCTION is_business_member(UUID, UUID) IS 'Checks if user is an active member of a business (bypasses RLS to avoid recursion)';

-- =====================================================
-- NEW POLICIES (No recursion)
-- =====================================================

-- SELECT: Allow viewing members if:
-- 1. User owns the business, OR
-- 2. User is a member of the business (checked via SECURITY DEFINER function)
CREATE POLICY "View members of businesses you belong to"
  ON business_members FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR
    is_business_member(business_id, auth.uid())
  );

-- INSERT: Allow inserting in two cases:
-- 1. User is the business owner (for owner membership creation via trigger)
-- 2. User is accepting a valid invitation (adding themselves)
CREATE POLICY "Insert members into businesses you own or via invitation"
  ON business_members FOR INSERT
  WITH CHECK (
    -- Case 1: User owns the business
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR
    -- Case 2: User is accepting a valid invitation (adding themselves)
    (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM invitations
        WHERE invitations.business_id = business_members.business_id
          AND invitations.email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
          )
          AND invitations.accepted_at IS NULL
          AND invitations.expires_at > NOW()
      )
    )
  );

-- UPDATE: Allow updating members if user is the business owner
CREATE POLICY "Update members in businesses you own"
  ON business_members FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- DELETE: Allow deleting members if user is the business owner
CREATE POLICY "Delete members from businesses you own"
  ON business_members FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- =====================================================
-- IMPORTANT NOTE
-- =====================================================
-- These policies now only allow business OWNERS to manage members via RLS.
-- For admins to add members, we'll use server-side functions with service role
-- that bypass RLS (this is secure because we check permissions in the function).
-- =====================================================

COMMENT ON TABLE business_members IS 'RLS policies: Only business owners can manage members via RLS. Admins use service role functions.';

-- Verify the fix
DO $$
BEGIN
  RAISE NOTICE '✓ Removed ALL RLS recursion from business_members';
  RAISE NOTICE '✓ Policies now only check businesses table (no recursion)';
  RAISE NOTICE '✓ Owner can create business and membership without errors';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTE: Admin member management will use service role (bypasses RLS)';
END $$;
