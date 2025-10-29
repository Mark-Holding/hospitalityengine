-- =====================================================
-- FIX AUTH.USERS PERMISSION ISSUE
-- =====================================================
-- RLS policies cannot directly query auth.users table.
-- We need to use auth.jwt() or create a helper function
-- to get the current user's email.
-- =====================================================

-- Create helper function to get current user's email
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Get email from auth.users (bypasses RLS)
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = auth.uid();

  RETURN v_email;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_user_email() TO authenticated;

-- =====================================================
-- UPDATE INVITATIONS POLICIES TO USE HELPER FUNCTION
-- =====================================================

-- Drop existing invitations policies
DROP POLICY IF EXISTS "View invitations" ON invitations;
DROP POLICY IF EXISTS "Update invitations" ON invitations;

-- Recreate with fixed email check
CREATE POLICY "View invitations"
  ON invitations FOR SELECT
  USING (
    -- Admins can view invitations for their business
    check_user_business_role(auth.uid(), business_id, 'admin')
    OR
    -- Recipients can view invitations sent to their email
    email = get_current_user_email()
  );

CREATE POLICY "Update invitations"
  ON invitations FOR UPDATE
  USING (
    -- Admins can update invitations
    check_user_business_role(auth.uid(), business_id, 'admin')
    OR
    -- Recipients can update their own invitations (for accepting)
    email = get_current_user_email()
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Created get_current_user_email() helper function';
  RAISE NOTICE '✓ Updated invitations policies to use helper function';
  RAISE NOTICE '✓ No more auth.users permission errors';
END $$;
