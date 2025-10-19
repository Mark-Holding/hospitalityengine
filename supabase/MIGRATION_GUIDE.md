# Supabase Migration Guide

## How to Run Migrations

### Step 1: Access Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project: **hospitalityengine**
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run Migration 001 - Profiles Table

1. Click **New Query** button
2. Open the file: `supabase/migrations/001_create_profiles_table.sql`
3. Copy the **entire contents** of the file
4. Paste into the SQL Editor
5. Click **Run** button (or press Cmd/Ctrl + Enter)

**Expected Result:**
```
Success. No rows returned
```

### Step 3: Verify the Migration

Run these verification queries one at a time in the SQL Editor:

#### Check that table was created:
```sql
SELECT * FROM public.profiles;
```

#### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';
```
Should show `rowsecurity = true`

#### Check RLS policies exist:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
```
Should show 3 policies: view, update, insert

#### Check triggers exist:
```sql
SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'public.profiles'::regclass;
```
Should show: `profiles_updated_at` and possibly others

### Step 4: Test Profile Auto-Creation

**Method 1: Sign up a new user**
1. Go to your app: http://localhost:3002/signup
2. Sign up with a NEW email (e.g., test@example.com)
3. Return to Supabase SQL Editor and run:
```sql
SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 1;
```
You should see the new profile with the email you just signed up with!

**Method 2: Check existing user profiles**
```sql
SELECT
  u.email,
  p.id,
  p.first_name,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```
All users should have a matching profile row.

## Troubleshooting

### Error: "permission denied for schema auth"
**Solution:** You need to run this as the postgres user or service_role. Make sure you're in the SQL Editor, not trying to query from the client.

### Error: "relation auth.users does not exist"
**Solution:** You might be in the wrong schema. The migration should work in the SQL Editor which has access to auth schema.

### Profile not created for new signups
**Possible causes:**
1. Trigger didn't install correctly - Run this to check:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Function has error - Check Supabase logs in Dashboard > Logs

### RLS blocking queries
**Remember:** RLS policies mean:
- Users can ONLY see their own profile
- Queries in SQL Editor use postgres role (bypasses RLS)
- Queries from your app use user's role (enforces RLS)

This is correct behavior!

## Next Steps

After successfully running and testing migration 001:
1. ✅ Profiles table created
2. ✅ Auto-creation trigger working
3. ✅ RLS policies active

Ready to move to migration 002: user_preferences table!
