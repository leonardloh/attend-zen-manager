import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, User } from 'lucide-react';
import StudentForm from '@/components/Students/StudentForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Student {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  phone: string;
  email?: string;
  class_name: string;
  enrollment_date: string;
  status: '活跃' | '旁听' | '保留';
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

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'全部' | '活跃' | '旁听' | '保留'>('全部');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if user can edit students (super_admin or cadre)
  const canEditStudents = user?.role === 'super_admin' || user?.role === 'cadre';
  
  // Mock data
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      student_id: 'S2024001',
      chinese_name: '王小明',
      english_name: 'Wang Xiaoming',
      gender: 'male',
      phone: '13800138001',
      email: 'wang.xiaoming@example.com',
      class_name: '初级班A',
      enrollment_date: '2024-01-15',
      status: '活跃',
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
      class_name: '中级班B',
      enrollment_date: '2024-02-01',
      status: '旁听',
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
      class_name: '高级班C',
      enrollment_date: '2024-01-20',
      status: '活跃',
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
      class_name: '初级班A',
      enrollment_date: '2024-03-01',
      status: '保留',
      postal_code: '100004',
      date_of_birth: '1990-03-25',
      emergency_contact_name: '李大四',
      emergency_contact_phone: '13900139004',
      emergency_contact_relation: 'Sibling'
    }
  ]);

  const filteredStudents = students.filter(student => {
    // First apply search filter
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      student.chinese_name.includes(searchTerm) ||
      student.chinese_name.toLowerCase().includes(searchLower) ||
      student.english_name.toLowerCase().includes(searchLower) ||
      student.class_name.includes(searchTerm) ||
      student.class_name.toLowerCase().includes(searchLower) ||
      student.student_id.toLowerCase().includes(searchLower)
    );

    // Then apply status filter
    const matchesStatus = statusFilter === '全部' || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '活跃': return 'bg-green-100 text-green-800';
      case '旁听': return 'bg-blue-100 text-blue-800';
      case '保留': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString()
    };
    
    setStudents(prev => [...prev, newStudent]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "学生添加成功",
      description: `${studentData.chinese_name} 已成功添加到系统中。`
    });
  };

  const handleEditStudent = (studentData: Student) => {
    setStudents(prev => prev.map(student => 
      student.id === studentData.id ? studentData : student
    ));
    setIsEditDialogOpen(false);
    setEditingStudent(null);
    
    toast({
      title: "学生信息更新成功",
      description: `${studentData.chinese_name} 的信息已成功更新。`
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setStudents(prev => prev.filter(s => s.id !== studentId));
    
    toast({
      title: "学生删除成功",
      description: `${student.chinese_name} 已从系统中删除。`
    });
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学员管理</h1>
          <p className="text-gray-600">Student Management</p>
        </div>
        {canEditStudents && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                添加学员
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加新学员</DialogTitle>
              </DialogHeader>
              <StudentForm
                onSubmit={handleAddStudent}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索学员姓名、学号或班级..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={statusFilter === '全部' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('全部')}
              >
                全部
              </Button>
              <Button 
                variant={statusFilter === '活跃' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('活跃')}
              >
                活跃
              </Button>
              <Button 
                variant={statusFilter === '旁听' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('旁听')}
              >
                旁听
              </Button>
              <Button 
                variant={statusFilter === '保留' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('保留')}
              >
                保留
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.chinese_name}</h3>
                    <p className="text-sm text-gray-600">{student.english_name}</p>
                    <p className="text-xs text-gray-500">{student.student_id}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">所在班级:</span>
                  <span className="font-medium">{student.class_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">性别:</span>
                  <span className="font-medium">{student.gender === 'male' ? '男' : '女'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">入学日期:</span>
                  <span className="font-medium">{student.enrollment_date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">电话:</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">邮编:</span>
                  <span className="font-medium">{student.postal_code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">出生日期:</span>
                  <span className="font-medium">{student.date_of_birth}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">紧急联系人:</span>
                  <span className="font-medium">{student.emergency_contact_name}</span>
                </div>
                {student.occupation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">职业:</span>
                    <span className="font-medium">{student.occupation}</span>
                  </div>
                )}
              </div>
              
              {canEditStudents && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(student)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除学员</AlertDialogTitle>
                        <AlertDialogDescription>
                          您确定要删除学员 <strong>{student.chinese_name}</strong> 吗？此操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteStudent(student.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑学员信息</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <StudentForm
              initialData={editingStudent}
              onSubmit={handleEditStudent}
              onCancel={closeEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-sm text-gray-600">总学员数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.status === '活跃').length}
            </div>
            <div className="text-sm text-gray-600">活跃学员</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {students.filter(s => s.status === '旁听').length}
            </div>
            <div className="text-sm text-gray-600">旁听学员</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {students.filter(s => s.status === '保留').length}
            </div>
            <div className="text-sm text-gray-600">保留学员</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Students;
