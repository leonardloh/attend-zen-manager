-- RLS Policies Example for Role-Based Access Control
-- This shows how to use roles stored in app_metadata for authorization

-- Example 1: Simple role check
-- Allow admins to see all students, others only see their own data
CREATE POLICY "Students can view their own data or admins can view all"
ON students
FOR SELECT
TO authenticated
USING (
  -- Check if user is admin in app_metadata
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'state_admin', 'branch_admin')
  OR
  -- Or if user is viewing their own student record
  id = (
    SELECT student_db_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Example 2: Class management - only class admins can manage their assigned classes
CREATE POLICY "Class admins can manage their assigned classes"
ON classes
FOR ALL
TO authenticated
USING (
  -- Check if user has class_admin role and matches the scope
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'class_admin'
  AND
  id = (auth.jwt() -> 'app_metadata' ->> 'scope_id')::bigint
);

-- Example 3: Branch management - branch admins can manage their assigned branches
CREATE POLICY "Branch admins can manage their assigned branches"
ON sub_branches
FOR ALL
TO authenticated
USING (
  -- Check if user has branch_admin role and matches the scope
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'branch_admin'
  AND
  id = (auth.jwt() -> 'app_metadata' ->> 'scope_id')::bigint
);

-- Example 4: Attendance records - class admins can manage their class attendance
CREATE POLICY "Class admins can manage their class attendance"
ON class_attendance
FOR ALL
TO authenticated
USING (
  -- Check if user has class_admin role
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'class_admin'
  AND
  -- And the attendance is for their assigned class
  class_id = (auth.jwt() -> 'app_metadata' ->> 'scope_id')::bigint
);

-- Example 5: Super admin can do everything
CREATE POLICY "Super admins have full access"
ON students
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
);

-- Helper function to get user role from JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role';
$$;

-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = role_name;
$$;

-- Helper function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION has_any_role(role_names text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = ANY(role_names);
$$;

-- Example usage in policies:
-- CREATE POLICY "Admin or owner access"
-- ON some_table
-- FOR ALL
-- TO authenticated
-- USING (
--   has_any_role(ARRAY['super_admin', 'state_admin'])
--   OR
--   owner_id = auth.uid()
-- );