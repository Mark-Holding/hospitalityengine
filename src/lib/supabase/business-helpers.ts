import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

// Type aliases for convenience
export type UserRole = Database['public']['Enums']['user_role'];
export type Business = Database['public']['Tables']['businesses']['Row'];
export type BusinessMember = Database['public']['Tables']['business_members']['Row'];

// Extended type with business details
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

/**
 * Get the current user's active business ID
 * Checks cookie first for performance, falls back to database
 */
export async function getActiveBusinessId(): Promise<string | null> {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return null;
  }

  // Check cookie first for performance
  const cookieStore = await cookies();
  const activeBizCookie = cookieStore.get('active_business_id');
  if (activeBizCookie?.value) {
    // Verify user still has access to this business
    const { data: membership } = await supabase
      .from('business_members')
      .select('business_id')
      .eq('user_id', user.id)
      .eq('business_id', activeBizCookie.value)
      .eq('is_active', true)
      .single();

    if (membership) {
      return activeBizCookie.value;
    }
  }

  // Fall back to database
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('active_business_id')
    .eq('user_id', user.id)
    .single();

  return prefs?.active_business_id || null;
}

/**
 * Get all businesses the current user belongs to
 */
export async function getUserBusinesses(): Promise<BusinessMembership[]> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return [];
  }

  const { data: memberships, error } = await supabase
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

  if (error) {
    console.error('Error fetching user businesses:', error);
    return [];
  }

  // Transform to match BusinessMembership type
  return (memberships || []).map((m: any) => ({
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
}

/**
 * Check if user has at least the specified role in a business
 * Role hierarchy: member < admin < owner
 */
export async function hasBusinessRole(
  businessId: string,
  requiredRole: UserRole
): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return false;
  }

  // Use database function for consistent role checking
  const { data, error } = await supabase.rpc('check_user_role_in_business', {
    check_business_id: businessId,
    required_role: requiredRole,
  });

  if (error) {
    console.error('Error checking user role:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if user belongs to any business
 */
export async function userHasAnyBusiness(): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from('business_members')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1);

  if (error) {
    console.error('Error checking user businesses:', error);
    return false;
  }

  return (data as unknown as { count: number }).count > 0;
}

/**
 * Get the active business details for the current user
 */
export async function getActiveBusiness(): Promise<BusinessMembership | null> {
  const activeBusinessId = await getActiveBusinessId();

  if (!activeBusinessId) {
    return null;
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: membership, error } = await supabase
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
    .eq('business_id', activeBusinessId)
    .eq('is_active', true)
    .single();

  if (error || !membership) {
    return null;
  }

  // Transform to match BusinessMembership type
  return {
    id: (membership as any).id,
    business_id: (membership as any).business_id,
    user_id: (membership as any).user_id,
    role: (membership as any).role,
    is_active: (membership as any).is_active,
    joined_at: (membership as any).joined_at,
    business: {
      id: (membership as any).business.id,
      name: (membership as any).business.name,
      slug: (membership as any).business.slug,
      owner_id: (membership as any).business.owner_id,
    },
  };
}

/**
 * Set the active business for the current user
 * Updates both database and cookie
 */
export async function setActiveBusinessId(businessId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return false;
  }

  // Verify user has access to this business
  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .eq('is_active', true)
    .single();

  if (!membership) {
    return false;
  }

  // Update database
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      active_business_id: businessId,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error setting active business:', error);
    return false;
  }

  // Update cookie
  const cookieStore = await cookies();
  cookieStore.set('active_business_id', businessId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return true;
}

/**
 * Get user's role in the active business
 */
export async function getActiveBusinessRole(): Promise<UserRole | null> {
  const activeBusiness = await getActiveBusiness();
  return activeBusiness?.role || null;
}

/**
 * Check if user is owner of the active business
 */
export async function isActiveBusinessOwner(): Promise<boolean> {
  const role = await getActiveBusinessRole();
  return role === 'owner';
}

/**
 * Check if user is admin or owner of the active business
 */
export async function isActiveBusinessAdmin(): Promise<boolean> {
  const role = await getActiveBusinessRole();
  return role === 'owner' || role === 'admin';
}
