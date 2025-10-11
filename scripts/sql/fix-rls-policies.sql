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

-- class_enrollments
ALTER POLICY "super admins full access" ON "public"."class_enrollments"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- classes
ALTER POLICY "super admins full access" ON "public"."classes"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- classrooms
ALTER POLICY "super admins full access" ON "public"."classrooms"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- main_branches
ALTER POLICY "super admins full access" ON "public"."main_branches"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- profiles
ALTER POLICY "super admins full access" ON "public"."profiles"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- students
ALTER POLICY "super admins full access" ON "public"."students"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- sub_branches
ALTER POLICY "super admins full access" ON "public"."sub_branches"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- user_roles
ALTER POLICY "super admins full access" ON "public"."user_roles"
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
