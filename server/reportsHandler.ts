import { createClient } from '@supabase/supabase-js';

interface HandlerRequest {
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: string;
}

interface HandlerResponse {
  status: number;
  body: string;
  headers?: Record<string, string>;
}

interface WeeklyAttendanceData {
  name: string;
  present: number;
  online: number;
  absent: number;
  leave: number;
}

interface WeekRange {
  start: string;
  end: string;
  label: string;
}

function calculateWeeklyRanges(startDate: Date, endDate: Date): WeekRange[] {
  const weeks: WeekRange[] = [];
  
  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  
  const getSunday = (monday: Date): Date => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 6);
    return d;
  };
  
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const formatLabel = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };
  
  let currentMonday = getMonday(startDate);
  
  while (currentMonday <= endDate) {
    const currentSunday = getSunday(currentMonday);
    
    const actualStart = currentMonday < startDate ? startDate : currentMonday;
    const actualEnd = currentSunday > endDate ? endDate : currentSunday;
    
    weeks.push({
      start: formatDate(actualStart),
      end: formatDate(actualEnd),
      label: `${formatLabel(actualStart)}-${formatLabel(actualEnd)}`
    });
    
    currentMonday = new Date(currentSunday);
    currentMonday.setDate(currentMonday.getDate() + 1);
  }
  
  return weeks;
}

export function createReportsHandler(options: { cors?: boolean } = {}) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration for reports handler');
  }

  return async (req: HandlerRequest): Promise<HandlerResponse> => {
    const corsHeaders: Record<string, string> = options.cors ? {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    } : {};

    if (req.method === 'OPTIONS') {
      return { status: 200, body: '', headers: corsHeaders };
    }

    if (req.method !== 'GET') {
      return {
        status: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      };
    }

    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      };
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        status: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return {
          status: 401,
          body: JSON.stringify({ error: 'Invalid token' }),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        };
      }

      // Check user role - only admins and cadres can access reports
      const userRole = user.user_metadata?.role || user.app_metadata?.role;
      const allowedRoles = ['super_admin', 'state_admin', 'branch_admin', 'classroom_admin', 'class_admin'];
      
      console.log('Reports API - User info:', {
        email: user.email,
        userRole,
        user_metadata_role: user.user_metadata?.role,
        app_metadata_role: user.app_metadata?.role,
        scope: user.user_metadata?.scope || user.app_metadata?.scope
      });
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        console.log('Reports API - Access denied: role not in allowed list');
        return {
          status: 403,
          body: JSON.stringify({ error: 'Forbidden - admin role required', details: { userRole, allowedRoles } }),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        };
      }

      const { startDate, endDate, classId } = req.query;
      
      // Get user's scope for filtering data based on role
      const userScope = user.user_metadata?.scope || user.app_metadata?.scope;
      
      if (!startDate || !endDate) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'startDate and endDate are required' }),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        };
      }

      // Compute allowed class IDs based on role hierarchy
      let allowedClassIds: number[] | null = null; // null means all classes allowed (super_admin only)
      
      if (userRole === 'super_admin') {
        // Super admin can see all classes
        allowedClassIds = null;
      } else if (userRole === 'state_admin') {
        // State admin must have scope to access data
        if (!userScope) {
          return {
            status: 403,
            body: JSON.stringify({ error: 'Missing scope for state_admin role' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          };
        }
        // State admin can see classes under their main_branch
        const { data: classes, error: scopeError } = await supabase
          .from('classes')
          .select('id')
          .eq('main_branch_id', Number(userScope));
        if (scopeError) {
          console.error('Error fetching scope classes:', scopeError);
          return {
            status: 500,
            body: JSON.stringify({ error: 'Failed to resolve access scope' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          };
        }
        allowedClassIds = classes?.map(c => c.id) ?? [];
      } else if (userRole === 'branch_admin') {
        // Branch admin must have scope to access data
        if (!userScope) {
          return {
            status: 403,
            body: JSON.stringify({ error: 'Missing scope for branch_admin role' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          };
        }
        // Branch admin can see classes under their sub_branch
        const { data: classes, error: scopeError } = await supabase
          .from('classes')
          .select('id')
          .eq('sub_branch_id', Number(userScope));
        if (scopeError) {
          console.error('Error fetching scope classes:', scopeError);
          return {
            status: 500,
            body: JSON.stringify({ error: 'Failed to resolve access scope' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          };
        }
        allowedClassIds = classes?.map(c => c.id) ?? [];
      } else if (userRole === 'classroom_admin') {
        // Classroom admin must have scope to access data
        if (!userScope) {
          return {
            status: 403,
            body: JSON.stringify({ error: 'Missing scope for classroom_admin role' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          };
        }
        // Classroom admin can see classes under their classroom
        const { data: classes, error: scopeError } = await supabase
          .from('classes')
          .select('id')
          .eq('classroom_id', Number(userScope));
        if (scopeError) {
          console.error('Error fetching scope classes:', scopeError);
          return {
            status: 500,
            body: JSON.stringify({ error: 'Failed to resolve access scope' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          };
        }
        allowedClassIds = classes?.map(c => c.id) ?? [];
      } else if (userRole === 'class_admin') {
        // Class admin must have scope to access data
        if (!userScope) {
          return {
            status: 403,
            body: JSON.stringify({ error: 'Missing scope for class_admin role' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          };
        }
        // Validate that the scope is a valid number
        const classId = Number(userScope);
        if (isNaN(classId)) {
          return {
            status: 403,
            body: JSON.stringify({ error: 'Invalid scope for class_admin role' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          };
        }
        // Class admin can only see their own class
        allowedClassIds = [classId];
      } else {
        // Unknown admin role - deny access
        return {
          status: 403,
          body: JSON.stringify({ error: 'Invalid admin role' }),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        };
      }

      // If user has limited scope but no allowed classes found, return empty data
      if (allowedClassIds !== null && allowedClassIds.length === 0) {
        return {
          status: 200,
          body: JSON.stringify({ data: [] }),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        };
      }

      // Determine the effective class filter
      let effectiveClassId = classId;
      
      // Validate requested classId against allowed scope
      if (classId && classId !== 'all' && allowedClassIds !== null) {
        const requestedId = Number(classId);
        if (!allowedClassIds.includes(requestedId)) {
          return {
            status: 403,
            body: JSON.stringify({ error: 'Access denied to requested class' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          };
        }
      }

      let query = supabase
        .from('class_attendance')
        .select('attendance_status, attendance_date')
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);
      
      // Apply class filter
      if (effectiveClassId && effectiveClassId !== 'all') {
        query = query.eq('class_id', Number(effectiveClassId));
      } else if (allowedClassIds !== null) {
        // If "all" requested but user has limited scope, filter to allowed classes
        query = query.in('class_id', allowedClassIds);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching attendance data:', error);
        return {
          status: 500,
          body: JSON.stringify({ error: 'Failed to fetch attendance data' }),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        };
      }

      const weeks = calculateWeeklyRanges(new Date(startDate), new Date(endDate));
      
      const weeklyData: WeeklyAttendanceData[] = weeks.map(week => {
        const weekRecords = (data || []).filter(r => {
          return r.attendance_date >= week.start && r.attendance_date <= week.end;
        });
        
        const nonHolidayRecords = weekRecords.filter(r => r.attendance_status !== 4);
        
        return {
          name: week.label,
          present: nonHolidayRecords.filter(r => r.attendance_status === 1).length,
          online: nonHolidayRecords.filter(r => r.attendance_status === 2).length,
          leave: nonHolidayRecords.filter(r => r.attendance_status === 3).length,
          absent: nonHolidayRecords.filter(r => r.attendance_status === 0).length
        };
      });

      return {
        status: 200,
        body: JSON.stringify({ data: weeklyData }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      };
    } catch (error) {
      console.error('Reports handler error:', error);
      return {
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      };
    }
  };
}
