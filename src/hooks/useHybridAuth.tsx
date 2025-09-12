import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useAuth as useMockAuth } from './useAuth';

interface User {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
  role: 'super_admin' | 'cadre' | 'student';
  phone?: string;
  email?: string;
}

interface HybridAuthContextType {
  user: User | null;
  login: (studentId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  authMode: 'mock' | 'supabase';
  switchAuthMode: (mode: 'mock' | 'supabase') => void;
  signUp?: (email: string, password: string, studentId: string) => Promise<boolean>;
}

const HybridAuthContext = createContext<HybridAuthContextType | undefined>(undefined);

export const HybridAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authMode, setAuthMode] = useState<'mock' | 'supabase'>('mock'); // Start with mock for backward compatibility
  
  const supabaseAuth = useSupabaseAuth();
  const mockAuth = useMockAuth();

  // Use the appropriate auth based on mode
  const currentAuth = authMode === 'supabase' ? supabaseAuth : mockAuth;

  const switchAuthMode = (mode: 'mock' | 'supabase') => {
    setAuthMode(mode);
    // Logout from current mode when switching
    currentAuth.logout();
  };

  const login = async (studentId: string, password: string): Promise<boolean> => {
    if (authMode === 'supabase') {
      return await supabaseAuth.login(studentId, password);
    } else {
      return await mockAuth.login(studentId, password);
    }
  };

  const logout = async (): Promise<void> => {
    if (authMode === 'supabase') {
      await supabaseAuth.logout();
    } else {
      mockAuth.logout();
    }
  };

  const signUp = async (email: string, password: string, studentId: string): Promise<boolean> => {
    if (authMode === 'supabase' && 'signUp' in supabaseAuth) {
      return await supabaseAuth.signUp(email, password, studentId);
    }
    return false;
  };

  const value: HybridAuthContextType = {
    user: currentAuth.user,
    login,
    logout,
    isLoading: currentAuth.isLoading,
    authMode,
    switchAuthMode,
    signUp: authMode === 'supabase' ? signUp : undefined,
  };

  return (
    <HybridAuthContext.Provider value={value}>
      {children}
    </HybridAuthContext.Provider>
  );
};

export const useHybridAuth = () => {
  const context = useContext(HybridAuthContext);
  if (context === undefined) {
    throw new Error('useHybridAuth must be used within a HybridAuthProvider');
  }
  return context;
};