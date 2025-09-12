import { supabase } from '../supabase';
import { DbClass, ClassWithDetails } from '@/types/database';

export interface CreateClassData {
  name: string;
  manage_by_sub_branch_id?: number;
  day_of_week?: string;
  class_start_time?: string;
  class_end_time?: string;
  monitor_id?: number;
  vice_monitor_id?: number;
  care_officer_id?: number;
}

export interface UpdateClassData extends Partial<CreateClassData> {
  id: number;
}

// Convert database class to frontend format
export const mapDbClassToFrontend = async (dbClass: DbClass): Promise<ClassWithDetails> => {
  // Get sub-branch name
  let sub_branch_name = '';
  if (dbClass.manage_by_sub_branch_id) {
    const { data: subBranch } = await supabase
      .from('sub_branches')
      .select('name')
      .eq('id', dbClass.manage_by_sub_branch_id)
      .single();
    sub_branch_name = subBranch?.name || '';
  }

  // Get class monitor name
  let class_monitor_name = '';
  if (dbClass.monitor_id) {
    const { data: student } = await supabase
      .from('students')
      .select('chinese_name')
      .eq('id', dbClass.monitor_id)
      .single();
    class_monitor_name = student?.chinese_name || '';
  }

  // Get student count from enrollments
  const { count: studentCount } = await supabase
    .from('class_enrollments')
    .select('*', { count: 'exact' })
    .eq('class_id', dbClass.id);

  // Format time
  const time = dbClass.day_of_week && dbClass.class_start_time && dbClass.class_end_time 
    ? `${dbClass.day_of_week} ${dbClass.class_start_time}-${dbClass.class_end_time}`
    : '';

  return {
    ...dbClass,
    sub_branch_name,
    student_count: studentCount || 0,
    class_monitor_name,
    deputy_monitors: dbClass.vice_monitor_id ? [dbClass.vice_monitor_id] : [],
    care_officers: dbClass.care_officer_id ? [dbClass.care_officer_id] : [],
    time,
    attendance_rate: 0, // TODO: Calculate from attendance data
    learning_progress: '',
    page_number: '',
    line_number: '',
    status: 'active' // Default status
  };
};

// Fetch all classes
export const fetchClasses = async (): Promise<ClassWithDetails[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch classes: ${error.message}`);
  }

  // Map each class with additional details
  const classesWithDetails = await Promise.all(
    data.map(cls => mapDbClassToFrontend(cls))
  );

  return classesWithDetails;
};

// Fetch class by ID
export const fetchClassById = async (id: number): Promise<ClassWithDetails | null> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch class: ${error.message}`);
  }

  return await mapDbClassToFrontend(data);
};

// Create new class
export const createClass = async (classData: CreateClassData): Promise<ClassWithDetails> => {
  const { data, error } = await supabase
    .from('classes')
    .insert(classData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create class: ${error.message}`);
  }

  return await mapDbClassToFrontend(data);
};

// Update class
export const updateClass = async (classData: UpdateClassData): Promise<ClassWithDetails> => {
  const { id, ...updateData } = classData;
  
  const { data, error } = await supabase
    .from('classes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update class: ${error.message}`);
  }

  return await mapDbClassToFrontend(data);
};

// Delete class
export const deleteClass = async (id: number): Promise<void> => {
  // First, delete related enrollments
  await supabase
    .from('class_enrollments')
    .delete()
    .eq('class_id', id);

  // Then delete the class
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete class: ${error.message}`);
  }
};

// Get classes by sub-branch
export const fetchClassesBySubBranch = async (subBranchId: number): Promise<ClassWithDetails[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('manage_by_sub_branch_id', subBranchId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch classes by sub-branch: ${error.message}`);
  }

  const classesWithDetails = await Promise.all(
    data.map(cls => mapDbClassToFrontend(cls))
  );

  return classesWithDetails;
};

// Search classes by name
export const searchClasses = async (query: string): Promise<ClassWithDetails[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to search classes: ${error.message}`);
  }

  const classesWithDetails = await Promise.all(
    data.map(cls => mapDbClassToFrontend(cls))
  );

  return classesWithDetails;
};