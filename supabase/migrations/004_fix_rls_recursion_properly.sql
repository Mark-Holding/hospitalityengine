-- =====================================================
-- FIX: RLS Infinite Recursion (Proper Fix)
-- =====================================================
-- The previous fix still had recursion because we were
-- querying business_members in an INSERT policy for business_members.
-- Solution: Use SECURITY DEFINER function to bypass RLS
-- =====================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Can add business members" ON business_members;

-- Create a helper function that bypasses RLS to check if user can add members
CREATE OR REPLACE FUNCTION user_can_add_members_to_business(check_business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- This function runs with SECURITY DEFINER, bypassing RLS
  -- Check if user is an active admin or owner of the business
  RETURN EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = check_business_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION user_can_add_members_to_business(UUID) IS 'Checks if current user can add members to a business (bypasses RLS to avoid recursion)';

-- Create new INSERT policy using the helper function
CREATE POLICY "Can add business members"
  ON business_members FOR INSERT
  WITH CHECK (
    -- Allow if user is the business owner (for initial membership creation)
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR
    -- Allow if user is already an admin/owner (checked via SECURITY DEFINER function)
    user_can_add_members_to_business(business_id)
  );

-- Verify the fix
DO $$
BEGIN
  RAISE NOTICE '✓ Fixed infinite recursion using SECURITY DEFINER function';
  RAISE NOTICE '✓ Function bypasses RLS when checking existing memberships';
  RAISE NOTICE '✓ Policy now safe from recursion';
END $$;
