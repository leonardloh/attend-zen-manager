
import React, { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardCard from '@/components/Dashboard/DashboardCard';
import { DatabaseTest } from '@/components/DatabaseTest';
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
import { useDatabase } from '@/contexts/DatabaseContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get data from database context
  const {
    students,
    classes, 
    cadres,
    isLoadingStudents,
    isLoadingClasses,
    isLoadingCadres
  } = useDatabase();
  
  // Calculate real-time statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === '活跃').length;
    const totalClasses = classes.length;
    const activeClasses = classes.filter(c => c.status === 'active').length;
    const totalCadres = cadres.length;
    const activeCadres = cadres.filter(c => c.status === '活跃').length;
    
    // Calculate overall attendance rate from classes
    const totalAttendanceRate = classes.length > 0 
      ? Math.round(classes.reduce((sum, cls) => sum + cls.attendance_rate, 0) / classes.length)
      : 0;
    
    return {
      totalStudents,
      activeStudents,
      totalClasses,
      activeClasses,
      totalCadres,
      activeCadres,
      attendanceRate: totalAttendanceRate
    };
  }, [students, classes, cadres]);
  
  const isLoading = isLoadingStudents || isLoadingClasses || isLoadingCadres;

  const renderAdminDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">加载仪表板数据中...</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">管理员仪表板</h1>
            <p className="text-gray-600">Administrator Dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="总学员数"
            subtitle="Total Students"
            value={stats.totalStudents.toString()}
            description={`活跃学员 ${stats.activeStudents}`}
            icon={Users}
            onClick={() => navigate('/students')}
          />
          <DashboardCard
            title="总班级数"
            subtitle="Total Classes"
            value={stats.totalClasses.toString()}
            description={`活跃班级 ${stats.activeClasses}`}
            icon={BookOpen}
            onClick={() => navigate('/classes')}
          />
          <DashboardCard
            title="干部人数"
            subtitle="Total Cadres"
            value={stats.totalCadres.toString()}
            description={`活跃干部 ${stats.activeCadres}`}
            icon={UserCheck}
            onClick={() => navigate('/cadres')}
          />
          <DashboardCard
            title="平均出席率"
            subtitle="Average Attendance"
            value={`${stats.attendanceRate}%`}
            description="所有班级平均"
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>班级概览</CardTitle>
              <p className="text-sm text-gray-600">Class Overview</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classes.slice(0, 5).map((cls, index) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-gray-600">{cls.time} • {cls.region}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        cls.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cls.status === 'active' ? '活跃' : '暂停'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{cls.student_count} 学员</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统统计</CardTitle>
              <p className="text-sm text-gray-600">System Statistics</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">活跃学员</span>
                  <span className="font-medium">{stats.activeStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">活跃班级</span>
                  <span className="font-medium">{stats.activeClasses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">平均出席率</span>
                  <span className="font-medium">{stats.attendanceRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">总班级学员</span>
                  <span className="font-medium">{classes.reduce((sum, c) => sum + c.student_count, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderCadreDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">加载仪表板数据中...</span>
          </div>
        </div>
      );
    }

    // Find current user's cadre information 
    const userCadre = cadres.find(c => c.student_id === user?.username);
    const userClasses = userCadre ? userCadre.roles?.length || 0 : 0;
    const userClassNames = userCadre ? userCadre.roles?.map(r => r.class_name) || [] : [];
    
    // Calculate attendance rate for user's classes
    const userClassesData = classes.filter(c => userClassNames.includes(c.name));
    const userAttendanceRate = userClassesData.length > 0 
      ? Math.round(userClassesData.reduce((sum, c) => sum + c.attendance_rate, 0) / userClassesData.length)
      : 0;
    
    return (
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
            title="我的职位"
            subtitle="My Positions"
            value={userClasses.toString()}
            description="负责的班级"
            icon={BookOpen}
            onClick={() => navigate('/cadres')}
          />
          <DashboardCard
            title="班级数量"
            subtitle="Total Classes"
            value={stats.totalClasses.toString()}
            description="系统总班级"
            icon={Clock}
            onClick={() => navigate('/classes')}
          />
          <DashboardCard
            title="我的班级出席率"
            subtitle="My Classes Attendance"
            value={`${userAttendanceRate}%`}
            description="平均出席率"
            icon={CheckCircle}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>我的班级</span>
                <Button size="sm" onClick={() => navigate('/attendance')}>
                  开始考勤
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userClassesData.length > 0 ? (
                  userClassesData.map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <p className="text-sm text-gray-600">{cls.time} • {cls.student_count} 学员</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{cls.attendance_rate}% 出席率</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    您尚未被分配到任何班级
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>统计概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">我的职位数</span>
                  <span className="font-medium">{userClasses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">我的班级出席率</span>
                  <span className="font-medium">{userAttendanceRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">我负责学员数</span>
                  <span className="font-medium">{userClassesData.reduce((sum, c) => sum + c.student_count, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderStudentDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">加载仪表板数据中...</span>
          </div>
        </div>
      );
    }

    // Find current user's student information
    const userStudent = students.find(s => s.student_id === user?.username);
    const userClasses = userStudent ? classes.filter(c => c.name === userStudent.class_name) : [];
    const userAttendanceRate = userClasses.length > 0 ? userClasses[0].attendance_rate : 0;
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学员仪表板</h1>
          <p className="text-gray-600">Student Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="我的班级"
            subtitle="My Class"
            value={userStudent ? "1" : "0"}
            description={userStudent ? userStudent.class_name : "未分配班级"}
            icon={BookOpen}
          />
          <DashboardCard
            title="我的出席率"
            subtitle="My Attendance"
            value={`${userAttendanceRate}%`}
            description="班级平均出席率"
            icon={CheckCircle}
          />
          <DashboardCard
            title="学员状态"
            subtitle="Student Status"
            value={userStudent?.status || "未知"}
            description={userStudent ? `学号: ${userStudent.student_id}` : ""}
            icon={Calendar}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>我的信息</CardTitle>
          </CardHeader>
          <CardContent>
            {userStudent ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">中文姓名</p>
                    <p className="text-sm text-gray-600">{userStudent.chinese_name}</p>
                  </div>
                  <span className="text-sm">{userStudent.english_name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">所在班级</p>
                    <p className="text-sm text-gray-600">{userStudent.class_name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userStudent.status === '活跃' 
                      ? 'bg-green-100 text-green-800' 
                      : userStudent.status === '旁听'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {userStudent.status}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">入学日期</p>
                    <p className="text-sm text-gray-600">{userStudent.enrollment_date}</p>
                  </div>
                  <span className="text-sm">性别: {userStudent.gender === 'male' ? '男' : '女'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                未找到学员信息
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

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
      
      {/* Temporary Database Test Component */}
      {user?.role === 'super_admin' && (
        <div className="mt-8">
          <DatabaseTest />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
