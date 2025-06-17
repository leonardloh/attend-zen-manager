
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, Users, MapPin, Calendar, TrendingUp, BarChart, Eye, Edit, BookOpen, Hash, Trash2 } from 'lucide-react';
import ClassForm from '@/components/Classes/ClassForm';
import ClassDetailsView from '@/components/Classes/ClassDetailsView';
import DeleteClassDialog from '@/components/Classes/DeleteClassDialog';
import { useToast } from '@/hooks/use-toast';

interface ClassInfo {
  id: string;
  name: string;
  region: '北马' | '中马' | '南马';
  time: string;
  student_count: number;
  class_monitor_id: string;
  class_monitor: string;
  deputy_monitors?: string[];
  care_officers?: string[];
  learning_progress: string;
  page_number: string;
  line_number: string;
  attendance_rate: number;
  status: 'active' | 'inactive';
}

const Classes: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassInfo | null>(null);
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassInfo[]>([
    {
      id: '1',
      name: '初级班A',
      region: '北马',
      time: '周一 09:00-11:00',
      student_count: 25,
      class_monitor: '王小明',
      learning_progress: '已完成基础语法，正在学习日常对话',
      page_number: '第15页',
      line_number: '第8行',
      attendance_rate: 85,
      status: 'active'
    },
    {
      id: '2',
      name: '中级班B',
      region: '中马',
      time: '周三 14:00-16:00',
      student_count: 22,
      class_monitor: '李小红',
      learning_progress: '已完成中级语法，正在学习商务对话',
      page_number: '第32页',
      line_number: '第12行',
      attendance_rate: 92,
      status: 'active'
    },
    {
      id: '3',
      name: '高级班C',
      region: '南马',
      time: '周五 19:00-21:00',
      student_count: 18,
      class_monitor: '张三',
      learning_progress: '已完成高级语法，正在准备考试',
      page_number: '第48页',
      line_number: '第6行',
      attendance_rate: 78,
      status: 'active'
    },
    {
      id: '4',
      name: '周末班D',
      region: '北马',
      time: '周六 10:00-12:00',
      student_count: 5,
      class_monitor: '李四',
      learning_progress: '刚开始基础学习',
      page_number: '第3页',
      line_number: '第15行',
      attendance_rate: 60,
      status: 'inactive'
    }
  ]);

  const getRegionColor = (region: string) => {
    switch (region) {
      case '北马':
        return 'bg-blue-100 text-blue-800';
      case '中马':
        return 'bg-green-100 text-green-800';
      case '南马':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAddClass = (classData: Omit<ClassInfo, 'id' | 'status'>) => {
    const newClass: ClassInfo = {
      ...classData,
      id: Date.now().toString(),
      status: 'active'
    };
    
    setClasses(prev => [...prev, newClass]);
    setIsDialogOpen(false);
    
    toast({
      title: "班级创建成功",
      description: `${classData.name} 已成功创建。`
    });
  };

  const handleViewClass = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setIsViewDialogOpen(true);
  };

  const handleEditClass = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClass = (updatedData: Omit<ClassInfo, 'id' | 'status'>) => {
    if (!selectedClass) return;
    
    const updatedClass: ClassInfo = {
      ...updatedData,
      id: selectedClass.id,
      status: selectedClass.status
    };
    
    setClasses(prev => prev.map(c => c.id === selectedClass.id ? updatedClass : c));
    setIsEditDialogOpen(false);
    setSelectedClass(null);
    
    toast({
      title: "班级更新成功",
      description: `${updatedData.name} 的信息已更新。`
    });
  };

  const handleDeleteClass = (classInfo: ClassInfo) => {
    setClassToDelete(classInfo);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (classId: string) => {
    const deletedClass = classes.find(c => c.id === classId);
    
    setClasses(prev => prev.filter(c => c.id !== classId));
    setClassToDelete(null);
    
    toast({
      title: "班级删除成功",
      description: `${deletedClass?.name} 已被永久删除。`,
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">班级管理</h1>
          <p className="text-gray-600">Class Management</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              创建班级
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建新班级</DialogTitle>
            </DialogHeader>
            <ClassForm
              onSubmit={handleAddClass}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
            <div className="text-sm text-gray-600">总班级数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {classes.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">活跃班级</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {classes.reduce((sum, c) => sum + c.student_count, 0)}
            </div>
            <div className="text-sm text-gray-600">总学生数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(classes.reduce((sum, c) => sum + c.attendance_rate, 0) / classes.length)}%
            </div>
            <div className="text-sm text-gray-600">平均出席率</div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classInfo) => (
          <Card key={classInfo.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{classInfo.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getRegionColor(classInfo.region)}>
                    {classInfo.region}
                  </Badge>
                  <Badge variant={classInfo.status === 'active' ? 'default' : 'secondary'}>
                    {classInfo.status === 'active' ? '活跃' : '暂停'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{classInfo.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{classInfo.student_count} 学生</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>班长: {classInfo.class_monitor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart className="h-4 w-4 text-gray-500" />
                  <span className={getAttendanceColor(classInfo.attendance_rate)}>
                    出席率: {classInfo.attendance_rate}%
                  </span>
                </div>
                
                {/* Learning Progress */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">学习进度</span>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {classInfo.learning_progress}
                  </p>
                </div>

                {/* 广论进度 */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">广论进度</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-gray-500" />
                        <span>{classInfo.page_number}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-gray-500" />
                        <span>{classInfo.line_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Attendance Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>出席率</span>
                    <span className={getAttendanceColor(classInfo.attendance_rate)}>
                      {classInfo.attendance_rate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        classInfo.attendance_rate >= 90 ? 'bg-green-600' :
                        classInfo.attendance_rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${classInfo.attendance_rate}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewClass(classInfo)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    查看详情
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditClass(classInfo)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                    onClick={() => handleDeleteClass(classInfo)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>班级详情</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <ClassDetailsView 
              classInfo={selectedClass} 
              onClose={() => setIsViewDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑班级</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <ClassForm
              initialData={selectedClass}
              onSubmit={handleUpdateClass}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteClassDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        classToDelete={classToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Classes;
