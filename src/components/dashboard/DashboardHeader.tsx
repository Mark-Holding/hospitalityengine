'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import LogoutButton from '@/components/auth/LogoutButton';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardHeaderProps {
  userEmail: string;
  userId: string;
}

export default function DashboardHeader({ userEmail, userId }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);

  // Fetch profile data only once on mount
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          return;
        }
        if (data) setProfile(data);
      } catch (error: any) {
        // Error fetching profile
      }
    };

    fetchProfile();
  }, [userId]);

  // Memoize avatar to prevent re-renders from triggering image reload
  const avatarElement = useMemo(() => {
    if (!profile?.avatar_url) {
      const initials = profile?.first_name?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || '?';
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <Image
          src={profile.avatar_url}
          alt="Profile"
          width={40}
          height={40}
          className="w-full h-full object-cover"
          unoptimized={profile.avatar_url.includes('supabase.co')}
        />
      </div>
    );
  }, [profile?.avatar_url, profile?.first_name, userEmail]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right side - Notifications & User */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : userEmail.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500">
                {profile?.job_title || 'Administrator'}
              </p>
            </div>
            {avatarElement}
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
