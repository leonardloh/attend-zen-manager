
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceGrid from '@/components/Attendance/AttendanceGrid';
import { Calendar as CalendarIcon, Clock, Users, Save, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Attendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [sessionActive, setSessionActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const classes = [
    { id: '1', name: '初级班A', time: '09:00-11:00', students: 25 },
    { id: '2', name: '中级班B', time: '14:00-16:00', students: 30 },
    { id: '3', name: '高级班C', time: '19:00-21:00', students: 20 },
    { id: '4', name: '初级班B', time: '10:00-12:00', students: 22 },
    { id: '5', name: '中级班A', time: '15:00-17:00', students: 28 },
    { id: '6', name: '高级班B', time: '18:00-20:00', students: 18 },
  ];

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.time.includes(searchTerm)
  );

  const startAttendanceSession = () => {
    if (selectedClass && selectedDate) {
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
            {/* Class Search and Selection */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                搜索并选择班级 / Search and Select Class
              </Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索班级名称或时间..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择班级" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.time} ({cls.students} 学生)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar as CalendarIcon className="h-5 w-5" />
              课程安排
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredClasses.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h3 className="font-medium">{cls.name}</h3>
                    <p className="text-sm text-gray-600">{cls.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {cls.students}
                    </div>
                    <Badge variant="outline">可选择</Badge>
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

      <AttendanceGrid classId={selectedClass} classDate={selectedDate} />
    </div>
  );
};

export default Attendance;
