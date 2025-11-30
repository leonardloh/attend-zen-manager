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

// Upsert bulk attendance - delete existing records for the same class/date, then insert new ones
export const upsertBulkAttendance = async (attendanceRecords: CreateAttendanceData[]): Promise<AttendanceRecord[]> => {
  if (attendanceRecords.length === 0) {
    return [];
  }

  const classId = attendanceRecords[0].class_id;
  const attendanceDate = attendanceRecords[0].attendance_date;

  // Delete existing records for this class and date
  const { error: deleteError } = await supabase
    .from('class_attendance')
    .delete()
    .eq('class_id', classId)
    .eq('attendance_date', attendanceDate);

  if (deleteError) {
    throw new Error(`Failed to delete existing attendance: ${deleteError.message}`);
  }

  // Insert new records
  const { data, error } = await supabase
    .from('class_attendance')
    .insert(attendanceRecords)
    .select(`
      *,
      students!inner(chinese_name),
      classes!inner(name)
    `);

  if (error) {
    throw new Error(`Failed to upsert bulk attendance: ${error.message}`);
  }

  return data.map(record => ({
    ...record,
    student_name: record.students?.chinese_name,
    class_name: record.classes?.name
  }));
};

// Helper functions for statistics - for latest attendance session only
export const getAttendanceStats = async (classId?: number, studentId?: number) => {
  let query = supabase
    .from('class_attendance')
    .select('attendance_status, attendance_date');

  if (classId) query = query.eq('class_id', classId);
  if (studentId) query = query.eq('student_id', studentId);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch attendance stats: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      online: 0,
      leave: 0,
      holiday: 0,
      attendanceRate: 0,
      latestDate: undefined
    };
  }

  // Find the latest attendance date
  const latestDate = data.reduce((latest, record) => {
    if (!record.attendance_date) return latest;
    if (!latest) return record.attendance_date;
    return record.attendance_date > latest ? record.attendance_date : latest;
  }, null as string | null);

  // Only count records from the latest date
  const latestRecords = data.filter(record => record.attendance_date === latestDate);

  const present = latestRecords.filter(record => record.attendance_status === 1).length;
  const online = latestRecords.filter(record => record.attendance_status === 2).length;
  const leave = latestRecords.filter(record => record.attendance_status === 3).length;
  const absent = latestRecords.filter(record => record.attendance_status === 0).length;
  const holiday = latestRecords.filter(record => record.attendance_status === 4).length;

  const total = latestRecords.length;
  const effectiveTotal = total - holiday;
  const attendanceRate = effectiveTotal > 0 ? ((present + online) / effectiveTotal) * 100 : 0;

  return {
    total,
    present,
    absent,
    online,
    leave,
    holiday,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
    latestDate: latestDate || undefined
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

// Interface for class attendance summary
export interface ClassAttendanceSummary {
  learning_progress: string;
  page_number: string;
  line_number: string;
  attendance_rate: number;
  latest_attendance_date: string | null;
}

// Get the latest attendance data for a class (learning_progress, lamrin_page, lamrin_line)
export const getLatestClassAttendance = async (classId: number): Promise<{
  learning_progress: string;
  lamrin_page: number | null;
  lamrin_line: number | null;
  latest_date: string | null;
}> => {
  // Get the latest attendance record for this class
  const { data, error } = await supabase
    .from('class_attendance')
    .select('learning_progress, lamrin_page, lamrin_line, attendance_date')
    .eq('class_id', classId)
    .order('attendance_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch latest attendance for class ${classId}:`, error);
    return {
      learning_progress: '',
      lamrin_page: null,
      lamrin_line: null,
      latest_date: null
    };
  }

  return {
    learning_progress: data?.learning_progress || '',
    lamrin_page: data?.lamrin_page || null,
    lamrin_line: data?.lamrin_line || null,
    latest_date: data?.attendance_date || null
  };
};

// Calculate attendance rate for a class
// Attendance rate = (present + online) / total * 100
// Excludes holiday records from calculation
export const calculateClassAttendanceRate = async (classId: number): Promise<number> => {
  // Get all attendance records for this class
  const { data, error } = await supabase
    .from('class_attendance')
    .select('attendance_status')
    .eq('class_id', classId);

  if (error) {
    console.error(`Failed to calculate attendance rate for class ${classId}:`, error);
    return 0;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  // Filter out holiday records (status 4)
  const nonHolidayRecords = data.filter(record => record.attendance_status !== 4);
  
  if (nonHolidayRecords.length === 0) {
    return 0;
  }

  // Count present (1) and online (2) as attended
  const attendedCount = nonHolidayRecords.filter(
    record => record.attendance_status === 1 || record.attendance_status === 2
  ).length;

  const attendanceRate = Math.round((attendedCount / nonHolidayRecords.length) * 100);
  return attendanceRate;
};

// Get complete attendance summary for a class (combines latest data and rate)
export const getClassAttendanceSummary = async (classId: number): Promise<ClassAttendanceSummary> => {
  const [latestData, attendanceRate] = await Promise.all([
    getLatestClassAttendance(classId),
    calculateClassAttendanceRate(classId)
  ]);

  return {
    learning_progress: latestData.learning_progress,
    page_number: latestData.lamrin_page ? String(latestData.lamrin_page) : '',
    line_number: latestData.lamrin_line ? String(latestData.lamrin_line) : '',
    attendance_rate: attendanceRate,
    latest_attendance_date: latestData.latest_date
  };
};
