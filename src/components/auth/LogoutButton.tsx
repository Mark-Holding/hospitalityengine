'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    console.log('🚪 [LOGOUT] Starting logout process...');
    setLoading(true);

    try {
      // Sign out from Supabase (this clears cookies)
      console.log('🔓 [LOGOUT] Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ [LOGOUT] Sign out error:', error.message, error);
        throw error;
      }

      console.log('✅ [LOGOUT] Sign out successful');
    } catch (error) {
      console.error('❌ [LOGOUT] Exception during logout:', error);
    } finally {
      // Always redirect, even if signOut fails
      // Force a hard navigation to clear all client state
      console.log('↗️ [LOGOUT] Redirecting to /login (hard navigation)');
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
