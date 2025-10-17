import { supabase } from '../supabase';
import { DbStudent, StudentWithDetails } from '@/types/database';

export interface CreateStudentData {
  student_id: string;
  chinese_name?: string;
  english_name?: string;
  gender?: string;
  date_of_joining?: string;
  status?: string;
  email?: string;
  state?: string;
  postcode?: string;
  year_of_birth?: number;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  emergency_contact_relationship?: string;
  profession?: string;
  education_level?: string;
  maritial_status?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  id: number;
}

// Convert database student to frontend format
export const mapDbStudentToFrontend = (dbStudent: DbStudent): StudentWithDetails => ({
  ...dbStudent,
  phone: dbStudent.emergency_contact_number || '',
  enrollment_date: dbStudent.date_of_joining || '',
});

// Convert frontend student to database format
export const mapFrontendStudentToDb = (student: Partial<StudentWithDetails> & { student_id: string }): CreateStudentData => ({
  student_id: student.student_id,
  chinese_name: student.chinese_name,
  english_name: student.english_name,
  gender: student.gender,
  date_of_joining: student.enrollment_date || student.date_of_joining,
  status: student.status,
  email: student.email,
  state: student.state,
  postcode: student.postal_code || student.postcode,
  year_of_birth: student.year_of_birth,
  emergency_contact_name: student.emergency_contact_name,
  emergency_contact_number: student.phone || student.emergency_contact_number,
  emergency_contact_relationship: student.emergency_contact_relation || student.emergency_contact_relationship,
  profession: student.occupation || student.profession,
  education_level: student.academic_level || student.education_level,
  maritial_status: student.marriage_status || student.maritial_status,
});

// Fetch all students
export const fetchStudents = async (): Promise<StudentWithDetails[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch students: ${error.message}`);
  }

  return data.map(mapDbStudentToFrontend);
};

// Fetch student by ID
export const fetchStudentById = async (id: number): Promise<StudentWithDetails | null> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch student: ${error.message}`);
  }

  return mapDbStudentToFrontend(data);
};

// Fetch student by student_id
export const fetchStudentByStudentId = async (studentId: string): Promise<StudentWithDetails | null> => {
  console.log('🔍 fetchStudentByStudentId - Querying for:', studentId);
  
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (error) {
    console.error('❌ fetchStudentByStudentId - Error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch student: ${error.message}`);
  }

  console.log('✅ fetchStudentByStudentId - Found student:', data?.student_id);
  return mapDbStudentToFrontend(data);
};

// Create new student
export const createStudent = async (studentData: CreateStudentData): Promise<StudentWithDetails> => {
  const { data, error } = await supabase
    .from('students')
    .insert(studentData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('已存在相同英文姓名、邮政编码和出生年份的学员');
    }
    throw new Error(`Failed to create student: ${error.message}`);
  }

  return mapDbStudentToFrontend(data);
};

// Update student
export const updateStudent = async (studentData: UpdateStudentData): Promise<StudentWithDetails> => {
  const { id, ...updateData } = studentData;
  
  const { data, error } = await supabase
    .from('students')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update student: ${error.message}`);
  }

  return mapDbStudentToFrontend(data);
};

// Delete student
export const deleteStudent = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete student: ${error.message}`);
  }
};

// Search students by name or student_id
export const searchStudents = async (query: string): Promise<StudentWithDetails[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .or(`student_id.ilike.%${query}%,chinese_name.ilike.%${query}%,english_name.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to search students: ${error.message}`);
  }

  return data.map(mapDbStudentToFrontend);
};
