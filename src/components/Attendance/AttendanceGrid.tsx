
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import AttendanceProgressForm from './AttendanceProgressForm';

interface Student {
  id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
}

interface AttendanceStatus {
  studentId: string;
  status: 'present' | 'online' | 'leave' | 'absent' | null;
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
}

const AttendanceGrid: React.FC<AttendanceGridProps> = ({ classId, classDate, onDataChange }) => {
  // Mock students data - in a real app, this would be fetched based on classId
  const [students] = useState<Student[]>([
    { id: '1', chinese_name: '王小明', english_name: 'Wang Xiaoming', gender: 'male' },
    { id: '2', chinese_name: '李小红', english_name: 'Li Xiaohong', gender: 'female' },
    { id: '3', chinese_name: '张三', english_name: 'Zhang San', gender: 'male' },
    { id: '4', chinese_name: '李四', english_name: 'Li Si', gender: 'female' },
    { id: '5', chinese_name: '王五', english_name: 'Wang Wu', gender: 'male' },
    { id: '6', chinese_name: '赵六', english_name: 'Zhao Liu', gender: 'female' },
    { id: '7', chinese_name: '钱七', english_name: 'Qian Qi', gender: 'male' },
    { id: '8', chinese_name: '孙八', english_name: 'Sun Ba', gender: 'female' },
  ]);

  const [attendance, setAttendance] = useState<AttendanceStatus[]>(
    students.map(student => ({ studentId: student.id, status: null }))
  );

  const [progressData, setProgressData] = useState<AttendanceProgressData>({
    learning_progress: '',
    page_number: '',
    line_number: '',
  });

  const statusConfig = {
    present: { label: '√实体', color: 'bg-green-500 hover:bg-green-600 text-white' },
    online: { label: '√线上', color: 'bg-blue-500 hover:bg-blue-600 text-white' },
    leave: { label: 'O', color: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
    absent: { label: 'X', color: 'bg-red-500 hover:bg-red-600 text-white' },
  };

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
    const updatedAttendance = attendance.map(item => ({ ...item, status: 'present' as const }));
    setAttendance(updatedAttendance);
    
    // Notify parent component of data changes
    if (onDataChange) {
      onDataChange(updatedAttendance, progressData);
    }
  };

  const clearAll = () => {
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
    const counts = { present: 0, online: 0, leave: 0, absent: 0, unmarked: 0 };
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

  return (
    <div className="space-y-6">
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
            <span>考勤统计 / Attendance Summary</span>
            <div className="flex gap-2">
              <Button onClick={markAllPresent} variant="outline" size="sm">
                全部出席
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                清空
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <div className="text-2xl font-bold text-gray-600">{statusCounts.unmarked}</div>
              <div className="text-sm text-gray-600">未标记</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {students.map((student) => {
          const studentAttendance = attendance.find(a => a.studentId === student.id);
          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-3">
                  {/* Student Avatar */}
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                  
                  {/* Student Name */}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">{student.chinese_name}</h3>
                    <p className="text-sm text-gray-600">{student.english_name}</p>
                  </div>
                  
                  {/* Status Buttons */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <Button
                        key={status}
                        onClick={() => updateAttendance(student.id, status as AttendanceStatus['status'])}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-12 text-sm font-medium transition-all",
                          studentAttendance?.status === status
                            ? config.color
                            : "hover:bg-gray-50"
                        )}
                      >
                        {config.label}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Current Status Badge */}
                  {studentAttendance?.status && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        studentAttendance.status === 'present' && "bg-green-100 text-green-800",
                        studentAttendance.status === 'online' && "bg-blue-100 text-blue-800",
                        studentAttendance.status === 'leave' && "bg-yellow-100 text-yellow-800",
                        studentAttendance.status === 'absent' && "bg-red-100 text-red-800"
                      )}
                    >
                      {statusConfig[studentAttendance.status].label}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceGrid;
