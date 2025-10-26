'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error) {
      // Exception during logout
    } finally {
      // Always redirect, even if signOut fails
      // Force a hard navigation to clear all client state
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
