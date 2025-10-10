
import React from 'react';
import PasswordChangeForm from '@/components/Settings/PasswordChangeForm';
import { useHybridAuth } from '@/hooks/useHybridAuth';

const Settings: React.FC = () => {
  const { user } = useHybridAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-600">System Settings</p>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">账户设置</h2>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">当前用户信息</h3>
            <div className="text-sm text-blue-800">
              <p><strong>姓名：</strong>{user?.chinese_name}</p>
              <p><strong>学号：</strong>{user?.student_id}</p>
              <p><strong>角色：</strong>{user?.role === 'super_admin' ? '超级管理员' : user?.role === 'cadre' ? '干部' : '学员'}</p>
            </div>
          </div>
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
};

export default Settings;
