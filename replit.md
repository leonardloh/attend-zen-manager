# Admin User Management System - Replit Migration

## Project Overview
Successfully migrated admin user management system from Lovable to Replit environment. The system features Supabase-based authentication with role-based access control, allowing super_admin users to manage user roles and permissions.

## Architecture
- **Frontend**: React + Vite + shadcn/ui (in `client/` directory)
- **Backend**: Express.js server with Vite middleware (in `server/` directory)
- **Authentication**: Supabase Auth with role-based access control
- **Admin API**: Located at `/api/admin-users` endpoint

## Required Environment Variables
The application requires the following Supabase environment variables to function:

### Client-side (Frontend)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Server-side (Admin API)
- `SUPABASE_URL` or `VITE_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

### Optional
- `VITE_DEFAULT_AUTH_MODE` - Set to 'mock' or 'supabase' (default: 'supabase')
- `ADMIN_USERS_PORT` - Port for standalone admin users server (default: 8787)

### Environment File Location
**IMPORTANT**: Environment variables must be placed in `client/.env` or `client/.env.local` (not in the root directory). Vite loads environment variables relative to where its config file is located.

## Directory Structure
```
/
├── client/           # Frontend application
│   ├── src/         # React components, pages, hooks
│   ├── public/      # Static assets
│   └── vite.config.ts
├── server/          # Backend application
│   ├── index.ts     # Main Express server
│   ├── routes.ts    # API route definitions
│   ├── vite.ts      # Vite middleware setup
│   └── adminUsersHandler.ts  # Admin user management logic
└── shared/          # Shared types and schemas (future use)
```

## Development
```bash
npm run dev        # Start development server with hot reload
npm run build:css  # Recompile Tailwind CSS (run after adding new Tailwind classes)
npm run build      # Build for production (includes CSS compilation)
npm run start      # Start production server
```

### CSS/Styling Notes
Due to PostCSS integration issues with the Vite middleware setup, the project uses pre-compiled Tailwind CSS:
- Source: `client/src/index.css` (contains Tailwind directives)
- Compiled: `client/src/output.css` (generated from source, imported by main.tsx)
- **Important**: After adding new Tailwind classes to components, run `npm run build:css` to recompile the CSS

## Deployment
The project is configured for Replit autoscale deployment:
- Build command: `npm run build`
- Start command: `npm run start`
- Port: 5000

## Admin Users API
The admin users endpoint (`/api/admin-users`) requires:
- Bearer token authentication
- `super_admin` role in user metadata
- Service role key configured in environment

### Endpoints
- `GET /api/admin-users` - List all users (with pagination)
- `PUT /api/admin-users` - Update user role and metadata
- `OPTIONS /api/admin-users` - CORS preflight

## Migration Notes
- Migrated from Lovable's Vite-only setup to Replit's Express + Vite fullstack template
- Preserved all existing admin functionality
- Admin users handler integrated as Express route
- Build and deployment configured for Replit environment

## Authentication Flow

### Google SSO Integration
The system now supports Google Sign-In using Supabase OAuth:

1. **Login Page** (`client/src/components/Auth/LoginForm.tsx`)
   - Users can sign in with Google OAuth or traditional email/password
   - Google sign-in button with OAuth redirect

2. **OAuth Callback** (`client/src/pages/AuthCallback.tsx`)
   - Handles Google OAuth redirect after authentication
   - Checks if user has completed their profile (has student_id in metadata)
   - Redirects new users to profile completion, existing users to dashboard

3. **Profile Completion** (`client/src/pages/CompleteProfile.tsx`)
   - New Google users must fill in student details
   - Creates student record in database
   - Updates user metadata with student_id
   - Default role: 'student'

4. **Role Assignment**
   - New users default to 'student' role
   - Admins can later assign roles: super_admin, state_admin, branch_admin, class_admin
   - Role management available through invitation system

### User Creation
- **Google SSO**: Primary method for new user registration
- **Invitation System**: Admins can invite users who then sign up via Google
- **Direct Creation**: Removed from Settings (UserRoleManagerCard)

## Recent Changes
- **2025-10-11**: RLS Policy Fix - State Admin Visibility
  - **Fixed critical bug**: State admins were seeing ALL main branches instead of only their assigned one
  - **Root cause**: Conflicting RLS policies - permissive "Other users read-only access" policy (USING true) was overriding restrictive state_admin policy
  - **Solution**: Excluded admin roles (super_admin, state_admin, branch_admin, classroom_admin, class_admin) from "Other users" policies
  - **Impact**: State admins now correctly see only their assigned main_branch and related data
  - **Files updated**: comprehensive_rls_policies.sql (fixed policies for main_branches, sub_branches, classrooms)
  - **Deployment**: Run enable_rls_with_fixed_policies.sql then comprehensive_rls_policies.sql in Supabase SQL Editor
  - **Testing**: Verified with lohleonard93@gmail.com (state_admin for 北马总院) - should only see 北马总院, not all branches

- **2025-10-11**: Performance Optimization
  - **Fixed slow login page load**: Moved DatabaseProvider to only wrap protected routes
  - Previously, all database queries (students, classes, branches, etc.) ran on every page load
  - Now, database data only loads after successful authentication
  - Significantly improved initial page load speed and login page responsiveness

- **2025-10-11**: Hierarchical Role-Based Access Control (RBAC) Implementation
  - **Added classroom_admin role**: New role for classroom-level administration
  - **UI Enhancements (UserManagement.tsx)**:
    - Conditional scope selection dropdowns based on admin role
    - MainBranchSearchInput for state_admin role
    - SubBranchSearchInput for branch_admin role
    - ClassroomNameSearchInput for classroom_admin role
    - ClassSearchInput for class_admin role
    - Validation prevents role assignment without proper scope selection
  - **Backend Security (server/userManagementHandler.ts)**:
    - Hierarchical scope validation for state_admin requesters
    - State admins can only assign scopes within their main_branch hierarchy
    - Scope ID normalization to prevent type mismatch errors
    - Returns 403 error when attempting to assign scopes outside hierarchy
  - **Database RLS Policies (comprehensive_rls_policies.sql)**:
    - Helper functions: get_user_role() and get_user_scope()
    - Per-table policies enforcing hierarchical access:
      - super_admin: Full access to all data
      - state_admin: Access to data under their main_branch
      - branch_admin: Access to data under their sub_branch
      - classroom_admin: Access to data under their classroom
      - class_admin: Read access + attendance management for their class
    - Defense-in-depth: UI validation + backend validation + RLS policies
  - **Security**: Multi-layer enforcement ensures admins cannot escalate privileges or access data outside their scope

- **2025-10-10**: Secure User Management Implementation
  - Created secure backend API handler (server/userManagementHandler.ts) for user management
  - Moved all admin operations from client-side to server-side with service role key protection
  - Backend validates Bearer tokens and restricts access to super_admin and state_admin only
  - GET /api/user-management?email=<email> - Search users by email (server-side)
  - PUT /api/user-management - Update user roles (server-side with validation)
  - Updated UserManagement.tsx to call secure backend API endpoints
  - Fixed Sidebar navigation to only show User Management to super_admin and state_admin
  - Removed direct Supabase admin API usage from client-side code
  - Security: Service role key never exposed to frontend

- **2025-10-10**: Enhanced Profile Form
  - Added Malaysian states dropdown to CompleteProfile form (玻璃市, 吉打, 槟城, etc.)
  - Implemented PhoneInput component with country code selection (defaulting to Malaysia)
  - Added personal contact number field (`personal_contact_number`) to CompleteProfile form
  - Fixed OAuth redirect URL to use Replit domain instead of localhost
  - Added VITE_REPLIT_DOMAINS environment variable for proper OAuth callbacks
  - Updated emergency contact number field to use PhoneInput with international formatting
  - Fixed TypeScript LSP errors in PhoneInput component

- **2025-10-09**: Google SSO Implementation
  - Added Google OAuth sign-in to login page
  - Implemented auth callback handler for OAuth redirects
  - Created profile completion page for new users
  - Set default role to 'student' for new signups
  - Removed direct user creation from Settings
  - Updated authentication flow to detect and handle new Google users

- **2025-10-09**: Successfully migrated from Lovable to Replit
  - Set up client/server directory structure
  - Configured Express backend with Vite middleware
  - Integrated admin users API
  - Fixed Express routing for wildcard routes
  - Added tsx watch mode for backend hot reload
  - Cleaned up obsolete src/ directory
  - Configured Vite allowed hosts for Replit deployment domain
