// Centralized Mock Data Store
// This file contains all mock data used throughout the application

// Student Interface
export interface Student {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  phone: string;
  email?: string;
  enrollment_date: string;
  status: '活跃' | '旁听' | '保留';
  // Mother class information
  mother_class_id?: string; // Reference to the class that this student primarily belongs to
  mother_class_name?: string; // Display name of mother class
  // Required fields
  postal_code: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  // Optional fields
  occupation?: string;
  academic_level?: 'Bachelor' | 'Master' | 'PhD' | 'Other';
  marriage_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
}

// Class Interface
export interface ClassInfo {
  id: string;
  name: string;
  sub_branch_id?: string; // Reference to SubBranch
  sub_branch_name?: string; // SubBranch name for display
  time: string;
  student_count: number;
  // Cadre roles (single references)
  class_monitor_id: string; // Primary class monitor
  class_monitor: string; // Display name
  deputy_monitors?: string[]; // Array of student IDs
  care_officers?: string[]; // Array of student IDs
  // Student management
  mother_class_students?: string[]; // Students who have this as their mother class
  regular_students?: string[]; // Other students who attend this class regularly
  learning_progress: string;
  page_number: string;
  line_number: string;
  attendance_rate: number;
  status: 'active' | 'inactive';
}

// Cadre Role Interface (for multiple roles support)
export interface CadreRole {
  class_id: string;
  class_name: string;
  role: '班长' | '副班长' | '关怀员';
  appointment_date: string; // When this specific role was appointed
}

// Cadre Interface (restructured for multiple roles)
export interface Cadre {
  id: string;
  student_id: string; // Reference to Student
  chinese_name: string; // Auto-populated from student
  english_name: string; // Auto-populated from student
  phone: string; // Auto-populated from student
  email?: string; // Auto-populated from student
  roles: CadreRole[]; // Multiple roles this cadre holds
  support_classes?: string[]; // Classes this cadre supports
  can_take_attendance: boolean; // Can take attendance for classes
  can_register_students: boolean; // Can register students for classes
  status: '活跃' | '暂停';
  created_date: string; // When the cadre record was first created
}

// Main Branch Interface
export interface MainBranch {
  id: string;
  name: string;
  region: '北马' | '中马' | '南马';
  address: string;
  student_id?: string; // Reference to the student who is the contact person
  contact_person: string;
  contact_phone: string;
  sub_branches_count: number;
  classes_count: number;
  students_count: number;
}

// Sub Branch Interface  
export interface SubBranch {
  id: string;
  name: string;
  main_branch_id: string;
  main_branch_name: string;
  state: string; // State/州属 like "雪兰莪州", "槟城州", etc.
  address: string;
  student_id?: string; // Reference to the student who is the contact person
  contact_person: string;
  contact_phone: string;
  email?: string;
  established_date: string;
  status: 'active' | 'inactive';
  classes_count: number;
  students_count: number;
}

// =============================================================================
// MOCK DATA
// =============================================================================

// Mock Students Data
export const mockStudents: Student[] = [
  {
    id: '1',
    student_id: 'S2024001',
    chinese_name: '王小明',
    english_name: 'Wang Xiaoming',
    gender: 'male',
    phone: '13800138001',
    email: 'wang.xiaoming@example.com',
    enrollment_date: '2024-01-15',
    status: '活跃',
    mother_class_id: '1', // 初级班A
    mother_class_name: '初级班A',
    postal_code: '100001',
    date_of_birth: '1995-05-15',
    emergency_contact_name: '王大明',
    emergency_contact_phone: '13900139001',
    emergency_contact_relation: 'Parent',
    occupation: '软件工程师',
    academic_level: 'Bachelor',
    marriage_status: 'Single'
  },
  {
    id: '2',
    student_id: 'S2024002',
    chinese_name: '李小红',
    english_name: 'Li Xiaohong',
    gender: 'female',
    phone: '13800138002',
    email: 'li.xiaohong@example.com',
    enrollment_date: '2024-02-01',
    status: '旁听',
    mother_class_id: '2', // 中级班B
    mother_class_name: '中级班B',
    postal_code: '100002',
    date_of_birth: '1992-08-22',
    emergency_contact_name: '李大红',
    emergency_contact_phone: '13900139002',
    emergency_contact_relation: 'Spouse',
    occupation: '设计师',
    academic_level: 'Master',
    marriage_status: 'Married'
  },
  {
    id: '3',
    student_id: 'S2024003',
    chinese_name: '张三',
    english_name: 'Zhang San',
    gender: 'male',
    phone: '13800138003',
    email: 'zhang.san@example.com',
    enrollment_date: '2024-01-20',
    status: '活跃',
    mother_class_id: '3', // 高级班C
    mother_class_name: '高级班C',
    postal_code: '100003',
    date_of_birth: '1988-12-10',
    emergency_contact_name: '张大三',
    emergency_contact_phone: '13900139003',
    emergency_contact_relation: 'Parent',
    occupation: '教师',
    academic_level: 'PhD',
    marriage_status: 'Married'
  },
  {
    id: '4',
    student_id: 'S2024004',
    chinese_name: '李四',
    english_name: 'Li Si',
    gender: 'female',
    phone: '13800138004',
    email: 'li.si@example.com',
    enrollment_date: '2024-03-01',
    status: '保留',
    postal_code: '100004',
    date_of_birth: '1990-03-25',
    emergency_contact_name: '李大四',
    emergency_contact_phone: '13900139004',
    emergency_contact_relation: 'Sibling'
  },
  {
    id: '5',
    student_id: 'S2024005',
    chinese_name: '王五',
    english_name: 'Wang Wu',
    gender: 'male',
    phone: '13800138005',
    email: 'wang.wu@example.com',
    enrollment_date: '2024-01-10',
    status: '活跃',
    postal_code: '100005',
    date_of_birth: '1993-07-18',
    emergency_contact_name: '王大五',
    emergency_contact_phone: '13900139005',
    emergency_contact_relation: 'Parent',
    occupation: '会计师',
    academic_level: 'Bachelor',
    marriage_status: 'Single'
  },
  {
    id: '6',
    student_id: 'S2024006',
    chinese_name: '赵六',
    english_name: 'Zhao Liu',
    gender: 'female',
    phone: '13800138006',
    email: 'zhao.liu@example.com',
    enrollment_date: '2024-02-15',
    status: '活跃',
    postal_code: '100006',
    date_of_birth: '1991-11-05',
    emergency_contact_name: '赵大六',
    emergency_contact_phone: '13900139006',
    emergency_contact_relation: 'Spouse',
    occupation: '护士',
    academic_level: 'Bachelor',
    marriage_status: 'Married'
  },
  {
    id: '7',
    student_id: 'S2024007',
    chinese_name: '钱七',
    english_name: 'Qian Qi',
    gender: 'male',
    phone: '13800138007',
    email: 'qian.qi@example.com',
    enrollment_date: '2024-01-25',
    status: '活跃',
    postal_code: '100007',
    date_of_birth: '1994-04-12',
    emergency_contact_name: '钱大七',
    emergency_contact_phone: '13900139007',
    emergency_contact_relation: 'Parent',
    occupation: '销售员',
    academic_level: 'Other',
    marriage_status: 'Single'
  },
  {
    id: '8',
    student_id: 'S2024008',
    chinese_name: '孙八',
    english_name: 'Sun Ba',
    gender: 'female',
    phone: '13800138008',
    email: 'sun.ba@example.com',
    enrollment_date: '2024-03-10',
    status: '旁听',
    postal_code: '100008',
    date_of_birth: '1989-09-28',
    emergency_contact_name: '孙大八',
    emergency_contact_phone: '13900139008',
    emergency_contact_relation: 'Sibling',
    occupation: '医生',
    academic_level: 'PhD',
    marriage_status: 'Married'
  },
  {
    id: '9',
    student_id: 'S2024009',
    chinese_name: '周九',
    english_name: 'Zhou Jiu',
    gender: 'male',
    phone: '13800138009',
    email: 'zhou.jiu@example.com',
    enrollment_date: '2024-02-20',
    status: '活跃',
    postal_code: '100009',
    date_of_birth: '1992-06-14',
    emergency_contact_name: '周大九',
    emergency_contact_phone: '13900139009',
    emergency_contact_relation: 'Parent',
    occupation: '律师',
    academic_level: 'Master',
    marriage_status: 'Single'
  },
  {
    id: '10',
    student_id: 'S2024010',
    chinese_name: '吴十',
    english_name: 'Wu Shi',
    gender: 'female',
    phone: '13800138010',
    email: 'wu.shi@example.com',
    enrollment_date: '2024-01-30',
    status: '活跃',
    postal_code: '100010',
    date_of_birth: '1990-12-03',
    emergency_contact_name: '吴大十',
    emergency_contact_phone: '13900139010',
    emergency_contact_relation: 'Spouse',
    occupation: '工程师',
    academic_level: 'Master',
    marriage_status: 'Married'
  },
  {
    id: '11',
    student_id: 'S2024011',
    chinese_name: '郑十一',
    english_name: 'Zheng Shiyi',
    gender: 'male',
    phone: '13800138011',
    email: 'zheng.shiyi@example.com',
    enrollment_date: '2024-02-05',
    status: '活跃',
    postal_code: '100011',
    date_of_birth: '1987-08-19',
    emergency_contact_name: '郑大十一',
    emergency_contact_phone: '13900139011',
    emergency_contact_relation: 'Parent',
    occupation: '建筑师',
    academic_level: 'Master',
    marriage_status: 'Married'
  },
  {
    id: '12',
    student_id: 'S2024012',
    chinese_name: '王十二',
    english_name: 'Wang Shier',
    gender: 'female',
    phone: '13800138012',
    email: 'wang.shier@example.com',
    enrollment_date: '2024-01-18',
    status: '旁听',
    postal_code: '100012',
    date_of_birth: '1993-03-07',
    emergency_contact_name: '王大十二',
    emergency_contact_phone: '13900139012',
    emergency_contact_relation: 'Sibling',
    occupation: '翻译员',
    academic_level: 'Bachelor',
    marriage_status: 'Single'
  },
  {
    id: '13',
    student_id: 'S2024013',
    chinese_name: '李十三',
    english_name: 'Li Shisan',
    gender: 'male',
    phone: '13800138013',
    email: 'li.shisan@example.com',
    enrollment_date: '2024-02-12',
    status: '活跃',
    postal_code: '100013',
    date_of_birth: '1991-10-25',
    emergency_contact_name: '李大十三',
    emergency_contact_phone: '13900139013',
    emergency_contact_relation: 'Parent',
    occupation: '记者',
    academic_level: 'Bachelor',
    marriage_status: 'Single'
  },
  {
    id: '14',
    student_id: 'S2024014',
    chinese_name: '张十四',
    english_name: 'Zhang Shisi',
    gender: 'female',
    phone: '13800138014',
    email: 'zhang.shisi@example.com',
    enrollment_date: '2024-03-05',
    status: '活跃',
    postal_code: '100014',
    date_of_birth: '1988-01-16',
    emergency_contact_name: '张大十四',
    emergency_contact_phone: '13900139014',
    emergency_contact_relation: 'Spouse',
    occupation: '心理咨询师',
    academic_level: 'Master',
    marriage_status: 'Married'
  },
  {
    id: '15',
    student_id: 'S2024015',
    chinese_name: '刘十五',
    english_name: 'Liu Shiwu',
    gender: 'male',
    phone: '13800138015',
    email: 'liu.shiwu@example.com',
    enrollment_date: '2024-01-08',
    status: '活跃',
    postal_code: '100015',
    date_of_birth: '1985-05-30',
    emergency_contact_name: '刘大十五',
    emergency_contact_phone: '13900139015',
    emergency_contact_relation: 'Parent',
    occupation: '大学教授',
    academic_level: 'PhD',
    marriage_status: 'Married'
  },
  // 添加罗净智作为示例 - 多职位干部
  {
    id: '16',
    student_id: 'TEST001',
    chinese_name: '罗净智',
    english_name: 'Loh Jing Zhi',
    gender: 'male',
    phone: '0195995846',
    email: 'jinzhi@example.com',
    enrollment_date: '2018-09-01',
    status: '活跃',
    mother_class_id: 'pgy18003', // PGY18003班 (需要在classes中创建)
    mother_class_name: 'PGY18003',
    postal_code: '11400',
    date_of_birth: '1993-07-09',
    emergency_contact_name: 'Ong Poh Siew',
    emergency_contact_phone: '0195995846',
    emergency_contact_relation: 'Parent',
    occupation: '软件工程师'
  }
];

// Mock Classes Data
export const mockClasses: ClassInfo[] = [
  {
    id: '1',
    name: '初级班A',
    sub_branch_id: '3',
    sub_branch_name: '大山脚分苑',
    time: '周一 09:00-11:00',
    student_count: 8,
    class_monitor_id: 'S2024001',
    class_monitor: '王小明',
    student_ids: ['S2024004', 'S2024005', 'S2024006', 'S2024007', 'S2024008'],
    deputy_monitors: ['S2024005'],
    care_officers: ['S2024006', 'S2024007'],
    learning_progress: '已完成基础语法，正在学习日常对话',
    page_number: '第15页',
    line_number: '第8行',
    attendance_rate: 85,
    status: 'active'
  },
  {
    id: '2',
    name: '中级班B',
    sub_branch_id: '2',
    sub_branch_name: '八打灵再也分苑',
    time: '周三 14:00-16:00',
    student_count: 7,
    class_monitor_id: 'S2024002',
    class_monitor: '李小红',
    student_ids: ['S2024009', 'S2024010', 'S2024011', 'S2024012', 'S2024013', 'S2024014'],
    deputy_monitors: ['S2024010'],
    care_officers: ['S2024011'],
    learning_progress: '已完成中级语法，正在学习商务对话',
    page_number: '第32页',
    line_number: '第12行',
    attendance_rate: 92,
    status: 'active'
  },
  {
    id: '3',
    name: '高级班C',
    sub_branch_id: '4',
    sub_branch_name: '新山分苑',
    time: '周五 19:00-21:00',
    student_count: 2,
    class_monitor_id: 'S2024003',
    class_monitor: '张三',
    student_ids: ['S2024015'],
    deputy_monitors: [],
    care_officers: [],
    learning_progress: '已完成高级语法，正在准备考试',
    page_number: '第48页',
    line_number: '第6行',
    attendance_rate: 78,
    status: 'active'
  },
  {
    id: '4',
    name: '周末班D',
    sub_branch_id: '3',
    sub_branch_name: '大山脚分苑',
    time: '周六 10:00-12:00',
    student_count: 1,
    class_monitor_id: 'S2024006',
    class_monitor: '赵六',
    student_ids: [],
    deputy_monitors: [],
    care_officers: [],
    learning_progress: '刚开始基础学习',
    page_number: '第3页',
    line_number: '第15行',
    attendance_rate: 60,
    status: 'inactive'
  },
  // 添加罗净智的母班
  {
    id: 'pgy18003',
    name: 'PGY18003',
    sub_branch_id: '3',
    sub_branch_name: '大山脚分苑',
    time: '周三 19:30-21:30',
    student_count: 1,
    class_monitor_id: 'TEST001',
    class_monitor: '罗净智',
    mother_class_students: ['TEST001'], // 罗净智的母班
    learning_progress: '广论第二轮学习',
    page_number: '第156页',
    line_number: '第8行',
    attendance_rate: 95,
    status: 'active'
  },
  // 添加新班级 PGY25001
  {
    id: 'pgy25001',
    name: 'PGY25001',
    sub_branch_id: '3',
    sub_branch_name: '大山脚分苑',
    time: '周五 20:00-22:00',
    student_count: 15,
    class_monitor_id: 'S2024002', // 其他人当班长
    class_monitor: '李小红',
    care_officers: ['TEST001'], // 罗净智当关怀员
    regular_students: ['S2024004', 'S2024005', 'S2024006'], // 其他学员
    learning_progress: '广论第一轮学习',
    page_number: '第25页',
    line_number: '第3行',
    attendance_rate: 88,
    status: 'active'
  }
];

// Mock Cadres Data
export const mockCadres: Cadre[] = [
  {
    id: '1',
    student_id: 'S2024001',
    chinese_name: '王小明',
    english_name: 'Wang Xiaoming',
    phone: '13800138001',
    email: 'wang.xiaoming@example.com',
    roles: [
      {
        class_id: '1',
        class_name: '初级班A',
        role: '班长',
        appointment_date: '2024-01-15'
      }
    ],
    support_classes: [],
    can_take_attendance: true,
    can_register_students: true,
    status: '活跃',
    created_date: '2024-01-15'
  },
  {
    id: '2',
    student_id: 'S2024002',
    chinese_name: '李小红',
    english_name: 'Li Xiaohong',
    phone: '13800138002',
    email: 'li.xiaohong@example.com',
    roles: [
      {
        class_id: '2',
        class_name: '中级班B',
        role: '班长',
        appointment_date: '2024-02-01'
      }
    ],
    support_classes: ['初级班A'],
    can_take_attendance: true,
    can_register_students: true,
    status: '活跃',
    created_date: '2024-02-01'
  },
  {
    id: '3',
    student_id: 'S2024003',
    chinese_name: '张三',
    english_name: 'Zhang San',
    phone: '13800138003',
    email: 'zhang.san@example.com',
    roles: [
      {
        class_id: '3',
        class_name: '高级班C',
        role: '班长',
        appointment_date: '2024-01-20'
      }
    ],
    support_classes: ['中级班B'],
    can_take_attendance: true,
    can_register_students: true,
    status: '活跃',
    created_date: '2024-01-20'
  },
  {
    id: '4',
    student_id: 'S2024005',
    chinese_name: '王五',
    english_name: 'Wang Wu',
    phone: '13800138005',
    email: 'wang.wu@example.com',
    roles: [
      {
        class_id: '1',
        class_name: '初级班A',
        role: '副班长',
        appointment_date: '2024-01-20'
      }
    ],
    support_classes: [],
    can_take_attendance: true,
    can_register_students: true,
    status: '活跃',
    created_date: '2024-01-20'
  },
  {
    id: '5',
    student_id: 'S2024006',
    chinese_name: '赵六',
    english_name: 'Zhao Liu',
    phone: '13800138006',
    email: 'zhao.liu@example.com',
    roles: [
      {
        class_id: '1',
        class_name: '初级班A',
        role: '关怀员',
        appointment_date: '2024-02-15'
      }
    ],
    support_classes: [],
    can_take_attendance: true,
    can_register_students: true,
    status: '活跃',
    created_date: '2024-02-15'
  },
  {
    id: '6',
    student_id: 'S2024010',
    chinese_name: '吴十',
    english_name: 'Wu Shi',
    phone: '13800138010',
    email: 'wu.shi@example.com',
    roles: [
      {
        class_id: '2',
        class_name: '中级班B',
        role: '副班长',
        appointment_date: '2024-02-01'
      }
    ],
    support_classes: [],
    can_take_attendance: true,
    can_register_students: true,
    status: '活跃',
    created_date: '2024-02-01'
  }
];

// Mock Main Branches Data
export const mockMainBranches: MainBranch[] = [
  {
    id: '1',
    name: '中马总院',
    region: '中马',
    address: '吉隆坡市中心某某路123号',
    student_id: 'S2024001', // 陈主任 -> 王小明
    contact_person: '王小明',
    contact_phone: '13800138001',
    sub_branches_count: 3,
    classes_count: 8,
    students_count: 120
  },
  {
    id: '2',
    name: '北马总院',
    region: '北马',
    address: '槟城州乔治市某某街456号',
    student_id: 'S2024002', // 林主任 -> 李小红
    contact_person: '李小红',
    contact_phone: '13800138002',
    sub_branches_count: 2,
    classes_count: 6,
    students_count: 85
  },
  {
    id: '3',
    name: '南马总院',
    region: '南马',
    address: '柔佛州新山市某某大道789号',
    student_id: 'S2024003', // 黄主任 -> 张三
    contact_person: '张三',
    contact_phone: '13800138003',
    sub_branches_count: 1,
    classes_count: 4,
    students_count: 60
  }
];

// Mock Sub Branches Data
export const mockSubBranches: SubBranch[] = [
  {
    id: '1',
    name: '蒲种分苑',
    main_branch_id: '1',
    main_branch_name: '吉隆坡主分苑',
    state: '雪兰莪州',
    address: '雪兰莪州蒲种某某花园101号',
    student_id: 'S2024005', // 张老师 -> 王五
    contact_person: '王五',
    contact_phone: '13800138005',
    email: 'puchong@lamrim.org.my',
    established_date: '2020-08-15',
    status: 'active',
    classes_count: 3,
    students_count: 45
  },
  {
    id: '2',
    name: '八打灵再也分苑',
    main_branch_id: '1',
    main_branch_name: '吉隆坡主分苑',
    state: '雪兰莪州',
    address: '雪兰莪州八打灵再也某某路202号',
    student_id: 'S2024006', // 王老师 -> 赵六
    contact_person: '赵六',
    contact_phone: '13800138006',
    email: 'pj@lamrim.org.my',
    established_date: '2020-11-20',
    status: 'active',
    classes_count: 2,
    students_count: 30
  },
  {
    id: '3',
    name: '大山脚分苑',
    main_branch_id: '2',
    main_branch_name: '槟城主分苑',
    state: '槟城州',
    address: '槟城州大山脚某某镇303号',
    student_id: 'S2024007', // 李老师 -> 钱七
    contact_person: '钱七',
    contact_phone: '13800138007',
    email: 'bsk@lamrim.org.my',
    established_date: '2021-01-10',
    status: 'active',
    classes_count: 2,
    students_count: 25
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Get student by ID
export const getStudentById = (studentId: string): Student | undefined => {
  return mockStudents.find(student => student.student_id === studentId);
};

// Get students by IDs
export const getStudentsByIds = (studentIds: string[]): Student[] => {
  return studentIds
    .map(id => getStudentById(id))
    .filter(Boolean) as Student[];
};

// Get class by ID
export const getClassById = (classId: string): ClassInfo | undefined => {
  return mockClasses.find(cls => cls.id === classId);
};

// Get all students in a class (including monitor and regular students)
export const getClassStudents = (classId: string): Student[] => {
  const classData = getClassById(classId);
  if (!classData) return [];
  
  const allStudentIds = [
    classData.class_monitor_id,
    ...(classData.deputy_monitors || []),
    ...(classData.care_officers || []),
    ...(classData.student_ids || [])
  ];
  
  // Remove duplicates and get student objects
  const uniqueIds = [...new Set(allStudentIds)];
  return getStudentsByIds(uniqueIds);
};

// Get cadre by student ID
export const getCadreByStudentId = (studentId: string): Cadre | undefined => {
  return mockCadres.find(cadre => cadre.student_id === studentId);
};

// Get classes by sub-branch
export const getClassesBySubBranch = (subBranchId: string): ClassInfo[] => {
  return mockClasses.filter(cls => cls.sub_branch_id === subBranchId);
};

// Get active classes
export const getActiveClasses = (): ClassInfo[] => {
  return mockClasses.filter(cls => cls.status === 'active');
};

// Get students by status
export const getStudentsByStatus = (status: '活跃' | '旁听' | '保留'): Student[] => {
  return mockStudents.filter(student => student.status === status);
};