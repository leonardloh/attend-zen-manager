import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Building } from 'lucide-react';
import StudentSearchInput from '@/components/Students/StudentSearchInput';
import SubBranchNameSearchInput from '@/components/Classrooms/SubBranchNameSearchInput';
import type { Region } from '@/pages/Classrooms';
import type { MainBranch, SubBranch } from '@/data/types';
import { useDatabase } from '@/contexts/DatabaseContext';

interface MainBranchFormProps {
  initialData?: MainBranch;
  onSubmit: (branch: MainBranch | Omit<MainBranch, 'id'>) => void;
  onCancel: () => void;
  regions: Region[];
  subBranches?: SubBranch[]; // Sub-branches data from parent
  onNavigateToSubBranches?: () => void; // Callback to navigate to sub-branch management
  onSubBranchAdd?: (subBranchData: Omit<SubBranch, 'id'>) => void; // Callback for adding sub-branch
  onSubBranchEdit?: (subBranchData: SubBranch) => void; // Callback for editing sub-branch
  onSubBranchDelete?: (subBranchId: string) => void; // Callback for deleting sub-branch
}

const MainBranchForm: React.FC<MainBranchFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  regions, 
  subBranches, 
  onNavigateToSubBranches,
  onSubBranchAdd,
  onSubBranchEdit,
  onSubBranchDelete
}) => {
  // State for sub-branch management
  const [inlineSubBranchName, setInlineSubBranchName] = useState(''); // For inline search
  const [responsibleSubBranch, setResponsibleSubBranch] = useState(initialData?.sub_branch_responsible || ''); // For responsible sub-branch search
  const [managedSubBranches, setManagedSubBranches] = useState<SubBranch[]>([]); // Local state for managed sub-branches
  const [isEditingMode, setIsEditingMode] = useState(false); // Track if we're editing existing main branch

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sub_branch_responsible: initialData?.sub_branch_responsible || '',
    student_id: initialData?.student_id || '', // Use the student_id from initialData
    contact_person: initialData?.contact_person || '',
    contact_phone: initialData?.contact_phone || '',
    sub_branches_count: initialData?.sub_branches_count || 0,
    classes_count: initialData?.classes_count || 0,
    students_count: initialData?.students_count || 0
  });


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

  // Find selected sub-branch for detailed display
  const selectedSubBranch = subBranches?.find(sb => sb.name === formData.sub_branch_responsible);

  // Sync responsibleSubBranch state with initialData changes (for editing existing branches)
  useEffect(() => {
    console.log('🔄 useEffect triggered with initialData:', initialData);
    if (initialData?.sub_branch_responsible) {
      console.log('📝 Setting responsibleSubBranch to:', initialData.sub_branch_responsible);
      setResponsibleSubBranch(initialData.sub_branch_responsible);
      setFormData(prev => ({
        ...prev,
        sub_branch_responsible: initialData.sub_branch_responsible
      }));
    } else {
      console.log('❌ No sub_branch_responsible in initialData');
    }
  }, [initialData]);

  // Set editing mode and initialize managed sub-branches when subBranches data changes
  useEffect(() => {
    // Determine if we're in editing mode
    const editingMode = !!initialData?.id;
    setIsEditingMode(editingMode);
    console.log('📝 Edit mode:', editingMode);
    
    if (subBranches && initialData?.id) {
      const currentManagedSubBranches = subBranches.filter(sb => 
        sb.main_branch_id === initialData.id || 
        (sb.main_branch_name === formData.name && formData.name)
      );
      setManagedSubBranches(currentManagedSubBranches);
      console.log('🏢 Initialized managedSubBranches:', currentManagedSubBranches);
    }
  }, [subBranches, initialData?.id, formData.name]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.sub_branch_responsible || !formData.student_id) {
      alert('请填写所有必填字段，包括选择负责分院和负责人学员 (Please fill in all required fields including selecting responsible sub-branch and student)');
      return;
    }
    
    // Build manage_sub_branches array from local managed sub-branches
    const currentManagedSubBranches = managedSubBranches.map(sb => sb.id);
    console.log('🔍 Debug - managedSubBranches state:', managedSubBranches.map(sb => `${sb.name}(${sb.id})`));
    console.log('🔍 Debug - currentManagedSubBranches to send:', currentManagedSubBranches);
    console.log('🔍 Debug - isEditingMode:', isEditingMode);
    console.log('🔍 Debug - initialData?.id:', initialData?.id);
    
    // Create the main branch data with proper MainBranch interface structure
    const mainBranchData: Omit<MainBranch, 'id'> = {
      name: formData.name,
      sub_branch_responsible: formData.sub_branch_responsible,
      student_id: formData.student_id,
      contact_person: formData.contact_person,
      contact_phone: formData.contact_phone,
      sub_branches_count: formData.sub_branches_count,
      classes_count: formData.classes_count,
      students_count: formData.students_count,
      manage_sub_branches: currentManagedSubBranches, // Use actual managed sub-branches
    };
    
    console.log('🚀 Submitting main branch data:', {
      name: mainBranchData.name,
      manage_sub_branches: mainBranchData.manage_sub_branches,
      isUpdate: !!initialData
    });
    
    if (initialData) {
      onSubmit({ ...mainBranchData, id: initialData.id });
    } else {
      onSubmit(mainBranchData);
    }
  };

  // Handle responsible sub-branch selection
  const handleResponsibleSubBranchSelect = (branchName: string, branchData?: SubBranch) => {
    if (branchData && branchName) {
      setFormData(prev => ({
        ...prev,
        sub_branch_responsible: branchData.name
      }));
      setResponsibleSubBranch(branchData.name);
    } else {
      setResponsibleSubBranch(branchName);
    }
  };

  // Handle inline sub-branch selection
  const handleInlineSubBranchSelect = (branchName: string, branchData?: SubBranch) => {
    if (branchData && branchName) {
      // Check if already added to avoid duplicates
      const isAlreadyManaged = managedSubBranches.some(sb => sb.id === branchData.id);
      if (!isAlreadyManaged) {
        // Auto-create sub-branch association when selected from search
        const enrichedSubBranchData = {
          ...branchData,
          main_branch_id: initialData?.id || 'temp-id',
          main_branch_name: formData.name
        };
        
        // Add to local state immediately for visual feedback
        setManagedSubBranches(prev => [...prev, enrichedSubBranchData]);
        console.log('➕ Added sub-branch to local state:', enrichedSubBranchData.name);
        
        // Only call database callback if NOT in editing mode (to prevent race conditions)
        if (!isEditingMode && onSubBranchAdd) {
          console.log('🔄 Calling database callback for add (not in edit mode)');
          onSubBranchAdd(enrichedSubBranchData);
        } else if (isEditingMode) {
          console.log('⏸️ Skipping database callback - in editing mode, will update on form submission');
        }
      }
      setInlineSubBranchName(''); // Clear search after adding
    } else {
      setInlineSubBranchName(branchName);
    }
  };

  // Handle delete sub-branch
  const handleDeleteSubBranch = (subBranchId: string) => {
    // Remove from local state immediately for visual feedback
    setManagedSubBranches(prev => prev.filter(sb => sb.id !== subBranchId));
    console.log('➖ Removed sub-branch from local state:', subBranchId);
    
    // Only call database callback if NOT in editing mode (to prevent race conditions)
    if (!isEditingMode && onSubBranchDelete) {
      console.log('🔄 Calling database callback for delete (not in edit mode)');
      onSubBranchDelete(subBranchId);
    } else if (isEditingMode) {
      console.log('⏸️ Skipping database callback - in editing mode, will update on form submission');
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">总院基本信息</h3>
        
        <div className="space-y-2">
          <Label htmlFor="name">总院名称 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如: 北马总院"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsible_subbranch">负责分院 *</Label>
          <SubBranchNameSearchInput
            value={responsibleSubBranch}
            onChange={handleResponsibleSubBranchSelect}
            placeholder="搜索负责分院..."
            subBranches={subBranches}
          />
          {formData.sub_branch_responsible && selectedSubBranch && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded border">
              <div className="font-medium">已选择: {selectedSubBranch.name}</div>
              {selectedSubBranch.state && (
                <div className="mt-1">州属: {selectedSubBranch.state}</div>
              )}
              {selectedSubBranch.contact_person && (
                <div>联系人: {selectedSubBranch.contact_person}</div>
              )}
              {selectedSubBranch.contact_phone && (
                <div>电话: {selectedSubBranch.contact_phone}</div>
              )}
              {selectedSubBranch.address && (
                <div>地址: {selectedSubBranch.address}</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="student_id">负责人学员 *</Label>
          <StudentSearchInput
            value={formData.student_id}
            onChange={(studentId) => setFormData({ ...formData, student_id: studentId })}
            placeholder="搜索负责人学员..."
          />
          {formData.student_id && formData.contact_person && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded border">
              已选择: {formData.contact_person} ({formData.student_id}) - {formData.contact_phone}
            </div>
          )}
        </div>

      </div>

      {/* Sub-branch Management Section */}
      {initialData && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">管理分院</h3>
          
          {/* Inline Sub-branch Search */}
          <div className="space-y-2">
            <Label htmlFor="inline-subbranch">搜索并添加分院</Label>
            <SubBranchNameSearchInput
              value={inlineSubBranchName}
              onChange={handleInlineSubBranchSelect}
              placeholder="搜索分院名称..."
              subBranches={subBranches}
            />
            <p className="text-xs text-gray-500">选择现有分院会自动关联到此总院</p>
          </div>

          {/* Sub-branches List */}
          <div className="space-y-3">
            {managedSubBranches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>该总院下暂无分院</p>
                <p className="text-sm">使用上方搜索栏添加分院</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>分院名称</TableHead>
                      <TableHead>州属</TableHead>
                      <TableHead>联系人</TableHead>
                      <TableHead>电话</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managedSubBranches.map((subBranch) => (
                      <TableRow key={subBranch.id}>
                        <TableCell className="font-medium">{subBranch.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {subBranch.state}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {subBranch.contact_person || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {subBranch.contact_phone || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (confirm(`确定要删除分院"${subBranch.name}"吗？`)) {
                                handleDeleteSubBranch(subBranch.id);
                              }
                            }}
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
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? '更新总院' : '添加总院'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
};

export default MainBranchForm;