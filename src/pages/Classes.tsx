
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Users, MapPin, Calendar } from 'lucide-react';

interface ClassInfo {
  id: string;
  name: string;
  day_of_week: string;
  time: string;
  location: string;
  capacity: number;
  enrolled: number;
  instructor: string;
  status: 'active' | 'inactive';
  level: 'beginner' | 'intermediate' | 'advanced';
}

const Classes: React.FC = () => {
  const [classes] = useState<ClassInfo[]>([
    {
      id: '1',
      name: '初级班A',
      day_of_week: '周一',
      time: '09:00-11:00',
      location: '教室101',
      capacity: 30,
      enrolled: 25,
      instructor: '张老师',
      status: 'active',
      level: 'beginner'
    },
    {
      id: '2',
      name: '中级班B',
      day_of_week: '周三',
      time: '14:00-16:00',
      location: '教室102',
      capacity: 25,
      enrolled: 22,
      instructor: '李老师',
      status: 'active',
      level: 'intermediate'
    },
    {
      id: '3',
      name: '高级班C',
      day_of_week: '周五',
      time: '19:00-21:00',
      location: '教室103',
      capacity: 20,
      enrolled: 18,
      instructor: '王老师',
      status: 'active',
      level: 'advanced'
    },
    {
      id: '4',
      name: '周末班D',
      day_of_week: '周六',
      time: '10:00-12:00',
      location: '教室104',
      capacity: 35,
      enrolled: 5,
      instructor: '陈老师',
      status: 'inactive',
      level: 'beginner'
    }
  ]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return '初级';
      case 'intermediate':
        return '中级';
      case 'advanced':
        return '高级';
      default:
        return '未知';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">班级管理</h1>
          <p className="text-gray-600">Class Management</p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          创建班级
        </Button>
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
              {classes.reduce((sum, c) => sum + c.enrolled, 0)}
            </div>
            <div className="text-sm text-gray-600">总学生数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(classes.reduce((sum, c) => sum + (c.enrolled / c.capacity), 0) / classes.length * 100)}%
            </div>
            <div className="text-sm text-gray-600">平均使用率</div>
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
                  <Badge className={getLevelColor(classInfo.level)}>
                    {getLevelText(classInfo.level)}
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
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{classInfo.day_of_week}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{classInfo.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{classInfo.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{classInfo.enrolled}/{classInfo.capacity} 学生</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">教师: </span>
                  <span className="font-medium">{classInfo.instructor}</span>
                </div>
                
                {/* Enrollment Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>入学率</span>
                    <span>{Math.round((classInfo.enrolled / classInfo.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(classInfo.enrolled / classInfo.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    查看详情
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    编辑
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Classes;
