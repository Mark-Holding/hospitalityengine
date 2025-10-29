-- =====================================================
-- BUSINESS-LEVEL AUTHENTICATION SCHEMA
-- Multi-Workspace with RBAC Implementation
-- =====================================================
-- Run this in Supabase SQL Editor
-- Date: 2025-10-28
-- =====================================================

-- =====================================================
-- STEP 1: CREATE ENUM FOR USER ROLES
-- =====================================================

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');

-- =====================================================
-- STEP 2: CREATE BUSINESSES TABLE
-- =====================================================

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_status VARCHAR(50) DEFAULT 'active',
  settings JSONB DEFAULT '{}'::JSONB
);

-- Add comment
COMMENT ON TABLE businesses IS 'Business/organization entities. Users can belong to multiple businesses.';

-- =====================================================
-- STEP 3: CREATE BUSINESS_MEMBERS JUNCTION TABLE
-- =====================================================

CREATE TABLE business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(business_id, user_id)
);

-- Add comment
COMMENT ON TABLE business_members IS 'Junction table connecting users to businesses with roles. Many-to-many relationship.';

-- =====================================================
-- STEP 4: CREATE INVITATIONS TABLE
-- =====================================================

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Add unique constraint to prevent duplicate pending invites
CREATE UNIQUE INDEX idx_unique_pending_invite
  ON invitations(business_id, email)
  WHERE accepted_at IS NULL;

-- Add comment
COMMENT ON TABLE invitations IS 'Email-based invitations for users to join businesses. Token-based with expiration.';

-- =====================================================
-- STEP 5: UPDATE USER_PREFERENCES TABLE
-- =====================================================

-- Add active_business_id column to existing user_preferences table
ALTER TABLE user_preferences
ADD COLUMN active_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL;

-- Add comment
COMMENT ON COLUMN user_preferences.active_business_id IS 'Currently active/selected business for this user. Used for business switcher.';

-- =====================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Business members indexes
CREATE INDEX idx_business_members_business_id ON business_members(business_id);
CREATE INDEX idx_business_members_user_id ON business_members(user_id);
CREATE INDEX idx_business_members_active ON business_members(is_active) WHERE is_active = true;
CREATE INDEX idx_business_members_role ON business_members(role);

-- Invitations indexes
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_business_id ON invitations(business_id);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at) WHERE accepted_at IS NULL;

-- Businesses indexes
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);

-- User preferences index
CREATE INDEX idx_user_preferences_active_business ON user_preferences(active_business_id);

-- =====================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- user_preferences RLS should already be enabled, but ensure it
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: CREATE RLS POLICIES FOR BUSINESSES TABLE
-- =====================================================

-- Users can view businesses they belong to
CREATE POLICY "Users can view their businesses"
  ON businesses FOR SELECT
  USING (
    id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Authenticated users can create businesses (become owner)
CREATE POLICY "Authenticated users can create businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Owners and admins can update their business
CREATE POLICY "Owners and admins can update business"
  ON businesses FOR UPDATE
  USING (
    id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- Only business owner can delete business
CREATE POLICY "Owner can delete business"
  ON businesses FOR DELETE
  USING (owner_id = auth.uid());

-- =====================================================
-- STEP 9: CREATE RLS POLICIES FOR BUSINESS_MEMBERS
-- =====================================================

-- Users can view members of businesses they belong to
CREATE POLICY "View members of own businesses"
  ON business_members FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Owners and admins can add members
CREATE POLICY "Owners and admins can add members"
  ON business_members FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- Owners and admins can update members
CREATE POLICY "Owners and admins can update members"
  ON business_members FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- Owners and admins can remove members (soft delete via is_active)
CREATE POLICY "Owners and admins can remove members"
  ON business_members FOR DELETE
  USING (
    business_id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- =====================================================
-- STEP 10: CREATE RLS POLICIES FOR INVITATIONS
-- =====================================================

-- Owners and admins can view invitations for their businesses
-- Recipients can view invitations sent to their email
CREATE POLICY "View business invitations"
  ON invitations FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
    OR email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Owners and admins can create invitations
CREATE POLICY "Owners and admins can invite"
  ON invitations FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- Owners and admins can update invitations (e.g., mark as accepted)
-- Recipients can update invitations sent to them (accept)
CREATE POLICY "Update business invitations"
  ON invitations FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
    OR email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Owners and admins can delete/revoke invitations
CREATE POLICY "Owners and admins can revoke invitations"
  ON invitations FOR DELETE
  USING (
    business_id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- =====================================================
-- STEP 11: CREATE HELPER FUNCTIONS
-- =====================================================

-- Get user's currently active business ID
CREATE OR REPLACE FUNCTION get_user_active_business_id()
RETURNS UUID AS $$
  SELECT active_business_id
  FROM user_preferences
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_user_active_business_id() IS 'Returns the currently active business ID for the authenticated user';

-- Check if user has specific role in business (with hierarchy)
CREATE OR REPLACE FUNCTION check_user_role_in_business(
  check_business_id UUID,
  required_role user_role
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = check_business_id
      AND user_id = auth.uid()
      AND is_active = true
      AND (
        (required_role = 'member' AND role IN ('member', 'admin', 'owner'))
        OR (required_role = 'admin' AND role IN ('admin', 'owner'))
        OR (required_role = 'owner' AND role = 'owner')
      )
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

COMMENT ON FUNCTION check_user_role_in_business(UUID, user_role) IS 'Checks if user has at least the specified role in the business (respects role hierarchy)';

-- Generate secure invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
  SELECT encode(gen_random_bytes(32), 'base64');
$$ LANGUAGE SQL VOLATILE;

COMMENT ON FUNCTION generate_invite_token() IS 'Generates a secure random token for invitations';

-- Clean up expired invitations (maintenance function)
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM invitations
  WHERE expires_at < NOW()
    AND accepted_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_invitations() IS 'Deletes expired, unaccepted invitations. Returns count of deleted rows.';

-- =====================================================
-- STEP 12: CREATE TRIGGERS
-- =====================================================

-- Trigger function: Auto-create owner membership when business created
CREATE OR REPLACE FUNCTION create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create membership if owner_id is not null
  IF NEW.owner_id IS NOT NULL THEN
    INSERT INTO business_members (business_id, user_id, role, joined_at, invited_by)
    VALUES (NEW.id, NEW.owner_id, 'owner', NOW(), NEW.owner_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_owner_membership
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_owner_membership();

COMMENT ON FUNCTION create_owner_membership() IS 'Automatically creates owner membership when a business is created';

-- Trigger function: Set first business as active for new members
CREATE OR REPLACE FUNCTION set_first_active_business()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if user doesn't have an active business yet
  IF NOT EXISTS (
    SELECT 1 FROM user_preferences
    WHERE user_id = NEW.user_id
      AND active_business_id IS NOT NULL
  ) THEN
    INSERT INTO user_preferences (user_id, active_business_id, updated_at)
    VALUES (NEW.user_id, NEW.business_id, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      active_business_id = NEW.business_id,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_first_active_business
  AFTER INSERT ON business_members
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION set_first_active_business();

COMMENT ON FUNCTION set_first_active_business() IS 'Sets the first business a user joins as their active business';

-- Trigger function: Update businesses.updated_at timestamp
CREATE OR REPLACE FUNCTION update_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_businesses_updated_at();

COMMENT ON FUNCTION update_businesses_updated_at() IS 'Automatically updates the updated_at timestamp when business is modified';

-- =====================================================
-- STEP 13: CREATE VIEWS (OPTIONAL - FOR CONVENIENCE)
-- =====================================================

-- View: User's businesses with membership details
CREATE OR REPLACE VIEW user_businesses AS
SELECT
  bm.user_id,
  b.id AS business_id,
  b.name AS business_name,
  b.slug AS business_slug,
  b.owner_id,
  bm.role,
  bm.joined_at,
  bm.is_active,
  CASE WHEN b.owner_id = bm.user_id THEN true ELSE false END AS is_owner
FROM business_members bm
JOIN businesses b ON b.id = bm.business_id
WHERE bm.is_active = true;

COMMENT ON VIEW user_businesses IS 'Convenient view showing all active businesses for users with their roles';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE '✓ Migration completed successfully!';
  RAISE NOTICE '✓ Tables created: businesses, business_members, invitations';
  RAISE NOTICE '✓ user_preferences updated with active_business_id';
  RAISE NOTICE '✓ RLS policies applied to all tables';
  RAISE NOTICE '✓ Helper functions created';
  RAISE NOTICE '✓ Triggers configured';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Generate TypeScript types from Supabase dashboard';
  RAISE NOTICE '2. Test will happen via the application (auth.uid() not available in SQL editor)';
  RAISE NOTICE '3. Proceed with Phase 2: Server-side context';
END $$;

-- =====================================================
-- OPTIONAL: MANUAL TEST (requires actual user ID)
-- =====================================================
-- NOTE: auth.uid() doesn't work in SQL Editor context
-- Use this test only if you have a real user ID from auth.users table
--
-- Step 1: Get a real user ID
-- SELECT id, email FROM auth.users LIMIT 1;
--
-- Step 2: Replace 'YOUR_USER_ID_HERE' below with actual UUID
--
-- DO $$
-- DECLARE
--   test_user_id UUID := 'YOUR_USER_ID_HERE'; -- Replace this!
--   test_business_id UUID;
-- BEGIN
--   -- Create test business
--   INSERT INTO businesses (name, owner_id)
--   VALUES ('Test Business', test_user_id)
--   RETURNING id INTO test_business_id;
--
--   RAISE NOTICE 'Created business: %', test_business_id;
--
--   -- Verify membership was auto-created
--   IF EXISTS (
--     SELECT 1 FROM business_members
--     WHERE user_id = test_user_id
--       AND business_id = test_business_id
--       AND role = 'owner'
--   ) THEN
--     RAISE NOTICE '✓ Owner membership created automatically';
--   ELSE
--     RAISE EXCEPTION '✗ Owner membership NOT created';
--   END IF;
--
--   -- Verify active business was set
--   IF EXISTS (
--     SELECT 1 FROM user_preferences
--     WHERE user_id = test_user_id
--       AND active_business_id = test_business_id
--   ) THEN
--     RAISE NOTICE '✓ Active business set automatically';
--   ELSE
--     RAISE NOTICE '⚠ Active business not set (might already have one)';
--   END IF;
--
--   -- Cleanup test data
--   DELETE FROM businesses WHERE id = test_business_id;
--   RAISE NOTICE '✓ Test data cleaned up';
--   RAISE NOTICE '';
--   RAISE NOTICE '✓✓✓ ALL TESTS PASSED! ✓✓✓';
-- END $$;
