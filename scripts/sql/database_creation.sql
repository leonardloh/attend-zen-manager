-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.class_attendance (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  class_id bigint,
  attendance_date date,
  learning_progress text,
  lamrin_page bigint,
  lamrin_line bigint,
  student_id bigint,
  attendance_status bigint,
  CONSTRAINT class_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT class_attendance_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT class_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.class_cadres (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  class_id bigint NOT NULL,
  student_id bigint NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['班长'::text, '副班长'::text, '关怀员'::text])),
  CONSTRAINT class_cadres_pkey PRIMARY KEY (id),
  CONSTRAINT class_cadres_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT class_cadres_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.class_enrollments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone,
  class_id bigint,
  student_id bigint,
  CONSTRAINT class_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT class_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.classes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone,
  name text,
  category text,
  level text,
  manage_by_sub_branch_id bigint,
  manage_by_classroom_id bigint,
  day_of_week text,
  class_start_date date,
  class_start_time time without time zone,
  class_end_time time without time zone,
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_new_manage_by_sub_branch_id_fkey FOREIGN KEY (manage_by_sub_branch_id) REFERENCES public.sub_branches(id),
  CONSTRAINT classes_manage_by_classroom_id_fkey FOREIGN KEY (manage_by_classroom_id) REFERENCES public.classrooms(id)
);

CREATE TABLE public.classrooms (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  state text,
  address text,
  person_in_charge bigint,
  sub_branch_id bigint NOT NULL,
  CONSTRAINT classrooms_pkey PRIMARY KEY (id),
  CONSTRAINT classrooms_sub_branch_id_fkey FOREIGN KEY (sub_branch_id) REFERENCES public.sub_branches(id),
  CONSTRAINT classrooms_person_in_charge_fkey FOREIGN KEY (person_in_charge) REFERENCES public.students(id)
);
CREATE TABLE public.main_branches (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  sub_branch_responsible bigint,
  person_in_charge bigint,
  manage_sub_branches ARRAY,
  CONSTRAINT main_branches_pkey PRIMARY KEY (id),
  CONSTRAINT main_branches_sub_branch_responsible_fkey FOREIGN KEY (sub_branch_responsible) REFERENCES public.sub_branches(id),
  CONSTRAINT main_branches_person_in_charge_fkey FOREIGN KEY (person_in_charge) REFERENCES public.students(id)
);
CREATE TABLE public.students (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  student_id text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  chinese_name text,
  english_name text,
  gender text,
  date_of_joining date,
  status text,
  email text,
  postcode text,
  year_of_birth integer,
  emergency_contact_name text,
  emergency_contact_number text,
  emergency_contact_relationship text,
  profession text,
  education_level text,
  maritial_status text,
  CONSTRAINT students_pkey PRIMARY KEY (id, student_id)
);
CREATE UNIQUE INDEX students_unique_identity_idx ON public.students (
  lower(trim(coalesce(english_name, ''))),
  trim(coalesce(postcode, '')),
  coalesce(year_of_birth, -1)
);
CREATE TABLE public.sub_branches (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  state text,
  address text,
  person_in_charge bigint,
  CONSTRAINT sub_branches_pkey PRIMARY KEY (id),
  CONSTRAINT sub_branches_person_in_charge_fkey FOREIGN KEY (person_in_charge) REFERENCES public.students(id)
);

-- Classrooms managed by sub-branches
CREATE TABLE public.classrooms (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  state text,
  address text,
  person_in_charge bigint,
  sub_branch_id bigint NOT NULL,
  CONSTRAINT classrooms_pkey PRIMARY KEY (id),
  CONSTRAINT classrooms_unique_name UNIQUE (name),
  CONSTRAINT classrooms_person_in_charge_fkey FOREIGN KEY (person_in_charge) REFERENCES public.students(id),
  CONSTRAINT classrooms_sub_branch_id_fkey FOREIGN KEY (sub_branch_id) REFERENCES public.sub_branches(id)
);

-- ==========================================================================
-- Role helpers & RLS policies
-- ==========================================================================

-- Helper: return TRUE when current JWT belongs to a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role' = 'super_admin';
$$;

-- Helper: return the scoped main_branch id for state_admin accounts
CREATE OR REPLACE FUNCTION public.state_scope_main_branch()
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'scope_id')::bigint
  WHERE auth.jwt() -> 'app_metadata' ->> 'role' = 'state_admin'
    AND auth.jwt() -> 'app_metadata' ->> 'scope_type' = 'main_branch';
$$;

-- Helper: test whether a sub_branch belongs to the state admin scope
CREATE OR REPLACE FUNCTION public.is_sub_branch_in_scope(sub_branch_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((
    SELECT EXISTS (
      SELECT 1
      FROM public.main_branches mb
      CROSS JOIN LATERAL (
        SELECT COALESCE(array(SELECT unnest(mb.manage_sub_branches)::text), ARRAY[]::text[]) AS entries
      ) arr
      LEFT JOIN public.sub_branches sb ON sb.id = sub_branch_id
      WHERE mb.id = public.state_scope_main_branch()
        AND (
          (arr.entries <> ARRAY[]::text[] AND sub_branch_id::text = ANY(arr.entries))
          OR (arr.entries <> ARRAY[]::text[] AND sb.name IS NOT NULL AND sb.name = ANY(arr.entries))
          OR (sb.main_branch_name IS NOT NULL AND sb.main_branch_name = mb.name)
        )
    )
  ), FALSE);
$$;

-- Enable RLS on core tables
ALTER TABLE public.main_branches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_branches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_cadres       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_attendance   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students          ENABLE ROW LEVEL SECURITY;

-- Super admins retain full access everywhere
CREATE POLICY "super admins full access" ON public.main_branches
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "super admins full access" ON public.sub_branches
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "super admins full access" ON public.classes
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "super admins full access" ON public.classrooms
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "super admins full access" ON public.class_enrollments
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "super admins full access" ON public.class_cadres
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "super admins full access" ON public.class_attendance
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "super admins full access" ON public.students
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- State admin scoped visibility (read-only)
CREATE POLICY "state admins main branch" ON public.main_branches
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (public.state_scope_main_branch() IS NOT NULL
        AND id = public.state_scope_main_branch())
  );

CREATE POLICY "state admins sub branches" ON public.sub_branches
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (public.state_scope_main_branch() IS NOT NULL
        AND public.is_sub_branch_in_scope(id))
  );

CREATE POLICY "state admins classes" ON public.classes
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (public.state_scope_main_branch() IS NOT NULL
        AND public.is_sub_branch_in_scope(classes.manage_by_sub_branch_id))
  );

CREATE POLICY "state admins classrooms" ON public.classrooms
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (public.state_scope_main_branch() IS NOT NULL
        AND public.is_sub_branch_in_scope(classrooms.sub_branch_id))
  );

CREATE POLICY "state admins class enrollments" ON public.class_enrollments
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      public.state_scope_main_branch() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.classes c
        WHERE c.id = class_enrollments.class_id
          AND public.is_sub_branch_in_scope(c.manage_by_sub_branch_id)
      )
    )
  );

CREATE POLICY "state admins class cadres" ON public.class_cadres
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      public.state_scope_main_branch() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.classes c
        WHERE c.id = class_cadres.class_id
          AND public.is_sub_branch_in_scope(c.manage_by_sub_branch_id)
      )
    )
  );

CREATE POLICY "state admins class attendance" ON public.class_attendance
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      public.state_scope_main_branch() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.classes c
        WHERE c.id = class_attendance.class_id
          AND public.is_sub_branch_in_scope(c.manage_by_sub_branch_id)
      )
    )
  );

CREATE POLICY "state admins students" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      public.state_scope_main_branch() IS NOT NULL
      AND (
        EXISTS (
          SELECT 1
          FROM public.class_enrollments ce
          JOIN public.classes c ON c.id = ce.class_id
          WHERE ce.student_id = students.id
            AND public.is_sub_branch_in_scope(c.manage_by_sub_branch_id)
        )
        OR EXISTS (
          SELECT 1
          FROM public.class_cadres cc
          JOIN public.classes c2 ON c2.id = cc.class_id
          WHERE cc.student_id = students.id
            AND public.is_sub_branch_in_scope(c2.manage_by_sub_branch_id)
        )
      )
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM (
      'super_admin',
      'state_admin',
      'branch_admin',
      'class_admin',
      'student'
    );
  END IF;
END $$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_db_id bigint UNIQUE REFERENCES public.students(id),
  phone text,
  state_admin_of bigint REFERENCES public.main_branches(id),
  branch_admin_of bigint REFERENCES public.sub_branches(id),
  class_admin_of bigint REFERENCES public.classes(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  scope_type text,
  scope_id bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT user_roles_unique_assignment UNIQUE (user_id, role, scope_type, scope_id)
);
