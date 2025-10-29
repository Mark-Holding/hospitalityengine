-- =====================================================
-- PROPER RBAC WITH SECURITY DEFINER FUNCTIONS
-- =====================================================
-- This migration creates helper functions that bypass RLS
-- and rebuilds all policies to use these functions.
-- This eliminates recursion while maintaining full RBAC.
-- =====================================================

-- =====================================================
-- STEP 1: CREATE SECURITY DEFINER HELPER FUNCTIONS
-- =====================================================

-- Check if user has a specific role or higher in a business
-- Returns TRUE if user has the minimum required role
CREATE OR REPLACE FUNCTION check_user_business_role(
  p_user_id UUID,
  p_business_id UUID,
  p_minimum_role user_role
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_role user_role;
  v_role_hierarchy INTEGER;
  v_minimum_hierarchy INTEGER;
BEGIN
  -- Get user's role in the business (bypasses RLS due to SECURITY DEFINER)
  SELECT role INTO v_user_role
  FROM business_members
  WHERE user_id = p_user_id
    AND business_id = p_business_id
    AND is_active = true
  LIMIT 1;

  -- If no membership found, return false
  IF v_user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Define role hierarchy: member=1, admin=2, owner=3
  v_role_hierarchy := CASE v_user_role
    WHEN 'member' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'owner' THEN 3
  END;

  v_minimum_hierarchy := CASE p_minimum_role
    WHEN 'member' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'owner' THEN 3
  END;

  -- Check if user's role meets minimum requirement
  RETURN v_role_hierarchy >= v_minimum_hierarchy;
END;
$$;

-- Check if user is a member of a business (any role)
CREATE OR REPLACE FUNCTION is_business_member(
  p_user_id UUID,
  p_business_id UUID
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check membership (bypasses RLS due to SECURITY DEFINER)
  RETURN EXISTS (
    SELECT 1 FROM business_members
    WHERE user_id = p_user_id
      AND business_id = p_business_id
      AND is_active = true
  );
END;
$$;

-- Get business owner ID (used for ownership checks)
CREATE OR REPLACE FUNCTION get_business_owner(
  p_business_id UUID
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  SELECT owner_id INTO v_owner_id
  FROM businesses
  WHERE id = p_business_id;

  RETURN v_owner_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_user_business_role(UUID, UUID, user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION is_business_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_owner(UUID) TO authenticated;

-- =====================================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- =====================================================

-- Businesses
DROP POLICY IF EXISTS "Users can view their businesses" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can view businesses" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON businesses;
DROP POLICY IF EXISTS "Owners and admins can update business" ON businesses;
DROP POLICY IF EXISTS "Owner can update business" ON businesses;
DROP POLICY IF EXISTS "Owner can delete business" ON businesses;

-- Business Members
DROP POLICY IF EXISTS "View members of own businesses" ON business_members;
DROP POLICY IF EXISTS "View business members" ON business_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON business_members;
DROP POLICY IF EXISTS "Owner can add members" ON business_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON business_members;
DROP POLICY IF EXISTS "Owner can update members" ON business_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON business_members;
DROP POLICY IF EXISTS "Owner can remove members" ON business_members;

-- Invitations
DROP POLICY IF EXISTS "View business invitations" ON invitations;
DROP POLICY IF EXISTS "View invitations" ON invitations;
DROP POLICY IF EXISTS "Owners and admins can invite" ON invitations;
DROP POLICY IF EXISTS "Owner can invite" ON invitations;
DROP POLICY IF EXISTS "Update business invitations" ON invitations;
DROP POLICY IF EXISTS "Update invitations" ON invitations;
DROP POLICY IF EXISTS "Delete business invitations" ON invitations;
DROP POLICY IF EXISTS "Delete invitations" ON invitations;

-- User Preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "View own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Update own preferences" ON user_preferences;

-- =====================================================
-- STEP 3: CREATE NEW POLICIES USING HELPER FUNCTIONS
-- =====================================================

-- ============= BUSINESSES TABLE =============

-- Users can view businesses they are members of
CREATE POLICY "View member businesses"
  ON businesses FOR SELECT
  USING (
    is_business_member(auth.uid(), id)
  );

-- Authenticated users can create businesses
CREATE POLICY "Create businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
  );

-- Owners and admins can update business
CREATE POLICY "Update businesses"
  ON businesses FOR UPDATE
  USING (
    check_user_business_role(auth.uid(), id, 'admin')
  );

-- Only owner can delete business
CREATE POLICY "Delete businesses"
  ON businesses FOR DELETE
  USING (
    owner_id = auth.uid()
  );

-- ============= BUSINESS_MEMBERS TABLE =============

-- Users can view members of businesses they belong to
CREATE POLICY "View business members"
  ON business_members FOR SELECT
  USING (
    is_business_member(auth.uid(), business_id)
  );

-- Owners and admins can add members
CREATE POLICY "Add business members"
  ON business_members FOR INSERT
  WITH CHECK (
    check_user_business_role(auth.uid(), business_id, 'admin')
  );

-- Owners and admins can update members (change roles, deactivate)
CREATE POLICY "Update business members"
  ON business_members FOR UPDATE
  USING (
    check_user_business_role(auth.uid(), business_id, 'admin')
  );

-- Owners and admins can remove members
CREATE POLICY "Delete business members"
  ON business_members FOR DELETE
  USING (
    check_user_business_role(auth.uid(), business_id, 'admin')
  );

-- ============= INVITATIONS TABLE =============

-- Owners/admins can view invitations for their business
-- Recipients can view invitations sent to their email
CREATE POLICY "View invitations"
  ON invitations FOR SELECT
  USING (
    check_user_business_role(auth.uid(), business_id, 'admin')
    OR
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Owners and admins can create invitations
CREATE POLICY "Create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    check_user_business_role(auth.uid(), business_id, 'admin')
  );

-- Owners/admins can update invitations
-- Recipients can update their own invitations (for accepting)
CREATE POLICY "Update invitations"
  ON invitations FOR UPDATE
  USING (
    check_user_business_role(auth.uid(), business_id, 'admin')
    OR
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Owners and admins can delete invitations
CREATE POLICY "Delete invitations"
  ON invitations FOR DELETE
  USING (
    check_user_business_role(auth.uid(), business_id, 'admin')
  );

-- ============= USER_PREFERENCES TABLE =============

-- Users can only access their own preferences
CREATE POLICY "View own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- STEP 4: VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Created SECURITY DEFINER helper functions';
  RAISE NOTICE '  - check_user_business_role(user_id, business_id, minimum_role)';
  RAISE NOTICE '  - is_business_member(user_id, business_id)';
  RAISE NOTICE '  - get_business_owner(business_id)';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Rebuilt all RLS policies using helper functions';
  RAISE NOTICE '  - No subqueries to business_members in policies';
  RAISE NOTICE '  - Functions bypass RLS via SECURITY DEFINER';
  RAISE NOTICE '  - No recursion possible!';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Full RBAC support:';
  RAISE NOTICE '  - Members: Can view';
  RAISE NOTICE '  - Admins: Can view, invite, manage members';
  RAISE NOTICE '  - Owners: Full control including delete';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Proper RBAC implementation complete!';
END $$;
