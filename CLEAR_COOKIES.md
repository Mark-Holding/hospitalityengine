# Clear Old Supabase Cookies

You have cookies from multiple Supabase projects. To fix auth issues:

## Method 1: Browser DevTools (Recommended)
1. Open your browser at `http://localhost:3000`
2. Press F12 to open DevTools
3. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click **Cookies** → `http://localhost:3000`
5. Delete all cookies starting with `sb-mpyyzltcyupsdjmehbkc-`
6. Keep only cookies starting with `sb-eqvffkvxzbczezvhrtop-` (your current project)
7. Refresh the page

## Method 2: Clear All Cookies
1. Open DevTools (F12)
2. Application → Cookies → Right-click → Clear all
3. Refresh the page
4. Try logging in again

## Why This Matters
Old cookies from previous Supabase projects can:
- Cause "Auth session missing" errors
- Interfere with proper authentication
- Create confusion in the auth flow

After clearing, you should only see cookies for your current project (`eqvffkvxzbczezvhrtop`).
