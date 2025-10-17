-- Comprehensive RLS Policies for Hierarchical Role-Based Access Control
-- This file implements the complete access control system for all admin levels
-- Updated to match actual database schema where main_branches.manage_sub_branches is an ARRAY

-- ==================================================
-- HELPER FUNCTIONS
-- ==================================================

-- Function to get user's role from JWT (checks both app_metadata and user_metadata)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    'student'
  );
$$;

-- Function to get user's scope_type from JWT
CREATE OR REPLACE FUNCTION get_user_scope_type()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'scope_type',
    auth.jwt() -> 'user_metadata' ->> 'scope_type'
  );
$$;

-- Function to get user's scope_id from JWT
CREATE OR REPLACE FUNCTION get_user_scope_id()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE
    WHEN auth.jwt() -> 'app_metadata' ->> 'scope_id' IS NOT NULL
    THEN (auth.jwt() -> 'app_metadata' ->> 'scope_id')::bigint
    WHEN auth.jwt() -> 'user_metadata' ->> 'scope_id' IS NOT NULL
    THEN (auth.jwt() -> 'user_metadata' ->> 'scope_id')::bigint
    ELSE NULL
  END;
$$;

-- Function to check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT get_user_role() = 'super_admin';
$$;

-- Function to get main_branch_id from sub_branch_id (handles array relationship)
CREATE OR REPLACE FUNCTION get_main_branch_from_sub_branch(sub_branch_id bigint)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM main_branches
  WHERE sub_branch_id = ANY(manage_sub_branches);
$$;

-- Function to check if user can access a specific main_branch
CREATE OR REPLACE FUNCTION can_access_main_branch(main_branch_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    is_super_admin() OR
    (get_user_role() = 'state_admin' AND get_user_scope_type() = 'main_branch' AND get_user_scope_id() = main_branch_id);
$$;

-- Function to check if user can access a specific sub_branch
CREATE OR REPLACE FUNCTION can_access_sub_branch(sub_branch_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    is_super_admin() OR
    (get_user_role() = 'branch_admin' AND get_user_scope_type() = 'sub_branch' AND get_user_scope_id() = sub_branch_id) OR
    -- State admin can access all sub_branches under their main_branch
    (get_user_role() = 'state_admin' AND get_user_scope_type() = 'main_branch' AND EXISTS (
      SELECT 1 FROM main_branches 
      WHERE id = get_user_scope_id() AND sub_branch_id = ANY(manage_sub_branches)
    ));
$$;

-- Function to check if user can access a specific classroom
CREATE OR REPLACE FUNCTION can_access_classroom(classroom_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    is_super_admin() OR
    (get_user_role() = 'classroom_admin' AND get_user_scope_type() = 'classroom' AND get_user_scope_id() = classroom_id) OR
    -- Branch admin can access classrooms in their sub_branch
    (get_user_role() = 'branch_admin' AND get_user_scope_type() = 'sub_branch' AND EXISTS (
      SELECT 1 FROM classrooms 
      WHERE id = classroom_id AND sub_branch_id = get_user_scope_id()
    )) OR
    -- State admin can access classrooms under their main_branch
    (get_user_role() = 'state_admin' AND get_user_scope_type() = 'main_branch' AND EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = classroom_id 
        AND EXISTS (
          SELECT 1 FROM main_branches mb
          WHERE mb.id = get_user_scope_id() AND c.sub_branch_id = ANY(mb.manage_sub_branches)
        )
    ));
$$;

-- Function to check if user can access a specific class
CREATE OR REPLACE FUNCTION can_access_class(class_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    is_super_admin() OR
    (get_user_role() = 'class_admin' AND get_user_scope_type() = 'class' AND get_user_scope_id() = class_id) OR
    -- Classroom admin can access classes managed by their classroom
    (get_user_role() = 'classroom_admin' AND get_user_scope_type() = 'classroom' AND EXISTS (
      SELECT 1 FROM classes 
      WHERE id = class_id AND manage_by_classroom_id = get_user_scope_id()
    )) OR
    -- Branch admin can access classes in their sub_branch
    (get_user_role() = 'branch_admin' AND get_user_scope_type() = 'sub_branch' AND EXISTS (
      SELECT 1 FROM classes 
      WHERE id = class_id AND (
        manage_by_sub_branch_id = get_user_scope_id() OR
        manage_by_classroom_id IN (
          SELECT id FROM classrooms WHERE sub_branch_id = get_user_scope_id()
        )
      )
    )) OR
    -- State admin can access classes under their main_branch
    (get_user_role() = 'state_admin' AND get_user_scope_type() = 'main_branch' AND EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = class_id AND (
        -- Classes managed by sub_branch under their main_branch
        EXISTS (
          SELECT 1 FROM main_branches mb
          WHERE mb.id = get_user_scope_id() AND c.manage_by_sub_branch_id = ANY(mb.manage_sub_branches)
        )
        OR
        -- Classes managed by classroom under their main_branch
        EXISTS (
          SELECT 1 FROM classrooms cr
          JOIN main_branches mb ON cr.sub_branch_id = ANY(mb.manage_sub_branches)
          WHERE mb.id = get_user_scope_id() AND c.manage_by_classroom_id = cr.id
        )
      )
    ));
$$;

-- ==================================================
-- DROP EXISTING POLICIES (to avoid conflicts)
-- ==================================================

-- Main Branches
DROP POLICY IF EXISTS "super admins full access" ON "public"."main_branches";
DROP POLICY IF EXISTS "State admins can access their main branch" ON "public"."main_branches";
DROP POLICY IF EXISTS "Other users read-only access" ON "public"."main_branches";

-- Sub Branches
DROP POLICY IF EXISTS "super admins full access" ON "public"."sub_branches";
DROP POLICY IF EXISTS "State admins can manage sub branches" ON "public"."sub_branches";
DROP POLICY IF EXISTS "Branch admins can access their sub branch" ON "public"."sub_branches";
DROP POLICY IF EXISTS "Other users read-only access" ON "public"."sub_branches";

-- Classrooms
DROP POLICY IF EXISTS "super admins full access" ON "public"."classrooms";
DROP POLICY IF EXISTS "State admins can manage classrooms" ON "public"."classrooms";
DROP POLICY IF EXISTS "Branch admins can manage classrooms" ON "public"."classrooms";
DROP POLICY IF EXISTS "Classroom admins can access their classroom" ON "public"."classrooms";
DROP POLICY IF EXISTS "Other users read-only access" ON "public"."classrooms";

-- Classes
DROP POLICY IF EXISTS "super admins full access" ON "public"."classes";
DROP POLICY IF EXISTS "State admins can manage classes" ON "public"."classes";
DROP POLICY IF EXISTS "Branch admins can manage classes" ON "public"."classes";
DROP POLICY IF EXISTS "Classroom admins can manage classes" ON "public"."classes";
DROP POLICY IF EXISTS "Class admins can read their class" ON "public"."classes";

-- Students
DROP POLICY IF EXISTS "super admins full access" ON "public"."students";
DROP POLICY IF EXISTS "State admins can manage students" ON "public"."students";
DROP POLICY IF EXISTS "Branch admins can manage students" ON "public"."students";
DROP POLICY IF EXISTS "Classroom admins can manage students" ON "public"."students";
DROP POLICY IF EXISTS "Class admins can view their students" ON "public"."students";
DROP POLICY IF EXISTS "Users can access their own student record" ON "public"."students";

-- Class Enrollments
DROP POLICY IF EXISTS "super admins full access" ON "public"."class_enrollments";
DROP POLICY IF EXISTS "Admin access by hierarchy" ON "public"."class_enrollments";
DROP POLICY IF EXISTS "Class admins can view enrollments" ON "public"."class_enrollments";

-- Class Attendance
DROP POLICY IF EXISTS "super admins full access" ON "public"."class_attendance";
DROP POLICY IF EXISTS "Admin access by hierarchy" ON "public"."class_attendance";
DROP POLICY IF EXISTS "Class admins can manage attendance" ON "public"."class_attendance";

-- Class Cadres
DROP POLICY IF EXISTS "super admins full access" ON "public"."class_cadres";
DROP POLICY IF EXISTS "Admin access by hierarchy" ON "public"."class_cadres";
DROP POLICY IF EXISTS "Class admins can view cadres" ON "public"."class_cadres";

-- User Roles
DROP POLICY IF EXISTS "super admins full access" ON "public"."user_roles";
DROP POLICY IF EXISTS "Admins can view roles in their hierarchy" ON "public"."user_roles";

-- ==================================================
-- MAIN BRANCHES POLICIES
-- ==================================================

CREATE POLICY "super admins full access"
ON "public"."main_branches"
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "State admins can access their main branch"
ON "public"."main_branches"
FOR ALL
TO authenticated
USING (can_access_main_branch(id))
WITH CHECK (can_access_main_branch(id));

CREATE POLICY "Other users read-only access"
ON "public"."main_branches"
FOR SELECT
TO authenticated
USING (
  -- Exclude admin roles - they use their own restrictive policies
  get_user_role() NOT IN ('super_admin', 'state_admin', 'branch_admin', 'classroom_admin', 'class_admin')
);

-- ==================================================
-- SUB BRANCHES POLICIES
-- ==================================================

CREATE POLICY "super admins full access"
ON "public"."sub_branches"
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "State admins can manage sub branches"
ON "public"."sub_branches"
FOR ALL
TO authenticated
USING (can_access_sub_branch(id))
WITH CHECK (can_access_sub_branch(id));

CREATE POLICY "Branch admins can access their sub branch"
ON "public"."sub_branches"
FOR ALL
TO authenticated
USING (can_access_sub_branch(id))
WITH CHECK (can_access_sub_branch(id));

CREATE POLICY "Other users read-only access"
ON "public"."sub_branches"
FOR SELECT
TO authenticated
USING (
  -- Exclude admin roles - they use their own restrictive policies
  get_user_role() NOT IN ('super_admin', 'state_admin', 'branch_admin', 'classroom_admin', 'class_admin')
);

-- ==================================================
-- CLASSROOMS POLICIES
-- ==================================================

CREATE POLICY "super admins full access"
ON "public"."classrooms"
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "State admins can manage classrooms"
ON "public"."classrooms"
FOR ALL
TO authenticated
USING (can_access_classroom(id))
WITH CHECK (can_access_classroom(id));

CREATE POLICY "Branch admins can manage classrooms"
ON "public"."classrooms"
FOR ALL
TO authenticated
USING (can_access_classroom(id))
WITH CHECK (can_access_classroom(id));

CREATE POLICY "Classroom admins can access their classroom"
ON "public"."classrooms"
FOR ALL
TO authenticated
USING (can_access_classroom(id))
WITH CHECK (can_access_classroom(id));

CREATE POLICY "Other users read-only access"
ON "public"."classrooms"
FOR SELECT
TO authenticated
USING (
  -- Exclude admin roles - they use their own restrictive policies
  get_user_role() NOT IN ('super_admin', 'state_admin', 'branch_admin', 'classroom_admin', 'class_admin')
);

-- ==================================================
-- CLASSES POLICIES
-- ==================================================

CREATE POLICY "super admins full access"
ON "public"."classes"
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "State admins can manage classes"
ON "public"."classes"
FOR ALL
TO authenticated
USING (can_access_class(id))
WITH CHECK (can_access_class(id));

CREATE POLICY "Branch admins can manage classes"
ON "public"."classes"
FOR ALL
TO authenticated
USING (can_access_class(id))
WITH CHECK (can_access_class(id));

CREATE POLICY "Classroom admins can manage classes"
ON "public"."classes"
FOR ALL
TO authenticated
USING (can_access_class(id))
WITH CHECK (can_access_class(id));

CREATE POLICY "Class admins can read their class"
ON "public"."classes"
FOR SELECT
TO authenticated
USING (can_access_class(id));

-- ==================================================
-- STUDENTS POLICIES
-- ==================================================

CREATE POLICY "super admins full access"
ON "public"."students"
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "State admins can manage students"
ON "public"."students"
FOR ALL
TO authenticated
USING (
  get_user_role() = 'state_admin' AND get_user_scope_type() = 'main_branch' AND EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE ce.student_id = students.id AND (
      -- Students in classes managed by sub_branches under their main_branch
      EXISTS (
        SELECT 1 FROM main_branches mb
        WHERE mb.id = get_user_scope_id() AND c.manage_by_sub_branch_id = ANY(mb.manage_sub_branches)
      )
      OR
      -- Students in classes managed by classrooms under their main_branch
      EXISTS (
        SELECT 1 FROM classrooms cr
        JOIN main_branches mb ON cr.sub_branch_id = ANY(mb.manage_sub_branches)
        WHERE mb.id = get_user_scope_id() AND c.manage_by_classroom_id = cr.id
      )
    )
  )
)
WITH CHECK (
  get_user_role() = 'state_admin' AND get_user_scope_type() = 'main_branch' AND EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE ce.student_id = students.id AND (
      EXISTS (
        SELECT 1 FROM main_branches mb
        WHERE mb.id = get_user_scope_id() AND c.manage_by_sub_branch_id = ANY(mb.manage_sub_branches)
      )
      OR
      EXISTS (
        SELECT 1 FROM classrooms cr
        JOIN main_branches mb ON cr.sub_branch_id = ANY(mb.manage_sub_branches)
        WHERE mb.id = get_user_scope_id() AND c.manage_by_classroom_id = cr.id
      )
    )
  )
);

CREATE POLICY "Branch admins can manage students"
ON "public"."students"
FOR ALL
TO authenticated
USING (
  get_user_role() = 'branch_admin' AND get_user_scope_type() = 'sub_branch' AND EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE ce.student_id = students.id AND (
      c.manage_by_sub_branch_id = get_user_scope_id() OR
      c.manage_by_classroom_id IN (
        SELECT id FROM classrooms WHERE sub_branch_id = get_user_scope_id()
      )
    )
  )
)
WITH CHECK (
  get_user_role() = 'branch_admin' AND get_user_scope_type() = 'sub_branch' AND EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE ce.student_id = students.id AND (
      c.manage_by_sub_branch_id = get_user_scope_id() OR
      c.manage_by_classroom_id IN (
        SELECT id FROM classrooms WHERE sub_branch_id = get_user_scope_id()
      )
    )
  )
);

CREATE POLICY "Classroom admins can manage students"
ON "public"."students"
FOR ALL
TO authenticated
USING (
  get_user_role() = 'classroom_admin' AND get_user_scope_type() = 'classroom' AND EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE ce.student_id = students.id AND c.manage_by_classroom_id = get_user_scope_id()
  )
)
WITH CHECK (
  get_user_role() = 'classroom_admin' AND get_user_scope_type() = 'classroom' AND EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE ce.student_id = students.id AND c.manage_by_classroom_id = get_user_scope_id()
  )
);

CREATE POLICY "Class admins can view their students"
ON "public"."students"
FOR SELECT
TO authenticated
USING (
  get_user_role() = 'class_admin' AND get_user_scope_type() = 'class' AND EXISTS (
    SELECT 1 FROM class_enrollments ce
    WHERE ce.student_id = students.id AND ce.class_id = get_user_scope_id()
  )
);

CREATE POLICY "Users can access their own student record"
ON "public"."students"
FOR SELECT
TO authenticated
USING (
  -- Allow users to see their own student record by matching student_id from metadata
  students.student_id = COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'student_id',
    auth.jwt() -> 'app_metadata' ->> 'student_id'
  )
);

-- ==================================================
-- CLASS ENROLLMENTS POLICIES
-- ==================================================

CREATE POLICY "super admins full access"
ON "public"."class_enrollments"
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Admin access by hierarchy"
ON "public"."class_enrollments"
FOR ALL
TO authenticated
USING (
  can_access_class(class_id) AND 
  get_user_role() IN ('state_admin', 'branch_admin', 'classroom_admin')
)
WITH CHECK (
  can_access_class(class_id) AND 
  get_user_role() IN ('state_admin', 'branch_admin', 'classroom_admin')
);

CREATE POLICY "Class admins can view enrollments"
ON "public"."class_enrollments"
FOR SELECT
TO authenticated
USING (can_access_class(class_id));

-- ==================================================
-- CLASS ATTENDANCE POLICIES
-- ==================================================

CREATE POLICY "super admins full access"
ON "public"."class_attendance"
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Admin access by hierarchy"
ON "public"."class_attendance"
FOR ALL
TO authenticated
USING (can_access_class(class_id))
WITH CHECK (can_access_class(class_id));

CREATE POLICY "Class admins can manage attendance"
ON "public"."class_attendance"
FOR ALL
TO authenticated
USING (
  get_user_role() = 'class_admin' AND 
  get_user_scope_type() = 'class' AND 
  class_id = get_user_scope_id()
)
WITH CHECK (
  get_user_role() = 'class_admin' AND 
  get_user_scope_type() = 'class' AND 
  class_id = get_user_scope_id()
);

-- ==================================================
-- CLASS CADRES POLICIES
-- ==================================================

CREATE POLICY "super admins full access"
ON "public"."class_cadres"
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Admin access by hierarchy"
ON "public"."class_cadres"
FOR ALL
TO authenticated
USING (can_access_class(class_id))
WITH CHECK (can_access_class(class_id));

CREATE POLICY "Class admins can view cadres"
ON "public"."class_cadres"
FOR SELECT
TO authenticated
USING (can_access_class(class_id));

-- ==================================================
-- USER ROLES POLICIES
-- ==================================================

CREATE POLICY "super admins full access"
ON "public"."user_roles"
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Admins can view roles in their hierarchy"
ON "public"."user_roles"
FOR SELECT
TO authenticated
USING (
  -- State admins can view roles for scopes within their main_branch
  (get_user_role() = 'state_admin' AND get_user_scope_type() = 'main_branch' AND (
    (scope_type = 'main_branch' AND scope_id = get_user_scope_id()) OR
    (scope_type = 'sub_branch' AND EXISTS (
      SELECT 1 FROM main_branches mb
      WHERE mb.id = get_user_scope_id() AND scope_id = ANY(mb.manage_sub_branches)
    )) OR
    (scope_type = 'classroom' AND EXISTS (
      SELECT 1 FROM classrooms cr
      JOIN main_branches mb ON cr.sub_branch_id = ANY(mb.manage_sub_branches)
      WHERE mb.id = get_user_scope_id() AND cr.id = scope_id
    )) OR
    (scope_type = 'class' AND EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = scope_id AND (
        EXISTS (
          SELECT 1 FROM main_branches mb
          WHERE mb.id = get_user_scope_id() AND c.manage_by_sub_branch_id = ANY(mb.manage_sub_branches)
        )
        OR
        EXISTS (
          SELECT 1 FROM classrooms cr
          JOIN main_branches mb ON cr.sub_branch_id = ANY(mb.manage_sub_branches)
          WHERE mb.id = get_user_scope_id() AND c.manage_by_classroom_id = cr.id
        )
      )
    ))
  )) OR
  -- Branch admins can view roles within their sub_branch
  (get_user_role() = 'branch_admin' AND get_user_scope_type() = 'sub_branch' AND (
    (scope_type = 'sub_branch' AND scope_id = get_user_scope_id()) OR
    (scope_type = 'classroom' AND EXISTS (
      SELECT 1 FROM classrooms WHERE id = scope_id AND sub_branch_id = get_user_scope_id()
    )) OR
    (scope_type = 'class' AND EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = scope_id AND (
        c.manage_by_sub_branch_id = get_user_scope_id() OR
        c.manage_by_classroom_id IN (SELECT id FROM classrooms WHERE sub_branch_id = get_user_scope_id())
      )
    ))
  ))
);

-- ==================================================
-- PROFILES POLICIES (unchanged - keep existing)
-- ==================================================

-- Profiles policies remain the same as they need special handling for user's own data
-- These are typically managed by Supabase Auth and should already have appropriate policies
