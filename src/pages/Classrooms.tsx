import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Building2, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MainBranchForm from '@/components/Classrooms/MainBranchForm';
import SubBranchForm from '@/components/Classrooms/SubBranchForm';
import MainBranchCard from '@/components/Classrooms/MainBranchCard';
import SubBranchCard from '@/components/Classrooms/SubBranchCard';
import { useData } from '@/contexts/DataContext';
import { MainBranch, SubBranch } from '@/data/mockData';

// Data interfaces - using types from mockData
export interface Region {
  id: string;
  name: string;
  code: string;
  description?: string;
  states: string[]; // Array of states under this region
  created_date: string;
}

const Classrooms: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('main-branches');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Main branch editing state
  const [editingMainBranch, setEditingMainBranch] = useState<MainBranch | null>(null);
  const [isEditMainBranchDialogOpen, setIsEditMainBranchDialogOpen] = useState(false);
  
  // Sub branch editing state
  const [editingSubBranch, setEditingSubBranch] = useState<SubBranch | null>(null);
  const [isEditSubBranchDialogOpen, setIsEditSubBranchDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock data
  const [regions, setRegions] = useState<Region[]>([
    {
      id: '1',
      name: '北马',
      code: 'NM',
      description: '北马地区包括槟城、玻璃市、霹雳等州属',
      states: ['槟城', '玻璃市', '霹雳', '吉打'],
      created_date: '2024-01-01'
    },
    {
      id: '2',
      name: '中马',
      code: 'CM',
      description: '中马地区包括雪隆、彭亨、马六甲等州属',
      states: ['雪隆', '彭亨', '马六甲', '森美兰'],
      created_date: '2024-01-01'
    },
    {
      id: '3',
      name: '南马',
      code: 'SM',
      description: '南马地区包括柔佛等州属',
      states: ['柔佛'],
      created_date: '2024-01-01'
    }
  ]);

  // Use DataContext for branches data
  const { mainBranches, updateMainBranch, addMainBranch, deleteMainBranch, subBranches, updateSubBranch, addSubBranch, deleteSubBranch, removeSubBranchFromMainBranch } = useData();

  // Check if user can manage classrooms (super_admin only)
  const canManageClassrooms = user?.role === 'super_admin';

  // Filter functions
  const filteredMainBranches = mainBranches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.region_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubBranches = subBranches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.main_branch_name && branch.main_branch_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (branch.state && branch.state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Debug: Monitor subBranches changes
  useEffect(() => {
    console.log('Classrooms component - subBranches changed:', subBranches.map(b => b.name));
    console.log('Classrooms component - filteredSubBranches:', filteredSubBranches.map(b => b.name));
  }, [subBranches, filteredSubBranches]);

  // CRUD handlers
  const handleAddMainBranch = (branchData: Omit<MainBranch, 'id'>) => {
    addMainBranch(branchData);
    setIsAddDialogOpen(false);
    toast({
      title: "总院添加成功",
      description: `${branchData.name} 已成功添加到系统中。`
    });
  };

  const handleEditMainBranch = (branchData: MainBranch) => {
    updateMainBranch(branchData);
    setEditingMainBranch(null);
    setIsEditMainBranchDialogOpen(false);
    toast({
      title: "总院更新成功",
      description: `${branchData.name} 的信息已成功更新。`
    });
  };

  const handleDeleteMainBranch = (branchId: string) => {
    const deletedBranch = mainBranches.find(branch => branch.id === branchId);
    deleteMainBranch(branchId);
    toast({
      title: "总院删除成功",
      description: `${deletedBranch?.name} 已从系统中删除。`,
      variant: "destructive"
    });
  };

  const handleAddSubBranch = (branchData: Omit<SubBranch, 'id'>) => {
    addSubBranch(branchData);
    setIsAddDialogOpen(false);
    toast({
      title: "分院添加成功",
      description: `${branchData.name} 已成功添加到系统中。`
    });
  };

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
      
      toast({
        title: "分院关联成功",
        description: `${branchData.name} 已成功关联到${branchData.main_branch_name}。`
      });
    } else {
      // Create new sub-branch if it doesn't exist
      handleAddSubBranch(branchData);
    }
  };

  const handleEditSubBranch = (branchData: SubBranch) => {
    updateSubBranch(branchData);
    setEditingSubBranch(null);
    setIsEditSubBranchDialogOpen(false);
    toast({
      title: "分院更新成功",
      description: `${branchData.name} 的信息已成功更新。`
    });
  };

  const handleDeleteSubBranch = (branchId: string) => {
    console.log('handleDeleteSubBranch called with ID:', branchId);
    const deletedBranch = subBranches.find(branch => branch.id === branchId);
    console.log('Found branch to delete:', deletedBranch?.name);
    
    deleteSubBranch(branchId);
    
    toast({
      title: "分院删除成功",
      description: `${deletedBranch?.name} 已从系统中删除。`,
      variant: "destructive"
    });
    console.log('Delete completed, toast shown');
  };

  // Handle removing sub-branch association from main branch (without deleting sub-branch)
  const handleRemoveSubBranchAssociation = (branchId: string) => {
    console.log('handleRemoveSubBranchAssociation called with ID:', branchId);
    const branchToRemove = subBranches.find(branch => branch.id === branchId);
    console.log('Found branch to remove association:', branchToRemove?.name);
    
    removeSubBranchFromMainBranch(branchId);
    
    toast({
      title: "分院关联已移除",
      description: `${branchToRemove?.name} 已从该总院中移除，但仍保留在分院管理中。`,
    });
    console.log('Association removal completed, toast shown');
  };

  const getAddForm = () => {
    switch (activeTab) {
      case 'main-branches':
        return (
          <MainBranchForm 
            onSubmit={handleAddMainBranch} 
            onCancel={() => setIsAddDialogOpen(false)} 
            regions={regions}
            subBranches={subBranches}
            onNavigateToSubBranches={() => {
              setIsAddDialogOpen(false);
              setActiveTab('sub-branches');
            }}
            onSubBranchAdd={handleAssociateSubBranch}
            onSubBranchEdit={handleEditSubBranch}
            onSubBranchDelete={handleRemoveSubBranchAssociation}
          />
        );
      case 'sub-branches':
        return <SubBranchForm 
          onSubmit={handleAddSubBranch} 
          onCancel={() => setIsAddDialogOpen(false)} 
          mainBranches={[]} 
          hideMainBranchSelection={true}
          useSimpleNameInput={true}
          allSubBranches={subBranches}
        />;
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (activeTab) {
      case 'main-branches':
        return '添加新总院';
      case 'sub-branches':
        return '添加新分院';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">教室管理</h1>
          <p className="text-gray-600">Classroom Management</p>
        </div>
        {canManageClassrooms && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                添加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{getDialogTitle()}</DialogTitle>
              </DialogHeader>
              {getAddForm()}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索地区、总院或分院..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="main-branches">总院管理</TabsTrigger>
          <TabsTrigger value="sub-branches">分院管理</TabsTrigger>
        </TabsList>

        <TabsContent value="main-branches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMainBranches.map((branch) => (
              <MainBranchCard
                key={branch.id}
                branch={branch}
                canEdit={canManageClassrooms}
                subBranches={subBranches}
                onEdit={(branch) => {
                  setEditingMainBranch(branch);
                  setIsEditMainBranchDialogOpen(true);
                }}
                onDelete={handleDeleteMainBranch}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sub-branches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubBranches.map((branch) => (
              <SubBranchCard
                key={branch.id}
                branch={branch}
                canEdit={canManageClassrooms}
                onEdit={(branch) => {
                  setEditingSubBranch(branch);
                  setIsEditSubBranchDialogOpen(true);
                }}
                onDelete={handleDeleteSubBranch}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{mainBranches.length}</div>
            <div className="text-sm text-gray-600">总院数量</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{subBranches.length}</div>
            <div className="text-sm text-gray-600">分院数量</div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Main Branch Dialog */}
      <Dialog open={isEditMainBranchDialogOpen} onOpenChange={setIsEditMainBranchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑总院信息</DialogTitle>
          </DialogHeader>
          {editingMainBranch && (
            <MainBranchForm 
              initialData={editingMainBranch}
              onSubmit={handleEditMainBranch} 
              onCancel={() => {
                setEditingMainBranch(null);
                setIsEditMainBranchDialogOpen(false);
              }}
              regions={regions}
              subBranches={subBranches}
              onNavigateToSubBranches={() => {
                setIsEditMainBranchDialogOpen(false);
                setActiveTab('sub-branches');
              }}
              onSubBranchAdd={handleAssociateSubBranch}
              onSubBranchEdit={handleEditSubBranch}
              onSubBranchDelete={handleRemoveSubBranchAssociation}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Sub Branch Dialog */}
      <Dialog open={isEditSubBranchDialogOpen} onOpenChange={setIsEditSubBranchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑分院信息</DialogTitle>
          </DialogHeader>
          {editingSubBranch && (
            <SubBranchForm
              initialData={editingSubBranch}
              onSubmit={handleEditSubBranch}
              onCancel={() => {
                setEditingSubBranch(null);
                setIsEditSubBranchDialogOpen(false);
              }}
              mainBranches={[]} 
              hideMainBranchSelection={true}
              useSimpleNameInput={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classrooms;