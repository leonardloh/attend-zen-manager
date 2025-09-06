import React, { useState } from 'react';
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

// Data interfaces
export interface Region {
  id: string;
  name: string;
  code: string;
  description?: string;
  states: string[]; // Array of states under this region
  created_date: string;
}

export interface MainBranch {
  id: string;
  name: string;
  region_id: string;
  region_name: string;
  student_id?: string; // Reference to student
  contact_person?: string; // Auto-populated from student
  contact_phone?: string; // Auto-populated from student
  created_date: string;
}

export interface SubBranch {
  id: string;
  name: string;
  main_branch_id?: string; // Optional reference to main branch
  main_branch_name?: string; // Optional main branch name
  region_id?: string; // Optional since can exist without main branch
  region_name?: string; // Optional since can exist without main branch
  state: string; // Required state field
  address?: string;
  student_id?: string; // Reference to student
  contact_person?: string; // Auto-populated from student
  contact_phone?: string; // Auto-populated from student
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

  const [mainBranches, setMainBranches] = useState<MainBranch[]>([
    {
      id: '1',
      name: '北马总院',
      region_id: '1',
      region_name: '北马',
      student_id: 'S2024001',
      contact_person: '王小明',
      contact_phone: '13800138001',
      created_date: '2024-01-01'
    },
    {
      id: '2',
      name: '中马总院',
      region_id: '2',
      region_name: '中马',
      student_id: 'S2024002',
      contact_person: '李小红',
      contact_phone: '13800138002',
      created_date: '2024-01-01'
    }
  ]);

  const [subBranches, setSubBranches] = useState<SubBranch[]>([
    {
      id: '1',
      name: '甲洞分院',
      main_branch_id: '2',
      main_branch_name: '中马总院',
      region_id: '2',
      region_name: '中马',
      state: '雪隆',
      address: '甲洞分院地址',
      student_id: 'S2024003',
      contact_person: '张三',
      contact_phone: '13800138003',
      created_date: '2024-01-01'
    },
    {
      id: '2',
      name: '八打灵分院',
      main_branch_id: '2',
      main_branch_name: '中马总院',
      region_id: '2',
      region_name: '中马',
      state: '雪隆',
      address: '八打灵分院地址',
      student_id: 'S2024004',
      contact_person: '李四',
      contact_phone: '13800138004',
      created_date: '2024-01-01'
    },
    {
      id: '3',
      name: '槟城分院',
      main_branch_id: '1',
      main_branch_name: '北马总院',
      region_id: '1',
      region_name: '北马',
      state: '槟城',
      address: '槟城分院地址',
      student_id: 'S2024001',
      contact_person: '王小明',
      contact_phone: '13800138001',
      created_date: '2024-01-01'
    }
  ]);

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

  // CRUD handlers
  const handleAddMainBranch = (branchData: Omit<MainBranch, 'id'>) => {
    const newBranch: MainBranch = {
      ...branchData,
      id: Date.now().toString()
    };
    setMainBranches(prev => [...prev, newBranch]);
    setIsAddDialogOpen(false);
    toast({
      title: "总院添加成功",
      description: `${branchData.name} 已成功添加到系统中。`
    });
  };

  const handleEditMainBranch = (branchData: MainBranch) => {
    setMainBranches(prev => prev.map(branch => 
      branch.id === branchData.id ? branchData : branch
    ));
    setEditingMainBranch(null);
    setIsEditMainBranchDialogOpen(false);
    toast({
      title: "总院更新成功",
      description: `${branchData.name} 的信息已成功更新。`
    });
  };

  const handleDeleteMainBranch = (branchId: string) => {
    const deletedBranch = mainBranches.find(branch => branch.id === branchId);
    setMainBranches(prev => prev.filter(branch => branch.id !== branchId));
    toast({
      title: "总院删除成功",
      description: `${deletedBranch?.name} 已从系统中删除。`,
      variant: "destructive"
    });
  };

  const handleAddSubBranch = (branchData: Omit<SubBranch, 'id'>) => {
    const newBranch: SubBranch = {
      ...branchData,
      id: Date.now().toString()
    };
    setSubBranches(prev => [...prev, newBranch]);
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
      
      setSubBranches(prev => prev.map(branch => 
        branch.id === existingBranch.id ? updatedBranch : branch
      ));
      
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
    setSubBranches(prev => prev.map(branch => 
      branch.id === branchData.id ? branchData : branch
    ));
    setEditingSubBranch(null);
    setIsEditSubBranchDialogOpen(false);
    toast({
      title: "分院更新成功",
      description: `${branchData.name} 的信息已成功更新。`
    });
  };

  const handleDeleteSubBranch = (branchId: string) => {
    const deletedBranch = subBranches.find(branch => branch.id === branchId);
    setSubBranches(prev => prev.filter(branch => branch.id !== branchId));
    toast({
      title: "分院删除成功",
      description: `${deletedBranch?.name} 已从系统中删除。`,
      variant: "destructive"
    });
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
            onSubBranchDelete={handleDeleteSubBranch}
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
              onSubBranchDelete={handleDeleteSubBranch}
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