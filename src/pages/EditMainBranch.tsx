import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useToast } from '@/hooks/use-toast';
import MainBranchForm from '@/components/Classrooms/MainBranchForm';
import type { MainBranch, SubBranch } from '@/data/types';

const EditMainBranch: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    mainBranches, 
    subBranches, 
    updateMainBranch, 
    updateSubBranch, 
    removeSubBranchFromMainBranch 
  } = useDatabase();
  const { toast } = useToast();
  const [editingMainBranch, setEditingMainBranch] = useState<MainBranch | null>(null);
  const [loading, setLoading] = useState(true);

  // Find the main branch by ID
  useEffect(() => {
    if (id && mainBranches.length > 0) {
      const branch = mainBranches.find(mb => mb.id === id);
      if (branch) {
        setEditingMainBranch(branch);
        setLoading(false);
      } else {
        // Branch not found, redirect back
        toast({
          title: "总院未找到",
          description: "请求的总院不存在或已被删除。",
          variant: "destructive"
        });
        navigate('/classrooms');
      }
    } else if (mainBranches.length > 0) {
      // Invalid ID format
      toast({
        title: "无效的总院ID",
        description: "请求的总院ID格式不正确。",
        variant: "destructive"
      });
      navigate('/classrooms');
    }
  }, [id, mainBranches, navigate, toast]);

  const handleSubmit = async (branchData: MainBranch) => {
    try {
      await updateMainBranch(branchData);
      toast({
        title: "总院更新成功",
        description: `${branchData.name} 的信息已成功更新。`
      });
      navigate('/classrooms');
    } catch (error) {
      toast({
        title: "更新失败",
        description: "更新总院信息时发生错误，请重试。",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    navigate('/classrooms');
  };

  // Sub-branch management handlers - similar to Classrooms.tsx
  const handleAssociateSubBranch = (branchData: Omit<SubBranch, 'id'>) => {
    // Check if a sub-branch with the same name already exists
    const existingBranch = subBranches.find(branch => branch.name === branchData.name);
    
    if (existingBranch) {
      // Update the existing sub-branch with main branch association
      const updatedBranch = {
        ...existingBranch,
        main_branch_id: branchData.main_branch_id,
        main_branch_name: branchData.main_branch_name,
        region_id: branchData.region_id,
        region_name: branchData.region_name
      };
      
      updateSubBranch(updatedBranch);
      
      // Also update the main branch to include this sub-branch in manage_sub_branches
      if (branchData.main_branch_id && editingMainBranch) {
        const currentManaged = editingMainBranch.manage_sub_branches || [];
        if (!currentManaged.includes(existingBranch.id)) {
          const updatedMainBranch = {
            ...editingMainBranch,
            manage_sub_branches: [...currentManaged, existingBranch.id]
          };
          updateMainBranch(updatedMainBranch);
          setEditingMainBranch(updatedMainBranch); // Update local state
        }
      }
      
      toast({
        title: "分院关联成功",
        description: `${branchData.name} 已成功关联到${branchData.main_branch_name}。`
      });
    }
  };

  const handleEditSubBranch = (branchData: SubBranch) => {
    updateSubBranch(branchData);
    toast({
      title: "分院更新成功",
      description: `${branchData.name} 的信息已成功更新。`
    });
  };

  const handleRemoveSubBranchAssociation = (branchId: string) => {
    const branchToRemove = subBranches.find(branch => branch.id === branchId);
    removeSubBranchFromMainBranch(branchId);
    toast({
      title: "分院关联已移除",
      description: `${branchToRemove?.name} 已从该总院中移除，但仍保留在分院管理中。`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!editingMainBranch) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb and Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            onClick={() => navigate('/classrooms')}
          >
            总院管理
          </Button>
          <span>/</span>
          <span>编辑总院信息</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">编辑总院信息</h1>
            <p className="text-gray-600 mt-1">修改 {editingMainBranch.name} 的详细信息</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <MainBranchForm
            initialData={editingMainBranch}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            regions={[]} // You may need to pass actual regions data if required
            subBranches={subBranches}
            onNavigateToSubBranches={() => {
              // Navigate back to classrooms page and switch to sub-branches tab
              navigate('/classrooms?tab=sub-branches');
            }}
            onSubBranchAdd={handleAssociateSubBranch}
            onSubBranchEdit={handleEditSubBranch}
            onSubBranchDelete={handleRemoveSubBranchAssociation}
          />
        </div>
      </div>
    </div>
  );
};

export default EditMainBranch;