// Database types based on Supabase schema

export interface DbStudent {
  id: number;
  student_id: string;
  created_at: string;
  chinese_name?: string;
  english_name?: string;
  gender?: string;
  date_of_joining?: string;
  status?: string;
  email?: string;
  state?: string;
  postcode?: string;
  birthday_date?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  emergency_contact_relationship?: string;
  profession?: string;
  education_level?: string;
  maritial_status?: string;
}

export interface DbMainBranch {
  id: number;
  created_at: string;
  name?: string;
  sub_branch_responsible?: string;
  manage_sub_branches?: number[];
  person_in_charge?: number;
}

export interface DbSubBranch {
  id: number;
  created_at: string;
  name?: string;
  state?: string;
  address?: string;
  person_in_charge?: number;
}

export interface DbClass {
  id: number;
  created_at: string;
  updated_at?: string;
  name?: string;
  manage_by_sub_branch_id?: number;
  day_of_week?: string;
  class_start_time?: string;
  class_end_time?: string;
  monitor_id?: number;
  vice_monitor_id?: number;
  care_officer_id?: number;
}

export interface DbClassEnrollment {
  id: number;
  created_at: string;
  updated_at?: string;
  class_id?: number;
  student_id?: number;
}

export interface DbClassAttendance {
  id: number;
  created_at: string;
  class_id?: number;
  attendance_date?: string;
  learning_progress?: string;
  lamrin_page?: number;
  lamrin_line?: number;
  student_id?: number;
  attendance_status?: number;
}

// Extended types with relationships for frontend use
export interface StudentWithDetails extends DbStudent {
  mother_class_name?: string;
  phone?: string; // Map from emergency_contact_number or add separate field
  enrollment_date?: string; // Map from date_of_joining
}

export interface ClassWithDetails extends DbClass {
  sub_branch_name?: string;
  student_count: number;
  class_monitor_name?: string;
  deputy_monitors?: number[];
  care_officers?: number[];
  time?: string; // Formatted time string
  attendance_rate?: number;
  learning_progress?: string;
  page_number?: string;
  line_number?: string;
  status: 'active' | 'inactive';
}

export interface MainBranchWithDetails extends DbMainBranch {
  region?: '北马' | '中马' | '南马';
  student_id?: string; // Frontend-formatted student ID
  contact_person?: string;
  contact_phone?: string;
  sub_branches_count?: number;
  classes_count?: number;
  students_count?: number;
  address?: string;
}

export interface SubBranchWithDetails extends DbSubBranch {
  main_branch_id?: number;
  main_branch_name?: string;
  contact_person?: string;
  contact_phone?: string;
  email?: string;
  established_date?: string;
  status?: 'active' | 'inactive';
  classes_count?: number;
  students_count?: number;
}