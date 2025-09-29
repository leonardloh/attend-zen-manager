import { createClient, SupabaseClient } from '@supabase/supabase-js';

type HttpMethod = 'GET' | 'PUT' | 'OPTIONS' | string;

type Headers = Record<string, string | undefined>;

type Query = Record<string, string | undefined> | undefined;

export interface AdminUsersRequest {
  method: HttpMethod;
  headers: Headers;
  query?: Query;
  body?: string | null;
}

export interface AdminUsersResponse {
  status: number;
  headers?: Record<string, string>;
  body?: string;
}

export interface AdminUsersHandlerOptions {
  supabaseUrl?: string;
  serviceRoleKey?: string;
  cors?: boolean;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
};

const buildResponse = (
  status: number,
  body: unknown,
  enableCors: boolean,
): AdminUsersResponse => ({
  status,
  headers: enableCors
    ? { ...defaultHeaders, ...corsHeaders }
    : defaultHeaders,
  body: JSON.stringify(body ?? {}),
});

const extractBearerToken = (headers: Headers): string | undefined => {
  const authHeader = headers.Authorization || headers.authorization;
  if (!authHeader) return undefined;
  if (!authHeader.startsWith('Bearer ')) return undefined;
  return authHeader.slice('Bearer '.length);
};

const ensureSupabaseClient = (
  url?: string,
  key?: string,
): SupabaseClient | null => {
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
};

export const createAdminUsersHandler = ({
  supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  cors = true,
}: AdminUsersHandlerOptions = {}) => {
  const supabaseAdmin = ensureSupabaseClient(supabaseUrl, serviceRoleKey);

  return async (req: AdminUsersRequest): Promise<AdminUsersResponse> => {
    if (cors && req.method === 'OPTIONS') {
      return buildResponse(200, { ok: true }, cors);
    }

    if (!supabaseAdmin) {
      console.error('Admin users handler missing Supabase credentials');
      return buildResponse(500, { error: 'service_not_configured' }, cors);
    }

    const token = extractBearerToken(req.headers || {});
    if (!token) {
      return buildResponse(401, { error: 'missing_bearer_token' }, cors);
    }

    const { data: authUser, error: tokenError } = await supabaseAdmin.auth.getUser(token);
    if (tokenError || !authUser?.user) {
      return buildResponse(401, { error: 'invalid_token' }, cors);
    }

    const requesterRole = authUser.user.app_metadata?.role;
    if (requesterRole !== 'super_admin') {
      return buildResponse(403, { error: 'forbidden' }, cors);
    }

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
      const page = Number(req.query?.page ?? '1');
      const perPage = Number(req.query?.per_page ?? '200');

      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) {
        console.error('Admin listUsers error:', error);
        return buildResponse(500, { error: error.message }, cors);
      }

      return buildResponse(200, data, cors);
    }

    if (method === 'PUT') {
      if (!req.body) {
        return buildResponse(400, { error: 'missing_body' }, cors);
      }

      type Payload = {
        userId: string;
        role: string;
        studentId?: string;
        scopeType?: string;
        scopeId?: string | number | null;
      };

      let payload: Payload;
      try {
        payload = JSON.parse(req.body) as Payload;
      } catch (parseError) {
        return buildResponse(400, { error: 'invalid_json' }, cors);
      }

      const { userId, role, studentId, scopeType, scopeId } = payload;
      if (!userId || !role) {
        return buildResponse(400, { error: 'missing_required_fields' }, cors);
      }

      let studentDbId: number | null = null;
      if (studentId) {
        const { data: studentRecord, error: studentError } = await supabaseAdmin
          .from('students')
          .select('id')
          .eq('student_id', studentId)
          .single();

        if (studentError || !studentRecord) {
          return buildResponse(400, { error: 'student_not_found' }, cors);
        }
        studentDbId = studentRecord.id;
      }

      const updatedMetadata: Record<string, unknown> = {
        role,
      };

      if (studentId) {
        updatedMetadata.student_id = studentId;
      } else {
        updatedMetadata.student_id = null;
      }

      if (scopeType && scopeId !== undefined && scopeId !== null && scopeType.length > 0) {
        updatedMetadata.scope_type = scopeType;
        updatedMetadata.scope_id = scopeId;
      } else {
        updatedMetadata.scope_type = null;
        updatedMetadata.scope_id = null;
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: updatedMetadata,
      });

      if (updateError) {
        console.error('Admin updateUser error:', updateError);
        return buildResponse(500, { error: updateError.message }, cors);
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          student_db_id: studentDbId,
        });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        return buildResponse(500, { error: profileError.message }, cors);
      }

      return buildResponse(200, { success: true }, cors);
    }

    return buildResponse(405, { error: 'method_not_allowed' }, cors);
  };
};

export type AdminUsersHandler = ReturnType<typeof createAdminUsersHandler>;
