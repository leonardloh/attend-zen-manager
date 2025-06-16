
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ClassMultiSelect from './ClassMultiSelect';
import ClassSearchInput from '@/components/Classes/ClassSearchInput';

interface Cadre {
  id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  role: '班长' | '副班长' | '关怀员';
  mother_class: string;
  support_classes: string[];
  can_take_attendance: boolean;
  can_register_students: boolean;
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
    gender: initialData?.gender || 'male' as const,
    date_of_birth: initialData?.date_of_birth || '',
    role: initialData?.role || '班长' as const,
    mother_class: initialData?.mother_class || '',
    support_classes: initialData?.support_classes || [],
    can_take_attendance: initialData?.can_take_attendance ?? true,
    can_register_students: initialData?.can_register_students ?? true
  });

  const roles = ['班长', '副班长', '关怀员'];
  
  // Available class names for the multi-select (extracted from our class data)
  const availableClasses = [
    '初级班A', '中级班B', '高级班C', '周末班D', 
    '初级班D', '中级班E', '高级班F'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
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
          <Label htmlFor="gender">性别 *</Label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">出生日期 *</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">职位 *</Label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as '班长' | '副班长' | '关怀员' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mother_class">母班班名 *</Label>
          <ClassSearchInput
            value={formData.mother_class}
            onChange={(className) => setFormData({ ...formData, mother_class: className })}
            placeholder="搜索母班班名..."
            excludeClasses={formData.support_classes}
            includeInactive={false}
          />
        </div>
      </div>

      <ClassMultiSelect
        value={formData.support_classes}
        onChange={(classes) => setFormData({ ...formData, support_classes: classes })}
        availableClasses={availableClasses}
      />

      {/* Permissions Section */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">权限设置</h3>
        <p className="text-sm text-gray-600">Permission Settings</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="can_take_attendance">考勤管理权限</Label>
              <p className="text-sm text-gray-500">允许该干部管理班级考勤</p>
            </div>
            <Switch
              id="can_take_attendance"
              checked={formData.can_take_attendance}
              onCheckedChange={(checked) => setFormData({ ...formData, can_take_attendance: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="can_register_students">学生注册权限</Label>
              <p className="text-sm text-gray-500">允许该干部注册新学生</p>
            </div>
            <Switch
              id="can_register_students"
              checked={formData.can_register_students}
              onCheckedChange={(checked) => setFormData({ ...formData, can_register_students: checked })}
            />
          </div>
        </div>
      </div>

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
