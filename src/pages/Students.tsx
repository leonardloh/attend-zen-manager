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
import { useData } from '@/contexts/DataContext';
import { type Student } from '@/data/mockData';

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
  
  // Use DataContext for students data
  const { students, updateStudent, addStudent, deleteStudent } = useData();

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
    addStudent(studentData);
    setIsAddDialogOpen(false);
    
    toast({
      title: "学生添加成功",
      description: `${studentData.chinese_name} 已成功添加到系统中。`
    });
  };

  const handleEditStudent = (studentData: Student) => {
    updateStudent(studentData);
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

    deleteStudent(studentId);
    
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
