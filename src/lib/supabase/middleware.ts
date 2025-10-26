import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

export async function updateSession(request: NextRequest) {
  console.log('🔒 [MIDDLEWARE] Starting session update for:', request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          console.log('🍪 [MIDDLEWARE] Getting all cookies:', cookies.map(c => c.name));
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log('🍪 [MIDDLEWARE] Setting cookies:', cookiesToSet.map(c => c.name));
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null;
  try {
    console.log('👤 [MIDDLEWARE] Calling supabase.auth.getUser()...');
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ [MIDDLEWARE] Auth error:', error.message, error.status);
    }

    if (!error && data?.user) {
      user = data.user;
      console.log('✅ [MIDDLEWARE] User authenticated:', user.email, 'ID:', user.id);
    } else {
      console.log('⚠️ [MIDDLEWARE] No authenticated user found');
    }
  } catch (error) {
    // Gracefully handle auth errors (e.g., expired tokens during logout)
    // User will be treated as not authenticated
    console.error('❌ [MIDDLEWARE] Exception in getUser():', error);
    user = null;
  }

  // Protected routes - redirect to login if not authenticated
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    console.log('🚫 [MIDDLEWARE] Protected route access denied, redirecting to /login');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Auth routes - redirect to dashboard if already authenticated
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
     request.nextUrl.pathname.startsWith('/signup'))
  ) {
    console.log('↩️ [MIDDLEWARE] Already authenticated, redirecting to /dashboard');
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  console.log('✅ [MIDDLEWARE] Session update complete for:', request.nextUrl.pathname);

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
