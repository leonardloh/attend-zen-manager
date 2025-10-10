import { createClient, SupabaseClient } from '@supabase/supabase-js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'OPTIONS' | string;

type Headers = Record<string, string | undefined>;

type Query = Record<string, string | undefined> | undefined;

export interface UserManagementRequest {
  method: HttpMethod;
  headers: Headers;
  query?: Query;
  body?: string | null;
}

export interface UserManagementResponse {
  status: number;
  headers?: Record<string, string>;
  body?: string;
}

export interface UserManagementHandlerOptions {
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
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
};

const buildResponse = (
  status: number,
  body: unknown,
  enableCors: boolean,
): UserManagementResponse => ({
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

export const createUserManagementHandler = ({
  supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  cors = true,
}: UserManagementHandlerOptions = {}) => {
  const supabaseAdmin = ensureSupabaseClient(supabaseUrl, serviceRoleKey);

  return async (req: UserManagementRequest): Promise<UserManagementResponse> => {
    if (cors && req.method === 'OPTIONS') {
      return buildResponse(200, { ok: true }, cors);
    }

    if (!supabaseAdmin) {
      console.error('User management handler missing Supabase credentials');
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

    const requesterRole = authUser.user.user_metadata?.role || authUser.user.app_metadata?.role;
    if (requesterRole !== 'super_admin' && requesterRole !== 'state_admin') {
      return buildResponse(403, { error: 'forbidden' }, cors);
    }

    const method = req.method?.toUpperCase();

    // GET /api/user-management/search?email=<email>
    if (method === 'GET') {
      const email = req.query?.email;
      if (!email) {
        return buildResponse(400, { error: 'missing_email_parameter' }, cors);
      }

      // Search for user by email
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) {
        console.error('List users error:', error);
        return buildResponse(500, { error: error.message }, cors);
      }

      const foundUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!foundUser) {
        return buildResponse(404, { error: 'user_not_found' }, cors);
      }

      // Return user data with role from user_metadata
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.user_metadata?.role || 'student',
        user_metadata: foundUser.user_metadata,
      };

      return buildResponse(200, userData, cors);
    }

    // PUT /api/user-management/role
    if (method === 'PUT') {
      if (!req.body) {
        return buildResponse(400, { error: 'missing_body' }, cors);
      }

      type Payload = {
        userId: string;
        role: string;
      };

      let payload: Payload;
      try {
        payload = JSON.parse(req.body) as Payload;
      } catch (parseError) {
        return buildResponse(400, { error: 'invalid_json' }, cors);
      }

      const { userId, role } = payload;
      if (!userId || !role) {
        return buildResponse(400, { error: 'missing_required_fields' }, cors);
      }

      // Validate role
      const validRoles = ['student', 'class_admin', 'branch_admin', 'state_admin', 'super_admin'];
      if (!validRoles.includes(role)) {
        return buildResponse(400, { error: 'invalid_role' }, cors);
      }

      // Get current user to preserve other metadata
      const { data: currentUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (!currentUser?.user) {
        return buildResponse(404, { error: 'user_not_found' }, cors);
      }

      // Update user role in both user_metadata and app_metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...currentUser.user.user_metadata,
          role: role
        },
        app_metadata: {
          ...currentUser.user.app_metadata,
          role: role
        }
      });

      if (updateError) {
        console.error('Update user role error:', updateError);
        return buildResponse(500, { error: updateError.message }, cors);
      }

      return buildResponse(200, { success: true, role }, cors);
    }

    return buildResponse(405, { error: 'method_not_allowed' }, cors);
  };
};

export type UserManagementHandler = ReturnType<typeof createUserManagementHandler>;
