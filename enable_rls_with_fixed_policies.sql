-- Enable RLS with Fixed Policies
-- This script enables RLS on all tables and installs the corrected policies
-- Run this in your Supabase SQL Editor after testing with RLS disabled

-- Step 1: Enable RLS on all tables
ALTER TABLE public.main_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_cadres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Run the comprehensive_rls_policies.sql file
-- Copy and paste the entire contents of comprehensive_rls_policies.sql below this line
-- (OR run it as a separate query after enabling RLS above)

-- Note: The comprehensive_rls_policies.sql file has been fixed to:
-- ✅ Properly restrict state_admin users to only see their assigned main_branch
-- ✅ Exclude admin roles from the permissive "Other users" policies
-- ✅ Enforce hierarchical access control at the database level
