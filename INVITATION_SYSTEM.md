# Invitation System Documentation

## Overview

The invitation system allows administrators to invite new users to the Attend Zen Manager system. Users receive an email with an invitation link that allows them to create an account and set their password.

## Features

- **Invite Users**: Send invitation emails to new users with assigned roles
- **Role Assignment**: Assign specific roles (student, class_admin, branch_admin, state_admin)
- **Scope Management**: Assign users to specific classes, branches, or states
- **Email Notifications**: Send beautifully formatted HTML emails with invitation links
- **Invitation Management**: View, resend, and cancel pending invitations
- **Secure Tokens**: Use secure tokens for invitation links with expiration dates

## Database Schema

### Invitations Table

```sql
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  student_id text REFERENCES public.students(student_id),
  role public.app_role NOT NULL,
  scope_type text,
  scope_id bigint,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invitations_unique_email_token UNIQUE (email, token)
);
```

## User Roles

- **student**: Basic student access
- **class_admin**: Class management access
- **branch_admin**: Branch management access  
- **state_admin**: State management access
- **super_admin**: Full system access

## Usage

### For Administrators

1. **Access Invitation Page**: Go to Settings → User Management (visible to super_admin, state_admin, branch_admin)
2. **Send Invitation**: Fill out the invitation form with:
   - Email address (required)
   - Student ID (optional)
   - Role (required)
   - Scope type and ID (required for admin roles)
3. **Manage Invitations**: View all sent invitations, resend or cancel as needed

### For Invited Users

1. **Receive Email**: Check email for invitation link
2. **Accept Invitation**: Click the link to go to the acceptance page
3. **Create Account**: Set password and create account
4. **Login**: Use student ID and password to login

## Email Service Integration

The system includes a flexible email service that supports multiple providers:

### Mock Service (Default)
- Logs emails to console for development
- Always returns success for testing

### Real Email Services
Uncomment and configure one of these in `src/lib/email/emailService.ts`:

#### SendGrid
```typescript
return new SendGridEmailService(process.env.SENDGRID_API_KEY!);
```

#### AWS SES
```typescript
return new AWSEmailService(process.env.AWS_REGION!);
```

#### Nodemailer (SMTP)
```typescript
return new NodemailerEmailService();
```

### Environment Variables

For production, set these environment variables:

```env
# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
# OR
AWS_REGION=us-east-1
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Email Settings
FROM_EMAIL=noreply@yourdomain.com
```

## API Endpoints

### Frontend API Functions

- `inviteUser(data, invitedBy)`: Create and send invitation
- `getInvitations(userId)`: Get all invitations for a user
- `resendInvitation(invitationId)`: Resend invitation email
- `cancelInvitation(invitationId)`: Cancel pending invitation

### Database Functions

- `createInvitation(data)`: Create new invitation record
- `getInvitationByToken(token)`: Get invitation by token
- `acceptInvitation(token)`: Mark invitation as accepted
- `deleteInvitation(invitationId)`: Delete invitation
- `createUserRole(userId, role, scopeType, scopeId)`: Create user role

## Security Features

- **Secure Tokens**: 32-byte random tokens for invitation links
- **Expiration**: Invitations expire after 7 days
- **One-time Use**: Invitations can only be accepted once
- **Role Validation**: Proper role assignment with scope validation
- **Email Verification**: Users must use the exact email address invited

## File Structure

```
src/
├── components/Settings/
│   ├── InviteUserForm.tsx      # Invitation form component
│   └── InvitationList.tsx      # Invitation management component
├── pages/
│   └── AcceptInvitation.tsx    # Invitation acceptance page
├── lib/
│   ├── database/
│   │   └── invitations.ts      # Database functions
│   ├── api/
│   │   └── invitations.ts      # API functions
│   └── email/
│       └── emailService.ts     # Email service integration
└── database_creation.sql       # Updated with invitations table
```

## Testing

1. **Development Mode**: Uses mock email service (logs to console)
2. **Test Invitations**: Send invitations and check console logs
3. **Accept Invitations**: Use invitation links to test acceptance flow
4. **Role Testing**: Test different roles and scope assignments

## Troubleshooting

### Common Issues

1. **Email Not Sending**: Check email service configuration
2. **Invitation Expired**: Check expiration date, resend if needed
3. **Invalid Token**: Ensure invitation hasn't been accepted already
4. **Role Assignment**: Verify scope type and ID are correct for admin roles

### Debug Mode

Enable debug logging by checking browser console for:
- Email sending logs
- Database operation logs
- API call logs

## Future Enhancements

- [ ] Bulk invitation support
- [ ] Custom email templates
- [ ] Invitation analytics
- [ ] Role-based invitation permissions
- [ ] Integration with external user directories
- [ ] Multi-language email support