import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { 
  useStudents, 
  useClasses, 
  useMainBranches, 
  useSubBranches,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useCreateMainBranch,
  useUpdateMainBranch,
  useDeleteMainBranch,
  useCreateSubBranch,
  useUpdateSubBranch,
  useDeleteSubBranch,
  useCreateEnrollment,
  useDeleteEnrollment
} from '@/hooks/useDatabase';
import { 
  fetchStudentByStudentId,
  mapFrontendStudentToDb,
  mapDbStudentToFrontend
} from '@/lib/database/students';
import {
  type CreateMainBranchData,
  type UpdateMainBranchData,
  type CreateSubBranchData,
  type UpdateSubBranchData,
  mapDbMainBranchToFrontend
} from '@/lib/database/branches';
import {
  type CreateClassData,
  type UpdateClassData
} from '@/lib/database/classes';
import {
  type CreateStudentData,
  type UpdateStudentData
} from '@/lib/database/students';
import {
  type Student,
  type ClassInfo,
  type Cadre,
  type CadreRole,
  type MainBranch,
  type SubBranch
} from '@/data/types';
import { type StudentWithDetails } from '@/types/database';

interface DatabaseContextType {
  // Loading states
  isLoadingStudents: boolean;
  isLoadingClasses: boolean;
  isLoadingMainBranches: boolean;
  isLoadingSubBranches: boolean;
  
  // Error states
  studentsError: Error | null;
  classesError: Error | null;
  mainBranchesError: Error | null;
  subBranchesError: Error | null;
  
  // Data (transformed to match existing interfaces)
  students: Student[];
  classes: ClassInfo[];
  cadres: Cadre[]; // TODO: Implement cadre system using database
  mainBranches: MainBranch[];
  subBranches: SubBranch[];
  
  // CRUD operations (maintaining existing API)
  updateStudent: (student: Student) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  
  updateClass: (classData: ClassInfo) => Promise<void>;
  addClass: (classData: Omit<ClassInfo, 'id' | 'status'>) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  
  updateCadre: (cadre: Cadre) => Promise<void>;
  addCadre: (cadre: Omit<Cadre, 'id'>) => Promise<void>;
  deleteCadre: (cadreId: string) => Promise<void>;
  
  updateMainBranch: (branch: MainBranch) => Promise<void>;
  addMainBranch: (branch: Omit<MainBranch, 'id'>) => Promise<void>;
  deleteMainBranch: (branchId: string) => Promise<void>;
  
  updateSubBranch: (branch: SubBranch) => Promise<void>;
  addSubBranch: (branch: Omit<SubBranch, 'id'>) => Promise<void>;
  deleteSubBranch: (branchId: string) => Promise<void>;
  removeSubBranchFromMainBranch: (branchId: string) => Promise<void>;
  
  // Unified Management Methods
  assignStudentToMotherClass: (studentId: string, classId: string) => Promise<void>;
  removeStudentFromMotherClass: (studentId: string) => Promise<void>;
  assignCadreRole: (studentId: string, classId: string, role: '班长' | '副班长' | '关怀员') => Promise<void>;
  removeCadreRole: (studentId: string, classId: string, role: '班长' | '副班长' | '关怀员') => Promise<void>;
  getStudentRoles: (studentId: string) => CadreRole[];
  getClassAllStudents: (classId: string) => Student[];
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

// Helper function to convert StudentWithDetails to Student interface for backward compatibility
const convertStudentWithDetailsToStudent = (studentDetails: StudentWithDetails): Student => {
  // Add data validation
  if (!studentDetails || !studentDetails.student_id) {
    console.warn('Invalid student data received:', studentDetails);
    return {
      id: '0',
      student_id: '',
      chinese_name: 'Invalid Student',
      english_name: 'Invalid Student',
      gender: 'male',
      phone: '',
      enrollment_date: '',
      status: '活跃',
      postal_code: '',
      date_of_birth: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
    };
  }

  return {
    id: studentDetails.id.toString(),
    student_id: studentDetails.student_id,
    chinese_name: studentDetails.chinese_name || '',
    english_name: studentDetails.english_name || '',
    gender: (studentDetails.gender as 'male' | 'female') || 'male',
    phone: studentDetails.phone || studentDetails.emergency_contact_number || '',
    email: studentDetails.email,
    enrollment_date: studentDetails.enrollment_date || studentDetails.date_of_joining || '',
    status: (studentDetails.status as '活跃' | '旁听' | '保留') || '活跃',
    postal_code: studentDetails.postcode || '',
    date_of_birth: studentDetails.birthday_date || '',
    emergency_contact_name: studentDetails.emergency_contact_name || '',
    emergency_contact_phone: studentDetails.emergency_contact_number || '',
    emergency_contact_relation: studentDetails.emergency_contact_relationship || '',
    occupation: studentDetails.profession,
    academic_level: studentDetails.education_level as 'Bachelor' | 'Master' | 'PhD' | 'Other',
    marriage_status: studentDetails.maritial_status as 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other',
  };
};

// Helper function to convert database class to frontend format
const mapDbClassToFrontend = (dbClass: any): ClassInfo => ({
  id: dbClass.id.toString(),
  name: dbClass.name || '',
  sub_branch_id: dbClass.manage_by_sub_branch_id?.toString(),
  sub_branch_name: dbClass.sub_branch_name || '',
  time: dbClass.time || '',
  student_count: dbClass.student_count || 0,
  class_monitor_id: dbClass.monitor_id?.toString() || '',
  class_monitor: dbClass.class_monitor_name || '',
  deputy_monitors: dbClass.deputy_monitors?.map((id: number) => id.toString()) || [],
  care_officers: dbClass.care_officers?.map((id: number) => id.toString()) || [],
  learning_progress: dbClass.learning_progress || '',
  page_number: dbClass.page_number || '',
  line_number: dbClass.line_number || '',
  attendance_rate: dbClass.attendance_rate || 0,
  status: dbClass.status || 'active'
});

// Helper function to convert database main branch to frontend format (local version for context usage)
const mapDbMainBranchToMainBranch = (dbBranch: any): MainBranch => ({
  id: dbBranch.id.toString(),
  name: dbBranch.name || '',
  region: dbBranch.region || '中马',
  address: dbBranch.address || '',
  student_id: dbBranch.student_id || '', // Use mapped student_id
  contact_person: dbBranch.contact_person || '',
  contact_phone: dbBranch.contact_phone || '',
  sub_branch_responsible: dbBranch.sub_branch_responsible || '', // Use mapped sub_branch_responsible name
  manage_sub_branches: dbBranch.manage_sub_branches || [],
  sub_branches_count: dbBranch.sub_branches_count || 0,
  classes_count: dbBranch.classes_count || 0,
  students_count: dbBranch.students_count || 0,
});

// Helper function to convert database sub branch to frontend format
const mapDbSubBranchToFrontend = (dbBranch: any): SubBranch => ({
  id: dbBranch.id.toString(),
  name: dbBranch.name || '',
  main_branch_id: dbBranch.main_branch_id?.toString() || '',
  main_branch_name: dbBranch.main_branch_name || '',
  state: dbBranch.state || '',
  address: dbBranch.address || '',
  student_id: dbBranch.person_in_charge?.toString(),
  contact_person: dbBranch.contact_person || '',
  contact_phone: dbBranch.contact_phone || '',
  email: dbBranch.email,
  established_date: dbBranch.established_date || '',
  status: dbBranch.status || 'active',
  classes_count: dbBranch.classes_count || 0,
  students_count: dbBranch.students_count || 0,
});

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  // Database hooks
  const { data: dbStudents, isLoading: isLoadingStudents, error: studentsError } = useStudents();
  const { data: dbClasses, isLoading: isLoadingClasses, error: classesError } = useClasses();
  const { data: dbMainBranches, isLoading: isLoadingMainBranches, error: mainBranchesError } = useMainBranches();
  const { data: dbSubBranches, isLoading: isLoadingSubBranches, error: subBranchesError } = useSubBranches();
  
  // Mutation hooks
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  
  const createClassMutation = useCreateClass();
  const updateClassMutation = useUpdateClass();
  const deleteClassMutation = useDeleteClass();
  
  const createMainBranchMutation = useCreateMainBranch();
  const updateMainBranchMutation = useUpdateMainBranch();
  const deleteMainBranchMutation = useDeleteMainBranch();
  
  const createSubBranchMutation = useCreateSubBranch();
  const updateSubBranchMutation = useUpdateSubBranch();
  const deleteSubBranchMutation = useDeleteSubBranch();
  
  const createEnrollmentMutation = useCreateEnrollment();
  const deleteEnrollmentMutation = useDeleteEnrollment();

  // Transform database data to frontend format using official mapping function
  const students = useMemo(() => {
    try {
      const studentDetails = (dbStudents || []).map(mapDbStudentToFrontend);
      const mappedStudents = studentDetails.map(convertStudentWithDetailsToStudent);
      console.log(`Successfully mapped ${mappedStudents.length} students from database`);
      return mappedStudents;
    } catch (error) {
      console.error('Error mapping students from database:', error);
      return [];
    }
  }, [dbStudents]);
  
  const classes = useMemo(() => 
    (dbClasses || []).map(mapDbClassToFrontend),
    [dbClasses]
  );
  
  // Use state for mainBranches due to async mapping
  const [mainBranches, setMainBranches] = useState<MainBranch[]>([]);

  // Handle async mapping for main branches
  useEffect(() => {
    if (!dbMainBranches) {
      setMainBranches([]);
      return;
    }

    const mapMainBranches = async () => {
      try {
        const mappedBranches = await Promise.all(
          dbMainBranches.map(async (dbBranch) => {
            const branchWithDetails = await mapDbMainBranchToFrontend(dbBranch);
            return mapDbMainBranchToMainBranch(branchWithDetails);
          })
        );
        setMainBranches(mappedBranches);
      } catch (error) {
        console.error('Error mapping main branches:', error);
        setMainBranches([]);
      }
    };

    mapMainBranches();
  }, [dbMainBranches]);
  
  const subBranches = useMemo(() => 
    (dbSubBranches || []).map(mapDbSubBranchToFrontend),
    [dbSubBranches]
  );

  // Generate cadres from classes and students
  const cadres = useMemo(() => {
    const cadreMap = new Map<string, Cadre>();
    
    classes.forEach(classInfo => {
      // Add monitor
      if (classInfo.class_monitor_id && classInfo.class_monitor) {
        const student = students.find(s => s.id === classInfo.class_monitor_id);
        if (student) {
          const cadreId = student.id;
          if (!cadreMap.has(cadreId)) {
            cadreMap.set(cadreId, {
              id: cadreId,
              student_id: student.student_id,
              chinese_name: student.chinese_name,
              english_name: student.english_name,
              phone: student.phone,
              email: student.email,
              roles: [],
              support_classes: [],
              can_take_attendance: true,
              can_register_students: true,
              status: '活跃',
              created_date: new Date().toISOString().split('T')[0]
            });
          }
          cadreMap.get(cadreId)!.roles.push({
            class_id: classInfo.id,
            class_name: classInfo.name,
            role: '班长',
            appointment_date: new Date().toISOString().split('T')[0]
          });
        }
      }
      
      // Add deputy monitors and care officers similarly
      [...(classInfo.deputy_monitors || []), ...(classInfo.care_officers || [])].forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        const role = classInfo.deputy_monitors?.includes(studentId) ? '副班长' : '关怀员';
        
        if (student) {
          const cadreId = student.id;
          if (!cadreMap.has(cadreId)) {
            cadreMap.set(cadreId, {
              id: cadreId,
              student_id: student.student_id,
              chinese_name: student.chinese_name,
              english_name: student.english_name,
              phone: student.phone,
              email: student.email,
              roles: [],
              support_classes: [],
              can_take_attendance: true,
              can_register_students: true,
              status: '活跃',
              created_date: new Date().toISOString().split('T')[0]
            });
          }
          cadreMap.get(cadreId)!.roles.push({
            class_id: classInfo.id,
            class_name: classInfo.name,
            role: role,
            appointment_date: new Date().toISOString().split('T')[0]
          });
        }
      });
    });
    
    return Array.from(cadreMap.values());
  }, [classes, students]);

  // Student methods
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    const dbStudentData = mapFrontendStudentToDb(studentData);
    await createStudentMutation.mutateAsync(dbStudentData);
  };

  const updateStudent = async (student: Student) => {
    const dbStudentData = mapFrontendStudentToDb(student);
    const updateData: UpdateStudentData = {
      id: parseInt(student.id),
      ...dbStudentData
    };
    await updateStudentMutation.mutateAsync(updateData);
  };

  const deleteStudent = async (studentId: string) => {
    await deleteStudentMutation.mutateAsync(parseInt(studentId));
  };

  // Class methods
  const addClass = async (classData: Omit<ClassInfo, 'id' | 'status'>) => {
    const dbClassData: CreateClassData = {
      name: classData.name,
      manage_by_sub_branch_id: classData.sub_branch_id ? parseInt(classData.sub_branch_id) : undefined,
      day_of_week: classData.time?.split(' ')[0],
      class_start_time: classData.time?.split(' ')[1]?.split('-')[0],
      class_end_time: classData.time?.split(' ')[1]?.split('-')[1],
      monitor_id: classData.class_monitor_id ? parseInt(classData.class_monitor_id) : undefined,
    };
    await createClassMutation.mutateAsync(dbClassData);
  };

  const updateClass = async (classData: ClassInfo) => {
    const updateData: UpdateClassData = {
      id: parseInt(classData.id),
      name: classData.name,
      manage_by_sub_branch_id: classData.sub_branch_id ? parseInt(classData.sub_branch_id) : undefined,
      day_of_week: classData.time?.split(' ')[0],
      class_start_time: classData.time?.split(' ')[1]?.split('-')[0],
      class_end_time: classData.time?.split(' ')[1]?.split('-')[1],
      monitor_id: classData.class_monitor_id ? parseInt(classData.class_monitor_id) : undefined,
    };
    await updateClassMutation.mutateAsync(updateData);
  };

  const deleteClass = async (classId: string) => {
    await deleteClassMutation.mutateAsync(parseInt(classId));
  };

  // Main Branch methods
  const addMainBranch = async (branchData: Omit<MainBranch, 'id'>) => {
    // Find the student by student_id to get their database ID
    let personInCharge: number | undefined = undefined;
    if (branchData.student_id) {
      const selectedStudent = students.find(s => s.student_id === branchData.student_id);
      if (selectedStudent) {
        personInCharge = parseInt(selectedStudent.id);
      }
    }
    
    // Find the sub-branch by name to get their database ID
    let responsibleSubBranchId: number | undefined = undefined;
    if (branchData.sub_branch_responsible) {
      const selectedSubBranch = subBranches.find(sb => sb.name === branchData.sub_branch_responsible);
      if (selectedSubBranch) {
        responsibleSubBranchId = parseInt(selectedSubBranch.id);
      }
    }
    
    const dbBranchData: CreateMainBranchData = {
      name: branchData.name,
      sub_branch_responsible: responsibleSubBranchId,
      manage_sub_branches: branchData.manage_sub_branches ? branchData.manage_sub_branches.map(id => parseInt(id)) : undefined,
      person_in_charge: personInCharge,
    };
    await createMainBranchMutation.mutateAsync(dbBranchData);
  };

  const updateMainBranch = async (branch: MainBranch) => {
    // Find the student by student_id to get their database ID
    let personInCharge: number | undefined = undefined;
    if (branch.student_id) {
      const selectedStudent = students.find(s => s.student_id === branch.student_id);
      if (selectedStudent) {
        personInCharge = parseInt(selectedStudent.id);
      }
    }
    
    // Find the sub-branch by name to get their database ID
    let responsibleSubBranchId: number | undefined = undefined;
    if (branch.sub_branch_responsible) {
      const selectedSubBranch = subBranches.find(sb => sb.name === branch.sub_branch_responsible);
      if (selectedSubBranch) {
        responsibleSubBranchId = parseInt(selectedSubBranch.id);
      }
    }
    
    const updateData: UpdateMainBranchData = {
      id: parseInt(branch.id),
      name: branch.name,
      sub_branch_responsible: responsibleSubBranchId,
      manage_sub_branches: branch.manage_sub_branches ? branch.manage_sub_branches.map(id => parseInt(id)) : undefined,
      person_in_charge: personInCharge,
    };
    await updateMainBranchMutation.mutateAsync(updateData);
  };

  const deleteMainBranch = async (branchId: string) => {
    await deleteMainBranchMutation.mutateAsync(parseInt(branchId));
  };

  // Sub Branch methods
  const addSubBranch = async (branchData: Omit<SubBranch, 'id'>) => {
    // Find the student by student_id to get their database ID
    let personInCharge: number | undefined = undefined;
    if (branchData.student_id) {
      const selectedStudent = students.find(s => s.student_id === branchData.student_id);
      if (selectedStudent) {
        personInCharge = parseInt(selectedStudent.id);
      }
    }
    
    const dbBranchData: CreateSubBranchData = {
      name: branchData.name,
      state: branchData.state,
      address: branchData.address,
      person_in_charge: personInCharge,
    };
    await createSubBranchMutation.mutateAsync(dbBranchData);
  };

  const updateSubBranch = async (branch: SubBranch) => {
    // Find the student by student_id to get their database ID
    let personInCharge: number | undefined = undefined;
    if (branch.student_id) {
      const selectedStudent = students.find(s => s.student_id === branch.student_id);
      if (selectedStudent) {
        personInCharge = parseInt(selectedStudent.id);
      }
    }
    
    const updateData: UpdateSubBranchData = {
      id: parseInt(branch.id),
      name: branch.name,
      state: branch.state,
      address: branch.address,
      person_in_charge: personInCharge,
    };
    await updateSubBranchMutation.mutateAsync(updateData);
  };

  const deleteSubBranch = async (branchId: string) => {
    await deleteSubBranchMutation.mutateAsync(parseInt(branchId));
  };

  const removeSubBranchFromMainBranch = async (branchId: string) => {
    // TODO: Implement this based on database schema
    console.log('removeSubBranchFromMainBranch not yet implemented');
  };

  // Enrollment management
  const assignStudentToMotherClass = async (studentId: string, classId: string) => {
    await createEnrollmentMutation.mutateAsync({
      student_id: parseInt(studentId),
      class_id: parseInt(classId)
    });
  };

  const removeStudentFromMotherClass = async (studentId: string) => {
    // Remove all enrollments for this student
    await deleteEnrollmentMutation.mutateAsync({
      studentId: parseInt(studentId),
      classId: 0 // Will be handled in the mutation to delete all for student
    });
  };

  // Cadre management - implemented through class role assignments
  const updateCadre = async (cadre: Cadre) => {
    // Cadres are derived from class assignments, so updating means updating class assignments
    // This is a complex operation that would involve updating multiple class records
    // For now, we'll implement basic functionality
    console.log('Cadre updates handled through class role assignments');
  };

  const addCadre = async (cadre: Omit<Cadre, 'id'>) => {
    // Adding a cadre means assigning roles to classes
    // This would involve updating class records with the new cadre assignments
    for (const role of cadre.roles) {
      await assignCadreRole(cadre.student_id, role.class_id, role.role);
    }
  };

  const deleteCadre = async (cadreId: string) => {
    // Find the cadre and remove all their roles
    const cadre = cadres.find(c => c.id === cadreId);
    if (cadre) {
      for (const role of cadre.roles) {
        await removeCadreRole(cadre.student_id, role.class_id, role.role);
      }
    }
  };

  const assignCadreRole = async (studentId: string, classId: string, role: '班长' | '副班长' | '关怀员') => {
    const classToUpdate = classes.find(c => c.id === classId);
    if (!classToUpdate) return;

    const updateData: UpdateClassData = {
      id: parseInt(classId),
      name: classToUpdate.name,
    };

    if (role === '班长') {
      updateData.monitor_id = parseInt(studentId);
    } else if (role === '副班长') {
      updateData.vice_monitor_id = parseInt(studentId);
    } else if (role === '关怀员') {
      updateData.care_officer_id = parseInt(studentId);
    }

    await updateClassMutation.mutateAsync(updateData);
  };

  const removeCadreRole = async (studentId: string, classId: string, role: '班长' | '副班长' | '关怀员') => {
    const classToUpdate = classes.find(c => c.id === classId);
    if (!classToUpdate) return;

    const updateData: UpdateClassData = {
      id: parseInt(classId),
      name: classToUpdate.name,
    };

    if (role === '班长') {
      updateData.monitor_id = undefined;
    } else if (role === '副班长') {
      updateData.vice_monitor_id = undefined;
    } else if (role === '关怀员') {
      updateData.care_officer_id = undefined;
    }

    await updateClassMutation.mutateAsync(updateData);
  };

  const getStudentRoles = (studentId: string): CadreRole[] => {
    const roles: CadreRole[] = [];
    
    classes.forEach(classInfo => {
      if (classInfo.class_monitor_id === studentId) {
        roles.push({
          class_id: classInfo.id,
          class_name: classInfo.name,
          role: '班长',
          appointment_date: new Date().toISOString().split('T')[0]
        });
      }
      if (classInfo.deputy_monitors?.includes(studentId)) {
        roles.push({
          class_id: classInfo.id,
          class_name: classInfo.name,
          role: '副班长',
          appointment_date: new Date().toISOString().split('T')[0]
        });
      }
      if (classInfo.care_officers?.includes(studentId)) {
        roles.push({
          class_id: classInfo.id,
          class_name: classInfo.name,
          role: '关怀员',
          appointment_date: new Date().toISOString().split('T')[0]
        });
      }
    });
    
    return roles;
  };

  const getClassAllStudents = (classId: string): Student[] => {
    // This would require fetching enrollment data - for now return empty
    // In a full implementation, we'd fetch from class_enrollments table
    return [];
  };

  const value: DatabaseContextType = {
    // Loading states
    isLoadingStudents,
    isLoadingClasses,
    isLoadingMainBranches,
    isLoadingSubBranches,
    
    // Error states
    studentsError,
    classesError,
    mainBranchesError,
    subBranchesError,
    
    // Data
    students,
    classes,
    cadres,
    mainBranches,
    subBranches,
    
    // CRUD operations
    updateStudent,
    addStudent,
    deleteStudent,
    updateClass,
    addClass,
    deleteClass,
    updateCadre,
    addCadre,
    deleteCadre,
    updateMainBranch,
    addMainBranch,
    deleteMainBranch,
    updateSubBranch,
    addSubBranch,
    deleteSubBranch,
    removeSubBranchFromMainBranch,
    assignStudentToMotherClass,
    removeStudentFromMotherClass,
    assignCadreRole,
    removeCadreRole,
    getStudentRoles,
    getClassAllStudents,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};