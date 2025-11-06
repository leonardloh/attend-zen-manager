
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Student {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  phone: string;
  email?: string;
  enrollment_date: string;
  status: '活跃' | '不活跃' | '退学' | '往生';
  state?: string;
  // Required fields
  postal_code: string;
  year_of_birth: number;
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
  onSubmit: (student: Student | Omit<Student, 'id'>) => Promise<boolean | void>;
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
    enrollment_date: initialData?.enrollment_date || new Date().toISOString().split('T')[0],
    status: initialData?.status || '活跃' as const,
    // Required fields
    postal_code: initialData?.postal_code || '',
    year_of_birth: initialData?.year_of_birth || new Date().getFullYear() - 25,
    emergency_contact_name: initialData?.emergency_contact_name || '',
    emergency_contact_phone: initialData?.emergency_contact_phone || '',
    emergency_contact_relation: initialData?.emergency_contact_relation || '',
    // Optional fields
    state: initialData?.state || '',
    occupation: initialData?.occupation || '',
    academic_level: initialData?.academic_level || undefined,
    marriage_status: initialData?.marriage_status || undefined
  });

  const statuses = ['活跃', '不活跃', '退学', '往生'];
  const academicLevels = ['Bachelor', 'Master', 'PhD', 'Other'];
  const marriageStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];
  const emergencyRelations = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'];
  const malaysiaStates = [
    '玻璃市','吉打','槟城','霹雳','雪隆','森美兰','马六甲','柔佛',
    '彭亨','登嘉楼','吉兰丹','沙巴','砂拉越','纳闽','东马'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.student_id || !formData.chinese_name || !formData.english_name || 
        !formData.phone || !formData.enrollment_date || !formData.state ||
        !formData.postal_code || !formData.year_of_birth || 
        !formData.emergency_contact_name || !formData.emergency_contact_phone || 
        !formData.emergency_contact_relation) {
      alert('请填写所有必填字段（含州属） (Please fill in all required fields, including state)');
      return;
    }
    
    if (initialData) {
      await onSubmit({ ...formData, id: initialData.id });
    } else {
      await onSubmit(formData);
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">状态 *</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as '活跃' | '不活跃' | '退学' | '往生' })}
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

      {/* New Required/Location Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">所在州属 *</Label>
          <Select
            value={formData.state}
            onValueChange={(value) => setFormData({ ...formData, state: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择州属" />
            </SelectTrigger>
            <SelectContent>
              {malaysiaStates.map((st) => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year_of_birth">出生年份 *</Label>
          <Input
            id="year_of_birth"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.year_of_birth}
            onChange={(e) => setFormData({ ...formData, year_of_birth: parseInt(e.target.value) || new Date().getFullYear() - 25 })}
            placeholder="例如: 1995"
            required
          />
        </div>
        <div></div>
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
