# Hospitality Engine - Database Schema

This schema is designed for Supabase PostgreSQL database with Row Level Security (RLS).

## Core Tables

### 1. `profiles`
Extends Supabase auth.users with additional user information.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  job_title TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `profiles_email_idx` ON email

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile

---

### 2. `organizations`
Business/restaurant information.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL, -- restaurant, cafe, bar, hotel, etc.
  logo_url TEXT,

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',

  -- Contact
  phone TEXT,
  website TEXT,

  -- Legal
  tax_id TEXT,
  license_number TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `organizations_business_name_idx` ON business_name

---

### 3. `organization_members`
Junction table for users and organizations.

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, manager, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, user_id)
);
```

**Indexes:**
- `org_members_org_id_idx` ON organization_id
- `org_members_user_id_idx` ON user_id

**RLS Policies:**
- Users can view members of organizations they belong to
- Only owners/admins can add/remove members

---

### 4. `user_preferences`
User application preferences and settings.

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notifications
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,

  -- Regional
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'America/Los_Angeles',
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/DD/YYYY',

  -- Display
  theme TEXT DEFAULT 'light', -- light, dark, auto

  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
- Users can view and update their own preferences

---

### 5. `subscriptions`
Subscription and billing information.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

  -- Plan Details
  plan_name TEXT NOT NULL, -- starter, professional, enterprise
  plan_price DECIMAL(10, 2) NOT NULL,
  plan_interval TEXT NOT NULL, -- month, year

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,

  -- External IDs (Stripe, etc.)
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `subscriptions_org_id_idx` ON organization_id
- `subscriptions_stripe_customer_idx` ON stripe_customer_id

---

### 6. `payment_methods`
Stored payment method information.

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Card Details (tokenized)
  type TEXT NOT NULL DEFAULT 'card',
  last4 TEXT NOT NULL,
  brand TEXT NOT NULL, -- visa, mastercard, amex
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,

  -- Status
  is_default BOOLEAN DEFAULT false,

  -- External ID
  stripe_payment_method_id TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `payment_methods_org_id_idx` ON organization_id

---

### 7. `invoices`
Billing history and invoices.

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Invoice Details
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- paid, pending, failed

  -- Dates
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,

  -- External
  stripe_invoice_id TEXT,
  pdf_url TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `invoices_org_id_idx` ON organization_id
- `invoices_number_idx` ON invoice_number
- `invoices_status_idx` ON status

---

### 8. `user_sessions`
Track active user sessions for security.

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session Info
  device TEXT,
  location TEXT,
  ip_address TEXT,
  user_agent TEXT,

  -- Status
  is_current BOOLEAN DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `user_sessions_user_id_idx` ON user_id
- `user_sessions_last_active_idx` ON last_active_at

---

## Database Functions

### `handle_new_user()`
Automatically create profile and preferences when a new user signs up.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### `update_updated_at()`
Automatically update the `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Row Level Security (RLS) Policies

### Profiles
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Organizations
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can view organizations they are members of
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
    )
  );

-- Organization owners can update
CREATE POLICY "Owners can update organization"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
```

### User Preferences
```sql
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## Storage Buckets

### `avatars`
User profile pictures.

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- RLS Policy
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public avatars are viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

### `organization-logos`
Business logos.

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true);
```

---

## Migration Order

1. Create `profiles` table and trigger
2. Create `organizations` table
3. Create `organization_members` table
4. Create `user_preferences` table
5. Create `subscriptions` table
6. Create `payment_methods` table
7. Create `invoices` table
8. Create `user_sessions` table
9. Create storage buckets
10. Enable RLS policies

---

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for timezone awareness
- UUIDs used for primary keys for better scalability
- Foreign keys have `ON DELETE CASCADE` where appropriate
- Indexes created on frequently queried columns
- RLS policies ensure data isolation between users/organizations
