import { supabase } from '../supabase';
import { DbClassAttendance, DbClassEnrollment } from '@/types/database';

// Class Enrollment interfaces
export interface CreateEnrollmentData {
  class_id: number;
  student_id: number;
}

export interface UpdateEnrollmentData extends Partial<CreateEnrollmentData> {
  id: number;
}

// Class Attendance interfaces
export interface CreateAttendanceData {
  class_id: number;
  student_id: number;
  attendance_date: string;
  attendance_status: number; // 1 = present, 2 = online, 3 = leave, 0 = absent, 4 = holiday
  learning_progress?: string;
  lamrin_page?: number;
  lamrin_line?: number;
}

export interface UpdateAttendanceData extends Partial<CreateAttendanceData> {
  id: number;
}

export interface AttendanceRecord extends DbClassAttendance {
  student_name?: string;
  class_name?: string;
}

// Class Enrollment CRUD operations
export const fetchEnrollments = async (): Promise<DbClassEnrollment[]> => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch enrollments: ${error.message}`);
  }

  return data;
};

export const fetchEnrollmentsByClass = async (classId: number): Promise<DbClassEnrollment[]> => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch class enrollments: ${error.message}`);
  }

  return data;
};

export const fetchEnrollmentsByStudent = async (studentId: number): Promise<DbClassEnrollment[]> => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch student enrollments: ${error.message}`);
  }

  return data;
};

export const createEnrollment = async (enrollmentData: CreateEnrollmentData): Promise<DbClassEnrollment> => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .insert(enrollmentData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create enrollment: ${error.message}`);
  }

  return data;
};

export const deleteEnrollment = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('class_enrollments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete enrollment: ${error.message}`);
  }
};

export const deleteEnrollmentByStudentAndClass = async (studentId: number, classId: number): Promise<void> => {
  const { error } = await supabase
    .from('class_enrollments')
    .delete()
    .eq('student_id', studentId)
    .eq('class_id', classId);

  if (error) {
    throw new Error(`Failed to delete enrollment: ${error.message}`);
  }
};

// Class Attendance CRUD operations
export const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('class_attendance')
    .select(`
      *,
      students!inner(chinese_name),
      classes!inner(name)
    `)
    .order('attendance_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch attendance: ${error.message}`);
  }

  return data.map(record => ({
    ...record,
    student_name: record.students?.chinese_name,
    class_name: record.classes?.name
  }));
};

export const fetchAttendanceByClass = async (classId: number, date?: string): Promise<AttendanceRecord[]> => {
  let query = supabase
    .from('class_attendance')
    .select(`
      *,
      students!inner(chinese_name),
      classes!inner(name)
    `)
    .eq('class_id', classId);

  if (date) {
    query = query.eq('attendance_date', date);
  }

  const { data, error } = await query.order('attendance_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch class attendance: ${error.message}`);
  }

  return data.map(record => ({
    ...record,
    student_name: record.students?.chinese_name,
    class_name: record.classes?.name
  }));
};

export const fetchAttendanceByStudent = async (studentId: number): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('class_attendance')
    .select(`
      *,
      students!inner(chinese_name),
      classes!inner(name)
    `)
    .eq('student_id', studentId)
    .order('attendance_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch student attendance: ${error.message}`);
  }

  return data.map(record => ({
    ...record,
    student_name: record.students?.chinese_name,
    class_name: record.classes?.name
  }));
};

export const createAttendance = async (attendanceData: CreateAttendanceData): Promise<AttendanceRecord> => {
  const { data, error } = await supabase
    .from('class_attendance')
    .insert(attendanceData)
    .select(`
      *,
      students!inner(chinese_name),
      classes!inner(name)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create attendance: ${error.message}`);
  }

  return {
    ...data,
    student_name: data.students?.chinese_name,
    class_name: data.classes?.name
  };
};

export const updateAttendance = async (attendanceData: UpdateAttendanceData): Promise<AttendanceRecord> => {
  const { id, ...updateData } = attendanceData;
  
  const { data, error } = await supabase
    .from('class_attendance')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      students!inner(chinese_name),
      classes!inner(name)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update attendance: ${error.message}`);
  }

  return {
    ...data,
    student_name: data.students?.chinese_name,
    class_name: data.classes?.name
  };
};

export const deleteAttendance = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('class_attendance')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete attendance: ${error.message}`);
  }
};

// Bulk attendance operations
export const createBulkAttendance = async (attendanceRecords: CreateAttendanceData[]): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('class_attendance')
    .insert(attendanceRecords)
    .select(`
      *,
      students!inner(chinese_name),
      classes!inner(name)
    `);

  if (error) {
    throw new Error(`Failed to create bulk attendance: ${error.message}`);
  }

  return data.map(record => ({
    ...record,
    student_name: record.students?.chinese_name,
    class_name: record.classes?.name
  }));
};

// Helper functions for statistics
export const getAttendanceStats = async (classId?: number, studentId?: number) => {
  let query = supabase
    .from('class_attendance')
    .select('attendance_status');

  if (classId) query = query.eq('class_id', classId);
  if (studentId) query = query.eq('student_id', studentId);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch attendance stats: ${error.message}`);
  }

  const present = data.filter(record => record.attendance_status === 1).length;
  const online = data.filter(record => record.attendance_status === 2).length;
  const leave = data.filter(record => record.attendance_status === 3).length;
  const absent = data.filter(record => record.attendance_status === 0).length;
  const holiday = data.filter(record => record.attendance_status === 4).length;

  const total = data.length;
  const effectiveTotal = total - holiday;
  const attendanceRate = effectiveTotal > 0 ? ((present + online) / effectiveTotal) * 100 : 0;

  return {
    total,
    present,
    absent,
    online,
    leave,
    holiday,
    attendanceRate: Math.round(attendanceRate * 100) / 100
  };
};

// Get students enrolled in a class with their latest attendance
export const getClassStudentsWithAttendance = async (classId: number, date?: string) => {
  const { data: enrollments, error: enrollError } = await supabase
    .from('class_enrollments')
    .select(`
      student_id,
      students!inner(id, student_id, chinese_name, english_name)
    `)
    .eq('class_id', classId);

  if (enrollError) {
    throw new Error(`Failed to fetch class students: ${enrollError.message}`);
  }

  // Get attendance for these students on the specified date (if provided)
  const studentIds = enrollments.map(e => e.student_id);
  let attendanceQuery = supabase
    .from('class_attendance')
    .select('student_id, attendance_status, learning_progress, lamrin_page, lamrin_line')
    .eq('class_id', classId)
    .in('student_id', studentIds);

  if (date) {
    attendanceQuery = attendanceQuery.eq('attendance_date', date);
  }

  const { data: attendance, error: attendanceError } = await attendanceQuery;

  if (attendanceError) {
    throw new Error(`Failed to fetch attendance data: ${attendanceError.message}`);
  }

  // Combine student info with attendance
  return enrollments.map(enrollment => {
    const studentAttendance = attendance.find(a => a.student_id === enrollment.student_id);
    return {
      ...enrollment.students,
      attendance_status: studentAttendance?.attendance_status,
      learning_progress: studentAttendance?.learning_progress,
      lamrin_page: studentAttendance?.lamrin_page,
      lamrin_line: studentAttendance?.lamrin_line,
      has_attendance: !!studentAttendance
    };
  });
};
