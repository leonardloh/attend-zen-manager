import { supabase } from '../supabase';

export interface Invitation {
  id: string;
  email: string;
  student_id?: string;
  role: string;
  scope_type?: string;
  scope_id?: number;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface CreateInvitationData {
  email: string;
  student_id?: string;
  role: string;
  scope_type?: string;
  scope_id?: number;
  invited_by: string;
}

// Generate a secure random token
const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Create a new invitation
export const createInvitation = async (data: CreateInvitationData): Promise<Invitation | null> => {
  try {
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        email: data.email,
        student_id: data.student_id || null,
        role: data.role,
        scope_type: data.scope_type || null,
        scope_id: data.scope_id || null,
        invited_by: data.invited_by,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return null;
    }

    return invitation;
  } catch (error) {
    console.error('Error creating invitation:', error);
    return null;
  }
};

// Get invitation by token
export const getInvitationByToken = async (token: string): Promise<Invitation | null> => {
  try {
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      console.error('Error fetching invitation:', error);
      return null;
    }

    return invitation;
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return null;
  }
};

// Get all invitations for a user
export const getInvitationsByUser = async (userId: string): Promise<Invitation[]> => {
  try {
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        invited_by_user:profiles!invitations_invited_by_fkey(
          chinese_name,
          english_name
        )
      `)
      .eq('invited_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }

    return invitations || [];
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }
};

// Mark invitation as accepted
export const acceptInvitation = async (token: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', token);

    if (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return false;
  }
};

// Delete invitation
export const deleteInvitation = async (invitationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      console.error('Error deleting invitation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return false;
  }
};

// Check if invitation is valid (not expired and not accepted)
export const isInvitationValid = (invitation: Invitation): boolean => {
  const now = new Date();
  const expiresAt = new Date(invitation.expires_at);
  
  return !invitation.accepted_at && expiresAt > now;
};

// Create user role after invitation acceptance
export const createUserRole = async (
  userId: string,
  role: string,
  scopeType?: string,
  scopeId?: number,
  createdBy?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        scope_type: scopeType || null,
        scope_id: scopeId || null,
        created_by: createdBy || null,
      });

    if (error) {
      console.error('Error creating user role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating user role:', error);
    return false;
  }
};