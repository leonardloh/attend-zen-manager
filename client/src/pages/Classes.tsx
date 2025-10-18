
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, Users, MapPin, Calendar, TrendingUp, BarChart, Eye, Edit, BookOpen, Hash, Archive, ArchiveRestore } from 'lucide-react';
import ClassForm from '@/components/Classes/ClassForm';
import ClassDetailsView from '@/components/Classes/ClassDetailsView';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useArchiveClass, useUnarchiveClass } from '@/hooks/useDatabase';
import { getStudentById, type ClassInfo } from '@/data/types';

const Classes: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const { toast } = useToast();
  
  const { 
    classes, 
    addClass, 
    updateClass, 
    isLoadingClasses, 
    classesError 
  } = useDatabase();
  
  const archiveClassMutation = useArchiveClass();
  const unarchiveClassMutation = useUnarchiveClass();

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

  const handleAddClass = async (classData: Omit<ClassInfo, 'id' | 'status'>) => {
    try {
      await addClass(classData);
      setIsDialogOpen(false);

      toast({
        title: '班级创建成功',
        description: `${classData.name} 已成功创建。`,
      });
    } catch (error) {
      console.error('Failed to create class:', error);
      toast({
        title: '班级创建失败',
        description: error instanceof Error ? error.message : '请填写完整的班级信息后再试一次。',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleViewClass = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setIsViewDialogOpen(true);
  };

  const handleEditClass = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClass = async (updatedData: Omit<ClassInfo, 'id' | 'status'>) => {
    if (!selectedClass) return;
    
    const updatedClass: ClassInfo = {
      ...updatedData,
      id: selectedClass.id,
      status: selectedClass.status
    };
    try {
      await updateClass(updatedClass);
      setIsEditDialogOpen(false);
      setSelectedClass(null);

      toast({
        title: '班级更新成功',
        description: `${updatedData.name} 的信息已更新。`,
      });
    } catch (error) {
      console.error('Failed to update class:', error);
      toast({
        title: '班级更新失败',
        description: error instanceof Error ? error.message : '请填写完整的班级信息后再试一次。',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleArchiveClass = (classInfo: ClassInfo) => {
    archiveClassMutation.mutate(Number(classInfo.id), {
      onSuccess: () => {
        toast({
          title: '班级已归档',
          description: `${classInfo.name} 已成功归档。`,
        });
      },
      onError: (error) => {
        console.error('Failed to archive class:', error);
        toast({
          title: '归档失败',
          description: error instanceof Error ? error.message : '无法归档班级',
          variant: 'destructive',
        });
      }
    });
  };

  const handleUnarchiveClass = (classInfo: ClassInfo) => {
    unarchiveClassMutation.mutate(Number(classInfo.id), {
      onSuccess: () => {
        toast({
          title: '班级已恢复',
          description: `${classInfo.name} 已成功恢复。`,
        });
      },
      onError: (error) => {
        console.error('Failed to unarchive class:', error);
        toast({
          title: '恢复失败',
          description: error instanceof Error ? error.message : '无法恢复班级',
          variant: 'destructive',
        });
      }
    });
  };

  // Handle loading and error states
  if (isLoadingClasses) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">加载班级数据中...</span>
        </div>
      </div>
    );
  }

  if (classesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-2">加载班级数据失败</p>
            <p className="text-sm text-gray-600">{classesError.message}</p>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="text-sm text-gray-600">总学员数</div>
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
                <Badge className={getRegionColor(classInfo.region)}>
                  {classInfo.region}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{classInfo.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>开课日期: {classInfo.class_start_date ? classInfo.class_start_date : '未设置'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{classInfo.student_count} 学员</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>班长: {classInfo.class_monitor_name || '未分配'}</span>
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
                    data-testid={`button-view-class-${classInfo.id}`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    查看详情
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditClass(classInfo)}
                    data-testid={`button-edit-class-${classInfo.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-orange-600 hover:text-orange-700 hover:border-orange-300"
                    onClick={() => handleArchiveClass(classInfo)}
                    data-testid={`button-archive-class-${classInfo.id}`}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    归档
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

    </div>
  );
};

export default Classes;
