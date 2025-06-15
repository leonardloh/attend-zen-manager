
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Cadre {
  id: string;
  chinese_name: string;
  english_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  class_assignments: string[];
  appointment_date: string;
  status: 'active' | 'inactive';
  permissions: string[];
}

interface CadreFormProps {
  initialData?: Cadre;
  onSubmit: (cadre: Cadre | Omit<Cadre, 'id'>) => void;
  onCancel: () => void;
}

const CadreForm: React.FC<CadreFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    chinese_name: initialData?.chinese_name || '',
    english_name: initialData?.english_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    class_assignments: initialData?.class_assignments || [],
    appointment_date: initialData?.appointment_date || new Date().toISOString().split('T')[0],
    status: initialData?.status || 'active' as const,
    permissions: initialData?.permissions || []
  });

  const [newClassAssignment, setNewClassAssignment] = useState('');
  const [newPermission, setNewPermission] = useState('');

  const positions = ['班长', '副班长', '学习组长', '宣传干事', '体育委员', '文艺委员', '生活委员'];
  const departments = ['学生会', '学习部', '宣传部', '体育部', '文艺部', '生活部'];
  const availablePermissions = [
    'attendance_management',
    'student_reports', 
    'class_management',
    'event_planning',
    'announcement_posting'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
  };

  const addClassAssignment = () => {
    if (newClassAssignment.trim() && !formData.class_assignments.includes(newClassAssignment.trim())) {
      setFormData({
        ...formData,
        class_assignments: [...formData.class_assignments, newClassAssignment.trim()]
      });
      setNewClassAssignment('');
    }
  };

  const removeClassAssignment = (classToRemove: string) => {
    setFormData({
      ...formData,
      class_assignments: formData.class_assignments.filter(c => c !== classToRemove)
    });
  };

  const addPermission = () => {
    if (newPermission && !formData.permissions.includes(newPermission)) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, newPermission]
      });
      setNewPermission('');
    }
  };

  const removePermission = (permissionToRemove: string) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.filter(p => p !== permissionToRemove)
    });
  };

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      'attendance_management': '考勤管理',
      'student_reports': '学生报告',
      'class_management': '班级管理',
      'event_planning': '活动策划',
      'announcement_posting': '公告发布'
    };
    return labels[permission] || permission;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chinese_name">中文姓名 *</Label>
          <Input
            id="chinese_name"
            value={formData.chinese_name}
            onChange={(e) => setFormData({ ...formData, chinese_name: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="english_name">英文姓名 *</Label>
          <Input
            id="english_name"
            value={formData.english_name}
            onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">邮箱 *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">电话</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">职位 *</Label>
          <select
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">选择职位</option>
            {positions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">部门 *</Label>
          <select
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">选择部门</option>
            {departments.map(department => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointment_date">任职日期 *</Label>
          <Input
            id="appointment_date"
            type="date"
            value={formData.appointment_date}
            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">状态 *</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
          </select>
        </div>
      </div>

      {/* Class Assignments */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium">负责班级</Label>
          <div className="mt-2">
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="输入班级名称"
                value={newClassAssignment}
                onChange={(e) => setNewClassAssignment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addClassAssignment())}
              />
              <Button type="button" onClick={addClassAssignment}>添加</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.class_assignments.map((classAssignment) => (
                <Badge key={classAssignment} variant="secondary" className="gap-1">
                  {classAssignment}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeClassAssignment(classAssignment)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium">权限</Label>
          <div className="mt-2">
            <div className="flex gap-2 mb-3">
              <select
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择权限</option>
                {availablePermissions.filter(p => !formData.permissions.includes(p)).map(permission => (
                  <option key={permission} value={permission}>
                    {getPermissionLabel(permission)}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={addPermission}>添加</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="gap-1">
                  {getPermissionLabel(permission)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removePermission(permission)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? '更新干部' : '添加干部'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
};

export default CadreForm;
