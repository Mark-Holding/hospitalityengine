# Business-Level Authentication Implementation Guide
## Multi-Workspace Model (Industry Standard)

## Overview
Upgrade the current user-level authentication to include business-level authentication with `business_id`, role-based access control (RBAC), and team management features. Users can belong to multiple businesses and switch between them.

## Current State
- ✅ User authentication via Supabase Auth
- ✅ Individual user accounts in `profiles` table
- ✅ Email disabled for dev (will re-enable for production)
- ❌ No business/organization structure
- ❌ No team member management
- ❌ No role-based permissions

## Target State
- ✅ Business-level data isolation
- ✅ Users can belong to MULTIPLE businesses
- ✅ Users can switch between their businesses
- ✅ First user to create business becomes owner/admin
- ✅ Additional users join via invitation (email link with token)
- ✅ Role-based access control (Owner, Admin, Member)
- ✅ Business settings management

## Business Model Rules (Industry Standard)
- **Multi-Business Support**: Users can be part of multiple businesses (like Slack, Notion, GitHub)
- **Active Business Context**: User has one "active" business at a time, can switch between them
- **Business Creation**: Anyone can create a new business and become owner
- **Joining Existing Business**: Invitation-only via email token
- **Business Switcher**: UI element to switch between businesses user belongs to

---

## DATABASE SCHEMA

### Complete Database Schema

```sql
-- 1. Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE, -- For URLs like /workspace/acme-restaurant
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_status VARCHAR(50) DEFAULT 'active',
  settings JSONB DEFAULT '{}'::JSONB
);

-- 2. User roles enum
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');

-- 3. Business members (junction table for many-to-many)
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

-- 4. Invitations table (for invite tokens)
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(business_id, email, accepted_at) -- Prevent duplicate active invites
);

-- 5. Update User preferences (stores last active business per user)
user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX idx_business_members_business_id ON business_members(business_id);
CREATE INDEX idx_business_members_user_id ON business_members(user_id);
CREATE INDEX idx_business_members_active ON business_members(is_active);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_business_id ON invitations(business_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);



-- 7. RLS Policies for businesses table
CREATE POLICY "Users can view businesses they belong to"
  ON businesses FOR SELECT
  USING (
    id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Business owners can update their business"
  ON businesses FOR UPDATE
  USING (
    id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can create businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Business owners can delete their business"
  ON businesses FOR DELETE
  USING (owner_id = auth.uid());

-- 8. RLS Policies for business_members table
CREATE POLICY "Users can view members of their businesses"
  ON business_members FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Owners and admins can manage members"
  ON business_members FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

CREATE POLICY "Owners and admins can update members"
  ON business_members FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

CREATE POLICY "Owners and admins can remove members"
  ON business_members FOR DELETE
  USING (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- 9. RLS Policies for invitations table
CREATE POLICY "Users can view invitations for their businesses"
  ON invitations FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
    OR email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

CREATE POLICY "Owners and admins can update invitations"
  ON invitations FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- 10. RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());



-- 11. Helper Functions
CREATE OR REPLACE FUNCTION get_user_active_business_id()
RETURNS UUID AS $$
  SELECT active_business_id 
  FROM user_preferences 
  WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

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

CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
  SELECT encode(gen_random_bytes(32), 'base64');
$$ LANGUAGE SQL VOLATILE;

-- 12. Trigger to create business_member when business is created
CREATE OR REPLACE FUNCTION create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO business_members (business_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_owner_membership
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_owner_membership();

-- 13. Trigger to set active business when joining first business
CREATE OR REPLACE FUNCTION set_first_active_business()
RETURNS TRIGGER AS $$
BEGIN
  -- If user has no active business set, set this as active
  IF NOT EXISTS (
    SELECT 1 FROM user_preferences WHERE user_id = NEW.user_id
  ) THEN
    INSERT INTO user_preferences (user_id, active_business_id)
    VALUES (NEW.user_id, NEW.business_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_first_active_business
  AFTER INSERT ON business_members
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION set_first_active_business();

-- 14. Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
  DELETE FROM invitations 
  WHERE expires_at < NOW() 
    AND accepted_at IS NULL;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 15. Trigger to update businesses.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## IMPLEMENTATION STEPS

### PHASE 1: HOOKS & CONTEXT

#### Step 1: Create Multi-Business User Profile Hook

**File**: `src/hooks/useUserProfile.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type UserRole = 'owner' | 'admin' | 'member';

export interface BusinessMembership {
  id: string;
  business_id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  joined_at: string;
  business: {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  activeBusinessId: string | null;
  businesses: BusinessMembership[];
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Fetch user's active business preference
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('active_business_id')
        .eq('user_id', user.id)
        .single();

      // Fetch all businesses user belongs to
      const { data: memberships, error: memberError } = await supabase
        .from('business_members')
        .select(`
          id,
          business_id,
          user_id,
          role,
          is_active,
          joined_at,
          business:businesses (
            id,
            name,
            slug,
            owner_id
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (memberError) throw memberError;

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email!,
        activeBusinessId: prefs?.active_business_id || memberships?.[0]?.business_id || null,
        businesses: memberships || []
      };

      setProfile(userProfile);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function switchBusiness(businessId: string) {
    if (!profile) return;

    try {
      // Update active business in preferences
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: profile.id,
          active_business_id: businessId,
          updated_at: new Date().toISOString()
        });

      // Update local state
      setProfile({
        ...profile,
        activeBusinessId: businessId
      });

      // Trigger page refresh to reload data for new business
      window.location.reload();
    } catch (err) {
      setError(err as Error);
    }
  }

  const getActiveBusiness = (): BusinessMembership | null => {
    if (!profile?.activeBusinessId) return null;
    return profile.businesses.find(b => b.business_id === profile.activeBusinessId) || null;
  };

  const hasRole = (minimumRole: UserRole, businessId?: string): boolean => {
    const targetBusinessId = businessId || profile?.activeBusinessId;
    if (!targetBusinessId) return false;
    
    const membership = profile?.businesses.find(b => b.business_id === targetBusinessId);
    if (!membership) return false;
    
    const roleHierarchy = { member: 1, admin: 2, owner: 3 };
    const userRoleLevel = roleHierarchy[membership.role];
    const requiredRoleLevel = roleHierarchy[minimumRole];
    
    return userRoleLevel >= requiredRoleLevel;
  };

  const activeBusiness = getActiveBusiness();

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    switchBusiness,
    hasRole,
    activeBusiness,
    isOwner: activeBusiness?.role === 'owner',
    isAdmin: hasRole('admin'),
    currentBusinessId: profile?.activeBusinessId,
    hasMultipleBusinesses: (profile?.businesses.length || 0) > 1,
    hasBusiness: (profile?.businesses.length || 0) > 0
  };
}
```

**Acceptance Criteria**:
- Fetches all businesses user belongs to
- Tracks active business
- Provides business switching functionality
- Role checking works for active business
- Handles multi-business scenarios

---

#### Step 2: Create Business Context Provider

**File**: `src/contexts/BusinessContext.tsx`

```typescript
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserProfile, UserProfile, BusinessMembership } from '@/hooks/useUserProfile';

interface BusinessContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  switchBusiness: (businessId: string) => Promise<void>;
  hasRole: (role: 'owner' | 'admin' | 'member', businessId?: string) => boolean;
  activeBusiness: BusinessMembership | null;
  isOwner: boolean;
  isAdmin: boolean;
  currentBusinessId: string | null;
  hasMultipleBusinesses: boolean;
  hasBusiness: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const businessData = useUserProfile();

  return (
    <BusinessContext.Provider value={businessData}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessContext must be used within BusinessProvider');
  }
  return context;
}
```

---

#### Step 3: Wrap App with Business Provider

**File**: `src/app/dashboard/layout.tsx`

```typescript
import { BusinessProvider } from '@/contexts/BusinessContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      {/* Existing layout code */}
      {children}
    </BusinessProvider>
  );
}
```

---

### PHASE 2: ONBOARDING & BUSINESS CREATION

#### Step 4: Create Business Onboarding Page

**File**: `src/app/onboarding/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useBusinessContext } from '@/contexts/BusinessContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { hasBusiness, refetch } = useBusinessContext();
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if user already has a business
  if (hasBusiness) {
    router.push('/dashboard');
    return null;
  }

  async function handleCreateBusiness(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessName,
          owner_id: user.id,
          slug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Membership is created automatically via trigger
      // Set as active business
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          active_business_id: business.id
        });

      // Refresh profile and redirect
      await refetch();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold">Create Your Business</h2>
          <p className="mt-2 text-gray-600">
            Let's get started by setting up your business
          </p>
        </div>

        <form onSubmit={handleCreateBusiness} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Acme Restaurant"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Business'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- New users without business see onboarding
- Creates business with user as owner
- Automatically creates business_member record (via trigger)
- Sets as active business
- Redirects to dashboard

---

#### Step 5: Add Onboarding Check to Auth Flow

**File**: `src/middleware.ts` or auth guard component

```typescript
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RequireBusinessGuard({ children }: { children: React.ReactNode }) {
  const { hasBusiness, loading } = useBusinessContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasBusiness) {
      router.push('/onboarding');
    }
  }, [hasBusiness, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasBusiness) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
```

---

### PHASE 3: BUSINESS SWITCHER UI

#### Step 6: Create Business Switcher Component

**File**: `src/components/BusinessSwitcher.tsx`

```typescript
'use client';

import { useBusinessContext } from '@/contexts/BusinessContext';
import { useState } from 'react';

export function BusinessSwitcher() {
  const { 
    activeBusiness, 
    profile, 
    switchBusiness, 
    hasMultipleBusinesses 
  } = useBusinessContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!hasMultipleBusinesses) {
    // Just show business name if only one business
    return (
      <div className="px-3 py-2 text-sm font-medium">
        {activeBusiness?.business.name}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
      >
        <span className="text-sm font-medium">
          {activeBusiness?.business.name || 'Select Business'}
        </span>
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-50">
          <div className="py-1">
            {profile?.businesses.map((business) => (
              <button
                key={business.business_id}
                onClick={() => {
                  switchBusiness(business.business_id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  business.business_id === activeBusiness?.business_id
                    ? 'bg-gray-50 font-medium'
                    : ''
                }`}
              >
                <div>{business.business.name}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {business.role}
                </div>
              </button>
            ))}
            
            <div className="border-t mt-1 pt-1">
              <a
                href="/onboarding"
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
              >
                + Create New Business
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Acceptance Criteria**:
- Shows current business name
- Dropdown with all user's businesses
- Can switch between businesses
- Shows user's role in each business
- Link to create new business

---

#### Step 7: Add Business Switcher to Navigation

**File**: Update your navigation component (e.g., `src/components/Navigation.tsx`)

```typescript
import { BusinessSwitcher } from '@/components/BusinessSwitcher';

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Logo />
          <BusinessSwitcher />
        </div>
        
        {/* Rest of navigation */}
      </div>
    </nav>
  );
}
```

---

### PHASE 4: INVITATION SYSTEM

#### Step 8: Create Invitation Service

**File**: `src/lib/invitations.ts`

```typescript
import { supabase } from '@/lib/supabase';

export async function createInvitation(
  businessId: string,
  email: string,
  role: 'admin' | 'member'
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user already member
  const { data: existing } = await supabase
    .from('business_members')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    throw new Error('User is already a member');
  }

  // Generate token
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);

  // Create invitation
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      token,
      business_id: businessId,
      email,
      role,
      invited_by: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    inviteUrl: `${window.location.origin}/invite/${token}`
  };
}

export async function acceptInvitation(token: string, userId: string) {
  // Get invitation
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*, business:businesses(name)')
    .eq('token', token)
    .is('accepted_at', null)
    .single();

  if (error || !invitation) {
    throw new Error('Invalid or expired invitation');
  }

  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired');
  }

  // Add user to business
  const { error: memberError } = await supabase
    .from('business_members')
    .insert({
      business_id: invitation.business_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by,
      joined_at: new Date().toISOString()
    });

  if (memberError) throw memberError;

  // Mark invitation as accepted
  await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  return invitation;
}
```

---

#### Step 9: Create Team Management Page

**File**: `src/app/dashboard/settings/team/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { createInvitation } from '@/lib/invitations';

export default function TeamManagementPage() {
  const { currentBusinessId, isAdmin } = useBusinessContext();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (currentBusinessId) {
      fetchMembers();
      fetchInvitations();
    }
  }, [currentBusinessId]);

  async function fetchMembers() {
    const { data } = await supabase
      .from('business_members')
      .select(`
        id,
        role,
        joined_at,
        user:user_id (
          id,
          email
        )
      `)
      .eq('business_id', currentBusinessId)
      .eq('is_active', true);

    setMembers(data || []);
  }

  async function fetchInvitations() {
    const { data } = await supabase
      .from('invitations')
      .select('*')
      .eq('business_id', currentBusinessId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString());

    setInvitations(data || []);
  }

  if (!isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Invite Member
        </button>
      </div>

      {/* Members table */}
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member: any) => (
              <tr key={member.id}>
                <td className="px-6 py-4">{member.user.email}</td>
                <td className="px-6 py-4 capitalize">{member.role}</td>
                <td className="px-6 py-4">
                  {new Date(member.joined_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {/* Change role, remove buttons */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Pending Invitations</h2>
          <div className="bg-white rounded-lg shadow">
            {/* Invitations list */}
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInviteModal && (
        <InviteModal
          businessId={currentBusinessId!}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            fetchInvitations();
            setShowInviteModal(false);
          }}
        />
      )}
    </div>
  );
}
```

---

#### Step 10: Create Invite Modal Component

**File**: `src/app/dashboard/settings/team/components/InviteModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createInvitation } from '@/lib/invitations';

interface InviteModalProps {
  businessId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteModal({ businessId, onClose, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createInvitation(businessId, email, role);
      setInviteUrl(result.inviteUrl);
      
      // Optionally send email here
      // await sendInvitationEmail(email, result.inviteUrl);
      
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (inviteUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Invitation Created!</h2>
          <p className="mb-4">Share this link with the user:</p>
          <div className="bg-gray-100 p-3 rounded mb-4 break-all text-sm">
            {inviteUrl}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteUrl);
              alert('Copied to clipboard!');
            }}
            className="w-full bg-blue-600 text-white py-2 rounded-md mb-2"
          >
            Copy Link
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>
        
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="colleague@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

#### Step 11: Create Invite Acceptance Page

**File**: `src/app/invite/[token]/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { acceptInvitation } from '@/lib/invitations';

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvitation();
  }, [params.token]);

  async function fetchInvitation() {
    try {
      const { data } = await supabase
        .from('invitations')
        .select('*, business:businesses(name)')
        .eq('token', params.token)
        .is('accepted_at', null)
        .single();

      if (!data || new Date(data.expires_at) < new Date()) {
        setError('Invalid or expired invitation');
      } else {
        setInvitation(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to signup with return URL
        router.push(`/signup?invite=${params.token}`);
        return;
      }

      await acceptInvitation(params.token, user.id);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4">You're Invited!</h1>
        <p className="mb-6">
          You've been invited to join <strong>{invitation.business.name}</strong> as a{' '}
          <span className="capitalize">{invitation.role}</span>.
        </p>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Accepting...' : 'Accept Invitation'}
        </button>
      </div>
    </div>
  );
}
```

---

### PHASE 5: UPDATE EXISTING FEATURES

#### Step 12: Update All Data Queries

**Files**: All components that fetch/create/update data

Update all queries to use active business:

```typescript
import { useBusinessContext } from '@/contexts/BusinessContext';

function MenuItemsList() {
  const { currentBusinessId } = useBusinessContext();

  // Fetch data
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('business_id', currentBusinessId);

  // Create data
  const { data } = await supabase
    .from('menu_items')
    .insert({
      ...menuItemData,
      business_id: currentBusinessId
    });
}
```

**Files to update**:
- List View component
- Menu Item component
- Ingredients Lookup component
- Components Lookup component
- Suppliers component

---

### PHASE 6: MIGRATION

#### Step 13: Migrate Existing Users

**SQL Migration Script**:

```sql
-- Migration for existing users to multi-business model

DO $$
DECLARE
  user_record RECORD;
  new_business_id UUID;
BEGIN
  -- Loop through all users in profiles
  FOR user_record IN 
    SELECT id, email FROM auth.users
  LOOP
    -- Check if user already has a business
    IF NOT EXISTS (
      SELECT 1 FROM business_members WHERE user_id = user_record.id
    ) THEN
      -- Create business for this user
      INSERT INTO businesses (name, owner_id)
      VALUES (
        COALESCE(user_record.email, 'Business ' || user_record.id::text),
        user_record.id
      )
      RETURNING id INTO new_business_id;
      
      -- business_member record created automatically via trigger
      
      -- Set as active business
      INSERT INTO user_preferences (user_id, active_business_id)
      VALUES (user_record.id, new_business_id);
      
      -- Update existing data with business_id
      UPDATE menu_items SET business_id = new_business_id WHERE user_id = user_record.id;
      UPDATE ingredients SET business_id = new_business_id WHERE user_id = user_record.id;
      UPDATE components SET business_id = new_business_id WHERE user_id = user_record.id;
      UPDATE suppliers SET business_id = new_business_id WHERE user_id = user_record.id;
      
      RAISE NOTICE 'Migrated user % to business %', user_record.email, new_business_id;
    END IF;
  END LOOP;
END $$;
```

---

### PHASE 7: TESTING

#### Step 14: Test All Scenarios

**Test Cases**:

1. ✅ New user creates business (becomes owner)
2. ✅ Owner invites admin and member
3. ✅ Invited user accepts invitation
4. ✅ User can be in multiple businesses
5. ✅ Business switcher works correctly
6. ✅ Data isolated per business
7. ✅ Role permissions work (owner/admin/member)
8. ✅ Cannot see other business data
9. ✅ Switching business reloads correct data
10. ✅ Invitation expires after 7 days

---

## COMPLETION CHECKLIST

- [ ] Database schema created with multi-business support
- [ ] User profile hook handles multiple businesses
- [ ] Business context provider implemented
- [ ] Business switcher component added to navigation
- [ ] Onboarding flow for first business
- [ ] Invitation system with tokens
- [ ] Team management page
- [ ] Invite acceptance page
- [ ] All data queries filter by active business_id
- [ ] Migration script for existing users
- [ ] All test scenarios pass
- [ ] Business switcher UX is smooth
- [ ] Role-based permissions work correctly

---

## RESOURCES

- [Supabase Multi-Tenancy Guide](https://supabase.com/docs/guides/auth/row-level-security#multi-tenancy)
- [Slack's Workspace Model](https://slack.com/help/articles/212675257-Join-a-Slack-workspace)
- [Notion's Workspace Switcher](https://www.notion.so/help/switch-between-workspaces)
