import { supabase } from '@/lib/supabase';

export interface AdminUpdatePayload {
  userId: string;
  role: string;
  studentId?: string;
  scopeType?: string;
  scopeId?: string | number | null;
}

export const listUsers = async () => {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new Error(error.message);
  return data;
};

export const updateUserRole = async (payload: AdminUpdatePayload) => {
  const { userId, role, studentId, scopeType, scopeId } = payload;

  let studentDbId: number | null = null;
  if (studentId) {
    const { data: studentRecord, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('student_id', studentId)
      .single();

    if (studentError || !studentRecord) {
      throw new Error('student_not_found');
    }
    studentDbId = studentRecord.id;
  }

  const updatedMetadata: Record<string, unknown> = {
    ...(payload as Record<string, unknown>),
    role,
    student_id: studentId ?? null,
    scope_type: scopeType ?? null,
    scope_id: scopeId ?? null,
  };

  delete updatedMetadata.userId;
  delete updatedMetadata.scopeType;
  delete updatedMetadata.scopeId;

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: updatedMetadata,
  });

  if (updateError) throw new Error(updateError.message);

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, student_db_id: studentDbId });

  if (profileError) throw new Error(profileError.message);

  return { success: true };
};
