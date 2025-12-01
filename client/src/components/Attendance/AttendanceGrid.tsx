
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { cn } from '@/lib/utils';
import AttendanceProgressForm from './AttendanceProgressForm';
import AttendanceHistoryCard from './AttendanceHistoryCard';
import { WeeklyAttendancePoint } from './types';

interface Student {
  id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
}

type AttendanceStatusValue = 'present' | 'online' | 'leave' | 'absent' | 'holiday';

interface AttendanceStatus {
  studentId: string;
  status: AttendanceStatusValue | null;
}

interface AttendanceProgressData {
  learning_progress: string;
  page_number: string;
  line_number: string;
}

interface AttendanceGridProps {
  classId?: string;
  classDate?: Date;
  onDataChange?: (attendanceData: AttendanceStatus[], progressData: AttendanceProgressData) => void;
  students?: Student[];
  isHoliday?: boolean;
  attendanceHistory?: WeeklyAttendancePoint[];
  isHistoryLoading?: boolean;
  historyError?: string | null;
  onReloadHistory?: () => void;
  onWeekClick?: (week: WeeklyAttendancePoint) => void;
  initialAttendanceData?: AttendanceStatus[];
  initialProgressData?: AttendanceProgressData;
}

const AttendanceGrid: React.FC<AttendanceGridProps> = ({
  classId,
  classDate,
  onDataChange,
  students: propStudents,
  isHoliday = false,
  attendanceHistory = [],
  isHistoryLoading = false,
  historyError = null,
  onReloadHistory,
  onWeekClick,
  initialAttendanceData = [],
  initialProgressData = {
    learning_progress: '',
    page_number: '',
    line_number: '',
  },
}) => {
  // Default mock students data - in a real app, this would be fetched based on classId
  const defaultStudents: Student[] = [
    { id: '1', chinese_name: '王小明', english_name: 'Wang Xiaoming', gender: 'male' },
    { id: '2', chinese_name: '李小红', english_name: 'Li Xiaohong', gender: 'female' },
    { id: '3', chinese_name: '张三', english_name: 'Zhang San', gender: 'male' },
    { id: '4', chinese_name: '李四', english_name: 'Li Si', gender: 'female' },
    { id: '5', chinese_name: '王五', english_name: 'Wang Wu', gender: 'male' },
    { id: '6', chinese_name: '赵六', english_name: 'Zhao Liu', gender: 'female' },
    { id: '7', chinese_name: '钱七', english_name: 'Qian Qi', gender: 'male' },
    { id: '8', chinese_name: '孙八', english_name: 'Sun Ba', gender: 'female' },
  ];
  
  // Use passed students or default to mock data
  const students = propStudents || defaultStudents;

  // Access class details to determine roles per student
  const { classes } = useDatabase();
  const currentClass = classes.find(c => c.id === (classId || ''));

  const getStudentRoles = (studentDbId: string): string[] => {
    const roles: string[] = [];
    if (!currentClass) return roles;
    if (currentClass.monitor_id && String(currentClass.monitor_id) === studentDbId) roles.push('班长');
    if ((currentClass.deputy_monitors || []).map(String).includes(studentDbId)) roles.push('副班长');
    if ((currentClass.care_officers || []).map(String).includes(studentDbId)) roles.push('关怀员');
    return roles;
  };

  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const previousAttendanceRef = useRef<AttendanceStatus[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Initialize attendance with prefilled data
  useEffect(() => {
    if (initialAttendanceData.length > 0) {
      console.log('🔄 AttendanceGrid: Applying prefilled data', initialAttendanceData);
      const statusById = new Map(initialAttendanceData.map(a => [a.studentId, a.status]));
      const updated = students.map(s => ({ studentId: s.id, status: statusById.get(s.id) ?? null }));
      setAttendance(updated);
      previousAttendanceRef.current = updated;
    } else {
      // Initialize with empty statuses
      const updated = students.map(s => ({ studentId: s.id, status: null as AttendanceStatusValue | null }));
      setAttendance(updated);
      previousAttendanceRef.current = updated;
    }
    setPage(1);
  }, [students, initialAttendanceData]);

  // Handle holiday toggles
  useEffect(() => {
    if (isHoliday) {
      const alreadyHoliday = attendance.every(item => item.status === 'holiday');
      if (!alreadyHoliday) {
        previousAttendanceRef.current = attendance;
        const holidayAttendance = attendance.map(item => ({ ...item, status: 'holiday' as AttendanceStatusValue }));
        setAttendance(holidayAttendance);
        onDataChange?.(holidayAttendance, progressData);
      }
    } else {
      const previous = previousAttendanceRef.current.length === students.length
        ? previousAttendanceRef.current
        : students.map(s => ({ studentId: s.id, status: null as AttendanceStatusValue | null }));
      const restored = previous.map(item => ({ ...item, status: item.status === 'holiday' ? null : item.status }));
      setAttendance(restored);
      onDataChange?.(restored, progressData);
      previousAttendanceRef.current = restored;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHoliday]);

  const [progressData, setProgressData] = useState<AttendanceProgressData>(initialProgressData);

  // Update progress data when initial data changes
  useEffect(() => {
    if (initialProgressData.learning_progress || initialProgressData.page_number || initialProgressData.line_number) {
      console.log('🔄 AttendanceGrid: Applying prefilled progress data', initialProgressData);
      setProgressData(initialProgressData);
    }
  }, [initialProgressData]);

  const statusConfig = {
    present: { label: '实体出席', color: 'bg-green-500 hover:bg-green-600 text-white' },
    online: { label: '线上出席', color: 'bg-blue-500 hover:bg-blue-600 text-white' },
    leave: { label: '请假', color: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
    absent: { label: '缺席', color: 'bg-red-500 hover:bg-red-600 text-white' },
  } as const;

  const updateAttendance = (studentId: string, status: AttendanceStatus['status']) => {
    const updatedAttendance = attendance.map(item => 
      item.studentId === studentId 
        ? { ...item, status: item.status === status ? null : status }
        : item
    );
    setAttendance(updatedAttendance);
    
    // Notify parent component of data changes
    if (onDataChange) {
      onDataChange(updatedAttendance, progressData);
    }
  };

  const markAllPresent = () => {
    if (isHoliday) return;
    const updatedAttendance = attendance.map(item => ({ ...item, status: 'present' as const }));
    setAttendance(updatedAttendance);
    
    // Notify parent component of data changes
    if (onDataChange) {
      onDataChange(updatedAttendance, progressData);
    }
  };

  const clearAll = () => {
    if (isHoliday) return;
    const updatedAttendance = attendance.map(item => ({ ...item, status: null }));
    setAttendance(updatedAttendance);
    
    // Notify parent component of data changes
    if (onDataChange) {
      onDataChange(updatedAttendance, progressData);
    }
  };

  const handleProgressDataChange = (data: AttendanceProgressData) => {
    setProgressData(data);
    
    // Notify parent component of data changes
    if (onDataChange) {
      onDataChange(attendance, data);
    }
  };

  const getStatusCounts = () => {
    const counts = { present: 0, online: 0, leave: 0, absent: 0, holiday: 0, unmarked: 0 };
    attendance.forEach(item => {
      if (item.status) {
        counts[item.status]++;
      } else {
        counts.unmarked++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedStudents = students.slice(start, start + pageSize);

  const goToPage = (p: number) => {
    const clamped = Math.min(Math.max(1, p), totalPages);
    setPage(clamped);
  };

  const renderPageLinks = () => {
    const items: JSX.Element[] = [];
    const addLink = (p: number, active = false) => {
      items.push(
        <PaginationItem key={p}>
          <PaginationLink isActive={active} href="#" onClick={(e) => { e.preventDefault(); goToPage(p); }}>
            {p}
          </PaginationLink>
        </PaginationItem>
      );
    };
    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) addLink(p, p === page);
    } else {
      addLink(1, page === 1);
      if (page > 3) {
        items.push(<PaginationEllipsis key="s-ellipsis" />);
      }
      const startMid = Math.max(2, page - 1);
      const endMid = Math.min(totalPages - 1, page + 1);
      for (let p = startMid; p <= endMid; p++) addLink(p, p === page);
      if (page < totalPages - 2) {
        items.push(<PaginationEllipsis key="e-ellipsis" />);
      }
      addLink(totalPages, page === totalPages);
    }
    return items;
  };

  return (
    <div className="space-y-6">
      {isHoliday && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4 text-sm text-orange-800">
            本次点名已标记为 <strong>放假</strong>，所有学员将记录为放假状态。若需恢复点名，请取消放假后重新标记。
          </CardContent>
        </Card>
      )}

      <AttendanceHistoryCard
        data={attendanceHistory}
        loading={isHistoryLoading}
        error={historyError}
        onRetry={onReloadHistory}
        onWeekClick={onWeekClick}
      />

      {/* Progress Form */}
      <AttendanceProgressForm
        classId={classId || ''}
        classDate={classDate}
        onDataChange={handleProgressDataChange}
      />

      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>点名统计 / Attendance Summary</span>
            <div className="flex gap-2">
              <Button onClick={markAllPresent} variant="outline" size="sm" disabled={isHoliday}>
                全部出席
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm" disabled={isHoliday}>
                <RotateCcw className="h-4 w-4 mr-1" />
                清空
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.present}</div>
              <div className="text-sm text-gray-600">实体出席</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.online}</div>
              <div className="text-sm text-gray-600">线上出席</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.leave}</div>
              <div className="text-sm text-gray-600">请假</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.absent}</div>
              <div className="text-sm text-gray-600">缺席</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.holiday}</div>
              <div className="text-sm text-gray-600">放假</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.unmarked}</div>
              <div className="text-sm text-gray-600">未标记</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Table */}
      <Card>
        <CardHeader>
          <CardTitle>学员与干部 / Class Cadres & Students</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">中文名</TableHead>
                <TableHead className="w-[35%]">English Name</TableHead>
                <TableHead className="w-[15%]">角色</TableHead>
                <TableHead className="text-center">实体出席</TableHead>
                <TableHead className="text-center">线上出席</TableHead>
                <TableHead className="text-center">请假</TableHead>
                <TableHead className="text-center">缺席</TableHead>
                {isHoliday && <TableHead className="text-center">放假</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedStudents.map((student) => {
                const studentAttendance = attendance.find(a => a.studentId === student.id);
                const roles = getStudentRoles(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.chinese_name}</TableCell>
                    <TableCell className="text-muted-foreground">{student.english_name}</TableCell>
                    <TableCell>
                      {roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {roles.map(r => (
                            <Badge
                              key={r}
                              variant="secondary"
                              className={cn(
                                'text-xs',
                                r === '班长' && 'bg-emerald-100 text-emerald-800',
                                r === '副班长' && 'bg-purple-100 text-purple-800',
                                r === '关怀员' && 'bg-orange-100 text-orange-800'
                              )}
                            >
                              {r}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-600">学员</Badge>
                      )}
                    </TableCell>
                    {(['present','online','leave','absent'] as const).map(status => (
                      <TableCell key={status} className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAttendance(student.id, status)}
                          disabled={isHoliday}
                          className={cn(
                            "px-3",
                            studentAttendance?.status === status ? statusConfig[status].color : "hover:bg-gray-50"
                          )}
                        >
                          {statusConfig[status].label}
                        </Button>
                      </TableCell>
                    ))}
                    {isHoliday && (
                      <TableCell className="text-center">
                        <Badge className="bg-orange-500 text-white">放假</Badge>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isHoliday ? 8 : 7} className="text-center text-muted-foreground py-10">
                    无学员/干部可显示
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground flex items-center gap-3">
              <span>
                显示 {students.length === 0 ? 0 : start + 1}-{Math.min(start + pageSize, students.length)} / 共 {students.length}
              </span>
              <div className="flex items-center gap-2">
                <span>每页</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1); }}>
                  <SelectTrigger className="h-8 w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); goToPage(page - 1); }} />
                  </PaginationItem>
                  {renderPageLinks()}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); goToPage(page + 1); }} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceGrid;
