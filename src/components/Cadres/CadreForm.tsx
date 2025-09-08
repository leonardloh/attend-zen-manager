
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ClassMultiSelect from './ClassMultiSelect';
import ClassSearchInput from '@/components/Classes/ClassSearchInput';
import StudentSearchInput from '@/components/Students/StudentSearchInput';

interface Cadre {
  id: string;
  student_id: string; // Reference to student
  chinese_name: string; // Auto-populated from student
  english_name: string; // Auto-populated from student
  gender: 'male' | 'female'; // Auto-populated from student
  date_of_birth: string; // Auto-populated from student
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
  // Mock students data - in real app this would come from API or props
  const mockStudents = [
    {
      id: '1',
      student_id: 'S2024001',
      chinese_name: '王小明',
      english_name: 'Wang Xiaoming',
      gender: 'male' as const,
      date_of_birth: '1995-05-15',
      class_name: '初级班A'
    },
    {
      id: '2',
      student_id: 'S2024002',
      chinese_name: '李小红',
      english_name: 'Li Xiaohong',
      gender: 'female' as const,
      date_of_birth: '1992-08-22',
      class_name: '中级班B'
    },
    {
      id: '3',
      student_id: 'S2024003',
      chinese_name: '张三',
      english_name: 'Zhang San',
      gender: 'male' as const,
      date_of_birth: '1988-12-10',
      class_name: '高级班C'
    },
    {
      id: '4',
      student_id: 'S2024004',
      chinese_name: '李四',
      english_name: 'Li Si',
      gender: 'female' as const,
      date_of_birth: '1990-03-25',
      class_name: '初级班A'
    }
  ];

  const [formData, setFormData] = useState({
    student_id: initialData?.student_id || '',
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

  // Auto-populate student information when student is selected
  useEffect(() => {
    if (formData.student_id) {
      const selectedStudent = mockStudents.find(s => s.student_id === formData.student_id);
      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          chinese_name: selectedStudent.chinese_name,
          english_name: selectedStudent.english_name,
          gender: selectedStudent.gender,
          date_of_birth: selectedStudent.date_of_birth,
          mother_class: prev.mother_class || selectedStudent.class_name // Use student's class as default if no mother class selected
        }));
      }
    }
  }, [formData.student_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.student_id || !formData.role || !formData.mother_class) {
      alert('请填写所有必填字段 (Please fill in all required fields)');
      return;
    }
    
    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">学员选择</h3>
        
        <div className="space-y-2">
          <Label htmlFor="student_id">学员编号 *</Label>
          <StudentSearchInput
            value={formData.student_id}
            onChange={(studentId) => setFormData({ ...formData, student_id: studentId })}
            placeholder="搜索学员编号或姓名..."
          />
        </div>

        {/* Display selected student information */}
        {formData.student_id && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">已选择学员信息</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">中文姓名:</span>
                <span className="ml-2 font-medium">{formData.chinese_name}</span>
              </div>
              <div>
                <span className="text-gray-600">英文姓名:</span>
                <span className="ml-2 font-medium">{formData.english_name}</span>
              </div>
              <div>
                <span className="text-gray-600">性别:</span>
                <span className="ml-2 font-medium">{formData.gender === 'male' ? '男' : '女'}</span>
              </div>
              <div>
                <span className="text-gray-600">出生日期:</span>
                <span className="ml-2 font-medium">{formData.date_of_birth}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <Label htmlFor="role">职位 *</Label>
        <Select
          value={formData.role}
          onValueChange={(value: '班长' | '副班长' | '关怀员') => 
            setFormData({ ...formData, role: value })
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="选择职位" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mother_class">母班班名 *</Label>
        <ClassSearchInput
          value={formData.mother_class}
          onChange={(className) => setFormData({ ...formData, mother_class: className })}
          placeholder="选择或搜索班级..."
        />
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
              <Label htmlFor="can_register_students">学员注册权限</Label>
              <p className="text-sm text-gray-500">允许该干部注册新学员</p>
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
