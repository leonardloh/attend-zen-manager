
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardCard from '@/components/Dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  BookOpen,
  UserCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理员仪表板</h1>
          <p className="text-gray-600">Administrator Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="总学生数"
          subtitle="Total Students"
          value="2,750"
          description="活跃学生"
          icon={Users}
          trend={{ value: 5.2, isPositive: true }}
          onClick={() => navigate('/students')}
        />
        <DashboardCard
          title="总班级数"
          subtitle="Total Classes"
          value="200"
          description="活跃班级"
          icon={BookOpen}
          onClick={() => navigate('/classes')}
        />
        <DashboardCard
          title="干部人数"
          subtitle="Total Cadres"
          value="611"
          description="各级干部"
          icon={UserCheck}
          onClick={() => navigate('/cadres')}
        />
        <DashboardCard
          title="今日出席率"
          subtitle="Today's Attendance"
          value="85.6%"
          description="平均出席率"
          icon={TrendingUp}
          trend={{ value: 2.1, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>今日班级安排</CardTitle>
            <p className="text-sm text-gray-600">Today's Class Schedule</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '09:00', class: '初级班A', location: '教室101', status: '进行中' },
                { time: '14:00', class: '中级班B', location: '教室102', status: '待开始' },
                { time: '19:00', class: '高级班C', location: '教室103', status: '待开始' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.class}</p>
                    <p className="text-sm text-gray-600">{item.time} • {item.location}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === '进行中' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统概览</CardTitle>
            <p className="text-sm text-gray-600">System Overview</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">本周活跃用户</span>
                <span className="font-medium">2,456</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">本月新增学生</span>
                <span className="font-medium">142</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均出席率</span>
                <span className="font-medium">87.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">系统运行时间</span>
                <span className="font-medium">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCadreDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">干部仪表板</h1>
          <p className="text-gray-600">Cadre Dashboard</p>
        </div>
        <Button onClick={() => navigate('/attendance')}>
          开始考勤 / Start Attendance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="我的班级"
          subtitle="My Classes"
          value="3"
          description="负责的班级"
          icon={BookOpen}
          onClick={() => navigate('/my-classes')}
        />
        <DashboardCard
          title="今日考勤"
          subtitle="Today's Sessions"
          value="2"
          description="待完成考勤"
          icon={Clock}
          onClick={() => navigate('/attendance')}
        />
        <DashboardCard
          title="平均出席率"
          subtitle="Average Attendance"
          value="89.2%"
          description="本月数据"
          icon={CheckCircle}
          trend={{ value: 3.5, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>今日班级</span>
              <Button size="sm" onClick={() => navigate('/attendance')}>
                开始考勤
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '14:00', class: '中级班B', students: 25, status: '待开始' },
                { time: '19:00', class: '高级班C', students: 20, status: '待开始' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.class}</p>
                    <p className="text-sm text-gray-600">{item.time} • {item.students} 学生</p>
                  </div>
                  <Button size="sm" variant="outline">
                    考勤
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>考勤统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">本周考勤次数</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均出席率</span>
                <span className="font-medium">89.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总学生数</span>
                <span className="font-medium">65</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">学生仪表板</h1>
        <p className="text-gray-600">Student Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="我的班级"
          subtitle="My Classes"
          value="2"
          description="已注册班级"
          icon={BookOpen}
        />
        <DashboardCard
          title="本月出席"
          subtitle="This Month"
          value="18/20"
          description="出席率 90%"
          icon={CheckCircle}
          trend={{ value: 5, isPositive: true }}
        />
        <DashboardCard
          title="下次课程"
          subtitle="Next Class"
          value="今天 19:00"
          description="高级班C"
          icon={Calendar}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>我的考勤记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-06-15', class: '高级班C', status: '实体出席', time: '19:00-21:00' },
              { date: '2024-06-14', class: '中级班B', status: '线上出席', time: '14:00-16:00' },
              { date: '2024-06-13', class: '高级班C', status: '实体出席', time: '19:00-21:00' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.class}</p>
                  <p className="text-sm text-gray-600">{item.date} • {item.time}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === '实体出席' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => {
    switch (user?.role) {
      case 'super_admin':
        return renderAdminDashboard();
      case 'cadre':
        return renderCadreDashboard();
      case 'student':
        return renderStudentDashboard();
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
