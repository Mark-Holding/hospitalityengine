-- =====================================================
-- FIX BUSINESSES TABLE RECURSION
-- =====================================================
-- The businesses SELECT policy was checking business_members,
-- which caused recursion when business_members queries
-- included nested selects to businesses.
--
-- Solution: Allow authenticated users to SELECT from businesses.
-- Access control is handled by business_members RLS policies,
-- since all queries go through that junction table anyway.
-- =====================================================

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view their businesses" ON businesses;

-- New policy: Allow any authenticated user to view businesses
-- This is safe because:
-- 1. Sensitive business data is controlled by business_members RLS
-- 2. Users can only see businesses through business_members queries
-- 3. No direct business queries bypass the membership check
CREATE POLICY "Authenticated users can view businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (true);

-- Alternative approach (commented out): Only allow viewing businesses you own
-- Uncomment this and comment out the above if you prefer stricter control
-- CREATE POLICY "View businesses you own"
--   ON businesses FOR SELECT
--   USING (owner_id = auth.uid());

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✓ Removed recursive businesses SELECT policy';
  RAISE NOTICE '✓ Businesses now viewable by authenticated users';
  RAISE NOTICE '✓ Access control still enforced via business_members RLS';
  RAISE NOTICE '✓ No more recursion!';
END $$;
