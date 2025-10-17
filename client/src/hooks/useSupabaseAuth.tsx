import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { fetchStudentByStudentId } from '@/lib/database';

interface User {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
  role: 'super_admin' | 'state_admin' | 'branch_admin' | 'class_admin' | 'cadre' | 'student';
  phone?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (studentId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  signUp: (email: string, password: string, studentId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to determine user role based on student data and metadata
const getUserRole = (studentData: any, metadataRole?: User['role']): User['role'] => {
  if (metadataRole) return metadataRole;
  if (studentData?.student_id === 'admin001') return 'super_admin';
  return 'student';
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 [useSupabaseAuth] Initializing auth...');
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        console.log('🔵 [useSupabaseAuth] getSession result:', {
          hasSession: !!session,
          hasError: !!error,
          userId: session?.user?.id,
          email: session?.user?.email,
          errorMessage: error?.message
        });
        
        // Only handle specific auth-related errors
        if (error && (
          error.message?.includes('refresh_token') || 
          error.message?.includes('invalid') ||
          error.message?.includes('expired')
        )) {
          console.error('❌ [useSupabaseAuth] Invalid auth session, signing out:', error.message);
          supabase.auth.signOut().catch(console.error);
          setSupabaseUser(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          console.log('🔵 [useSupabaseAuth] Loading user data for:', session.user.email);
          loadUserData(session.user);
        } else {
          console.log('🔵 [useSupabaseAuth] No session, setting loading to false');
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('❌ [useSupabaseAuth] getSession error:', error);
        setSupabaseUser(null);
        setIsLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🟢 [useSupabaseAuth] Auth state changed:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        });
        
        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          console.log('🔴 [useSupabaseAuth] User signed out');
          setSupabaseUser(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Handle token refresh failures
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('⚠️ [useSupabaseAuth] Token refresh failed, no session');
          setSupabaseUser(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔵 [useSupabaseAuth] Loading user data from auth change:', session.user.email);
          await loadUserData(session.user);
        } else {
          console.log('🔵 [useSupabaseAuth] No session in auth change, setting user to null');
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    console.log('🔵 [loadUserData] START - Setting isLoading to true');
    try {
      setIsLoading(true);
      
      // Try to get student_id from user metadata
      // Check both app_metadata and user_metadata for role (fallback to user_metadata for compatibility)
      const metadataRole = (supabaseUser.app_metadata?.role || supabaseUser.user_metadata?.role) as User['role'] | undefined;
      const studentId = supabaseUser.user_metadata?.student_id;
      
      console.log('🔵 [loadUserData] Metadata:', { metadataRole, studentId });
      
      if (studentId) {
        // Fetch student data from database
        let studentData: Awaited<ReturnType<typeof fetchStudentByStudentId>> | null = null;
        try {
          console.log('🔵 [loadUserData] Fetching student data for:', studentId);
          studentData = await fetchStudentByStudentId(studentId);
          console.log('🔵 [loadUserData] Student data fetched:', !!studentData);
        } catch (error) {
          console.warn('⚠️ [loadUserData] Failed to fetch student data, falling back to metadata', error);
        }

        if (studentData) {
          const derivedRole = getUserRole(studentData, metadataRole);
          console.log('🔵 [loadUserData] Setting user with student data, role:', derivedRole);

          setUser({
            id: studentData.id.toString(),
            student_id: studentData.student_id,
            chinese_name: studentData.chinese_name || '',
            english_name: studentData.english_name || '',
            role: derivedRole,
            phone: studentData.phone,
            email: supabaseUser.email,
          });
        } else {
          const fallbackRole: User['role'] = getUserRole(null, metadataRole);
          console.log('🔵 [loadUserData] Setting user with metadata fallback, role:', fallbackRole);
          setUser({
            id: supabaseUser.id,
            student_id: studentId,
            chinese_name: supabaseUser.user_metadata?.chinese_name || '学员',
            english_name: supabaseUser.user_metadata?.english_name || 'Student',
            role: fallbackRole,
            email: supabaseUser.email,
          });
        }
      } else {
        // No student_id in metadata - new user from Google SSO, default to student role
        const fallbackRole: User['role'] = getUserRole(null, metadataRole);
        console.log('🔵 [loadUserData] No student_id, setting admin user, role:', fallbackRole);
        setUser({
          id: supabaseUser.id,
          student_id: supabaseUser.email?.split('@')[0] || 'unknown',
          chinese_name: '管理员',
          english_name: 'Admin',
          role: fallbackRole,
          email: supabaseUser.email,
        });
      }
      console.log('🔵 [loadUserData] User set successfully');
    } catch (error) {
      console.error('❌ [loadUserData] Error loading user data:', error);
      setUser(null);
    } finally {
      console.log('🔵 [loadUserData] FINALLY - Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, studentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // First, verify that the student exists in the database
      const studentData = await fetchStudentByStudentId(studentId);
      if (!studentData) {
        throw new Error('学员ID不存在');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            student_id: studentId,
            chinese_name: studentData.chinese_name,
            english_name: studentData.english_name,
          }
        }
      });

      if (error) {
        throw error;
      }

      // If signup successful but email confirmation is required
      if (data.user && !data.session) {
        // User needs to confirm email
        return true;
      }

      return !!data.user;
    } catch (error: any) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrStudentId: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      let email = emailOrStudentId;
      
      // If input doesn't look like an email, treat it as student_id and find the associated email
      if (!emailOrStudentId.includes('@')) {
        const studentData = await fetchStudentByStudentId(emailOrStudentId);
        if (studentData && studentData.email) {
          email = studentData.email;
        } else {
          throw new Error('找不到该学员ID对应的邮箱');
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return !!data.user;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser,
      login, 
      logout, 
      isLoading,
      signUp
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
