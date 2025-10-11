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
        scopeType?: string;
        scopeId?: string | number;
      };

      let payload: Payload;
      try {
        payload = JSON.parse(req.body) as Payload;
      } catch (parseError) {
        return buildResponse(400, { error: 'invalid_json' }, cors);
      }

      const { userId, role, scopeType, scopeId } = payload;
      if (!userId || !role) {
        return buildResponse(400, { error: 'missing_required_fields' }, cors);
      }

      // Validate role
      const validRoles = ['student', 'class_admin', 'classroom_admin', 'branch_admin', 'state_admin', 'super_admin'];
      if (!validRoles.includes(role)) {
        return buildResponse(400, { error: 'invalid_role' }, cors);
      }

      // Validate scope is provided for admin roles (except super_admin and student)
      const requiresScope = ['state_admin', 'branch_admin', 'classroom_admin', 'class_admin'];
      if (requiresScope.includes(role) && (!scopeType || scopeId === undefined)) {
        return buildResponse(400, { error: 'scope_required_for_admin_role' }, cors);
      }

      // Validate that requester can assign the requested scope (hierarchical validation)
      const requesterScopeId = authUser.user.user_metadata?.scope_id || authUser.user.app_metadata?.scope_id;
      // Normalize scope IDs to numbers for comparison
      const normalizedRequesterScopeId = requesterScopeId ? Number(requesterScopeId) : null;
      const normalizedScopeId = scopeId ? Number(scopeId) : null;

      if (requesterRole === 'state_admin' && scopeType && normalizedScopeId) {
        // State admin can only assign scopes under their main_branch
        if (scopeType === 'sub_branch') {
          // Verify the sub_branch belongs to their main_branch
          const { data: subBranch } = await supabaseAdmin
            .from('sub_branches')
            .select('main_branch_id')
            .eq('id', normalizedScopeId)
            .single();
          
          if (!subBranch || subBranch.main_branch_id !== normalizedRequesterScopeId) {
            return buildResponse(403, { error: 'cannot_assign_scope_outside_hierarchy' }, cors);
          }
        } else if (scopeType === 'classroom') {
          // Verify the classroom belongs to a sub_branch under their main_branch
          const { data: classroom } = await supabaseAdmin
            .from('classrooms')
            .select('sub_branch_id')
            .eq('id', normalizedScopeId)
            .single();
          
          if (!classroom) {
            return buildResponse(403, { error: 'classroom_not_found' }, cors);
          }

          // Check if the sub_branch belongs to their main_branch
          const { data: subBranch } = await supabaseAdmin
            .from('sub_branches')
            .select('main_branch_id')
            .eq('id', classroom.sub_branch_id)
            .single();
          
          if (!subBranch || subBranch.main_branch_id !== normalizedRequesterScopeId) {
            return buildResponse(403, { error: 'cannot_assign_scope_outside_hierarchy' }, cors);
          }
        } else if (scopeType === 'class') {
          // Verify the class belongs to their main_branch (through sub_branch or classroom)
          const { data: classData } = await supabaseAdmin
            .from('classes')
            .select('manage_by_sub_branch_id, manage_by_classroom_id')
            .eq('id', normalizedScopeId)
            .single();
          
          if (!classData) {
            return buildResponse(403, { error: 'class_not_found' }, cors);
          }

          let mainBranchId = null;

          // Check via sub_branch
          if (classData.manage_by_sub_branch_id) {
            const { data: subBranch } = await supabaseAdmin
              .from('sub_branches')
              .select('main_branch_id')
              .eq('id', classData.manage_by_sub_branch_id)
              .single();
            mainBranchId = subBranch?.main_branch_id;
          }

          // Check via classroom
          if (!mainBranchId && classData.manage_by_classroom_id) {
            const { data: classroom } = await supabaseAdmin
              .from('classrooms')
              .select('sub_branch_id')
              .eq('id', classData.manage_by_classroom_id)
              .single();
            
            if (classroom?.sub_branch_id) {
              const { data: subBranch } = await supabaseAdmin
                .from('sub_branches')
                .select('main_branch_id')
                .eq('id', classroom.sub_branch_id)
                .single();
              mainBranchId = subBranch?.main_branch_id;
            }
          }
          
          if (!mainBranchId || mainBranchId !== normalizedRequesterScopeId) {
            return buildResponse(403, { error: 'cannot_assign_scope_outside_hierarchy' }, cors);
          }
        } else if (scopeType === 'main_branch' && normalizedScopeId !== normalizedRequesterScopeId) {
          // State admin can only assign their own main_branch
          return buildResponse(403, { error: 'cannot_assign_scope_outside_hierarchy' }, cors);
        }
      }

      // Get current user to preserve other metadata
      const { data: currentUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (!currentUser?.user) {
        return buildResponse(404, { error: 'user_not_found' }, cors);
      }

      // Prepare metadata updates
      const metadataUpdate: Record<string, any> = {
        role: role
      };

      // Add scope information if provided
      if (scopeType && scopeId !== undefined) {
        metadataUpdate.scope_type = scopeType;
        metadataUpdate.scope_id = scopeId;
      } else {
        // Clear scope if not an admin role
        metadataUpdate.scope_type = null;
        metadataUpdate.scope_id = null;
      }

      // Update user role in both user_metadata and app_metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...currentUser.user.user_metadata,
          ...metadataUpdate
        },
        app_metadata: {
          ...currentUser.user.app_metadata,
          ...metadataUpdate
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
