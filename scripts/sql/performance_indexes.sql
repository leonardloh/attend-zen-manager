-- Performance Indexes for RLS Policies
-- These indexes significantly speed up the hierarchical permission checks
-- Run this in Supabase SQL Editor after installing RLS policies

-- ==================================================
-- INDEXES FOR ARRAY LOOKUPS (GIN indexes)
-- ==================================================

-- Index for main_branches.manage_sub_branches array lookups
-- Used by RLS policies to check if sub_branch belongs to main_branch
CREATE INDEX IF NOT EXISTS idx_main_branches_manage_sub_branches 
ON main_branches USING GIN (manage_sub_branches);

-- ==================================================
-- INDEXES FOR FOREIGN KEY LOOKUPS (B-tree indexes)
-- ==================================================

-- Index for sub_branch_id lookups in classrooms table
CREATE INDEX IF NOT EXISTS idx_classrooms_sub_branch_id 
ON classrooms(sub_branch_id);

-- Index for classroom management in classes table
CREATE INDEX IF NOT EXISTS idx_classes_manage_by_classroom_id 
ON classes(manage_by_classroom_id);

-- Index for sub_branch management in classes table
CREATE INDEX IF NOT EXISTS idx_classes_manage_by_sub_branch_id 
ON classes(manage_by_sub_branch_id);

-- Index for class_id lookups in enrollments
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class_id 
ON class_enrollments(class_id);

-- Index for student_id lookups in enrollments
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student_id 
ON class_enrollments(student_id);

-- Index for class_id lookups in attendance
CREATE INDEX IF NOT EXISTS idx_class_attendance_class_id 
ON class_attendance(class_id);

-- Index for class_id lookups in cadres
CREATE INDEX IF NOT EXISTS idx_class_cadres_class_id 
ON class_cadres(class_id);

-- ==================================================
-- INDEXES FOR USER ROLES TABLE
-- ==================================================

-- Composite index for scope lookups (scope_type + scope_id together)
CREATE INDEX IF NOT EXISTS idx_user_roles_scope 
ON user_roles(scope_type, scope_id);

-- Index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON user_roles(user_id);

-- ==================================================
-- VERIFY INDEXES
-- ==================================================

-- Query to verify all indexes are created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'main_branches', 'sub_branches', 'classrooms', 'classes',
        'class_enrollments', 'class_attendance', 'class_cadres', 'user_roles'
    )
ORDER BY tablename, indexname;
