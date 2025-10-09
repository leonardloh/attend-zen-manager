import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentSearchInput from '@/components/Students/StudentSearchInput';
import { useToast } from '@/hooks/use-toast';
import type { SubBranch } from '@/data/types';
import { useDatabase } from '@/contexts/DatabaseContext';
import SubBranchNameSearchInput from '@/components/Classrooms/SubBranchNameSearchInput';
import { Badge } from '@/components/ui/badge';

export interface ClassroomFormData {
  name: string;
  state?: string;
  address?: string;
  student_id?: string; // public student_id string
  sub_branch_id: string; // sub branch id (string)
  sub_branch_name?: string;
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
    sub_branch_id: initialData?.sub_branch_id || '',
    sub_branch_name: initialData?.sub_branch_name || ''
  });
  const [selectedSubBranchName, setSelectedSubBranchName] = useState<string>(initialData?.sub_branch_name || '');

  const { students } = useDatabase();
  const { toast } = useToast();

  const selectedSubBranch = useMemo(() => {
    if (!formData.sub_branch_id) {
      return subBranches.find((sb) => sb.name === selectedSubBranchName);
    }
    return subBranches.find((sb) => sb.id === formData.sub_branch_id) ||
      subBranches.find((sb) => sb.name === selectedSubBranchName);
  }, [formData.sub_branch_id, selectedSubBranchName, subBranches]);

  useEffect(() => {
    if (initialData?.sub_branch_id && subBranches.length > 0) {
      const existing = subBranches.find((sb) => sb.id === initialData.sub_branch_id);
      if (existing) {
        setSelectedSubBranchName(existing.name);
        setFormData((prev) => ({ ...prev, sub_branch_name: existing.name }));
      }
    }
  }, [initialData?.sub_branch_id, subBranches]);

  useEffect(() => {
    // no-op; reserved for future auto-fill
  }, [formData.student_id, students]);

  const handleSubBranchSelect = (branchName: string, branchData?: SubBranch) => {
    if (branchData) {
      setFormData((prev) => ({
        ...prev,
        sub_branch_id: branchData.id,
        sub_branch_name: branchData.name,
        state: prev.state || branchData.state,
      }));
      setSelectedSubBranchName(branchData.name);
    } else {
      setSelectedSubBranchName(branchName);
      const matched = subBranches.find((sb) => sb.name === branchName);
      setFormData((prev) => ({
        ...prev,
        sub_branch_id: matched ? matched.id : '',
        sub_branch_name: branchName || matched?.name,
      }));
    }
  };

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
            <Label>所属分院 *</Label>
            <SubBranchNameSearchInput
              value={selectedSubBranchName}
              onChange={handleSubBranchSelect}
              placeholder="搜索分院名称..."
              subBranches={subBranches}
            />
            {selectedSubBranch && (
              <div className="mt-2 text-sm text-green-600 bg-green-50 p-3 rounded border border-green-100">
                <div className="font-medium">已选择: {selectedSubBranch.name}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-green-700">
                  {selectedSubBranch.state && (
                    <Badge variant="outline" className="border-green-200 text-green-700">
                      州属: {selectedSubBranch.state}
                    </Badge>
                  )}
                  {selectedSubBranch.main_branch_name && (
                    <Badge variant="outline" className="border-green-200 text-green-700">
                      州属分院: {selectedSubBranch.main_branch_name}
                    </Badge>
                  )}
                </div>
                {(selectedSubBranch.contact_person || selectedSubBranch.contact_phone) && (
                  <div className="mt-2 text-xs text-green-700 space-y-1">
                    {selectedSubBranch.contact_person && (
                      <div>联系人: {selectedSubBranch.contact_person}</div>
                    )}
                    {selectedSubBranch.contact_phone && (
                      <div>电话: {selectedSubBranch.contact_phone}</div>
                    )}
                  </div>
                )}
              </div>
            )}
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
