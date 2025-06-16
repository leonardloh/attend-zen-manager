
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, MapPin, TrendingUp, BarChart, Calendar, BookOpen, Hash } from 'lucide-react';

interface ClassInfo {
  id: string;
  name: string;
  region: '北马' | '中马' | '南马';
  time: string;
  student_count: number;
  class_monitor: string;
  learning_progress: string;
  page_number: string;
  line_number: string;
  attendance_rate: number;
  status: 'active' | 'inactive';
}

interface ClassDetailsViewProps {
  classInfo: ClassInfo;
  onClose: () => void;
}

const ClassDetailsView: React.FC<ClassDetailsViewProps> = ({ classInfo, onClose }) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{classInfo.name}</h2>
          <p className="text-gray-600">班级ID: {classInfo.id}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getRegionColor(classInfo.region)}>
            {classInfo.region}
          </Badge>
          <Badge variant={classInfo.status === 'active' ? 'default' : 'secondary'}>
            {classInfo.status === 'active' ? '活跃' : '暂停'}
          </Badge>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">上课时间</p>
              <p className="text-gray-600">{classInfo.time}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">学生人数</p>
              <p className="text-gray-600">{classInfo.student_count} 名学生</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">班长</p>
              <p className="text-gray-600">{classInfo.class_monitor}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <BarChart className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">出席率</p>
              <p className={getAttendanceColor(classInfo.attendance_rate)}>
                {classInfo.attendance_rate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium">学习进度</h3>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">{classInfo.learning_progress}</p>
        </div>
      </div>

      {/* 广论进度 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium">广论进度</h3>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">页数</p>
                <p className="text-gray-600">{classInfo.page_number || '未设置'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">行数</p>
                <p className="text-gray-600">{classInfo.line_number || '未设置'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium">出席率详情</h3>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span>当前出席率</span>
            <span className={getAttendanceColor(classInfo.attendance_rate)}>
              {classInfo.attendance_rate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                classInfo.attendance_rate >= 90 ? 'bg-green-600' :
                classInfo.attendance_rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${classInfo.attendance_rate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={onClose} className="flex-1">
          关闭
        </Button>
      </div>
    </div>
  );
};

export default ClassDetailsView;
