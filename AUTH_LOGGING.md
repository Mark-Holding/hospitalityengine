# Authentication Logging Guide

## Overview
Comprehensive logging has been added to all authentication flows for development debugging.

## Log Prefixes

All logs are prefixed with emojis and labels for easy filtering:

- `🔒 [MIDDLEWARE]` - Middleware session validation
- `🔐 [AUTH CALLBACK]` - OAuth/email callback processing
- `🔑 [LOGIN]` - Login page actions
- `📝 [SIGNUP]` - Signup page actions
- `🚪 [LOGOUT]` - Logout actions
- `🍪 [MIDDLEWARE]` - Cookie operations

## What Each Component Logs

### Middleware (`src/lib/supabase/middleware.ts`)
- Session update start/completion
- Cookie operations (getAll/setAll)
- User authentication status
- Auth errors with details
- Route protection decisions
- Redirect actions

### Auth Callback (`src/app/auth/callback/route.ts`)
- Code exchange process
- Session creation
- User details
- Redirect decisions
- Error handling

### Login Page (`src/app/login/page.tsx`)
- Login attempt start
- Sign-in success/failure
- Session validation
- Redirect to dashboard

### Signup Page (`src/app/signup/page.tsx`)
- Signup attempt start
- Validation errors
- Email confirmation requirements
- Session creation
- Auto-login vs email confirmation

### Logout Button (`src/components/auth/LogoutButton.tsx`)
- Logout process start
- Sign-out success/failure
- Redirect to login

## How to Use

### Filter Logs in Browser Console
```javascript
// Show only auth-related logs
console.log messages containing: [LOGIN], [SIGNUP], [LOGOUT]
```

### Filter Logs in Terminal
```bash
# Show only middleware logs
grep "MIDDLEWARE"

# Show all auth logs
grep -E "(MIDDLEWARE|LOGIN|SIGNUP|LOGOUT|AUTH CALLBACK)"
```

## Expected Log Patterns

### Successful Login
```
🔑 [LOGIN] Starting login process for: user@example.com
✅ [LOGIN] Sign in successful
👤 [LOGIN] User: user@example.com ID: xxx-xxx-xxx
🔐 [LOGIN] Session: true
↗️ [LOGIN] Redirecting to /dashboard (hard navigation)

🔒 [MIDDLEWARE] Starting session update for: /dashboard
🍪 [MIDDLEWARE] Getting all cookies: ['sb-xxx-auth-token']
👤 [MIDDLEWARE] Calling supabase.auth.getUser()...
✅ [MIDDLEWARE] User authenticated: user@example.com ID: xxx-xxx-xxx
✅ [MIDDLEWARE] Session update complete for: /dashboard
```

### Successful Logout
```
🚪 [LOGOUT] Starting logout process...
🔓 [LOGOUT] Calling supabase.auth.signOut()...
✅ [LOGOUT] Sign out successful
↗️ [LOGOUT] Redirecting to /login (hard navigation)

🔒 [MIDDLEWARE] Starting session update for: /login
🍪 [MIDDLEWARE] Getting all cookies: ['__next_hmr_refresh_hash__']
❌ [MIDDLEWARE] Auth error: Auth session missing! 400
⚠️ [MIDDLEWARE] No authenticated user found
✅ [MIDDLEWARE] Session update complete for: /login
```

### Protected Route Access (Logged In)
```
🔒 [MIDDLEWARE] Starting session update for: /dashboard
✅ [MIDDLEWARE] User authenticated: user@example.com
✅ [MIDDLEWARE] Session update complete for: /dashboard
```

### Protected Route Access (Not Logged In)
```
🔒 [MIDDLEWARE] Starting session update for: /dashboard
⚠️ [MIDDLEWARE] No authenticated user found
🚫 [MIDDLEWARE] Protected route access denied, redirecting to /login
```

## When to Remove Logging

Consider removing or reducing logging when:
- Moving to production
- Performance becomes a concern
- Logs are cluttering development

## Files with Logging

1. `src/lib/supabase/middleware.ts` - Server-side session validation
2. `src/app/auth/callback/route.ts` - Auth callback handler
3. `src/app/login/page.tsx` - Login page
4. `src/app/signup/page.tsx` - Signup page
5. `src/components/auth/LogoutButton.tsx` - Logout component

## Common Issues and What to Look For

### Login Redirect Not Working
Look for:
- `✅ [LOGIN] Session: true` (should be true)
- `↗️ [LOGIN] Redirecting to /dashboard`
- Check if middleware logs show authentication after redirect

### Session Not Persisting
Look for:
- Cookie presence in middleware logs
- Auth errors in middleware
- Session validation failures

### Logout Not Working
Look for:
- `✅ [LOGOUT] Sign out successful`
- Cookies cleared in subsequent middleware calls
- "Auth session missing" after logout (expected)
