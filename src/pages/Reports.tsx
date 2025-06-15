
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, Users, CheckCircle } from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedClass, setSelectedClass] = useState('all');

  // Mock data for charts
  const attendanceData = [
    { name: '第1周', present: 85, online: 12, absent: 8 },
    { name: '第2周', present: 78, online: 15, absent: 12 },
    { name: '第3周', present: 92, online: 8, absent: 5 },
    { name: '第4周', present: 88, online: 10, absent: 7 },
  ];

  const classAttendanceData = [
    { name: '初级班A', value: 85, color: '#10B981' },
    { name: '中级班B', value: 78, color: '#3B82F6' },
    { name: '高级班C', value: 92, color: '#8B5CF6' },
    { name: '周末班D', value: 65, color: '#F59E0B' },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报告统计</h1>
          <p className="text-gray-600">Reports & Analytics</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出Excel
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                时间范围
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">本周</SelectItem>
                  <SelectItem value="monthly">本月</SelectItem>
                  <SelectItem value="quarterly">本季度</SelectItem>
                  <SelectItem value="yearly">本年</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                班级筛选
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部班级</SelectItem>
                  <SelectItem value="1">初级班A</SelectItem>
                  <SelectItem value="2">中级班B</SelectItem>
                  <SelectItem value="3">高级班C</SelectItem>
                  <SelectItem value="4">周末班D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总学生数</p>
                <p className="text-2xl font-bold text-gray-900">2,750</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均出席率</p>
                <p className="text-2xl font-bold text-gray-900">85.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本月课程数</p>
                <p className="text-2xl font-bold text-gray-900">124</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">趋势</p>
                <p className="text-2xl font-bold text-green-600">+5.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>周考勤趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#10B981" name="实体出席" />
                <Bar dataKey="online" fill="#3B82F6" name="线上出席" />
                <Bar dataKey="absent" fill="#EF4444" name="缺席" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>各班级出席率</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classAttendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {classAttendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>详细考勤报告</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">班级</th>
                  <th className="text-left p-2">日期</th>
                  <th className="text-left p-2">实体出席</th>
                  <th className="text-left p-2">线上出席</th>
                  <th className="text-left p-2">请假</th>
                  <th className="text-left p-2">缺席</th>
                  <th className="text-left p-2">出席率</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { class: '初级班A', date: '2024-06-15', present: 20, online: 3, leave: 1, absent: 1, rate: 92 },
                  { class: '中级班B', date: '2024-06-15', present: 18, online: 2, leave: 2, absent: 3, rate: 80 },
                  { class: '高级班C', date: '2024-06-14', present: 16, online: 1, leave: 0, absent: 1, rate: 94 },
                  { class: '周末班D', date: '2024-06-14', present: 3, online: 1, leave: 0, absent: 1, rate: 80 },
                ].map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.class}</td>
                    <td className="p-2">{item.date}</td>
                    <td className="p-2">{item.present}</td>
                    <td className="p-2">{item.online}</td>
                    <td className="p-2">{item.leave}</td>
                    <td className="p-2">{item.absent}</td>
                    <td className="p-2">
                      <Badge 
                        variant={item.rate >= 90 ? 'default' : item.rate >= 80 ? 'secondary' : 'destructive'}
                      >
                        {item.rate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
