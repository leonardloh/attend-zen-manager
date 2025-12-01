# Admin User Management System

## Overview
This project is an admin user management system that facilitates the creation, management, and secure access of user accounts. It features Supabase-based authentication with robust role-based access control (RBAC), allowing `super_admin` users to manage user roles and permissions. The system supports Google SSO for user registration and provides hierarchical administrative capabilities, ensuring secure and scoped data access for various admin levels (state, branch, classroom, class). It also includes features for managing class archiving, attendance tracking, and reporting with secure API endpoints. The system aims to provide a comprehensive and secure platform for educational institution administration.

## User Preferences
I want to interact with the system through a web interface. I prefer clear visual feedback on actions (e.g., toast notifications). I need the system to be responsive and quick, especially during login and navigation. I expect an intuitive workflow for managing users and classes. Security and data integrity are paramount, so I prefer robust authentication and authorization mechanisms.

## System Architecture
The system employs a client-server architecture:
- **Frontend**: Developed with React, Vite, and `shadcn/ui` for a modern, responsive user interface. Styling uses pre-compiled Tailwind CSS.
- **Backend**: An Express.js server integrated with Vite middleware, handling API requests and business logic.
- **Authentication**: Supabase Auth handles user authentication, including Google SSO. Role-based access control is enforced at both the UI and API levels using Supabase RLS policies and server-side validation.
- **Admin API**: A secure `/api/admin-users` endpoint is provided for managing users, requiring bearer token authentication and `super_admin` roles. Additional secure API endpoints exist for reports and user management with hierarchical authorization.
- **Authorization**: Implements hierarchical RBAC with roles such as `super_admin`, `state_admin`, `branch_admin`, `classroom_admin`, and `class_admin`. Access to data and functionalities is strictly scoped based on the user's assigned role and associated organizational unit (e.g., main_branch, sub_branch, classroom, class).
- **Class Management**: Includes soft-delete functionality for classes through archiving/unarchiving, tracked via an `is_archived` status and automatic timestamp updates.
- **Attendance & Reporting**: Features interactive attendance history charts with navigation capabilities and secure API endpoints for generating weekly attendance reports, excluding holiday data.
- **Performance**: Optimized for fast login and page loads by strategically loading database data only after successful authentication and skipping unnecessary lookups for admin users.

## External Dependencies
- **Supabase**: Used for authentication, database (PostgreSQL), and Row Level Security (RLS).
- **React**: Frontend library.
- **Vite**: Frontend build tool and development server.
- **Express.js**: Backend web framework.
- **shadcn/ui**: UI component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Google OAuth**: For Google Sign-In integration.