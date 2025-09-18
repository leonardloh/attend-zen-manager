import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Building2 } from 'lucide-react';
import StudentSearchInput from '@/components/Students/StudentSearchInput';
import SubBranchNameSearchInput from '@/components/Classrooms/SubBranchNameSearchInput';
import ClassroomNameSearchInput, { type ClassroomLookupItem } from '@/components/Classrooms/ClassroomNameSearchInput';
import type { SubBranch, MainBranch } from '@/data/types';
import { useDatabase } from '@/contexts/DatabaseContext';

interface SubBranchFormProps {
  initialData?: SubBranch;
  onSubmit: (branch: (SubBranch | Omit<SubBranch, 'id'>) & { manage_classrooms?: string[] }) => void;
  onCancel: () => void;
  mainBranches: MainBranch[];
  hideMainBranchSelection?: boolean; // New prop to hide main branch selection
  allSubBranches?: SubBranch[]; // All sub-branches for search functionality
  useSimpleNameInput?: boolean; // New prop to use simple text input instead of search
  isSimplifiedMode?: boolean; // New prop for simplified mode with only name search
  classrooms?: ClassroomLookupItem[];
}

const SubBranchForm: React.FC<SubBranchFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  mainBranches, 
  hideMainBranchSelection = false, 
  allSubBranches = [],
  useSimpleNameInput = false,
  isSimplifiedMode = false,
  classrooms = []
}) => {

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

  const [managedClassrooms, setManagedClassrooms] = useState<ClassroomLookupItem[]>([]);
  const [classroomSearchValue, setClassroomSearchValue] = useState('');

  const { students } = useDatabase();

  // Auto-populate contact information when student is selected
  useEffect(() => {
    if (formData.student_id) {
      const selectedStudent = students.find(s => s.student_id === formData.student_id);
      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          contact_person: selectedStudent.chinese_name,
          contact_phone: selectedStudent.phone
        }));
      }
    }
  }, [formData.student_id, students]);

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
      if (!hideMainBranchSelection && !formData.main_branch_id) {
        alert('请选择所属州属分院 (Please select managing state branch)');
        return;
      }
    }
    
    const submissionPayload = initialData
      ? { ...formData, id: initialData.id, manage_classrooms: managedClassrooms.map((cls) => cls.id) }
      : { ...formData, manage_classrooms: managedClassrooms.map((cls) => cls.id) };

    onSubmit(submissionPayload);
  };

  // Malaysian states
  const states = [
    '玻璃市', '吉打', '槟城', '霹雳', '雪隆', '森美兰', '马六甲', '柔佛',
    '彭亨', '登嘉楼', '吉兰丹', '东马', '沙巴', '砂拉越', '纳闽'
  ];

  // Pre-populate classroom associations when editing existing sub-branch
  useEffect(() => {
    if (initialData?.id) {
      const current = classrooms.filter((cls) => cls.sub_branch_id === initialData.id);
      setManagedClassrooms(current);
    } else {
      setManagedClassrooms([]);
    }
  }, [initialData?.id, classrooms]);

  useEffect(() => {
    setManagedClassrooms((prev) =>
      prev.map((cls) => ({
        ...cls,
        sub_branch_name: formData.name || cls.sub_branch_name,
      }))
    );
  }, [formData.name]);

  const handleClassroomSelect = (classroomName: string, classroom?: ClassroomLookupItem) => {
    if (classroom) {
      const alreadyManaged = managedClassrooms.some((cls) => cls.id === classroom.id);
      if (!alreadyManaged) {
        setManagedClassrooms((prev) => [
          ...prev,
          {
            ...classroom,
            sub_branch_id: initialData?.id || classroom.sub_branch_id,
            sub_branch_name: formData.name || classroom.sub_branch_name,
          },
        ]);
      }
      setClassroomSearchValue('');
    } else {
      setClassroomSearchValue(classroomName);
    }
  };

  const handleRemoveClassroom = (classroomId: string) => {
    setManagedClassrooms((prev) => prev.filter((cls) => cls.id !== classroomId));
  };

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
                  <Label htmlFor="main_branch">所属州属分院</Label>
                  <Select
                    value={formData.main_branch_id}
                    onValueChange={handleMainBranchChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择州属分院（可选）" />
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
                  <strong>提示:</strong> 未选择所属州属分院，该分院将作为独立分院进行管理。
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">管理教室</h3>
        <div className="space-y-2">
          <Label>搜索并添加教室</Label>
          <ClassroomNameSearchInput
            value={classroomSearchValue}
            onChange={handleClassroomSelect}
            placeholder="搜索教室名称..."
            classrooms={classrooms}
            disabledIds={managedClassrooms.map((cls) => cls.id)}
          />
          <p className="text-xs text-gray-500">选择现有教室会自动关联到此分院</p>
        </div>

        <div className="space-y-3">
          {managedClassrooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>该分院下暂无教室</p>
              <p className="text-sm">使用上方搜索栏添加教室</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>教室名称</TableHead>
                    <TableHead>州属</TableHead>
                    <TableHead>当前所属分院</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managedClassrooms.map((classroom) => (
                    <TableRow key={classroom.id}>
                      <TableCell className="font-medium">{classroom.name}</TableCell>
                      <TableCell>
                        {classroom.state ? (
                          <Badge variant="outline" className="text-xs">
                            {classroom.state}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {classroom.sub_branch_name ? (
                          <span>{classroom.sub_branch_name}</span>
                        ) : (
                          <span className="text-xs text-gray-500">未分配</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveClassroom(classroom.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
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
