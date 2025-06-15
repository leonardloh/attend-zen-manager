
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AttendanceGrid from '@/components/Attendance/AttendanceGrid';
import { Calendar, Clock, Users, Save } from 'lucide-react';

const Attendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [sessionActive, setSessionActive] = useState(false);

  const classes = [
    { id: '1', name: '初级班A', time: '09:00-11:00', students: 25 },
    { id: '2', name: '中级班B', time: '14:00-16:00', students: 30 },
    { id: '3', name: '高级班C', time: '19:00-21:00', students: 20 },
  ];

  const startAttendanceSession = () => {
    if (selectedClass) {
      setSessionActive(true);
    }
  };

  const endAttendanceSession = () => {
    setSessionActive(false);
    // Here you would typically save the attendance data
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择班级 / Select Class
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择班级" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.time} ({cls.students} 学生)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-600">
                <p>今日: {new Date().toLocaleDateString('zh-CN')}</p>
                <p>时间: {new Date().toLocaleTimeString('zh-CN')}</p>
              </div>
              <Button 
                onClick={startAttendanceSession}
                disabled={!selectedClass}
                className="bg-blue-600 hover:bg-blue-700"
              >
                开始考勤
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              今日课程安排
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classes.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{cls.name}</h3>
                    <p className="text-sm text-gray-600">{cls.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {cls.students}
                    </div>
                    <Badge variant="outline">待开始</Badge>
                  </div>
                </div>
              ))}
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
            {selectedClassInfo?.time} • {new Date().toLocaleDateString('zh-CN')}
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

      <AttendanceGrid />
    </div>
  );
};

export default Attendance;
