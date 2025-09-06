import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentSearchInput from '@/components/Students/StudentSearchInput';
import SubBranchNameSearchInput from '@/components/Classrooms/SubBranchNameSearchInput';
import type { SubBranch, MainBranch } from '@/pages/Classrooms';

interface SubBranchFormProps {
  initialData?: SubBranch;
  onSubmit: (branch: SubBranch | Omit<SubBranch, 'id'>) => void;
  onCancel: () => void;
  mainBranches: MainBranch[];
  hideMainBranchSelection?: boolean; // New prop to hide main branch selection
  allSubBranches?: SubBranch[]; // All sub-branches for search functionality
  useSimpleNameInput?: boolean; // New prop to use simple text input instead of search
  isSimplifiedMode?: boolean; // New prop for simplified mode with only name search
}

const SubBranchForm: React.FC<SubBranchFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  mainBranches, 
  hideMainBranchSelection = false, 
  allSubBranches = [],
  useSimpleNameInput = false,
  isSimplifiedMode = false
}) => {
  // Mock students data - in real app this would come from API or props
  const mockStudents = [
    {
      id: '1',
      student_id: 'S2024001',
      chinese_name: '王小明',
      english_name: 'Wang Xiaoming',
      phone: '13800138001'
    },
    {
      id: '2',
      student_id: 'S2024002',
      chinese_name: '李小红',
      english_name: 'Li Xiaohong',
      phone: '13800138002'
    },
    {
      id: '3',
      student_id: 'S2024003',
      chinese_name: '张三',
      english_name: 'Zhang San',
      phone: '13800138003'
    },
    {
      id: '4',
      student_id: 'S2024004',
      chinese_name: '李四',
      english_name: 'Li Si',
      phone: '13800138004'
    }
  ];

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    main_branch_id: initialData?.main_branch_id || '',
    main_branch_name: initialData?.main_branch_name || '',
    region_id: initialData?.region_id || '',
    region_name: initialData?.region_name || '',
    state: initialData?.state || '',
    address: initialData?.address || '',
    student_id: initialData?.student_id || '',
    contact_person: initialData?.contact_person || '',
    contact_phone: initialData?.contact_phone || '',
    created_date: initialData?.created_date || new Date().toISOString().split('T')[0]
  });

  // Auto-populate contact information when student is selected
  useEffect(() => {
    if (formData.student_id) {
      const selectedStudent = mockStudents.find(s => s.student_id === formData.student_id);
      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          contact_person: selectedStudent.chinese_name,
          contact_phone: selectedStudent.phone
        }));
      }
    }
  }, [formData.student_id]);

  // Auto-populate information when sub-branch is selected from search
  const handleSubBranchSelect = (branchName: string, branchData?: SubBranch) => {
    if (branchData) {
      // Auto-populate fields from selected sub-branch
      setFormData(prev => ({
        ...prev,
        name: branchData.name,
        state: branchData.state,
        address: branchData.address || '',
        student_id: branchData.student_id || '',
        contact_person: branchData.contact_person || '',
        contact_phone: branchData.contact_phone || ''
      }));
    } else {
      // Manual input - only update name
      setFormData(prev => ({ ...prev, name: branchName }));
    }
  };

  const handleMainBranchChange = (mainBranchId: string) => {
    const selectedBranch = mainBranches.find(b => b.id === mainBranchId);
    setFormData({
      ...formData,
      main_branch_id: mainBranchId,
      main_branch_name: selectedBranch?.name || '',
      region_id: selectedBranch?.region_id || '',
      region_name: selectedBranch?.region_name || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simplified validation for simplified mode - only name is required
    if (isSimplifiedMode) {
      if (!formData.name) {
        alert('请填写分院名称 (Please fill in sub-branch name)');
        return;
      }
    } else {
      // Full validation - name and state are required
      if (!formData.name || !formData.state) {
        alert('请填写分院名称和所在州属 (Please fill in sub-branch name and state)');
        return;
      }
    }
    
    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
  };

  // Malaysian states
  const states = [
    '玻璃市', '吉打', '槟城', '霹雳', '雪隆', '森美兰', '马六甲', '柔佛',
    '彭亨', '登嘉楼', '吉兰丹', '东马', '沙巴', '砂拉越', '纳闽'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">分院基本信息</h3>
        
        {isSimplifiedMode ? (
          // Simplified mode - only show name search
          <div className="space-y-2">
            <Label htmlFor="name">分院名称 *</Label>
            <SubBranchNameSearchInput
              value={formData.name}
              onChange={handleSubBranchSelect}
              placeholder="搜索分院名称..."
              subBranches={allSubBranches}
            />
            {formData.name && (
              <p className="text-sm text-green-600">已选择: {formData.name}</p>
            )}
          </div>
        ) : (
          // Full mode - show all fields
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">分院名称 *</Label>
                {useSimpleNameInput ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入新分院名称..."
                    required
                  />
                ) : (
                  <SubBranchNameSearchInput
                    value={formData.name}
                    onChange={handleSubBranchSelect}
                    placeholder="搜索或输入分院名称..."
                    subBranches={allSubBranches}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">所在州属 *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择州属" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {!hideMainBranchSelection && (
                <div className="space-y-2">
                  <Label htmlFor="main_branch">所属总院</Label>
                  <Select
                    value={formData.main_branch_id}
                    onValueChange={handleMainBranchChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择总院（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} ({branch.region_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Display selected region info */}
            {formData.region_name && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>所属地区:</strong> {formData.region_name}
                </p>
              </div>
            )}

            {/* Show message when no main branch is selected */}
            {!formData.main_branch_id && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>提示:</strong> 未选择所属总院，该分院将作为独立分院进行管理。
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">地址</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="分院详细地址..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">联系人学员</Label>
                <StudentSearchInput
                  value={formData.student_id}
                  onChange={(studentId) => setFormData({ ...formData, student_id: studentId })}
                  placeholder="搜索学员编号或姓名..."
                />
              </div>
            </div>

            {/* Display selected student contact information */}
            {formData.student_id && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">联系人信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">联系人:</span>
                    <span className="ml-2 font-medium">{formData.contact_person}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">电话:</span>
                    <span className="ml-2 font-medium">{formData.contact_phone}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="created_date">创建日期 *</Label>
              <Input
                id="created_date"
                type="date"
                value={formData.created_date}
                onChange={(e) => setFormData({ ...formData, created_date: e.target.value })}
                required
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? '更新分院' : '添加分院'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
};

export default SubBranchForm;