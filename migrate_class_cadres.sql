-- Migration script to convert existing monitor_id, vice_monitor_id and care_officer_id to junction table
-- Run this AFTER creating the class_cadres table but BEFORE dropping the old columns

-- Step 1: Migrate existing monitors to class_cadres table
INSERT INTO public.class_cadres (class_id, student_id, role, created_at)
SELECT 
  id as class_id,
  monitor_id as student_id,
  '班长' as role,
  created_at
FROM public.classes
WHERE monitor_id IS NOT NULL;

-- Step 2: Migrate existing vice monitors to class_cadres table
INSERT INTO public.class_cadres (class_id, student_id, role, created_at)
SELECT 
  id as class_id,
  vice_monitor_id as student_id,
  '副班长' as role,
  created_at
FROM public.classes
WHERE vice_monitor_id IS NOT NULL;

-- Step 3: Migrate existing care officers to class_cadres table  
INSERT INTO public.class_cadres (class_id, student_id, role, created_at)
SELECT 
  id as class_id,
  care_officer_id as student_id,
  '关怀员' as role,
  created_at
FROM public.classes
WHERE care_officer_id IS NOT NULL;

-- Step 4: Verify the migration
SELECT 
  'Migration Summary' as info,
  COUNT(*) as total_cadre_records,
  SUM(CASE WHEN role = '班长' THEN 1 ELSE 0 END) as monitors,
  SUM(CASE WHEN role = '副班长' THEN 1 ELSE 0 END) as deputy_monitors,
  SUM(CASE WHEN role = '关怀员' THEN 1 ELSE 0 END) as care_officers
FROM public.class_cadres;

-- Step 5: Show classes with their new cadre structure
SELECT 
  c.id,
  c.name,
  string_agg(
    CASE WHEN cc.role = '班长' THEN s.chinese_name END, 
    ', '
  ) as monitors,
  string_agg(
    CASE WHEN cc.role = '副班长' THEN s.chinese_name END, 
    ', '
  ) as deputy_monitors,
  string_agg(
    CASE WHEN cc.role = '关怀员' THEN s.chinese_name END,
    ', '  
  ) as care_officers
FROM public.classes c
LEFT JOIN public.class_cadres cc ON c.id = cc.class_id
LEFT JOIN public.students s ON cc.student_id = s.id
GROUP BY c.id, c.name
ORDER BY c.created_at;

-- Step 6: After verification, you can drop the old columns (UNCOMMENT ONLY AFTER VERIFICATION)
-- ALTER TABLE public.classes DROP COLUMN IF EXISTS monitor_id;
-- ALTER TABLE public.classes DROP COLUMN IF EXISTS vice_monitor_id;
-- ALTER TABLE public.classes DROP COLUMN IF EXISTS care_officer_id;