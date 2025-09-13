import { supabase } from '../supabase';
import { DbClass, DbClassCadre, ClassWithDetails } from '@/types/database';

export interface CreateClassData {
  name: string;
  manage_by_sub_branch_id?: number;
  day_of_week?: string;
  class_start_time?: string;
  class_end_time?: string;
  monitor_id?: number;
  deputy_monitors?: number[]; // Array of student IDs for deputy monitors
  care_officers?: number[]; // Array of student IDs for care officers
  student_ids?: number[]; // Array of student IDs for class enrollment
}

export interface UpdateClassData extends Partial<CreateClassData> {
  id: number;
}

export interface CreateClassCadreData {
  class_id: number;
  student_id: number;
  role: '班长' | '副班长' | '关怀员';
}

// Helper function to format time from database (HH:MM:SS) to form format (HH:MM)
const formatTimeForForm = (timeString: string): string => {
  if (!timeString) return '';
  // Remove seconds if present (08:00:00 -> 08:00)
  return timeString.substring(0, 5);
};

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

  // Get cadres from junction table
  const { data: classCadres } = await supabase
    .from('class_cadres')
    .select(`
      student_id,
      role,
      students!inner(chinese_name)
    `)
    .eq('class_id', dbClass.id);

  // Separate all three roles
  const monitors = classCadres?.filter(c => c.role === '班长') || [];
  const deputyMonitors = classCadres?.filter(c => c.role === '副班长') || [];
  const careOfficers = classCadres?.filter(c => c.role === '关怀员') || [];

  // Get monitor info (should be only one due to EXCLUDE constraint)
  const monitor = monitors[0];
  const monitor_id = monitor?.student_id;
  const class_monitor_name = monitor ? (monitor.students as any).chinese_name : '';

  // Get student count from enrollments
  const { count: studentCount } = await supabase
    .from('class_enrollments')
    .select('*', { count: 'exact' })
    .eq('class_id', dbClass.id);

  // Get enrolled students with their student IDs
  const { data: enrolledStudents } = await supabase
    .from('class_enrollments')
    .select(`
      student_id,
      students!inner(student_id, chinese_name, english_name)
    `)
    .eq('class_id', dbClass.id);

  // Extract student IDs for mother_class_students field
  const motherClassStudents = enrolledStudents?.map(enrollment => 
    (enrollment.students as any).student_id
  ) || [];

  console.log('🔧 mapDbClassToFrontend - Enrolled students:', {
    enrolledStudents,
    motherClassStudents,
    studentCount
  });

  // Format time - strip seconds from database time format
  const time = dbClass.day_of_week && dbClass.class_start_time && dbClass.class_end_time 
    ? `${dbClass.day_of_week} ${formatTimeForForm(dbClass.class_start_time)}-${formatTimeForForm(dbClass.class_end_time)}`
    : '';
    
  console.log('🔧 mapDbClassToFrontend - Time formatting:', {
    originalStartTime: dbClass.class_start_time,
    originalEndTime: dbClass.class_end_time,
    formattedStartTime: formatTimeForForm(dbClass.class_start_time || ''),
    formattedEndTime: formatTimeForForm(dbClass.class_end_time || ''),
    finalTimeString: time
  });

  return {
    ...dbClass,
    sub_branch_name,
    student_count: studentCount || 0,
    monitor_id,
    class_monitor_name,
    deputy_monitors: deputyMonitors.map(dm => dm.student_id),
    care_officers: careOfficers.map(co => co.student_id),
    deputy_monitor_names: deputyMonitors.map(dm => (dm.students as any).chinese_name),
    care_officer_names: careOfficers.map(co => (co.students as any).chinese_name),
    mother_class_students: motherClassStudents,
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
  const { monitor_id, deputy_monitors, care_officers, student_ids, ...baseClassData } = classData;
  
  console.log('🔧 createClass - Input data:', {
    monitor_id,
    deputy_monitors,
    care_officers,
    student_ids,
    baseClassData
  });
  
  // First, create the class
  const { data, error } = await supabase
    .from('classes')
    .insert(baseClassData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create class: ${error.message}`);
  }

  console.log('🔧 createClass - Class created with ID:', data.id);

  // Add monitor if provided
  if (monitor_id) {
    await updateClassCadres(data.id, '班长', [monitor_id]);
  }

  // Add deputy monitors if any
  if (deputy_monitors && deputy_monitors.length > 0) {
    await updateClassCadres(data.id, '副班长', deputy_monitors);
  }

  // Add care officers if any
  if (care_officers && care_officers.length > 0) {
    await updateClassCadres(data.id, '关怀员', care_officers);
  }

  // Create student enrollments if any
  if (student_ids && student_ids.length > 0) {
    console.log('🔧 createClass - Creating enrollments for students:', student_ids);
    await createClassEnrollments(data.id, student_ids);
  }

  return await mapDbClassToFrontend(data);
};

// Update class
export const updateClass = async (classData: UpdateClassData): Promise<ClassWithDetails> => {
  const { id, monitor_id, deputy_monitors, care_officers, student_ids, ...updateData } = classData;
  
  console.log('🔧 updateClass - Input data:', {
    id,
    monitor_id,
    deputy_monitors,
    care_officers,
    student_ids,
    updateData
  });
  
  // First, update the basic class data
  const { data, error } = await supabase
    .from('classes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update class: ${error.message}`);
  }

  console.log('🔧 updateClass - Class updated with ID:', id);

  // Update monitor if provided
  if (monitor_id !== undefined) {
    await updateClassCadres(id, '班长', monitor_id ? [monitor_id] : []);
  }

  // Update deputy monitors if provided
  if (deputy_monitors !== undefined) {
    await updateClassCadres(id, '副班长', deputy_monitors);
  }

  // Update care officers if provided
  if (care_officers !== undefined) {
    await updateClassCadres(id, '关怀员', care_officers);
  }

  // Update student enrollments if provided
  if (student_ids !== undefined) {
    console.log('🔧 updateClass - Updating enrollments for students:', student_ids);
    await updateClassEnrollments(id, student_ids);
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

  // Delete class cadres (should cascade automatically, but being explicit)
  await supabase
    .from('class_cadres')
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

// Class Cadre Management Functions

// Add a cadre to a class
export const addClassCadre = async (cadreData: CreateClassCadreData): Promise<void> => {
  const { error } = await supabase
    .from('class_cadres')
    .insert(cadreData);

  if (error) {
    throw new Error(`Failed to add class cadre: ${error.message}`);
  }
};

// Remove a cadre from a class
export const removeClassCadre = async (classId: number, studentId: number, role: '班长' | '副班长' | '关怀员'): Promise<void> => {
  const { error } = await supabase
    .from('class_cadres')
    .delete()
    .eq('class_id', classId)
    .eq('student_id', studentId)
    .eq('role', role);

  if (error) {
    throw new Error(`Failed to remove class cadre: ${error.message}`);
  }
};

// Update class cadres (replace all cadres of a specific role for a class)
export const updateClassCadres = async (classId: number, role: '班长' | '副班长' | '关怀员', studentIds: number[]): Promise<void> => {
  console.log(`🔧 updateClassCadres: classId=${classId}, role=${role}, studentIds=${JSON.stringify(studentIds)}`);
  
  // First, remove all existing cadres of this role for this class
  const { error: deleteError } = await supabase
    .from('class_cadres')
    .delete()
    .eq('class_id', classId)
    .eq('role', role);

  if (deleteError) {
    console.error(`❌ Failed to delete existing ${role} cadres:`, deleteError);
    throw new Error(`Failed to delete existing cadres: ${deleteError.message}`);
  }

  // Then, add new cadres if any
  if (studentIds.length > 0) {
    const cadreInserts = studentIds.map(studentId => ({
      class_id: classId,
      student_id: studentId,
      role: role
    }));

    console.log(`🔧 Inserting ${cadreInserts.length} ${role} records:`, cadreInserts);

    const { error: insertError } = await supabase
      .from('class_cadres')
      .insert(cadreInserts);

    if (insertError) {
      console.error(`❌ Failed to insert ${role} cadres:`, insertError);
      throw new Error(`Failed to update class cadres: ${insertError.message}`);
    }

    console.log(`✅ Successfully inserted ${cadreInserts.length} ${role} records for class ${classId}`);
  } else {
    console.log(`ℹ️ No ${role} cadres to insert for class ${classId}`);
  }
};

// Get all cadres for a specific class
export const fetchClassCadres = async (classId: number): Promise<DbClassCadre[]> => {
  const { data, error } = await supabase
    .from('class_cadres')
    .select('*')
    .eq('class_id', classId);

  if (error) {
    throw new Error(`Failed to fetch class cadres: ${error.message}`);
  }

  return data || [];
};

// Class Enrollment Management Functions

// Create enrollments for multiple students in a class
export const createClassEnrollments = async (classId: number, studentIds: number[]): Promise<void> => {
  console.log(`🔧 createClassEnrollments: classId=${classId}, studentIds=${JSON.stringify(studentIds)}`);
  
  if (studentIds.length === 0) {
    console.log('ℹ️ No students to enroll');
    return;
  }

  const enrollmentInserts = studentIds.map(studentId => ({
    class_id: classId,
    student_id: studentId,
    updated_at: new Date().toISOString()
  }));

  console.log(`🔧 Inserting ${enrollmentInserts.length} enrollment records:`, enrollmentInserts);

  const { error } = await supabase
    .from('class_enrollments')
    .insert(enrollmentInserts);

  if (error) {
    console.error('❌ Failed to create class enrollments:', error);
    throw new Error(`Failed to create class enrollments: ${error.message}`);
  }

  console.log(`✅ Successfully created ${enrollmentInserts.length} enrollment records for class ${classId}`);
};

// Update class enrollments (replace all existing enrollments with new ones)
export const updateClassEnrollments = async (classId: number, studentIds: number[]): Promise<void> => {
  console.log(`🔧 updateClassEnrollments: classId=${classId}, studentIds=${JSON.stringify(studentIds)}`);
  
  // First, remove all existing enrollments for this class
  const { error: deleteError } = await supabase
    .from('class_enrollments')
    .delete()
    .eq('class_id', classId);

  if (deleteError) {
    console.error(`❌ Failed to delete existing enrollments:`, deleteError);
    throw new Error(`Failed to delete existing enrollments: ${deleteError.message}`);
  }

  // Then, create new enrollments if any students are provided
  if (studentIds.length > 0) {
    await createClassEnrollments(classId, studentIds);
  } else {
    console.log(`ℹ️ No students to enroll for class ${classId}`);
  }
};

// Add a single student to a class
export const addStudentToClass = async (classId: number, studentId: number): Promise<void> => {
  const { error } = await supabase
    .from('class_enrollments')
    .insert({
      class_id: classId,
      student_id: studentId,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw new Error(`Failed to add student to class: ${error.message}`);
  }
};

// Remove a student from a class
export const removeStudentFromClass = async (classId: number, studentId: number): Promise<void> => {
  const { error } = await supabase
    .from('class_enrollments')
    .delete()
    .eq('class_id', classId)
    .eq('student_id', studentId);

  if (error) {
    throw new Error(`Failed to remove student from class: ${error.message}`);
  }
};

// Get all students enrolled in a specific class
export const getClassStudents = async (classId: number): Promise<any[]> => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select(`
      student_id,
      students!inner(id, student_id, chinese_name, english_name)
    `)
    .eq('class_id', classId);

  if (error) {
    throw new Error(`Failed to fetch class students: ${error.message}`);
  }

  return data || [];
};