
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, User } from 'lucide-react';

interface Student {
  id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  phone?: string;
  email?: string;
  class_name: string;
  enrollment_date: string;
  status: 'active' | 'inactive';
}

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data
  const [students] = useState<Student[]>([
    {
      id: '1',
      chinese_name: '王小明',
      english_name: 'Wang Xiaoming',
      gender: 'male',
      phone: '13800138001',
      email: 'wang.xiaoming@example.com',
      class_name: '初级班A',
      enrollment_date: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      chinese_name: '李小红',
      english_name: 'Li Xiaohong',
      gender: 'female',
      phone: '13800138002',
      email: 'li.xiaohong@example.com',
      class_name: '中级班B',
      enrollment_date: '2024-02-01',
      status: 'active'
    },
    {
      id: '3',
      chinese_name: '张三',
      english_name: 'Zhang San',
      gender: 'male',
      phone: '13800138003',
      email: 'zhang.san@example.com',
      class_name: '高级班C',
      enrollment_date: '2024-01-20',
      status: 'active'
    },
    {
      id: '4',
      chinese_name: '李四',
      english_name: 'Li Si',
      gender: 'female',
      phone: '13800138004',
      email: 'li.si@example.com',
      class_name: '初级班A',
      enrollment_date: '2024-03-01',
      status: 'inactive'
    }
  ]);

  const filteredStudents = students.filter(student =>
    student.chinese_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学生管理</h1>
          <p className="text-gray-600">Student Management</p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          添加学生
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索学生姓名或班级..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                全部
              </Button>
              <Button variant="outline" size="sm">
                活跃
              </Button>
              <Button variant="outline" size="sm">
                非活跃
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.chinese_name}</h3>
                    <p className="text-sm text-gray-600">{student.english_name}</p>
                  </div>
                </div>
                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                  {student.status === 'active' ? '活跃' : '非活跃'}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">班级:</span>
                  <span className="font-medium">{student.class_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">性别:</span>
                  <span className="font-medium">{student.gender === 'male' ? '男' : '女'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">入学日期:</span>
                  <span className="font-medium">{student.enrollment_date}</span>
                </div>
                {student.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">电话:</span>
                    <span className="font-medium">{student.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  编辑
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-sm text-gray-600">总学生数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">活跃学生</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {students.filter(s => s.gender === 'male').length}
            </div>
            <div className="text-sm text-gray-600">男学生</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">
              {students.filter(s => s.gender === 'female').length}
            </div>
            <div className="text-sm text-gray-600">女学生</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Students;
