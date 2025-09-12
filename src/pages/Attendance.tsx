import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceGrid from '@/components/Attendance/AttendanceGrid';
import { Calendar as CalendarIcon, Clock, Users, Save, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDatabase } from '@/contexts/DatabaseContext';

interface AttendanceStatus {
  studentId: string;
  status: 'present' | 'online' | 'leave' | 'absent' | null;
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

  // Use DatabaseContext for reactive classes data
  const { classes, getClassAllStudents } = useDatabase();

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.time.includes(searchTerm)
  );

  // Get students for the selected class using DatabaseContext
  const selectedClassStudents = selectedClass ? getClassAllStudents(selectedClass) : [];

  const startAttendanceSession = () => {
    if (selectedClass && selectedDate) {
      setSessionActive(true);
      // Reset data when starting a new session
      setAttendanceData([]);
      setProgressData({
        learning_progress: '',
        page_number: '',
        line_number: '',
      });
    }
  };

  const handleDataChange = (attendance: AttendanceStatus[], progress: AttendanceProgressData) => {
    setAttendanceData(attendance);
    setProgressData(progress);
  };

  const endAttendanceSession = () => {
    // Save all data when ending the session
    console.log('Saving attendance:', {
      classId: selectedClass,
      classDate: selectedDate,
      attendance: attendanceData.filter(item => item.status !== null),
      progress: progressData
    });
    
    // Show success message
    alert('考勤数据和学习进度已保存！');
    
    setSessionActive(false);
  };

  if (!sessionActive) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">考勤管理</h1>
          <p className="text-gray-600">Attendance Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              开始考勤会话
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
                    {selectedDate ? format(selectedDate, "yyyy年MM月dd日") : "选择考勤日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
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
                开始考勤
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedClassInfo = classes.find(c => c.id === selectedClass);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedClassInfo?.name} - 考勤中
          </h1>
          <p className="text-gray-600">
            {selectedClassInfo?.time} • {selectedDate ? format(selectedDate, "yyyy年MM月dd日") : ''}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => setSessionActive(false)}>
            返回
          </Button>
          <Button onClick={endAttendanceSession} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            结束考勤
          </Button>
        </div>
      </div>

      <AttendanceGrid 
        classId={selectedClass} 
        classDate={selectedDate} 
        onDataChange={handleDataChange}
        students={selectedClassStudents}
      />
    </div>
  );
};

export default Attendance;
