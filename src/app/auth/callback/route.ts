import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('🔐 [AUTH CALLBACK] Processing auth callback...');

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('📋 [AUTH CALLBACK] Code present:', !!code);
  console.log('📋 [AUTH CALLBACK] Next path:', next);
  console.log('📋 [AUTH CALLBACK] Origin:', origin);

  if (code) {
    try {
      const supabase = await createClient();
      console.log('🔄 [AUTH CALLBACK] Exchanging code for session...');

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ [AUTH CALLBACK] Exchange error:', error.message, error);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
      }

      if (data?.session) {
        console.log('✅ [AUTH CALLBACK] Session created successfully');
        console.log('👤 [AUTH CALLBACK] User:', data.user?.email, 'ID:', data.user?.id);

        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        console.log('🌐 [AUTH CALLBACK] Environment:', isLocalEnv ? 'development' : 'production');
        console.log('🌐 [AUTH CALLBACK] Forwarded host:', forwardedHost);

        if (isLocalEnv) {
          // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
          console.log('↗️ [AUTH CALLBACK] Redirecting to:', `${origin}${next}`);
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          console.log('↗️ [AUTH CALLBACK] Redirecting to:', `https://${forwardedHost}${next}`);
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          console.log('↗️ [AUTH CALLBACK] Redirecting to:', `${origin}${next}`);
          return NextResponse.redirect(`${origin}${next}`);
        }
      } else {
        console.warn('⚠️ [AUTH CALLBACK] No session in response data');
      }
    } catch (err) {
      console.error('❌ [AUTH CALLBACK] Exception:', err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exception`);
    }
  } else {
    console.warn('⚠️ [AUTH CALLBACK] No code parameter provided');
  }

  // return the user to an error page with instructions
  console.log('❌ [AUTH CALLBACK] Redirecting to error page');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
