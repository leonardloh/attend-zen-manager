import { createInvitation, getInvitationsByUser, deleteInvitation } from '../database/invitations';
import { sendInvitationEmail } from '../email/emailService';

export interface InviteUserRequest {
  email: string;
  studentId?: string;
  role: string;
  scopeType?: string;
  scopeId?: number;
}

export interface InviteUserResponse {
  success: boolean;
  message: string;
  invitationId?: string;
}

// Mock API functions - these would typically call a backend service
export const inviteUser = async (data: InviteUserRequest, invitedBy: string): Promise<InviteUserResponse> => {
  try {
    // Validate required fields
    if (!data.email || !data.role) {
      return {
        success: false,
        message: '邮箱和角色是必填的',
      };
    }

    // Check if user already exists
    const existingUser = await checkUserExists(data.email);
    if (existingUser) {
      return {
        success: false,
        message: '该邮箱已注册用户',
      };
    }

    // Create invitation
    const invitation = await createInvitation({
      email: data.email,
      student_id: data.studentId,
      role: data.role,
      scope_type: data.scopeType,
      scope_id: data.scopeId,
      invited_by: invitedBy,
    });

    if (!invitation) {
      return {
        success: false,
        message: '创建邀请失败',
      };
    }

    // Send invitation email
    const invitationLink = `${window.location.origin}/accept-invitation?token=${invitation.token}`;
    const emailSent = await sendInvitationEmail({
      email: invitation.email,
      invitationLink,
      role: invitation.role,
      invitedBy: '系统管理员', // In a real app, you'd fetch the inviter's name
      expiresAt: invitation.expires_at,
    });
    
    if (!emailSent) {
      return {
        success: false,
        message: '邀请创建成功，但邮件发送失败',
      };
    }

    return {
      success: true,
      message: '邀请发送成功',
      invitationId: invitation.id,
    };
  } catch (error) {
    console.error('Error inviting user:', error);
    return {
      success: false,
      message: '发送邀请时发生错误',
    };
  }
};

export const getInvitations = async (userId: string) => {
  try {
    return await getInvitationsByUser(userId);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }
};

export const resendInvitation = async (invitationId: string): Promise<InviteUserResponse> => {
  try {
    // In a real implementation, you would:
    // 1. Fetch the invitation from database
    // 2. Check if it's still valid
    // 3. Resend the email using sendInvitationEmail
    // 4. Update the invitation record if needed
    
    // For now, we'll simulate a successful resend
    console.log('Resending invitation:', invitationId);
    
    return {
      success: true,
      message: '邀请重新发送成功',
    };
  } catch (error) {
    console.error('Error resending invitation:', error);
    return {
      success: false,
      message: '重新发送邀请失败',
    };
  }
};

export const cancelInvitation = async (invitationId: string): Promise<InviteUserResponse> => {
  try {
    const success = await deleteInvitation(invitationId);
    return {
      success,
      message: success ? '邀请已取消' : '取消邀请失败',
    };
  } catch (error) {
    console.error('Error canceling invitation:', error);
    return {
      success: false,
      message: '取消邀请失败',
    };
  }
};

// Helper function to check if user already exists
const checkUserExists = async (email: string): Promise<boolean> => {
  // This would typically check against your user database
  // For now, return false as a mock
  return false;
};

// Helper function to send invitation email (now using the email service)
const sendInvitationEmailHelper = async (invitation: any): Promise<boolean> => {
  try {
    const invitationLink = `${window.location.origin}/accept-invitation?token=${invitation.token}`;
    
    return await sendInvitationEmail({
      email: invitation.email,
      invitationLink,
      role: invitation.role,
      invitedBy: '系统管理员', // In a real app, you'd fetch the inviter's name
      expiresAt: invitation.expires_at,
    });
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return false;
  }
};