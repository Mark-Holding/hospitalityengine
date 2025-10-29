# Business-Level Authentication Implementation Plan

## Overview
Upgrade from user-level to business-level authentication with multi-workspace support, role-based access control (RBAC), and team management.

## Current State
- ✅ User authentication via Supabase Auth
- ✅ Individual user accounts in `profiles` table
- ✅ Server-side rendering with Next.js 15
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

## Business Model (Industry Standard)
- **Multi-Business Support**: Users can be part of multiple businesses (like Slack, Notion, GitHub)
- **Active Business Context**: User has one "active" business at a time, can switch between them
- **Business Creation**: Anyone can create a new business and become owner
- **Joining Existing Business**: Invitation-only via email token
- **Business Switcher**: UI element to switch between businesses user belongs to

---

## PHASE 1: DATABASE FOUNDATION

### Step 1: Create Core Tables
Create the complete schema with:
- `businesses` table
- `business_members` junction table (many-to-many)
- `invitations` table
- Update `user_preferences` table

### Step 2: Create Enum & Indexes
- `user_role` enum (owner, admin, member)
- Performance indexes on foreign keys and frequently queried columns

### Step 3: Implement RLS Policies
Row-level security for:
- Businesses (view only your businesses)
- Business members (manage only if admin/owner)
- Invitations (create/view based on role)
- User preferences (own preferences only)

### Step 4: Create Helper Functions
- `get_user_active_business_id()` - Get user's active business
- `check_user_role_in_business()` - Check user role with hierarchy
- `generate_invite_token()` - Generate secure tokens
- `cleanup_expired_invitations()` - Maintenance function

### Step 5: Create Triggers
- Auto-create owner membership when business created
- Auto-set first business as active for new users
- Update timestamps on business changes

### Step 6: Generate TypeScript Types
Update `database.types.ts` from Supabase schema

---

## PHASE 2: SERVER-SIDE CONTEXT

### Step 7: Create Server Helpers
Create server-side utilities:
- `getActiveBusinessId()` - From cookies/DB
- `getUserBusinesses()` - Fetch all user's businesses
- `hasBusinessRole()` - Server-side permission check

### Step 8: Update Middleware
Enhance middleware to:
- Check if user has any business
- Redirect to onboarding if no business
- Handle business context in cookies
- Protect business-specific routes

---

## PHASE 3: CLIENT CONTEXT & HOOKS

### Step 9: Create useUserProfile Hook
Hook to manage:
- Fetch all user's businesses
- Track active business
- Switch between businesses
- Role checking utilities

### Step 10: Create BusinessContext Provider
React context to provide:
- User profile data
- Active business
- Business switching functionality
- Permission checking functions

---

## PHASE 4: ONBOARDING FLOW

### Step 11: Create Onboarding Page
Page for users without a business:
- Business name input
- Auto-create business with user as owner
- Auto-set as active business
- Redirect to dashboard

### Step 12: Create RequireBusinessGuard Component
Guard component that:
- Checks if user has business
- Redirects to onboarding if not
- Shows loading state

### Step 13: Update Dashboard Layout
Wrap dashboard with:
- BusinessProvider
- RequireBusinessGuard (if needed)

---

## PHASE 5: BUSINESS SWITCHER UI

### Step 14: Create BusinessSwitcher Component
Dropdown component with:
- Current business name
- List of all user's businesses
- User's role in each business
- "Create new business" link
- Smooth switching with reload

### Step 15: Add to Navigation
Integrate BusinessSwitcher into:
- Dashboard header
- Visible on all dashboard pages

---

## PHASE 6: TEAM MANAGEMENT & INVITATIONS

### Step 16: Create Invitation Service
Functions for:
- `createInvitation()` - Generate invite link
- `acceptInvitation()` - Process acceptance
- `revokeInvitation()` - Cancel invite

### Step 17: Build Team Management Page
Page showing:
- Current team members table
- Member roles
- Invite button (admin/owner only)
- Change role functionality
- Remove member functionality

### Step 18: Create InviteModal Component
Modal for inviting users:
- Email input
- Role selection
- Generate shareable link
- Copy to clipboard

### Step 19: Create Invite Acceptance Page
Page at `/invite/[token]`:
- Validate token
- Show business name
- Accept/decline buttons
- Auto-join business on accept
- Handle expired invites

---

## PHASE 7: PERMISSIONS & GUARDS

### Step 20: Create Permission System
Build:
- `hasRole()` function with hierarchy
- `<OwnerOnly>` component
- `<AdminOnly>` component
- `<MemberPlus>` component
- Role-based UI hiding/showing

---

## PHASE 8: DATA MODEL UPDATES

### Step 21: Update Data Queries
When building features, ensure all queries:
- Filter by `business_id`
- Include `business_id` on inserts
- Use active business from context

**Applies to future tables**:
- menu_items
- ingredients
- components
- suppliers
- orders
- invoices
- etc.

---

## PHASE 9: TESTING

### Step 22: Test Complete Flow
Test scenarios:
- New user signup → create business → becomes owner
- Owner invites admin → admin accepts
- Owner invites member → member accepts
- User belongs to multiple businesses
- Business switching works correctly

### Step 23: Test Role Permissions
Verify:
- Owner can do everything
- Admin can invite and manage members
- Member can only view (no management access)
- UI hides features based on role

### Step 24: Test Data Isolation
Confirm:
- Users only see data for active business
- Switching business shows different data
- Cannot access other business data via API
- RLS policies enforcing isolation

---

## ARCHITECTURE DECISIONS

### 1. Server-First Approach
- Next.js 15 uses server components by default
- Business context available server-side
- Middleware handles redirects and guards

### 2. Hybrid Storage Strategy
- Active business ID in cookie (fast access)
- Database as source of truth
- Sync on every business switch

### 3. Role Hierarchy
```
Owner (level 3)
  └─ Can do everything
  └─ Can delete business
  └─ Cannot be removed from business

Admin (level 2)
  └─ Can invite members
  └─ Can manage team
  └─ Can update business settings
  └─ Cannot delete business

Member (level 1)
  └─ Can view business data
  └─ Can use tools
  └─ Cannot manage team
  └─ Cannot change settings
```

### 4. Invitation Flow
```
1. Admin/Owner creates invitation
   └─ Generate unique token
   └─ Store in invitations table
   └─ Create shareable link

2. Invitee clicks link
   └─ If not logged in: redirect to signup
   └─ If logged in: show acceptance page

3. Invitee accepts
   └─ Create business_member record
   └─ Set as active business (if first)
   └─ Mark invitation as accepted
```

---

## DATABASE SCHEMA

### Businesses Table
```sql
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
```

### Business Members Table (Junction)
```sql
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');

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
```

### Invitations Table
```sql
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
  UNIQUE(business_id, email, accepted_at)
);
```

### User Preferences Update
```sql
ALTER TABLE user_preferences
ADD COLUMN active_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL;
```

---

## COMPONENT STRUCTURE

```
src/
├── hooks/
│   └── useUserProfile.ts          # Fetch businesses, switch active
├── contexts/
│   └── BusinessContext.tsx        # Provider for business data
├── components/
│   ├── guards/
│   │   ├── RequireBusinessGuard.tsx
│   │   ├── OwnerOnly.tsx
│   │   └── AdminOnly.tsx
│   └── business/
│       ├── BusinessSwitcher.tsx
│       └── InviteModal.tsx
├── app/
│   ├── onboarding/
│   │   └── page.tsx               # Create first business
│   ├── invite/
│   │   └── [token]/
│   │       └── page.tsx           # Accept invitation
│   └── dashboard/
│       ├── layout.tsx             # Wrap with BusinessProvider
│       └── settings/
│           └── team/
│               └── page.tsx       # Team management
└── lib/
    ├── supabase/
    │   └── business-helpers.ts    # Server-side business utils
    └── invitations.ts             # Invitation service
```

---

## SUCCESS CRITERIA

- [ ] ✅ User can create business and become owner
- [ ] ✅ Owner can invite team members with roles
- [ ] ✅ Invited users can accept and join business
- [ ] ✅ Users can belong to multiple businesses
- [ ] ✅ Users can switch between businesses smoothly
- [ ] ✅ Business switcher shows all businesses + roles
- [ ] ✅ Role-based permissions work (owner/admin/member)
- [ ] ✅ Data is isolated per business
- [ ] ✅ RLS policies prevent unauthorized access
- [ ] ✅ Middleware redirects work correctly
- [ ] ✅ Onboarding flow for new users works
- [ ] ✅ Team management page functional
- [ ] ✅ Invitation system works end-to-end

---

## FUTURE ENHANCEMENTS

- Email notifications for invitations
- Business branding (logo, colors)
- Audit logs for business actions
- Advanced permissions (custom roles)
- Business transfer (change owner)
- Business deletion with data export
- SSO/SAML integration for enterprise

---

## NOTES

- This is a major architectural change
- Test thoroughly after each phase
- Consider data migration if existing users/data
- Keep old endpoints working during transition
- Document breaking changes
- Plan downtime if needed for DB changes

---

**Last Updated**: 2025-10-28
**Status**: Implementation in progress
**Next Step**: Phase 1 - Database Foundation
