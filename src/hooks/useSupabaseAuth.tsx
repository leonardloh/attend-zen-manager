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

// Helper function to determine user role based on student data
const getUserRole = (studentData: any): User['role'] => {
  // For now, we'll use simple logic - you can enhance this based on your needs
  if (studentData.student_id === 'admin001') return 'super_admin';
  // Check if user is a cadre based on class assignments (to be implemented)
  // For now, default to student
  return 'student';
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          loadUserData(session.user);
        } else {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Supabase getSession error:', error);
        setSupabaseUser(null);
        setIsLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      setIsLoading(true);
      
      // Try to get student_id from user metadata
      const metadataRole = supabaseUser.app_metadata?.role as User['role'] | undefined;
      const studentId = supabaseUser.user_metadata?.student_id;
      
      if (studentId) {
        // Fetch student data from database
        let studentData: Awaited<ReturnType<typeof fetchStudentByStudentId>> | null = null;
        try {
          studentData = await fetchStudentByStudentId(studentId);
        } catch (error) {
          console.warn('Failed to fetch student data, falling back to metadata', error);
        }

        if (studentData) {
          const derivedRole = metadataRole ?? getUserRole(studentData);

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
          const fallbackRole: User['role'] = metadataRole ?? 'super_admin';
          setUser({
            id: supabaseUser.id,
            student_id: studentId,
            chinese_name: supabaseUser.user_metadata?.chinese_name || '管理员',
            english_name: supabaseUser.user_metadata?.english_name || 'Admin',
            role: fallbackRole,
            email: supabaseUser.email,
          });
        }
      } else {
        // No student_id in metadata - fall back to metadata role or default super admin
        const fallbackRole: User['role'] = metadataRole ?? 'super_admin';
        setUser({
          id: supabaseUser.id,
          student_id: supabaseUser.email?.split('@')[0] || 'unknown',
          chinese_name: '管理员',
          english_name: 'Admin',
          role: fallbackRole,
          email: supabaseUser.email,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
    } finally {
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
