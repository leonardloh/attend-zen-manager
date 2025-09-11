import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ClassMultiSelect from './ClassMultiSelect';
import ClassSearchInput from '@/components/Classes/ClassSearchInput';
import StudentSearchInput from '@/components/Students/StudentSearchInput';
import { useData } from '@/contexts/DataContext';
import { Cadre, CadreRole } from '@/data/mockData';

interface CadreFormProps {
  initialData?: Cadre;
  onSubmit: (cadre: Cadre | Omit<Cadre, 'id'>) => void;
  onCancel: () => void;
}

const CadreForm: React.FC<CadreFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { students, classes } = useData();

  // Extract role information from initialData if it exists
  const initialRole = initialData?.roles && initialData.roles.length > 0 
    ? initialData.roles[0] 
    : { class_name: initialData?.mother_class || '', role: initialData?.role || '班长' };

  const [formData, setFormData] = useState({
    student_id: initialData?.student_id || '',
    chinese_name: initialData?.chinese_name || '',
    english_name: initialData?.english_name || '',
    gender: initialData?.gender || 'male' as const,
    date_of_birth: initialData?.date_of_birth || '',
    role: initialRole.role as '班长' | '副班长' | '关怀员',
    mother_class: initialRole.class_name || '',
    support_classes: initialData?.support_classes || [],
    can_take_attendance: initialData?.can_take_attendance ?? true,
    can_register_students: initialData?.can_register_students ?? true
  });

  const roles = ['班长', '副班长', '关怀员'];
  
  // Available class names for the multi-select (extracted from our class data)
  const availableClasses = classes.map(cls => cls.name);

  // Auto-populate student information when student is selected
  useEffect(() => {
    if (formData.student_id) {
      const selectedStudent = students.find(s => s.student_id === formData.student_id);
      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          chinese_name: selectedStudent.chinese_name,
          english_name: selectedStudent.english_name,
          gender: selectedStudent.gender,
          date_of_birth: selectedStudent.date_of_birth,
          mother_class: prev.mother_class || selectedStudent.class_name || '' // Use student's class as default if no mother class selected
        }));
      }
    }
  }, [formData.student_id, students]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.student_id || !formData.role || !formData.mother_class) {
      alert('请填写所有必填字段 (Please fill in all required fields)');
      return;
    }
    
    // Find the class ID for the mother class
    const motherClass = classes.find(c => c.name === formData.mother_class);
    const classId = motherClass ? motherClass.id : '';
    
    // Create the cadre object with the new structure
    const cadreData = {
      student_id: formData.student_id,
      chinese_name: formData.chinese_name,
      english_name: formData.english_name,
      phone: students.find(s => s.student_id === formData.student_id)?.phone || '',
      email: students.find(s => s.student_id === formData.student_id)?.email || '',
      roles: [{
        class_id: classId,
        class_name: formData.mother_class,
        role: formData.role,
        appointment_date: new Date().toISOString().split('T')[0]
      }] as CadreRole[],
      support_classes: formData.support_classes,
      can_take_attendance: formData.can_take_attendance,
      can_register_students: formData.can_register_students,
      status: '活跃' as const,
      created_date: new Date().toISOString().split('T')[0]
    };

    if (initialData) {
      onSubmit({ ...cadreData, id: initialData.id });
    } else {
      onSubmit(cadreData);
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