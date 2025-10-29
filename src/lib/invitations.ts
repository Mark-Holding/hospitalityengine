import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type UserRole = Database['public']['Enums']['user_role'];

export interface InvitationResult {
  id: string;
  token: string;
  inviteUrl: string;
  email: string;
  role: UserRole;
  expires_at: string;
}

/**
 * Create an invitation for a user to join a business
 */
export async function createInvitation(
  businessId: string,
  email: string,
  role: 'admin' | 'member'
): Promise<InvitationResult> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  // Check if email is already a member
  const { data: existingMember } = await supabase
    .from('business_members')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .single();

  if (existingMember) {
    throw new Error('This user is already a member of the business');
  }

  // Check for pending invitation
  const { data: pendingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('business_id', businessId)
    .eq('email', email)
    .is('accepted_at', null)
    .single();

  if (pendingInvite) {
    throw new Error('An invitation has already been sent to this email');
  }

  // Generate token using database function
  const { data: tokenData, error: tokenError } = await supabase.rpc('generate_invite_token');

  if (tokenError || !tokenData) {
    throw new Error('Failed to generate invitation token');
  }

  // Create invitation
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      token: tokenData,
      business_id: businessId,
      email,
      role,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invitation:', error);
    throw new Error('Failed to create invitation');
  }

  const inviteUrl = `${window.location.origin}/invite/${tokenData}`;

  return {
    id: data.id,
    token: tokenData,
    inviteUrl,
    email: data.email,
    role: data.role,
    expires_at: data.expires_at,
  };
}

/**
 * Accept an invitation to join a business
 */
export async function acceptInvitation(token: string): Promise<{
  businessId: string;
  businessName: string;
  role: UserRole;
}> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be logged in to accept an invitation');
  }

  // Get invitation with business details
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select(`
      *,
      business:businesses(id, name)
    `)
    .eq('token', token)
    .is('accepted_at', null)
    .single();

  if (inviteError || !invitation) {
    throw new Error('Invalid or expired invitation');
  }

  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('This invitation has expired');
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('business_members')
    .select('id')
    .eq('business_id', invitation.business_id)
    .eq('user_id', user.id)
    .single();

  if (existingMember) {
    throw new Error('You are already a member of this business');
  }

  // Add user to business
  const { error: memberError } = await supabase
    .from('business_members')
    .insert({
      business_id: invitation.business_id,
      user_id: user.id,
      role: invitation.role,
      invited_by: invitation.invited_by,
      joined_at: new Date().toISOString(),
    });

  if (memberError) {
    console.error('Error adding member:', memberError);
    throw new Error('Failed to join business');
  }

  // Mark invitation as accepted
  await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  return {
    businessId: invitation.business_id,
    businessName: (invitation.business as any).name,
    role: invitation.role,
  };
}

/**
 * Get invitation details by token (for preview before acceptance)
 */
export async function getInvitationDetails(token: string): Promise<{
  businessName: string;
  role: UserRole;
  inviterEmail: string | null;
  expiresAt: string;
}> {
  const supabase = createClient();

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      role,
      expires_at,
      business:businesses(name),
      inviter:invited_by(email)
    `)
    .eq('token', token)
    .is('accepted_at', null)
    .single();

  if (error || !invitation) {
    throw new Error('Invalid or expired invitation');
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('This invitation has expired');
  }

  return {
    businessName: (invitation.business as any)?.name || 'Unknown Business',
    role: invitation.role,
    inviterEmail: null, // RLS might prevent access to inviter details
    expiresAt: invitation.expires_at,
  };
}

/**
 * Revoke/cancel an invitation
 */
export async function revokeInvitation(invitationId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId);

  if (error) {
    console.error('Error revoking invitation:', error);
    throw new Error('Failed to revoke invitation');
  }
}
