import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  // Student operations
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  fetchStudentByStudentId,
  type CreateStudentData,
  type UpdateStudentData,
  
  // Class operations
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  searchClasses,
  type CreateClassData,
  type UpdateClassData,
  
  // Branch operations
  fetchMainBranches,
  createMainBranch,
  updateMainBranch,
  deleteMainBranch,
  fetchSubBranches,
  createSubBranch,
  updateSubBranch,
  deleteSubBranch,
  type CreateMainBranchData,
  type UpdateMainBranchData,
  type CreateSubBranchData,
  type UpdateSubBranchData,
  
  // Enrollment operations
  createEnrollment,
  deleteEnrollmentByStudentAndClass,
  fetchEnrollmentsByClass,
  type CreateEnrollmentData
} from '@/lib/database';

// Query Keys
export const QUERY_KEYS = {
  STUDENTS: ['students'],
  CLASSES: ['classes'],
  MAIN_BRANCHES: ['mainBranches'],
  SUB_BRANCHES: ['subBranches'],
  ENROLLMENTS: ['enrollments'],
  ATTENDANCE: ['attendance'],
} as const;

// Student Hooks
export const useStudents = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STUDENTS,
    queryFn: fetchStudents,
  });
};

export const useSearchStudents = (query: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.STUDENTS, 'search', query],
    queryFn: () => searchStudents(query),
    enabled: query.length > 0,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS });
      toast.success('学员创建成功');
    },
    onError: (error: Error) => {
      toast.error(`创建学员失败: ${error.message}`);
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS });
      toast.success('学员更新成功');
    },
    onError: (error: Error) => {
      toast.error(`更新学员失败: ${error.message}`);
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS });
      toast.success('学员删除成功');
    },
    onError: (error: Error) => {
      toast.error(`删除学员失败: ${error.message}`);
    },
  });
};

// Class Hooks
export const useClasses = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CLASSES,
    queryFn: fetchClasses,
  });
};

export const useSearchClasses = (query: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CLASSES, 'search', query],
    queryFn: () => searchClasses(query),
    enabled: query.length > 0,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES });
      toast.success('班级创建成功');
    },
    onError: (error: Error) => {
      toast.error(`创建班级失败: ${error.message}`);
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES });
      toast.success('班级更新成功');
    },
    onError: (error: Error) => {
      toast.error(`更新班级失败: ${error.message}`);
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      toast.success('班级删除成功');
    },
    onError: (error: Error) => {
      toast.error(`删除班级失败: ${error.message}`);
    },
  });
};

// Main Branch Hooks
export const useMainBranches = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MAIN_BRANCHES,
    queryFn: fetchMainBranches,
  });
};

export const useCreateMainBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMainBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAIN_BRANCHES });
      toast.success('总分苑创建成功');
    },
    onError: (error: Error) => {
      toast.error(`创建总分苑失败: ${error.message}`);
    },
  });
};

export const useUpdateMainBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateMainBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAIN_BRANCHES });
      toast.success('总分苑更新成功');
    },
    onError: (error: Error) => {
      toast.error(`更新总分苑失败: ${error.message}`);
    },
  });
};

export const useDeleteMainBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteMainBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAIN_BRANCHES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUB_BRANCHES });
      toast.success('总分苑删除成功');
    },
    onError: (error: Error) => {
      toast.error(`删除总分苑失败: ${error.message}`);
    },
  });
};

// Sub Branch Hooks
export const useSubBranches = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SUB_BRANCHES,
    queryFn: fetchSubBranches,
  });
};

export const useCreateSubBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSubBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUB_BRANCHES });
      toast.success('分苑创建成功');
    },
    onError: (error: Error) => {
      toast.error(`创建分苑失败: ${error.message}`);
    },
  });
};

export const useUpdateSubBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSubBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUB_BRANCHES });
      toast.success('分苑更新成功');
    },
    onError: (error: Error) => {
      toast.error(`更新分苑失败: ${error.message}`);
    },
  });
};

export const useDeleteSubBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSubBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUB_BRANCHES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      toast.success('分苑删除成功');
    },
    onError: (error: Error) => {
      toast.error(`删除分苑失败: ${error.message}`);
    },
  });
};

// Enrollment Hooks
export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES });
      toast.success('学员注册成功');
    },
    onError: (error: Error) => {
      toast.error(`注册失败: ${error.message}`);
    },
  });
};

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studentId, classId }: { studentId: number; classId: number }) => 
      deleteEnrollmentByStudentAndClass(studentId, classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES });
      toast.success('学员退班成功');
    },
    onError: (error: Error) => {
      toast.error(`退班失败: ${error.message}`);
    },
  });
};