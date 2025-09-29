import { supabase } from '@/lib/supabase';

const FUNCTIONS_BASE = (import.meta.env.VITE_FUNCTIONS_BASE_URL ?? '/.netlify/functions').replace(/\/?$/, '');
const FUNCTION_ENDPOINT = `${FUNCTIONS_BASE}/admin-users`;
const USE_SERVICE_ROLE = import.meta.env.VITE_USE_SERVICE_ROLE === 'true';

const getAccessToken = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('无法获取当前登录会话，请重新登录');
  }
  return data.session.access_token;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();

  let payload: any;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      const errorMessage = response.status === 404
        ? 'admin_endpoint_not_found'
        : 'invalid_json_response';
      throw new Error(errorMessage);
    }
  }

  if (!response.ok) {
    const message = payload?.error || response.statusText || 'request_failed';
    throw new Error(message);
  }

  return payload as T;
};

export interface AdminUpdatePayload {
  userId: string;
  role: string;
  studentId?: string;
  scopeType?: string;
  scopeId?: string | number | null;
}

export const listUsers = async () => {
  if (USE_SERVICE_ROLE) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);
    return data;
  }

  const token = await getAccessToken();
  const response = await fetch(`${FUNCTION_ENDPOINT}?page=1&per_page=200`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  return handleResponse(response);
};

export const updateUserRole = async (payload: AdminUpdatePayload) => {
  if (USE_SERVICE_ROLE) {
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
  }

  const token = await getAccessToken();
  const response = await fetch(FUNCTION_ENDPOINT, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean }>(response);
};
