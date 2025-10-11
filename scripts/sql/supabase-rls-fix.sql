-- Fix RLS Policies for Super Admin Access
-- Run this in your Supabase SQL Editor

-- ==================================================
-- STUDENTS TABLE POLICIES
-- ==================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow super_admin full access to students" ON students;
DROP POLICY IF EXISTS "Allow state_admin full access to students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to read students" ON students;

-- Create new policies for students table
CREATE POLICY "Allow super_admin and state_admin full access to students"
ON students
FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'user_metadata'->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'app_metadata'->>'role')::text IN ('super_admin', 'state_admin')
);

-- Allow all authenticated users to read students (for regular users)
CREATE POLICY "Allow authenticated read students"
ON students
FOR SELECT
TO authenticated
USING (true);

-- ==================================================
-- CLASSES TABLE POLICIES
-- ==================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow super_admin full access to classes" ON classes;
DROP POLICY IF EXISTS "Allow state_admin full access to classes" ON classes;
DROP POLICY IF EXISTS "Allow authenticated users to read classes" ON classes;

-- Create new policies for classes table
CREATE POLICY "Allow super_admin and state_admin full access to classes"
ON classes
FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'user_metadata'->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'app_metadata'->>'role')::text IN ('super_admin', 'state_admin')
);

-- Allow all authenticated users to read classes
CREATE POLICY "Allow authenticated read classes"
ON classes
FOR SELECT
TO authenticated
USING (true);

-- ==================================================
-- MAIN_BRANCHES TABLE POLICIES
-- ==================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow super_admin full access to main_branches" ON main_branches;
DROP POLICY IF EXISTS "Allow state_admin full access to main_branches" ON main_branches;
DROP POLICY IF EXISTS "Allow authenticated users to read main_branches" ON main_branches;

-- Create new policies for main_branches table
CREATE POLICY "Allow super_admin and state_admin full access to main_branches"
ON main_branches
FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'user_metadata'->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'app_metadata'->>'role')::text IN ('super_admin', 'state_admin')
);

-- Allow all authenticated users to read main_branches
CREATE POLICY "Allow authenticated read main_branches"
ON main_branches
FOR SELECT
TO authenticated
USING (true);

-- ==================================================
-- SUB_BRANCHES TABLE POLICIES
-- ==================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow super_admin full access to sub_branches" ON sub_branches;
DROP POLICY IF EXISTS "Allow state_admin full access to sub_branches" ON sub_branches;
DROP POLICY IF EXISTS "Allow authenticated users to read sub_branches" ON sub_branches;

-- Create new policies for sub_branches table
CREATE POLICY "Allow super_admin and state_admin full access to sub_branches"
ON sub_branches
FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'user_metadata'->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'app_metadata'->>'role')::text IN ('super_admin', 'state_admin')
);

-- Allow all authenticated users to read sub_branches
CREATE POLICY "Allow authenticated read sub_branches"
ON sub_branches
FOR SELECT
TO authenticated
USING (true);

-- ==================================================
-- CLASSROOMS TABLE POLICIES (if exists)
-- ==================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow super_admin full access to classrooms" ON classrooms;
DROP POLICY IF EXISTS "Allow state_admin full access to classrooms" ON classrooms;
DROP POLICY IF EXISTS "Allow authenticated users to read classrooms" ON classrooms;

-- Create new policies for classrooms table
CREATE POLICY "Allow super_admin and state_admin full access to classrooms"
ON classrooms
FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'user_metadata'->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'app_metadata'->>'role')::text IN ('super_admin', 'state_admin')
);

-- Allow all authenticated users to read classrooms
CREATE POLICY "Allow authenticated read classrooms"
ON classrooms
FOR SELECT
TO authenticated
USING (true);

-- ==================================================
-- ENROLLMENTS TABLE POLICIES (if exists)
-- ==================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow super_admin full access to enrollments" ON enrollments;
DROP POLICY IF EXISTS "Allow authenticated users to read enrollments" ON enrollments;

-- Create new policies for enrollments table
CREATE POLICY "Allow super_admin and state_admin full access to enrollments"
ON enrollments
FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'user_metadata'->>'role')::text IN ('super_admin', 'state_admin')
  OR
  (auth.jwt()->'app_metadata'->>'role')::text IN ('super_admin', 'state_admin')
);

-- Allow all authenticated users to read enrollments
CREATE POLICY "Allow authenticated read enrollments"
ON enrollments
FOR SELECT
TO authenticated
USING (true);
