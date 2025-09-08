import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  mockStudents, 
  mockClasses, 
  mockCadres, 
  mockMainBranches, 
  mockSubBranches,
  type Student,
  type ClassInfo,
  type Cadre,
  type MainBranch,
  type SubBranch
} from '@/data/mockData';

interface DataContextType {
  // Students
  students: Student[];
  updateStudent: (student: Student) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  deleteStudent: (studentId: string) => void;
  
  // Classes
  classes: ClassInfo[];
  updateClass: (classData: ClassInfo) => void;
  addClass: (classData: Omit<ClassInfo, 'id' | 'status'>) => void;
  deleteClass: (classId: string) => void;
  
  // Cadres
  cadres: Cadre[];
  updateCadre: (cadre: Cadre) => void;
  addCadre: (cadre: Omit<Cadre, 'id'>) => void;
  deleteCadre: (cadreId: string) => void;
  
  // Main Branches
  mainBranches: MainBranch[];
  updateMainBranch: (branch: MainBranch) => void;
  addMainBranch: (branch: Omit<MainBranch, 'id'>) => void;
  deleteMainBranch: (branchId: string) => void;
  
  // Sub Branches
  subBranches: SubBranch[];
  updateSubBranch: (branch: SubBranch) => void;
  addSubBranch: (branch: Omit<SubBranch, 'id'>) => void;
  deleteSubBranch: (branchId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [classes, setClasses] = useState<ClassInfo[]>(mockClasses);
  const [cadres, setCadres] = useState<Cadre[]>(mockCadres);
  const [mainBranches, setMainBranches] = useState<MainBranch[]>(mockMainBranches);
  const [subBranches, setSubBranches] = useState<SubBranch[]>(mockSubBranches);

  // Student methods
  const updateStudent = (student: Student) => {
    setStudents(prev => prev.map(s => s.id === student.id ? student : s));
  };

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString()
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  // Class methods
  const updateClass = (classData: ClassInfo) => {
    setClasses(prev => prev.map(c => c.id === classData.id ? classData : c));
  };

  const addClass = (classData: Omit<ClassInfo, 'id' | 'status'>) => {
    const newClass: ClassInfo = {
      ...classData,
      id: Date.now().toString(),
      status: 'active'
    };
    setClasses(prev => [...prev, newClass]);
  };

  const deleteClass = (classId: string) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
  };

  // Cadre methods
  const updateCadre = (cadre: Cadre) => {
    setCadres(prev => prev.map(c => c.id === cadre.id ? cadre : c));
  };

  const addCadre = (cadreData: Omit<Cadre, 'id'>) => {
    const newCadre: Cadre = {
      ...cadreData,
      id: Date.now().toString()
    };
    setCadres(prev => [...prev, newCadre]);
  };

  const deleteCadre = (cadreId: string) => {
    setCadres(prev => prev.filter(c => c.id !== cadreId));
  };

  // Main Branch methods
  const updateMainBranch = (branch: MainBranch) => {
    setMainBranches(prev => prev.map(b => b.id === branch.id ? branch : b));
  };

  const addMainBranch = (branchData: Omit<MainBranch, 'id'>) => {
    const newBranch: MainBranch = {
      ...branchData,
      id: Date.now().toString()
    };
    setMainBranches(prev => [...prev, newBranch]);
  };

  const deleteMainBranch = (branchId: string) => {
    setMainBranches(prev => prev.filter(b => b.id !== branchId));
  };

  // Sub Branch methods
  const updateSubBranch = (branch: SubBranch) => {
    setSubBranches(prev => prev.map(b => b.id === branch.id ? branch : b));
  };

  const addSubBranch = (branchData: Omit<SubBranch, 'id'>) => {
    const newBranch: SubBranch = {
      ...branchData,
      id: Date.now().toString()
    };
    setSubBranches(prev => [...prev, newBranch]);
  };

  const deleteSubBranch = (branchId: string) => {
    setSubBranches(prev => prev.filter(b => b.id !== branchId));
  };

  const value: DataContextType = {
    students,
    updateStudent,
    addStudent,
    deleteStudent,
    
    classes,
    updateClass,
    addClass,
    deleteClass,
    
    cadres,
    updateCadre,
    addCadre,
    deleteCadre,
    
    mainBranches,
    updateMainBranch,
    addMainBranch,
    deleteMainBranch,
    
    subBranches,
    updateSubBranch,
    addSubBranch,
    deleteSubBranch,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Helper functions that work with the current context data
export const useClassStudents = (classId: string): Student[] => {
  const { classes, students } = useData();
  
  const classData = classes.find(c => c.id === classId);
  if (!classData) return [];
  
  const allStudentIds = [
    classData.class_monitor_id,
    ...(classData.deputy_monitors || []),
    ...(classData.care_officers || []),
    ...(classData.student_ids || [])
  ];
  
  // Remove duplicates and get student objects
  const uniqueIds = [...new Set(allStudentIds)];
  return uniqueIds
    .map(id => students.find(student => student.student_id === id))
    .filter(Boolean) as Student[];
};