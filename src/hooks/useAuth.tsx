
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
  role: 'super_admin' | 'state_admin' | 'branch_admin' | 'class_admin' | 'cadre' | 'student';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (studentId: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration - updated to use student_id
const mockUsers: User[] = [
  {
    id: '1',
    student_id: 'admin001',
    chinese_name: '超级管理员',
    english_name: 'Super Admin User',
    role: 'super_admin',
    phone: '13800138000'
  },
  {
    id: '2',
    student_id: 'cadre001',
    chinese_name: '李班长',
    english_name: 'Li Ming',
    role: 'cadre',
    phone: '13800138001'
  },
  {
    id: '3',
    student_id: 'student001',
    chinese_name: '王学员',
    english_name: 'Wang Lei',
    role: 'student',
    phone: '13800138002'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Temporarily auto-login as super_admin for testing
      const defaultUser = mockUsers.find(u => u.role === 'super_admin');
      if (defaultUser) {
        setUser(defaultUser);
        localStorage.setItem('user', JSON.stringify(defaultUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrStudentId: string, password: string): Promise<boolean> => {
    // Dev account bypass for debugging
    if (emailOrStudentId === 'admin001' && password === 'password') {
      const devUser = {
        id: 'dev-admin',
        student_id: 'admin001',
        chinese_name: '开发管理员',
        english_name: 'Dev Admin',
        role: 'super_admin',
        phone: '13800138000',
        email: 'admin@dev.local'
      };
      setUser(devUser);
      localStorage.setItem('user', JSON.stringify(devUser));
      return true;
    }

    // Mock authentication - support both email and student_id
    const foundUser = mockUsers.find(u => 
      u.student_id === emailOrStudentId || 
      u.email === emailOrStudentId
    );
    
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
