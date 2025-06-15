
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
  role: 'admin' | 'cadre' | 'student';
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
    chinese_name: '管理员',
    english_name: 'Admin User',
    role: 'admin',
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
    chinese_name: '王学生',
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
    }
    setIsLoading(false);
  }, []);

  const login = async (studentId: string, password: string): Promise<boolean> => {
    // Mock authentication - now using student_id instead of email
    const foundUser = mockUsers.find(u => u.student_id === studentId);
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
