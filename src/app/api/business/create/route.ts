import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

// Create a Supabase client with SERVICE ROLE (bypasses RLS)
const supabaseAdmin = createAdminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key - bypasses RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { businessName } = await request.json();

    if (!businessName || typeof businessName !== 'string') {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    // Get current user from their session using the regular server client
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Generate slug from business name
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Create business using service role (bypasses RLS)
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: businessName,
        owner_id: user.id,
        slug: slug || undefined,
      })
      .select()
      .single();

    if (businessError) {
      console.error('Error creating business:', businessError);
      return NextResponse.json(
        { error: 'Failed to create business' },
        { status: 500 }
      );
    }

    // Check if membership already exists (trigger may have created it)
    const { data: existingMembership } = await supabaseAdmin
      .from('business_members')
      .select('id')
      .eq('business_id', business.id)
      .eq('user_id', user.id)
      .single();

    // Only create membership if it doesn't exist (trigger didn't create it)
    if (!existingMembership) {
      const { error: memberError } = await supabaseAdmin
        .from('business_members')
        .insert({
          business_id: business.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
          invited_by: user.id,
        });

      if (memberError) {
        console.error('Error creating membership:', memberError);
        // Rollback: delete the business
        await supabaseAdmin.from('businesses').delete().eq('id', business.id);
        return NextResponse.json(
          { error: 'Failed to create business membership' },
          { status: 500 }
        );
      }
    }

    // Set as active business
    await supabaseAdmin
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        active_business_id: business.id,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
