import { supabase } from '../supabase';
import { DbClassroom, ClassroomWithDetails } from '@/types/database';

export interface CreateClassroomData {
  name: string;
  state?: string;
  address?: string;
  person_in_charge?: number; // students.id
  sub_branch_id: number;     // sub_branches.id
}

export interface UpdateClassroomData extends Partial<CreateClassroomData> {
  id: number;
}

export const mapDbClassroomToFrontend = async (
  db: DbClassroom
): Promise<ClassroomWithDetails> => {
  // Lookup sub-branch name
  let sub_branch_name: string | undefined;
  if (db.sub_branch_id) {
    const { data: sb } = await supabase
      .from('sub_branches')
      .select('name')
      .eq('id', db.sub_branch_id)
      .single();
    sub_branch_name = sb?.name;
  }

  // Lookup person_in_charge student_id + name
  let student_id_ref: string | undefined;
  let contact_person: string | undefined;
  if (db.person_in_charge) {
    const { data: st } = await supabase
      .from('students')
      .select('student_id, chinese_name')
      .eq('id', db.person_in_charge)
      .single();
    student_id_ref = st?.student_id;
    contact_person = st?.chinese_name;
  }

  return {
    ...db,
    sub_branch_name,
    student_id_ref,
    contact_person,
  };
};

export const fetchClassrooms = async (): Promise<ClassroomWithDetails[]> => {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch classrooms: ${error.message}`);
  return Promise.all((data || []).map(mapDbClassroomToFrontend));
};

export const searchClassrooms = async (query: string): Promise<ClassroomWithDetails[]> => {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to search classrooms: ${error.message}`);
  return Promise.all((data || []).map(mapDbClassroomToFrontend));
};

export const createClassroom = async (payload: CreateClassroomData): Promise<ClassroomWithDetails> => {
  // Upsert on unique classroom name so repeated creates update the existing record
  const { data, error } = await supabase
    .from('classrooms')
    .upsert(payload, { onConflict: 'name' })
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create classroom: ${error.message}`);
  return await mapDbClassroomToFrontend(data as DbClassroom);
};

export const updateClassroom = async (payload: UpdateClassroomData): Promise<ClassroomWithDetails> => {
  const { id, ...update } = payload;
  const { data, error } = await supabase
    .from('classrooms')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to update classroom: ${error.message}`);
  return await mapDbClassroomToFrontend(data as DbClassroom);
};

export const deleteClassroom = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('classrooms')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`Failed to delete classroom: ${error.message}`);
};
