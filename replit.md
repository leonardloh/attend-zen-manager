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
