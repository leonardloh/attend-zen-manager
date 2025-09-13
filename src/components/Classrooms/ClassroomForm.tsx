import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentSearchInput from '@/components/Students/StudentSearchInput';
import { useToast } from '@/hooks/use-toast';
import type { SubBranch } from '@/data/types';
import { useDatabase } from '@/contexts/DatabaseContext';

export interface ClassroomFormData {
  name: string;
  state?: string;
  address?: string;
  student_id?: string; // public student_id string
  sub_branch_id: string; // sub branch id (string)
}

interface ClassroomFormProps {
  initialData?: ClassroomFormData & { id: string };
  onSubmit: (data: ClassroomFormData | (ClassroomFormData & { id: string })) => void;
  onCancel: () => void;
  subBranches: SubBranch[];
}

const ClassroomForm: React.FC<ClassroomFormProps> = ({ initialData, onSubmit, onCancel, subBranches }) => {
  const [formData, setFormData] = useState<ClassroomFormData>({
    name: initialData?.name || '',
    state: initialData?.state || '',
    address: initialData?.address || '',
    student_id: initialData?.student_id || '',
    sub_branch_id: initialData?.sub_branch_id || ''
  });

  const { students } = useDatabase();
  const { toast } = useToast();

  useEffect(() => {
    // no-op; reserved for future auto-fill
  }, [formData.student_id, students]);

  const states = [
    '玻璃市', '吉打', '槟城', '霹雳', '雪隆', '森美兰', '马六甲', '柔佛',
    '彭亨', '登嘉楼', '吉兰丹', '东马', '沙巴', '砂拉越', '纳闽'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sub_branch_id) {
      toast({ title: '校验失败', description: '请填写教室名称并选择所属分院', variant: 'destructive' });
      return;
    }
    if (initialData) onSubmit({ ...formData, id: initialData.id });
    else onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">教室基本信息</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">教室名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入教室名称..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subBranch">所属分院 *</Label>
            <Select
              value={formData.sub_branch_id}
              onValueChange={(value) => setFormData({ ...formData, sub_branch_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择所属分院" />
              </SelectTrigger>
              <SelectContent>
                {subBranches
                  .filter(sb => sb.id && String(sb.id).length > 0)
                  .map(sb => (
                    <SelectItem key={sb.id} value={sb.id}>
                      {sb.name} {sb.main_branch_name ? `（${sb.main_branch_name}）` : ''}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">所在州属</Label>
            <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
              <SelectTrigger>
                <SelectValue placeholder="选择州属" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="student">负责人学员</Label>
            <StudentSearchInput
              value={formData.student_id}
              onChange={(studentId) => setFormData({ ...formData, student_id: studentId })}
              placeholder="搜索学员编号或姓名..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">地址</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="教室详细地址..."
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? '更新教室' : '添加教室'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
};

export default ClassroomForm;
