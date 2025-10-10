-- Fix RLS Policies - Check BOTH app_metadata AND user_metadata for role
-- Run this in your Supabase SQL Editor

-- Helper function to check if user is super_admin or state_admin
-- This checks both app_metadata and user_metadata
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt()->'app_metadata'->>'role' IN ('super_admin', 'state_admin'))
    OR
    (auth.jwt()->'user_metadata'->>'role' IN ('super_admin', 'state_admin'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- UPDATE ALL POLICIES TO USE THE HELPER FUNCTION
-- ==================================================

-- class_attendance
ALTER POLICY "super admins full access" ON "public"."class_attendance"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- class_cadres
ALTER POLICY "super admins full access" ON "public"."class_cadres"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- classes (if exists)
ALTER POLICY "super admins full access" ON "public"."classes"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- students (if exists)
ALTER POLICY "super admins full access" ON "public"."students"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- main_branches (if exists)
ALTER POLICY "super admins full access" ON "public"."main_branches"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- sub_branches (if exists)
ALTER POLICY "super admins full access" ON "public"."sub_branches"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- classrooms (if exists)
ALTER POLICY "super admins full access" ON "public"."classrooms"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- enrollments (if exists)
ALTER POLICY "super admins full access" ON "public"."enrollments"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- attendance_records (if exists)
ALTER POLICY "super admins full access" ON "public"."attendance_records"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Add more tables as needed following the same pattern
