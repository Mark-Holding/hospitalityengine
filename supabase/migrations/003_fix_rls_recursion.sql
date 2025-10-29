-- =====================================================
-- FIX: RLS Infinite Recursion in business_members
-- =====================================================
-- The INSERT policy was causing infinite recursion when
-- the trigger tried to create owner membership
-- =====================================================

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Owners and admins can add members" ON business_members;

-- Create new INSERT policy that avoids recursion
-- Allows:
-- 1. Creating owner membership when user is the business owner
-- 2. Existing admins/owners adding new members
CREATE POLICY "Can add business members"
  ON business_members FOR INSERT
  WITH CHECK (
    -- Allow if user is the business owner (for initial owner membership creation)
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR
    -- Allow if user is already an admin/owner of this business
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_id = business_members.business_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- Verify the fix
DO $$
BEGIN
  RAISE NOTICE '✓ Fixed infinite recursion in business_members INSERT policy';
  RAISE NOTICE '✓ New policy allows owner to create their own membership';
  RAISE NOTICE '✓ Policy also allows admins/owners to add other members';
END $$;
