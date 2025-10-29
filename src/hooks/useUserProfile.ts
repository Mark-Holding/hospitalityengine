'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type UserRole = Database['public']['Enums']['user_role'];

export interface BusinessMembership {
  id: string;
  business_id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean | null;
  joined_at: string | null;
  business: {
    id: string;
    name: string;
    slug: string | null;
    owner_id: string | null;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  activeBusinessId: string | null;
  businesses: BusinessMembership[];
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Fetch user's active business preference
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('active_business_id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch all businesses user belongs to
      const { data: memberships, error: memberError } = await supabase
        .from('business_members')
        .select(`
          id,
          business_id,
          user_id,
          role,
          is_active,
          joined_at,
          business:businesses (
            id,
            name,
            slug,
            owner_id
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (memberError) {
        console.error('Error fetching business_members:', memberError);
        throw memberError;
      }

      // Transform data to match BusinessMembership type
      const transformedMemberships: BusinessMembership[] = (memberships || []).map((m: any) => ({
        id: m.id,
        business_id: m.business_id,
        user_id: m.user_id,
        role: m.role,
        is_active: m.is_active,
        joined_at: m.joined_at,
        business: {
          id: m.business.id,
          name: m.business.name,
          slug: m.business.slug,
          owner_id: m.business.owner_id,
        },
      }));

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email!,
        activeBusinessId: prefs?.active_business_id || transformedMemberships[0]?.business_id || null,
        businesses: transformedMemberships,
      };

      setProfile(userProfile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const switchBusiness = useCallback(async (businessId: string) => {
    if (!profile) return;

    try {
      const supabase = createClient();

      // Update active business in preferences
      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: profile.id,
          active_business_id: businessId,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      // Update local state
      setProfile({
        ...profile,
        activeBusinessId: businessId,
      });

      // Trigger page reload to reload data for new business context
      window.location.reload();
    } catch (err) {
      console.error('Error switching business:', err);
      setError(err as Error);
    }
  }, [profile]);

  const getActiveBusiness = useCallback((): BusinessMembership | null => {
    if (!profile?.activeBusinessId) return null;
    return profile.businesses.find(b => b.business_id === profile.activeBusinessId) || null;
  }, [profile]);

  const hasRole = useCallback((minimumRole: UserRole, businessId?: string): boolean => {
    const targetBusinessId = businessId || profile?.activeBusinessId;
    if (!targetBusinessId) return false;

    const membership = profile?.businesses.find(b => b.business_id === targetBusinessId);
    if (!membership) return false;

    const roleHierarchy: Record<UserRole, number> = { member: 1, admin: 2, owner: 3 };
    const userRoleLevel = roleHierarchy[membership.role];
    const requiredRoleLevel = roleHierarchy[minimumRole];

    return userRoleLevel >= requiredRoleLevel;
  }, [profile]);

  const activeBusiness = getActiveBusiness();

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    switchBusiness,
    hasRole,
    activeBusiness,
    isOwner: activeBusiness?.role === 'owner',
    isAdmin: hasRole('admin'),
    currentBusinessId: profile?.activeBusinessId,
    hasMultipleBusinesses: (profile?.businesses.length || 0) > 1,
    hasBusiness: (profile?.businesses.length || 0) > 0,
  };
}
