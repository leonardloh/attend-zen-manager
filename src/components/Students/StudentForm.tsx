
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  phone: string;
  email?: string;
  class_name: string;
  enrollment_date: string;
  status: '活跃' | '旁听' | '保留';
  // Required fields
  postal_code: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  // Optional fields
  occupation?: string;
  academic_level?: 'Bachelor' | 'Master' | 'PhD' | 'Other';
  marriage_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
}

interface StudentFormProps {
  initialData?: Student;
  onSubmit: (student: Student | Omit<Student, 'id'>) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    student_id: initialData?.student_id || '',
    chinese_name: initialData?.chinese_name || '',
    english_name: initialData?.english_name || '',
    gender: initialData?.gender || 'male' as const,
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    class_name: initialData?.class_name || '',
    enrollment_date: initialData?.enrollment_date || new Date().toISOString().split('T')[0],
    status: initialData?.status || '活跃' as const,
    // Required fields
    postal_code: initialData?.postal_code || '',
    date_of_birth: initialData?.date_of_birth || '',
    emergency_contact_name: initialData?.emergency_contact_name || '',
    emergency_contact_phone: initialData?.emergency_contact_phone || '',
    emergency_contact_relation: initialData?.emergency_contact_relation || '',
    // Optional fields
    occupation: initialData?.occupation || '',
    academic_level: initialData?.academic_level || undefined,
    marriage_status: initialData?.marriage_status || undefined
  });

  const [open, setOpen] = useState(false);

  const classes = ['初级班A', '中级班B', '高级班C', '初级班D', '中级班E', '高级班F'];
  const statuses = ['活跃', '旁听', '保留'];
  const academicLevels = ['Bachelor', 'Master', 'PhD', 'Other'];
  const marriageStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];
  const emergencyRelations = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.student_id || !formData.chinese_name || !formData.english_name || 
        !formData.phone || !formData.class_name || !formData.enrollment_date || 
        !formData.postal_code || !formData.date_of_birth || 
        !formData.emergency_contact_name || !formData.emergency_contact_phone || 
        !formData.emergency_contact_relation) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="student_id">学号 *</Label>
          <Input
            id="student_id"
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            placeholder="例如: S2024001"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="chinese_name">中文姓名 *</Label>
          <Input
            id="chinese_name"
            value={formData.chinese_name}
            onChange={(e) => setFormData({ ...formData, chinese_name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="english_name">英文姓名 *</Label>
          <Input
            id="english_name"
            value={formData.english_name}
            onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
            required
          />
        </div>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="enrollment_date">入学日期 *</Label>
          <Input
            id="enrollment_date"
            type="date"
            value={formData.enrollment_date}
            onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>所在班级 *</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {formData.class_name || "选择或输入班级..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="搜索或输入班级名称..." 
                  value={formData.class_name}
                  onValueChange={(value) => setFormData({ ...formData, class_name: value })}
                />
                <CommandList>
                  <CommandEmpty>没有找到班级。按回车键添加新班级。</CommandEmpty>
                  <CommandGroup>
                    {classes
                      .filter(className => 
                        className.toLowerCase().includes(formData.class_name.toLowerCase()) ||
                        formData.class_name === ''
                      )
                      .map((className) => (
                        <CommandItem
                          key={className}
                          value={className}
                          onSelect={(currentValue) => {
                            setFormData({ ...formData, class_name: currentValue });
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.class_name === className ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {className}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">状态 *</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as '活跃' | '旁听' | '保留' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">电话 *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="手机号码"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="电子邮箱"
        />
      </div>

      {/* New Required Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postal_code">邮政编码 *</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            placeholder="例如: 100000"
            required
          />
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

      {/* Emergency Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">紧急联系人信息</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">紧急联系人姓名 *</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              placeholder="联系人姓名"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">紧急联系人电话 *</Label>
            <Input
              id="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              placeholder="联系人电话"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_relation">与学员关系 *</Label>
          <Select
            value={formData.emergency_contact_relation}
            onValueChange={(value) => setFormData({ ...formData, emergency_contact_relation: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="选择关系" />
            </SelectTrigger>
            <SelectContent>
              {emergencyRelations.map((relation) => (
                <SelectItem key={relation} value={relation}>
                  {relation === 'Parent' ? '父母' :
                   relation === 'Spouse' ? '配偶' :
                   relation === 'Sibling' ? '兄弟姐妹' :
                   relation === 'Child' ? '子女' :
                   relation === 'Friend' ? '朋友' :
                   '其他'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Optional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">可选信息</h3>
        
        <div className="space-y-2">
          <Label htmlFor="occupation">职业</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            placeholder="职业或工作"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="academic_level">学历水平</Label>
            <Select
              value={formData.academic_level}
              onValueChange={(value: 'Bachelor' | 'Master' | 'PhD' | 'Other') => 
                setFormData({ ...formData, academic_level: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择学历" />
              </SelectTrigger>
              <SelectContent>
                {academicLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === 'Bachelor' ? '学士学位' :
                     level === 'Master' ? '硕士学位' :
                     level === 'PhD' ? '博士学位' :
                     '其他'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="marriage_status">婚姻状况</Label>
            <Select
              value={formData.marriage_status}
              onValueChange={(value: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other') => 
                setFormData({ ...formData, marriage_status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择婚姻状况" />
              </SelectTrigger>
              <SelectContent>
                {marriageStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'Single' ? '单身' :
                     status === 'Married' ? '已婚' :
                     status === 'Divorced' ? '离异' :
                     status === 'Widowed' ? '丧偶' :
                     '其他'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? '更新学员' : '添加学员'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
