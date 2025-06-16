
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  phone?: string;
  email?: string;
  class_name: string;
  enrollment_date: string;
  status: '活跃' | '旁听' | '保留';
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
    status: initialData?.status || '活跃' as const
  });

  const [open, setOpen] = useState(false);

  const classes = ['初级班A', '中级班B', '高级班C', '初级班D', '中级班E', '高级班F'];
  const statuses = ['活跃', '旁听', '保留'];

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
          <Label>班级 *</Label>
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
          <Label htmlFor="phone">电话</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="手机号码"
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

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? '更新学生' : '添加学生'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
