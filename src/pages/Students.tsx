import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentForm from '@/components/Students/StudentForm';
import { useToast } from '@/hooks/use-toast';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { useDatabase } from '@/contexts/DatabaseContext';
import { type Student } from '@/data/types';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'全部' | '活跃' | '旁听' | '保留'>('全部');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useHybridAuth();
  
  // Check if user can edit students (super_admin or cadre)
  const canEditStudents = user?.role === 'super_admin' || user?.role === 'cadre';
  
  // Use DatabaseContext for students data
  const { 
    students, 
    updateStudent, 
    addStudent, 
    deleteStudent, 
    isLoadingStudents, 
    studentsError,
    classes,
  } = useDatabase();

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const uniqueStates = Array.from(new Set(students.map(s => s.state).filter(Boolean))) as string[];

  // Map student_id -> class names where they are enrolled (from classes.mother_class_students)
  const classNameByStudentId = React.useMemo(() => {
    const m = new Map<string, string>();
    (classes || []).forEach((c: any) => {
      (c.mother_class_students || []).forEach((sid: string) => {
        if (m.has(sid)) m.set(sid, `${m.get(sid)}, ${c.name}`);
        else m.set(sid, c.name);
      });
    });
    return m;
  }, [classes]);

  const filteredStudents = students.filter(student => {
    // First apply search filter
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      student.chinese_name.includes(searchTerm) ||
      student.chinese_name.toLowerCase().includes(searchLower) ||
      student.english_name.toLowerCase().includes(searchLower) ||
      (classNameByStudentId.get(student.student_id) || '').toLowerCase().includes(searchLower) ||
      student.student_id.toLowerCase().includes(searchLower)
    );

    // Then apply status filter
    const matchesStatus = statusFilter === '全部' || student.status === statusFilter;

    const matchesState = stateFilter === 'all' || student.state === stateFilter;
    return matchesSearch && matchesStatus && matchesState;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '活跃': return 'bg-green-100 text-green-800';
      case '旁听': return 'bg-blue-100 text-blue-800';
      case '保留': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    const created = await addStudent(studentData);
    if (!created) {
      return false;
    }

    setIsAddDialogOpen(false);

    toast({
      title: '学生添加成功',
      description: `${studentData.chinese_name} 已成功添加到系统中。`
    });

    return true;
  };

  const handleEditStudent = async (studentData: Student) => {
    await updateStudent(studentData);
    setIsEditDialogOpen(false);
    setEditingStudent(null);
    
    toast({
      title: '学生信息更新成功',
      description: `${studentData.chinese_name} 的信息已成功更新。`
    });

    return true;
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

  // Handle loading and error states
  if (isLoadingStudents) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">加载学员数据中...</span>
        </div>
      </div>
      );
  }

  if (studentsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-2">加载学员数据失败</p>
            <p className="text-sm text-gray-600">{studentsError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedStudents = filteredStudents.slice(start, start + pageSize);

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

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
            <div className="flex gap-2 items-center flex-wrap">
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
              <Select value={stateFilter} onValueChange={(v) => setStateFilter(v)}>
                <SelectTrigger className="h-8 w-[160px]">
                  <SelectValue placeholder="按州属筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部州属</SelectItem>
                  {uniqueStates.map((st) => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>学号</TableHead>
                <TableHead>中文姓名</TableHead>
                <TableHead>英文姓名</TableHead>
                <TableHead>性别</TableHead>
                <TableHead>电话</TableHead>
                <TableHead>州属</TableHead>
                <TableHead>入学日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>母班</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">{student.student_id}</TableCell>
                  <TableCell className="font-medium">{student.chinese_name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.english_name}</TableCell>
                  <TableCell>{student.gender === 'male' ? '男' : '女'}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{student.state || '-'}</TableCell>
                  <TableCell>{student.enrollment_date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                  </TableCell>
                  <TableCell>{classNameByStudentId.get(student.student_id) || '-'}</TableCell>
                  <TableCell className="text-right">
                    {canEditStudents && (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(student)}>
                          <Edit className="h-4 w-4 mr-1" /> 编辑
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
                              <AlertDialogAction onClick={() => handleDeleteStudent(student.id)} className="bg-red-600 hover:bg-red-700">
                                确认删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {pagedStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                    无匹配的学员
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          显示 {filteredStudents.length === 0 ? 0 : start + 1}-{Math.min(start + pageSize, filteredStudents.length)} / 共 {filteredStudents.length}
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1); }}>
            <SelectTrigger className="h-8 w-[100px]"><SelectValue placeholder="每页" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="18">18</SelectItem>
            </SelectContent>
          </Select>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); goTo(page - 1); }} />
                </PaginationItem>
                {(() => {
                  const links: JSX.Element[] = [];
                  const add = (p: number, active = false) => links.push(
                    <PaginationItem key={p}>
                      <PaginationLink href="#" isActive={active} onClick={(e) => { e.preventDefault(); goTo(p); }}>{p}</PaginationLink>
                    </PaginationItem>
                  );
                  if (totalPages <= 7) {
                    for (let p = 1; p <= totalPages; p++) add(p, p === page);
                  } else {
                    add(1, page === 1);
                    if (page > 3) links.push(<PaginationEllipsis key="s" />);
                    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) add(p, p === page);
                    if (page < totalPages - 2) links.push(<PaginationEllipsis key="e" />);
                    add(totalPages, page === totalPages);
                  }
                  return links;
                })()}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); goTo(page + 1); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
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
