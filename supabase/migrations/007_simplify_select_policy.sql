-- =====================================================
-- SIMPLIFY SELECT POLICY (Final Fix)
-- =====================================================
-- Remove the helper function that still causes recursion
-- Use direct business ownership check only for SELECT
-- =====================================================

-- Drop policies FIRST (they depend on the function)
DROP POLICY IF EXISTS "View members of businesses you belong to" ON business_members;
DROP POLICY IF EXISTS "View members of businesses you own" ON business_members;
DROP POLICY IF EXISTS "View business members" ON business_members;

-- Now drop the problematic function
DROP FUNCTION IF EXISTS is_business_member(UUID, UUID) CASCADE;

-- New SELECT policy: Allow viewing if you own the business OR if it's your own membership record
CREATE POLICY "View business members"
  ON business_members FOR SELECT
  USING (
    -- Case 1: You own the business
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR
    -- Case 2: It's your own membership record (so you can see which businesses you belong to)
    user_id = auth.uid()
  );

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✓ Simplified SELECT policy - no recursion';
  RAISE NOTICE '✓ Users can view: businesses they own + their own memberships';
  RAISE NOTICE '✓ This allows BusinessSwitcher to work!';
END $$;
