
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Calendar, 
  ClipboardList, 
  BarChart3, 
  Settings,
  BookOpen,
  UserCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const adminNavItems = [
    { icon: Home, label: '主页', sublabel: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: '学员管理', sublabel: 'Students', path: '/students' },
    { icon: BookOpen, label: '班级管理', sublabel: 'Classes', path: '/classes' },
    { icon: UserCheck, label: '干部管理', sublabel: 'Cadres', path: '/cadres' },
    { icon: Building2, label: '教室管理', sublabel: 'Classrooms', path: '/classrooms' },
    { icon: ClipboardList, label: '考勤记录', sublabel: 'Attendance', path: '/attendance' },
    { icon: BarChart3, label: '报告统计', sublabel: 'Reports', path: '/reports' },
    { icon: Settings, label: '系统设置', sublabel: 'Settings', path: '/settings' },
  ];

  const cadreNavItems = [
    { icon: Home, label: '主页', sublabel: 'Dashboard', path: '/dashboard' },
    { icon: ClipboardList, label: '考勤记录', sublabel: 'Attendance', path: '/attendance' },
    { icon: Users, label: '我的班级', sublabel: 'My Classes', path: '/my-classes' },
    { icon: BarChart3, label: '考勤报告', sublabel: 'Reports', path: '/reports' },
  ];

  const studentNavItems = [
    { icon: Home, label: '主页', sublabel: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: '我的考勤', sublabel: 'My Attendance', path: '/my-attendance' },
  ];

  const getNavItems = () => {
    switch (user?.role) {
      case 'super_admin':
        return adminNavItems;
      case 'cadre':
        return cadreNavItems;
      case 'student':
        return studentNavItems;
      default:
        return [];
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">导航菜单</h2>
            <p className="text-sm text-gray-500">Navigation</p>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {getNavItems().map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.sublabel}</div>
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
