import { supabase } from '../supabase';
import { DbMainBranch, DbSubBranch, MainBranchWithDetails, SubBranchWithDetails } from '@/types/database';

// Main Branch interfaces
export interface CreateMainBranchData {
  name: string;
  sub_branch_responsible?: number;
  manage_sub_branches?: string[]; // Database stores as strings despite our intentions
  person_in_charge?: number;
}

export interface UpdateMainBranchData extends Partial<CreateMainBranchData> {
  id: number;
}

// Sub Branch interfaces  
export interface CreateSubBranchData {
  name: string;
  state?: string;
  address?: string;
  person_in_charge?: number;
}

export interface UpdateSubBranchData extends Partial<CreateSubBranchData> {
  id: number;
}

// Convert database main branch to frontend format
export const mapDbMainBranchToFrontend = async (dbBranch: DbMainBranch): Promise<MainBranchWithDetails> => {
  // Get contact person name and student_id
  let contact_person = '';
  let contact_phone = '';
  let student_id = '';
  if (dbBranch.person_in_charge) {
    const { data: student } = await supabase
      .from('students')
      .select('student_id, chinese_name, emergency_contact_number')
      .eq('id', dbBranch.person_in_charge)
      .single();
    if (student) {
      student_id = student.student_id || '';
      contact_person = student.chinese_name || '';
      contact_phone = student.emergency_contact_number || '';
    }
  }

  // Count sub-branches - get count from the array length
  const subBranchesCount = dbBranch.manage_sub_branches ? dbBranch.manage_sub_branches.length : 0;

  // Count classes through managed sub-branches
  let classesCount = 0;
  if (dbBranch.manage_sub_branches && dbBranch.manage_sub_branches.length > 0) {
    const { count } = await supabase
      .from('classes')
      .select('*', { count: 'exact' })
      .in('manage_by_sub_branch_id', dbBranch.manage_sub_branches);
    classesCount = count || 0;
  }

  // Get responsible sub-branch name - handle both ID and name cases
  let responsibleSubBranchName = '';
  if (dbBranch.sub_branch_responsible) {
    // Check if it's already a name (string that's not a number)
    if (isNaN(Number(dbBranch.sub_branch_responsible))) {
      // It's already a name, use it directly
      responsibleSubBranchName = dbBranch.sub_branch_responsible;
    } else {
      // It's an ID, look up the name
      const { data: subBranch } = await supabase
        .from('sub_branches')
        .select('name')
        .eq('id', dbBranch.sub_branch_responsible)
        .single();
      if (subBranch) {
        responsibleSubBranchName = subBranch.name || '';
      }
    }
  }

  // Count students through classes
  const studentsCount = 0;
  // This would be complex, setting to 0 for now

  return {
    ...dbBranch,
    student_id, // Map person_in_charge ID to student_id string
    contact_person,
    contact_phone,
    sub_branch_responsible: responsibleSubBranchName, // Map sub_branch_responsible ID to name
    manage_sub_branches: dbBranch.manage_sub_branches || [], // Database already stores as strings, keep as-is for frontend
    sub_branches_count: subBranchesCount,
    classes_count: classesCount,
    students_count: studentsCount,
    region: undefined, // Not in DB schema yet
    address: '', // Not in current schema
  };
};

// Convert database sub branch to frontend format
export const mapDbSubBranchToFrontend = async (dbBranch: DbSubBranch): Promise<SubBranchWithDetails> => {
  // Get contact person info
  let contact_person = '';
  let contact_phone = '';
  if (dbBranch.person_in_charge) {
    const { data: student } = await supabase
      .from('students')
      .select('chinese_name, emergency_contact_number')
      .eq('id', dbBranch.person_in_charge)
      .single();
    if (student) {
      contact_person = student.chinese_name || '';
      contact_phone = student.emergency_contact_number || '';
    }
  }

  // Get main branch info - find main branch that manages this sub-branch
  let main_branch_id = undefined;
  let main_branch_name = '';
  const { data: mainBranches } = await supabase
    .from('main_branches')
    .select('id, name')
    .contains('manage_sub_branches', [dbBranch.id]); // Use contains to check array
  
  if (mainBranches && mainBranches.length > 0) {
    main_branch_id = mainBranches[0].id;
    main_branch_name = mainBranches[0].name || '';
  }

  // Count classes
  const { count: classesCount } = await supabase
    .from('classes')
    .select('*', { count: 'exact' })
    .eq('manage_by_sub_branch_id', dbBranch.id);

  // Count students through enrollments
  let studentsCount = 0;
  const { data: classes } = await supabase
    .from('classes')
    .select('id')
    .eq('manage_by_sub_branch_id', dbBranch.id);
    
  if (classes && classes.length > 0) {
    const classIds = classes.map(c => c.id);
    const { count } = await supabase
      .from('class_enrollments')
      .select('*', { count: 'exact' })
      .in('class_id', classIds);
    studentsCount = count || 0;
  }

  return {
    ...dbBranch,
    main_branch_id,
    main_branch_name,
    contact_person,
    contact_phone,
    email: '', // Not in current schema
    established_date: dbBranch.created_at,
    status: 'active',
    classes_count: classesCount || 0,
    students_count: studentsCount,
  };
};

// Main Branch CRUD operations
export const fetchMainBranches = async (): Promise<MainBranchWithDetails[]> => {
  const { data, error } = await supabase
    .from('main_branches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch main branches: ${error.message}`);
  }

  const branchesWithDetails = await Promise.all(
    data.map(branch => mapDbMainBranchToFrontend(branch))
  );

  return branchesWithDetails;
};

export const fetchMainBranchById = async (id: number): Promise<MainBranchWithDetails | null> => {
  const { data, error } = await supabase
    .from('main_branches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch main branch: ${error.message}`);
  }

  return await mapDbMainBranchToFrontend(data);
};

export const createMainBranch = async (branchData: CreateMainBranchData): Promise<MainBranchWithDetails> => {
  const { data, error } = await supabase
    .from('main_branches')
    .insert(branchData)
    .select()
    .single();
  

  if (error) {
    throw new Error(`Failed to create main branch: ${error.message}`);
  }

  return await mapDbMainBranchToFrontend(data);
};

export const updateMainBranch = async (branchData: UpdateMainBranchData): Promise<MainBranchWithDetails> => {
  const { id, ...updateData } = branchData;
  
  const { data, error } = await supabase
    .from('main_branches')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update main branch: ${error.message}`);
  }

  return await mapDbMainBranchToFrontend(data);
};

export const deleteMainBranch = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('main_branches')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete main branch: ${error.message}`);
  }
};

// Sub Branch CRUD operations
export const fetchSubBranches = async (): Promise<SubBranchWithDetails[]> => {
  const { data, error } = await supabase
    .from('sub_branches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch sub branches: ${error.message}`);
  }

  const branchesWithDetails = await Promise.all(
    data.map(branch => mapDbSubBranchToFrontend(branch))
  );

  return branchesWithDetails;
};

export const fetchSubBranchById = async (id: number): Promise<SubBranchWithDetails | null> => {
  const { data, error } = await supabase
    .from('sub_branches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch sub branch: ${error.message}`);
  }

  return await mapDbSubBranchToFrontend(data);
};

export const createSubBranch = async (branchData: CreateSubBranchData): Promise<SubBranchWithDetails> => {
  const { data, error } = await supabase
    .from('sub_branches')
    .insert(branchData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create sub branch: ${error.message}`);
  }

  return await mapDbSubBranchToFrontend(data);
};

export const updateSubBranch = async (branchData: UpdateSubBranchData): Promise<SubBranchWithDetails> => {
  const { id, ...updateData } = branchData;
  
  const { data, error } = await supabase
    .from('sub_branches')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update sub branch: ${error.message}`);
  }

  return await mapDbSubBranchToFrontend(data);
};

export const deleteSubBranch = async (id: number): Promise<void> => {
  // First delete related classes
  const { data: classes } = await supabase
    .from('classes')
    .select('id')
    .eq('manage_by_sub_branch_id', id);

  if (classes && classes.length > 0) {
    const classIds = classes.map(c => c.id);
    // Delete enrollments first
    await supabase
      .from('class_enrollments')
      .delete()
      .in('class_id', classIds);
    
    // Then delete classes
    await supabase
      .from('classes')
      .delete()
      .in('id', classIds);
  }

  // Finally delete the sub branch
  const { error } = await supabase
    .from('sub_branches')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete sub branch: ${error.message}`);
  }
};

// Search functions
export const searchSubBranches = async (query: string): Promise<SubBranchWithDetails[]> => {
  const { data, error } = await supabase
    .from('sub_branches')
    .select('*')
    .or(`name.ilike.%${query}%,state.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to search sub branches: ${error.message}`);
  }

  const branchesWithDetails = await Promise.all(
    data.map(branch => mapDbSubBranchToFrontend(branch))
  );

  return branchesWithDetails;
};