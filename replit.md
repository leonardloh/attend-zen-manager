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
npm run dev    # Start development server with hot reload
npm run build  # Build for production
npm run start  # Start production server
```

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

## Recent Changes
- **2025-10-09**: Successfully migrated from Lovable to Replit
  - Set up client/server directory structure
  - Configured Express backend with Vite middleware
  - Integrated admin users API
  - Fixed Express routing for wildcard routes
  - Added tsx watch mode for backend hot reload
  - Cleaned up obsolete src/ directory
  - Configured Vite allowed hosts for Replit deployment domain
