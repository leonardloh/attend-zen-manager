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
  type CadreRole,
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
  removeSubBranchFromMainBranch: (branchId: string) => void;
  
  // Unified Management Methods
  assignStudentToMotherClass: (studentId: string, classId: string) => void;
  removeStudentFromMotherClass: (studentId: string) => void;
  assignCadreRole: (studentId: string, classId: string, role: '班长' | '副班长' | '关怀员') => void;
  removeCadreRole: (studentId: string, classId: string, role: '班长' | '副班长' | '关怀员') => void;
  getStudentRoles: (studentId: string) => CadreRole[];
  getClassAllStudents: (classId: string) => Student[]; // Including mother class students and cadres
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
    // Get the old main branch to check if name changed
    const oldBranch = mainBranches.find(b => b.id === branch.id);
    
    // Update main branch
    setMainBranches(prev => prev.map(b => b.id === branch.id ? branch : b));
    
    // If main branch name changed, update all related sub-branches
    if (oldBranch && oldBranch.name !== branch.name) {
      console.log('Main branch name changed from', oldBranch.name, 'to', branch.name);
      setSubBranches(prev => prev.map(sub => 
        sub.main_branch_id === branch.id 
          ? { ...sub, main_branch_name: branch.name }
          : sub
      ));
    }
    
  };

  const addMainBranch = (branchData: Omit<MainBranch, 'id'>) => {
    const newBranch: MainBranch = {
      ...branchData,
      id: Date.now().toString()
    };
    setMainBranches(prev => [...prev, newBranch]);
  };

  const deleteMainBranch = (branchId: string) => {
    // Get the main branch before deletion for cascade operations
    const branchToDelete = mainBranches.find(b => b.id === branchId);
    console.log('Deleting main branch:', branchToDelete?.name);
    
    // Remove main branch
    setMainBranches(prev => prev.filter(b => b.id !== branchId));
    
    // Clear main branch association from related sub-branches (don't delete them)
    setSubBranches(prev => prev.map(sub => 
      sub.main_branch_id === branchId 
        ? { ...sub, main_branch_id: '', main_branch_name: '' }
        : sub
    ));
  };

  // Sub Branch methods
  const updateSubBranch = (branch: SubBranch) => {
    const oldSubBranch = subBranches.find(b => b.id === branch.id);
    
    // Update sub-branch
    setSubBranches(prev => prev.map(b => b.id === branch.id ? branch : b));
    
    // If main_branch_name was changed and we have a main_branch_id, 
    // find the main branch by name and update the ID reference
    if (oldSubBranch && 
        oldSubBranch.main_branch_name !== branch.main_branch_name && 
        branch.main_branch_name) {
      const matchingMainBranch = mainBranches.find(mb => mb.name === branch.main_branch_name);
      if (matchingMainBranch && matchingMainBranch.id !== branch.main_branch_id) {
        console.log('Sub-branch main_branch_name changed, updating main_branch_id reference');
        // Update the sub-branch with correct main_branch_id
        setSubBranches(prev => prev.map(b => 
          b.id === branch.id 
            ? { ...b, main_branch_id: matchingMainBranch.id }
            : b
        ));
      }
    }
  };

  const addSubBranch = (branchData: Omit<SubBranch, 'id'>) => {
    const newBranch: SubBranch = {
      ...branchData,
      id: Date.now().toString()
    };
    setSubBranches(prev => [...prev, newBranch]);
  };

  const deleteSubBranch = (branchId: string) => {
    console.log('deleteSubBranch called with ID:', branchId);
    const branchToDelete = subBranches.find(b => b.id === branchId);
    console.log('Branch to delete:', branchToDelete?.name);
    console.log('SubBranches before deletion:', subBranches.length);
    console.log('SubBranches state before:', subBranches.map(b => b.name));
    
    setSubBranches(prev => {
      const newBranches = prev.filter(b => b.id !== branchId);
      console.log('SubBranches after deletion:', newBranches.length);
      console.log('SubBranches state after:', newBranches.map(b => b.name));
      return newBranches;
    });
    
    // Force a console log after state update
    setTimeout(() => {
      console.log('SubBranches state after timeout:', subBranches.map(b => b.name));
    }, 100);
  };

  // Remove sub-branch association from main branch (without deleting the sub-branch)
  const removeSubBranchFromMainBranch = (branchId: string) => {
    console.log('removeSubBranchFromMainBranch called with ID:', branchId);
    const branchToUpdate = subBranches.find(b => b.id === branchId);
    console.log('Branch to remove association:', branchToUpdate?.name);
    
    setSubBranches(prev => prev.map(sub => 
      sub.id === branchId 
        ? { 
            ...sub, 
            main_branch_id: '', 
            main_branch_name: '' 
          }
        : sub
    ));
    
    console.log('Association removed, sub-branch preserved in system');
  };

  // Unified Management Methods
  const assignStudentToMotherClass = (studentId: string, classId: string) => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    // Update student's mother class information
    setStudents(prev => prev.map(student => 
      student.student_id === studentId 
        ? { 
            ...student, 
            mother_class_id: classId,
            mother_class_name: targetClass.name
          }
        : student
    ));

    // Add student to class's mother_class_students array
    setClasses(prev => prev.map(classInfo => 
      classInfo.id === classId 
        ? { 
            ...classInfo, 
            mother_class_students: [...(classInfo.mother_class_students || []), studentId]
          }
        : classInfo
    ));
  };

  const removeStudentFromMotherClass = (studentId: string) => {
    const student = students.find(s => s.student_id === studentId);
    if (!student || !student.mother_class_id) return;

    const oldClassId = student.mother_class_id;

    // Remove mother class info from student
    setStudents(prev => prev.map(s => 
      s.student_id === studentId 
        ? { ...s, mother_class_id: undefined, mother_class_name: undefined }
        : s
    ));

    // Remove student from class's mother_class_students array
    setClasses(prev => prev.map(classInfo => 
      classInfo.id === oldClassId 
        ? { 
            ...classInfo, 
            mother_class_students: (classInfo.mother_class_students || []).filter(id => id !== studentId)
          }
        : classInfo
    ));
  };

  const assignCadreRole = (studentId: string, classId: string, role: '班长' | '副班长' | '关怀员') => {
    const student = students.find(s => s.student_id === studentId);
    const targetClass = classes.find(c => c.id === classId);
    if (!student || !targetClass) return;

    // Check if cadre record exists for this student
    const existingCadre = cadres.find(c => c.student_id === studentId);
  
    if (existingCadre) {
      // Add new role to existing cadre
      const newRole: CadreRole = {
        class_id: classId,
        class_name: targetClass.name,
        role: role,
        appointment_date: new Date().toISOString().split('T')[0]
      };

      setCadres(prev => prev.map(cadre => 
        cadre.student_id === studentId 
          ? { 
              ...cadre, 
              roles: [...cadre.roles.filter(r => !(r.class_id === classId && r.role === role)), newRole]
            }
          : cadre
      ));
    } else {
      // Create new cadre record with proper structure
      const newCadre: Cadre = {
        id: Date.now().toString(),
        student_id: studentId,
        chinese_name: student.chinese_name,
        english_name: student.english_name,
        phone: student.phone,
        email: student.email,
        roles: [{
          class_id: classId,
          class_name: targetClass.name,
          role: role,
          appointment_date: new Date().toISOString().split('T')[0]
        }],
        support_classes: [],
        can_take_attendance: true,
        can_register_students: true,
        status: '活跃',
        created_date: new Date().toISOString().split('T')[0]
      };

      setCadres(prev => [...prev, newCadre]);
    }

    // Update class information
    setClasses(prev => prev.map(classInfo => {
      if (classInfo.id !== classId) return classInfo;

      let updatedClass = { ...classInfo };
      
      if (role === '班长') {
        updatedClass.class_monitor_id = studentId;
        updatedClass.class_monitor = student.chinese_name;
      } else if (role === '副班长') {
        const deputies = updatedClass.deputy_monitors || [];
        if (!deputies.includes(studentId)) {
          updatedClass.deputy_monitors = [...deputies, studentId];
        }
      } else if (role === '关怀员') {
        const careOfficers = updatedClass.care_officers || [];
        if (!careOfficers.includes(studentId)) {
          updatedClass.care_officers = [...careOfficers, studentId];
        }
      }

      return updatedClass;
    }));
  };

  const removeCadreRole = (studentId: string, classId: string, role: '班长' | '副班长' | '关怀员') => {
    // Remove role from cadre record
    setCadres(prev => prev.map(cadre => {
      if (cadre.student_id !== studentId) return cadre;
      
      const updatedRoles = cadre.roles.filter(r => !(r.class_id === classId && r.role === role));
      
      // If no roles left, remove the cadre entirely
      return updatedRoles.length > 0 ? { ...cadre, roles: updatedRoles } : null;
    }).filter(Boolean) as Cadre[]);

    // Update class information
    setClasses(prev => prev.map(classInfo => {
      if (classInfo.id !== classId) return classInfo;

      let updatedClass = { ...classInfo };
      
      if (role === '班长' && classInfo.class_monitor_id === studentId) {
        updatedClass.class_monitor_id = '';
        updatedClass.class_monitor = '';
      } else if (role === '副班长') {
        updatedClass.deputy_monitors = (classInfo.deputy_monitors || []).filter(id => id !== studentId);
      } else if (role === '关怀员') {
        updatedClass.care_officers = (classInfo.care_officers || []).filter(id => id !== studentId);
      }

      return updatedClass;
    }));
  };

  const getStudentRoles = (studentId: string): CadreRole[] => {
    const cadre = cadres.find(c => c.student_id === studentId);
    return cadre ? cadre.roles : [];
  };

  const getClassAllStudents = (classId: string): Student[] => {
    const classInfo = classes.find(c => c.id === classId);
    if (!classInfo) return [];

    const allStudentIds = [
      ...(classInfo.mother_class_students || []),
      ...(classInfo.regular_students || []),
      classInfo.class_monitor_id,
      ...(classInfo.deputy_monitors || []),
      ...(classInfo.care_officers || [])
    ];

    const uniqueIds = [...new Set(allStudentIds.filter(Boolean))];
    return uniqueIds
      .map(id => students.find(s => s.student_id === id))
      .filter(Boolean) as Student[];
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
    removeSubBranchFromMainBranch,
    
    // Unified Management Methods
    assignStudentToMotherClass,
    removeStudentFromMotherClass,
    assignCadreRole,
    removeCadreRole,
    getStudentRoles,
    getClassAllStudents,
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