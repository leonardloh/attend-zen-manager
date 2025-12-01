import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AttendanceGrid from '@/components/Attendance/AttendanceGrid';
import { Calendar as CalendarIcon, Clock, Users, Save, Search } from 'lucide-react';
import { addWeeks, endOfWeek, format, parseISO, startOfWeek, startOfYear, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDatabase } from '@/contexts/DatabaseContext';
import { upsertBulkAttendance, fetchAttendanceByClass, type AttendanceRecord, type CreateAttendanceData } from '@/lib/database/attendance';
import { WeeklyAttendancePoint } from '@/components/Attendance/types';

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

const Attendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [sessionActive, setSessionActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState<AttendanceStatus[]>([]);
  const [progressData, setProgressData] = useState<AttendanceProgressData>({
    learning_progress: '',
    page_number: '',
    line_number: '',
  });
  const [isHoliday, setIsHoliday] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  const [navigationDialogOpen, setNavigationDialogOpen] = useState(false);
  const [pendingNavigationDate, setPendingNavigationDate] = useState<Date | null>(null);
  const [pendingNavigationWeekLabel, setPendingNavigationWeekLabel] = useState<string>('');

  // Use DatabaseContext for reactive classes data
  const { classes, getClassAllStudents } = useDatabase();

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.time.includes(searchTerm)
  );

  const selectedClassInfo = useMemo(
    () => classes.find((cls) => cls.id === selectedClass),
    [classes, selectedClass]
  );

  // Extract day of week from class time (e.g., "周二 20:00-20:30" -> 2 for Tuesday)
  const getClassDayOfWeek = useCallback((classTime: string): number | null => {
    const dayMap: Record<string, number> = {
      '周日': 0,
      '周一': 1,
      '周二': 2,
      '周三': 3,
      '周四': 4,
      '周五': 5,
      '周六': 6,
    };
    
    for (const [dayName, dayNum] of Object.entries(dayMap)) {
      if (classTime.includes(dayName)) {
        return dayNum;
      }
    }
    return null;
  }, []);

  // Get the day of week for the selected class
  const selectedClassDayOfWeek = useMemo(() => {
    if (!selectedClassInfo?.time) return null;
    return getClassDayOfWeek(selectedClassInfo.time);
  }, [selectedClassInfo, getClassDayOfWeek]);

  // Get students for the selected class using DatabaseContext
  const selectedClassStudents = selectedClass ? getClassAllStudents(selectedClass) : [];

  const loadAttendanceHistory = useCallback(async () => {
    if (!selectedClass) return;
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await fetchAttendanceByClass(parseInt(selectedClass, 10));
      setHistoryRecords(data);
    } catch (err) {
      console.error('Failed to load attendance history:', err);
      setHistoryRecords([]);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setHistoryError(errorMessage);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (!sessionActive || !selectedClass) return;
    loadAttendanceHistory();
  }, [sessionActive, selectedClass, loadAttendanceHistory]);

  const weeklyAttendanceHistory = useMemo<WeeklyAttendancePoint[]>(() => {
    if (!selectedClass) {
      return [];
    }

    const historyMap = new Map<string, { weekStart: Date; attendanceCount: number; totalRecords: number; holidayCount: number }>();

    const targetDate = selectedDate ?? new Date();
    const currentWeekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
    const classStartDateString = selectedClassInfo?.class_start_date;

    let classStartWeek: Date | null = null;
    if (classStartDateString) {
      const parsed = parseISO(classStartDateString);
      if (!Number.isNaN(parsed.getTime())) {
        classStartWeek = startOfWeek(parsed, { weekStartsOn: 1 });
      }
    }

    const yearStart = startOfWeek(startOfYear(targetDate), { weekStartsOn: 1 });
    const lowerBound = classStartWeek ?? yearStart;

    const rangeStart = lowerBound;
    const rangeEnd = currentWeekStart.getTime() >= lowerBound.getTime() ? currentWeekStart : lowerBound;

    // Group records by date and count attendance per session
    const recordsByDate = new Map<string, typeof historyRecords>();
    historyRecords.forEach((record) => {
      if (!record.attendance_date) return;
      const dateKey = record.attendance_date;
      if (!recordsByDate.has(dateKey)) {
        recordsByDate.set(dateKey, []);
      }
      recordsByDate.get(dateKey)!.push(record);
    });

    console.log(`📊 Processing ${recordsByDate.size} attendance sessions for class ${selectedClass}`);

    // Process each date's records as a single session
    recordsByDate.forEach((dateRecords, dateKey) => {
      const recordDate = parseISO(dateKey);
      if (Number.isNaN(recordDate.getTime())) return;
      const weekStart = startOfWeek(recordDate, { weekStartsOn: 1 });
      if (weekStart.getTime() < lowerBound.getTime() || weekStart.getTime() > rangeEnd.getTime()) {
        return;
      }
      const key = format(weekStart, 'yyyy-MM-dd');
      const existing = historyMap.get(key) ?? { weekStart, attendanceCount: 0, totalRecords: 0, holidayCount: 0 };
      
      // Check if this session is marked as holiday (all records have status 4)
      const holidayRecords = dateRecords.filter(record => record.attendance_status === 4);
      const isHolidaySession = holidayRecords.length > 0 && holidayRecords.length === dateRecords.length;
      
      if (isHolidaySession) {
        existing.holidayCount = (existing.holidayCount ?? 0) + 1;
        console.log(`📅 Date ${dateKey}: Holiday session (${dateRecords.length} records)`);
      } else {
        // Count how many students attended (present or online) on this date
        const attendedCount = dateRecords.filter(
          record => record.attendance_status === 1 || record.attendance_status === 2
        ).length;
        
        console.log(`📅 Date ${dateKey}: ${attendedCount} students attended (${dateRecords.length} total records)`);
        
        existing.attendanceCount += attendedCount;
      }
      
      existing.totalRecords += dateRecords.length;
      historyMap.set(key, existing);
    });

    const result: WeeklyAttendancePoint[] = [];
    let cursor = new Date(rangeStart);
    const effectiveEnd = rangeEnd.getTime();
    
    while (cursor.getTime() <= effectiveEnd) {
      const key = format(cursor, 'yyyy-MM-dd');
      const entry = historyMap.get(key);
      const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
      const holidayCount = entry?.holidayCount ?? 0;
      const isHolidayWeek = holidayCount > 0 && entry?.attendanceCount === 0;
      
      // Calculate the target date for this week based on the class day
      let targetDate: string | undefined;
      if (selectedClassDayOfWeek !== null) {
        const weekStart = cursor;
        const dayOffset = (selectedClassDayOfWeek - 1 + 7) % 7;
        const classDayInWeek = addDays(weekStart, dayOffset);
        targetDate = format(classDayInWeek, 'yyyy-MM-dd');
      }
      
      result.push({
        weekKey: key,
        weekLabel: `${format(cursor, 'MM/dd')} ~ ${format(weekEnd, 'MM/dd')}`,
        attendanceCount: entry?.attendanceCount ?? 0,
        isMissing: !entry,
        isHoliday: isHolidayWeek,
        holidayCount: holidayCount,
        targetDate,
      });
      cursor = addWeeks(cursor, 1);
    }

    return result;
  }, [historyRecords, selectedClass, selectedDate, selectedClassInfo, selectedClassDayOfWeek]);

  const startAttendanceSession = async () => {
    if (selectedClass && selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if there's existing attendance for this date
      try {
        const existingRecords = await fetchAttendanceByClass(parseInt(selectedClass, 10), dateString);
        
        if (existingRecords.length > 0) {
          // Prefill with existing data
          console.log(`📝 Found ${existingRecords.length} existing records for ${dateString}, prefilling...`);
          
          const statusCodeToValue: Record<number, AttendanceStatusValue> = {
            1: 'present',
            2: 'online',
            3: 'leave',
            0: 'absent',
            4: 'holiday',
          };
          
          const prefilledAttendance = existingRecords.map(record => ({
            studentId: String(record.student_id),
            status: record.attendance_status !== undefined ? (statusCodeToValue[record.attendance_status] || null) : null,
          }));
          
          setAttendanceData(prefilledAttendance);
          
          // Prefill progress data from first record
          const firstRecord = existingRecords[0];
          setProgressData({
            learning_progress: firstRecord.learning_progress || '',
            page_number: firstRecord.lamrin_page ? String(firstRecord.lamrin_page) : '',
            line_number: firstRecord.lamrin_line ? String(firstRecord.lamrin_line) : '',
          });
          
          setIsHoliday(firstRecord.attendance_status === 4);
        } else {
          // No existing records, start fresh
          console.log(`📝 No existing records for ${dateString}, starting fresh`);
          setAttendanceData([]);
          setProgressData({
            learning_progress: '',
            page_number: '',
            line_number: '',
          });
          setIsHoliday(false);
        }
      } catch (error) {
        console.error('Failed to load existing attendance:', error);
        // Start fresh on error
        setAttendanceData([]);
        setProgressData({
          learning_progress: '',
          page_number: '',
          line_number: '',
        });
        setIsHoliday(false);
      }
      
      setSessionActive(true);
      setHistoryRecords([]);
      setHistoryError(null);
    }
  };

  const handleDataChange = (attendance: AttendanceStatus[], progress: AttendanceProgressData) => {
    setAttendanceData(attendance);
    setProgressData(progress);
  };

  const endAttendanceSession = async () => {
    if (!selectedClass || !selectedDate) return;
    const statusToCode: Record<AttendanceStatusValue, number> = {
      present: 1,
      online: 2,
      leave: 3,
      absent: 0,
      holiday: 4,
    };

    const attendance_date = format(selectedDate, 'yyyy-MM-dd');
    const lamrin_page = progressData.page_number ? parseInt(progressData.page_number, 10) : undefined;
    const lamrin_line = progressData.line_number ? parseInt(progressData.line_number, 10) : undefined;

    const roster = selectedClassStudents.map(student => student.id);
    const effectiveAttendance = isHoliday
      ? roster.map(studentId => ({ studentId, status: 'holiday' as AttendanceStatusValue }))
      : attendanceData;

    const records: CreateAttendanceData[] = effectiveAttendance
      .filter(item => item.status !== null)
      .map(item => ({
        class_id: parseInt(selectedClass, 10),
        student_id: parseInt(item.studentId, 10),
        attendance_date,
        attendance_status: statusToCode[item.status!],
        learning_progress: progressData.learning_progress || undefined,
        lamrin_page,
        lamrin_line,
      }));

    try {
      if (records.length > 0) {
        await upsertBulkAttendance(records);
      }
      alert('点名数据和学习进度已保存！');
      setSessionActive(false);
      setIsHoliday(false);
      setHistoryRecords([]);
      setHistoryError(null);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      const message = err instanceof Error ? err.message : '未知错误';
      alert(`保存失败：${message}`);
    }
  };
  
  const handleWeekClick = useCallback((week: WeeklyAttendancePoint) => {
    if (!week.targetDate) return;
    
    const targetDate = parseISO(week.targetDate);
    if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === week.targetDate) {
      return;
    }
    
    setPendingNavigationDate(targetDate);
    setPendingNavigationWeekLabel(week.weekLabel);
    setNavigationDialogOpen(true);
  }, [selectedDate]);
  
  const handleSaveAndNavigate = async () => {
    if (!selectedClass || !selectedDate || !pendingNavigationDate) return;
    
    const statusToCode: Record<AttendanceStatusValue, number> = {
      present: 1,
      online: 2,
      leave: 3,
      absent: 0,
      holiday: 4,
    };

    const attendance_date = format(selectedDate, 'yyyy-MM-dd');
    const lamrin_page = progressData.page_number ? parseInt(progressData.page_number, 10) : undefined;
    const lamrin_line = progressData.line_number ? parseInt(progressData.line_number, 10) : undefined;

    const roster = selectedClassStudents.map(student => student.id);
    const effectiveAttendance = isHoliday
      ? roster.map(studentId => ({ studentId, status: 'holiday' as AttendanceStatusValue }))
      : attendanceData;

    const records: CreateAttendanceData[] = effectiveAttendance
      .filter(item => item.status !== null)
      .map(item => ({
        class_id: parseInt(selectedClass, 10),
        student_id: parseInt(item.studentId, 10),
        attendance_date,
        attendance_status: statusToCode[item.status!],
        learning_progress: progressData.learning_progress || undefined,
        lamrin_page,
        lamrin_line,
      }));

    try {
      if (records.length > 0) {
        await upsertBulkAttendance(records);
      }
      alert('点名数据已保存！正在跳转...');
      
      setSelectedDate(pendingNavigationDate);
      setNavigationDialogOpen(false);
      setPendingNavigationDate(null);
      setPendingNavigationWeekLabel('');
      setSessionActive(false);
      
      setTimeout(() => {
        setSelectedDate(pendingNavigationDate);
      }, 100);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      const message = err instanceof Error ? err.message : '未知错误';
      alert(`保存失败：${message}`);
    }
  };
  
  const handleDiscardAndNavigate = () => {
    if (!pendingNavigationDate) return;
    
    setNavigationDialogOpen(false);
    setSessionActive(false);
    setIsHoliday(false);
    setAttendanceData([]);
    setProgressData({ learning_progress: '', page_number: '', line_number: '' });
    setHistoryRecords([]);
    setHistoryError(null);
    
    const navDate = pendingNavigationDate;
    setPendingNavigationDate(null);
    setPendingNavigationWeekLabel('');
    
    setTimeout(() => {
      setSelectedDate(navDate);
    }, 100);
  };
  
  const handleCancelNavigation = () => {
    setNavigationDialogOpen(false);
    setPendingNavigationDate(null);
    setPendingNavigationWeekLabel('');
  };

  if (!sessionActive) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">点名管理</h1>
          <p className="text-gray-600">Attendance Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              开始点名
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Class Search */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                搜索班级 / Search Classes
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索班级名称或时间..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Class Selection Grid */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                选择班级 / Select Class
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                      selectedClass === cls.id 
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" 
                        : "border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-600">{cls.time}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {cls.student_count}
                        </div>
                        {selectedClass === cls.id && (
                          <Badge className="bg-blue-600">已选择</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                选择日期 / Select Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "yyyy年MM月dd日") : "选择点名日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => {
                      if (selectedClassDayOfWeek === null) return false;
                      return date.getDay() !== selectedClassDayOfWeek;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-600">
                <p>当前时间: {new Date().toLocaleString('zh-CN')}</p>
                {selectedDate && (
                  <p>选择日期: {format(selectedDate, "yyyy年MM月dd日")}</p>
                )}
              </div>
              <Button 
                onClick={startAttendanceSession}
                disabled={!selectedClass || !selectedDate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                开始点名
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedClassInfo?.name} - 点名中
          </h1>
          <p className="text-gray-600">
            {selectedClassInfo?.time} • {selectedDate ? format(selectedDate, "yyyy年MM月dd日") : ''}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => { setSessionActive(false); setIsHoliday(false); }}>
            返回
          </Button>
          <Button
            variant={isHoliday ? 'destructive' : 'outline'}
            onClick={() => setIsHoliday(prev => !prev)}
          >
            {isHoliday ? '取消放假' : '放假'}
          </Button>
          <Button onClick={endAttendanceSession} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            结束点名
          </Button>
        </div>
      </div>

      <AttendanceGrid 
        classId={selectedClass} 
        classDate={selectedDate} 
        onDataChange={handleDataChange}
        students={selectedClassStudents}
        isHoliday={isHoliday}
        attendanceHistory={weeklyAttendanceHistory}
        isHistoryLoading={isHistoryLoading}
        historyError={historyError}
        onReloadHistory={loadAttendanceHistory}
        onWeekClick={handleWeekClick}
        initialAttendanceData={attendanceData}
        initialProgressData={progressData}
      />
      
      <AlertDialog open={navigationDialogOpen} onOpenChange={setNavigationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>切换点名日期</AlertDialogTitle>
            <AlertDialogDescription>
              您正在为 {selectedDate ? format(selectedDate, 'yyyy年MM月dd日') : ''} 进行点名。
              是否要切换到 {pendingNavigationWeekLabel} 周 ({pendingNavigationDate ? format(pendingNavigationDate, 'yyyy年MM月dd日') : ''}) 的点名记录？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="default"
              onClick={handleSaveAndNavigate}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-save-and-navigate"
            >
              保存当前点名并跳转
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscardAndNavigate}
              data-testid="button-discard-and-navigate"
            >
              放弃当前更改并跳转
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelNavigation}
              data-testid="button-cancel-navigation"
            >
              取消
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Attendance;
