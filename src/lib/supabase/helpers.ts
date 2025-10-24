import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Typed helper for updating user preferences
 * Works around TypeScript inference issues with Supabase SSR client
 *
 * Note: The @ts-expect-error directives below are necessary due to a known issue
 * with Supabase SSR client type inference in React 19 + Next.js 15 environments.
 * The function signature ensures type safety at the API level.
 */
export async function updateUserPreferences(
  client: SupabaseClient<Database>,
  userId: string,
  updates: Database['public']['Tables']['user_preferences']['Update']
) {
  return await client
    .from('user_preferences')
    // @ts-expect-error - Supabase SSR client type inference issue
    .update(updates)
    .eq('user_id', userId);
}

/**
 * Typed helper for updating user profile
 * Works around TypeScript inference issues with Supabase SSR client
 *
 * Note: The @ts-expect-error directives below are necessary due to a known issue
 * with Supabase SSR client type inference in React 19 + Next.js 15 environments.
 * The function signature ensures type safety at the API level.
 */
export async function updateUserProfile(
  client: SupabaseClient<Database>,
  userId: string,
  updates: Database['public']['Tables']['profiles']['Update']
) {
  return await client
    .from('profiles')
    // @ts-expect-error - Supabase SSR client type inference issue
    .update(updates)
    .eq('id', userId);
}
