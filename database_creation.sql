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
