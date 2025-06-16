# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Description
- Create a classroom management system for a lamrin dharma classes in Malaysia.
- The dharma classes has multiple branches in Malaysia
- The student management system will have several features to help the secretary in consolidating the students and cadre information

## Context
- Classrooms are scattered accross multiple regions in multiple states of Malaysia.
- Each classroom has their respective cadres and students.
- Roles of cadres are (班长, 副班长，关怀员)
- Each of these cadres need to register new students to the class, take the attendance of students, and update the 学习进度（广论行数 & 广论页数）

## Development Commands

- **Start development server**: `npm run dev` (runs on port 8080)
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Project Architecture

This is a React-based attendance management system built with:
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components + Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: TanStack Query for server state, React Context for auth
- **Forms**: React Hook Form + Zod validation

### Key Architecture Patterns

**Authentication & Authorization**:
- Role-based access control with 3 roles: `admin`, `cadre`, `student`
- Mock authentication system in `src/hooks/useAuth.tsx`
- Protected routes wrapper that redirects unauthenticated users to login
- Different navigation menus based on user role

**Component Structure**:
- UI components in `src/components/ui/` (shadcn/ui)
- Feature components organized by domain: `Auth/`, `Students/`, `Classes/`, `Cadres/`, `Attendance/`
- Layout components in `src/components/Layout/`
- Pages in `src/pages/`

**Data Management**:
- Currently uses mock data and localStorage for persistence
- Structured for future backend integration with TanStack Query
- User roles determine data access permissions

**Path Aliases**:
- `@/` resolves to `src/` directory
- Configured in both `vite.config.ts` and `tsconfig.json`

### Role-Based Features

- **Admin**: Full access to all features (students, classes, cadres, attendance, reports, settings)
- **Cadre**: Can manage attendance for their assigned classes, view reports
- **Student**: Can only view their own attendance records

### Chinese/English Bilingual

The application supports both Chinese and English labels throughout the interface, with Chinese as the primary language for UI elements.

## Recent Implementation Updates

### Class Management Enhancements
- **Enhanced Class Creation Form**: 
  - Replaced text input time fields with dropdown selectors for start/end times (08:00-22:00 in 30-minute intervals)
  - Changed from 班长姓名 to 班长学号 with searchable student ID input
  - Removed 广论页数 and 广论行数 fields from class creation
  - Added dynamic cadre role selection for 副班长 and 关怀员 with add/remove functionality
  - All cadre selections use searchable StudentSearchInput component instead of dropdowns

### Search Components
- **StudentSearchInput**: Reusable component for searching student IDs with real-time filtering by student ID or Chinese/English names
- **ClassSearchInput**: Reusable component for searching class names with filtering by class name, region, or schedule
- Both components support exclusion lists to prevent duplicate selections

### Deletion Confirmation Patterns
- **Class Deletion**: Advanced confirmation requiring users to type exact class name, with detailed impact warnings
- **Cadre Deletion**: AlertDialog confirmation following student deletion pattern, with comprehensive information about what will be deleted
- **Student Deletion**: Simple AlertDialog confirmation with basic warning message
- All deletion patterns include "此操作不可撤销" warnings and proper toast feedback

### Form Components Used in Cadre Management
- **CadreForm**: Uses ClassSearchInput for 母班班名 selection instead of hardcoded dropdown
- **ClassMultiSelect**: Used for 护持班名 (support classes) selection
- Cadre forms include dynamic search for both mother class and support classes

### Data Structures
- **Student**: Includes student_id (format: S2024XXX), chinese_name, english_name, class assignments
- **Class**: Includes class_monitor_id, deputy_monitors[], care_officers[] arrays
- **Cadre**: Includes mother_class, support_classes[], role-based permissions

### UI Patterns
- Search inputs use Command + Popover components for consistent UX
- Deletion confirmations follow established patterns (simple AlertDialog for cadres/students, advanced confirmation for classes)
- Form validation prevents duplicate selections across roles
- Real-time search with case-insensitive matching across multiple fields