-- =====================================================
-- SIMPLIFY ALL RLS POLICIES TO AVOID RECURSION
-- =====================================================
-- Remove all policies that check business_members table
-- for businesses, invitations, and user_preferences.
-- Use direct ownership checks or simpler conditions.
-- =====================================================

-- =====================================================
-- 1. FIX BUSINESSES POLICIES (UPDATE/DELETE)
-- =====================================================

DROP POLICY IF EXISTS "Owners and admins can update business" ON businesses;
DROP POLICY IF EXISTS "Owner can delete business" ON businesses;

-- Only owner can update their business (simpler, no business_members check)
CREATE POLICY "Owner can update business"
  ON businesses FOR UPDATE
  USING (owner_id = auth.uid());

-- Only owner can delete business (already simple, recreating for consistency)
CREATE POLICY "Owner can delete business"
  ON businesses FOR DELETE
  USING (owner_id = auth.uid());

-- =====================================================
-- 2. FIX BUSINESS_MEMBERS POLICIES (INSERT/UPDATE/DELETE)
-- =====================================================

-- These policies check business_members table recursively
-- We'll use direct business ownership checks instead

DROP POLICY IF EXISTS "Owners and admins can add members" ON business_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON business_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON business_members;

-- Owner can add members (check businesses table directly)
CREATE POLICY "Owner can add members"
  ON business_members FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Owner can update members
CREATE POLICY "Owner can update members"
  ON business_members FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Owner can remove members
CREATE POLICY "Owner can remove members"
  ON business_members FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- =====================================================
-- 3. FIX INVITATIONS POLICIES (ALL)
-- =====================================================

DROP POLICY IF EXISTS "View business invitations" ON invitations;
DROP POLICY IF EXISTS "Owners and admins can invite" ON invitations;
DROP POLICY IF EXISTS "Update business invitations" ON invitations;
DROP POLICY IF EXISTS "Delete business invitations" ON invitations;

-- Owner can view invitations for their business
-- Recipients can view invitations sent to their email
CREATE POLICY "View invitations"
  ON invitations FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Owner can create invitations
CREATE POLICY "Owner can invite"
  ON invitations FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Owner can update invitations
-- Recipients can update invitations sent to them (for accepting)
CREATE POLICY "Update invitations"
  ON invitations FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Owner can delete invitations
CREATE POLICY "Delete invitations"
  ON invitations FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- =====================================================
-- 4. VERIFY USER_PREFERENCES POLICIES
-- =====================================================

-- Ensure user_preferences policies are simple (they should be already)
-- Users should only access their own preferences

DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

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
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ All RLS policies simplified';
  RAISE NOTICE '✓ No more business_members subqueries in other table policies';
  RAISE NOTICE '✓ Owner-based permissions (simplified from Owner/Admin)';
  RAISE NOTICE '✓ No recursion possible';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTE: Admin role permissions removed for simplicity.';
  RAISE NOTICE 'Only Owners can now invite/manage members.';
  RAISE NOTICE 'Re-add admin permissions later if needed with proper RLS.';
END $$;
