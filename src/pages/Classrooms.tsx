import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MainBranchForm from '@/components/Classrooms/MainBranchForm';
import SubBranchForm from '@/components/Classrooms/SubBranchForm';
import ClassroomForm, { ClassroomFormData } from '@/components/Classrooms/ClassroomForm';
import ClassroomCard, { ClassroomItem } from '@/components/Classrooms/ClassroomCard';
import MainBranchCard from '@/components/Classrooms/MainBranchCard';
import SubBranchCard from '@/components/Classrooms/SubBranchCard';
import { useDatabase } from '@/contexts/DatabaseContext';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainBranch, SubBranch } from '@/data/types';

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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('main-branches');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // Classroom editing state
  const [editingClassroom, setEditingClassroom] = useState<ClassroomItem | null>(null);
  const [isEditClassroomDialogOpen, setIsEditClassroomDialogOpen] = useState(false);
  
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
  const { 
    mainBranches, 
    updateMainBranch, 
    addMainBranch, 
    deleteMainBranch, 
    subBranches, 
    updateSubBranch, 
    addSubBranch, 
    deleteSubBranch, 
    removeSubBranchFromMainBranch,
    isLoadingMainBranches,
    isLoadingSubBranches,
    mainBranchesError,
    subBranchesError,
    students,
    classrooms,
    addClassroom,
    updateClassroom,
    deleteClassroom,
  } = useDatabase();

  // Pagination/sorting state for classrooms
  const [cPage, setCPage] = useState(1);
  const [cPageSize, setCPageSize] = useState(9);
  const [sortBy, setSortBy] = useState<'name' | 'state' | 'sub_branch_name'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [subBranchFilter, setSubBranchFilter] = useState<string>('all');
  // Sub-branch tab controls
  const [sbPage, setSbPage] = useState(1);
  const [sbPageSize, setSbPageSize] = useState(6);
  const [sbSortBy, setSbSortBy] = useState<'name' | 'state' | 'main_branch_name'>('name');
  const [sbSortDir, setSbSortDir] = useState<'asc' | 'desc'>('asc');
  const [sbMainFilter, setSbMainFilter] = useState<string>('all');
  const [sbStateFilter, setSbStateFilter] = useState<string>('all');
  const subBranchStates = React.useMemo(() => {
    const set = new Set<string>();
    subBranches.forEach(sb => { if (sb.state) set.add(sb.state); });
    return Array.from(set);
  }, [subBranches]);

  // Check if user can manage classrooms (super_admin only)
  const canManageClassrooms = user?.role === 'super_admin';

  // Filter functions
  const filteredMainBranches = mainBranches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch as any).region_name?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
    (branch as any).region?.toLowerCase?.().includes(searchTerm.toLowerCase())
  );

  const classroomCountBySub = React.useMemo(() => {
    const map = new Map<string, number>();
    classrooms.forEach((c) => {
      const id = c.sub_branch_id;
      map.set(id, (map.get(id) || 0) + 1);
    });
    return map;
  }, [classrooms]);

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
      
      // Also update the main branch to include this sub-branch in manage_sub_branches
      if (branchData.main_branch_id) {
        const mainBranchToUpdate = mainBranches.find(mb => mb.id === branchData.main_branch_id);
        if (mainBranchToUpdate) {
          const currentManaged = mainBranchToUpdate.manage_sub_branches || [];
          if (!currentManaged.includes(existingBranch.id)) {
            const updatedMainBranch = {
              ...mainBranchToUpdate,
              manage_sub_branches: [...currentManaged, existingBranch.id]
            };
            console.log('🔗 Adding sub-branch to main branch manage_sub_branches:', existingBranch.id);
            updateMainBranch(updatedMainBranch);
          }
        }
      }
      
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

  // Classroom CRUD handlers
  const handleAddClassroom = async (data: ClassroomFormData) => {
    try {
      const updated = await addClassroom(data as any);
      setIsAddDialogOpen(false);
      toast({ title: updated ? '教室已存在，已更新' : '教室添加成功', description: `${data.name} ${updated ? '信息已更新' : '已添加'}。` });
    } catch (e: any) {
      toast({ title: '添加失败', description: e?.message || '未知错误', variant: 'destructive' });
    }
  };

  const handleEditClassroom = async (data: ClassroomItem) => {
    try {
      await updateClassroom(data as any);
      setEditingClassroom(null);
      setIsEditClassroomDialogOpen(false);
      toast({ title: '教室更新成功', description: `${data.name} 已更新。` });
    } catch (e: any) {
      toast({ title: '更新失败', description: e?.message || '未知错误', variant: 'destructive' });
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    try {
      await deleteClassroom(id);
      toast({ title: '教室删除成功' });
    } catch (e: any) {
      toast({ title: '删除失败', description: e?.message || '未知错误', variant: 'destructive' });
    }
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
      case 'classrooms':
        return (
          <ClassroomForm
            onSubmit={(data) => handleAddClassroom(data)}
            onCancel={() => setIsAddDialogOpen(false)}
            subBranches={subBranches}
          />
        );
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
      case 'classrooms':
        return '添加新教室';
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main-branches">总院管理</TabsTrigger>
          <TabsTrigger value="sub-branches">分院管理</TabsTrigger>
          <TabsTrigger value="classrooms">教室管理</TabsTrigger>
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
                  navigate(`/classrooms/main-branches/${branch.id}/edit`);
                }}
                onDelete={handleDeleteMainBranch}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sub-branches" className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-muted-foreground">共 {subBranches.length} 个分院</div>
            <div className="flex items-center gap-2">
              <Select value={sbMainFilter} onValueChange={(v) => { setSbMainFilter(v); setSbPage(1); }}>
                <SelectTrigger className="h-8 w-[200px]"><SelectValue placeholder="按总院筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部总院</SelectItem>
                  {mainBranches
                    .filter(mb => mb.id && String(mb.id).length > 0)
                    .map(mb => (
                      <SelectItem key={mb.id} value={mb.id}>{mb.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={sbStateFilter} onValueChange={(v) => { setSbStateFilter(v); setSbPage(1); }}>
                <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="按州属筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部州属</SelectItem>
                  {subBranchStates.map(st => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sbSortBy} onValueChange={(v) => { setSbSortBy(v as any); setSbPage(1); }}>
                <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="排序字段" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">按名称</SelectItem>
                  <SelectItem value="state">按州属</SelectItem>
                  <SelectItem value="main_branch_name">按总院</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sbSortDir} onValueChange={(v) => { setSbSortDir(v as any); setSbPage(1); }}>
                <SelectTrigger className="h-8 w-[120px]"><SelectValue placeholder="顺序" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">升序</SelectItem>
                  <SelectItem value="desc">降序</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(sbPageSize)} onValueChange={(v) => { setSbPageSize(parseInt(v)); setSbPage(1); }}>
                <SelectTrigger className="h-8 w-[100px]"><SelectValue placeholder="每页" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const term = searchTerm.toLowerCase();
              const filtered = subBranches.filter((b: any) => {
                const matchesText = (b.name || '').toLowerCase().includes(term) ||
                  (b.main_branch_name || '').toLowerCase().includes(term) ||
                  (b.state || '').toLowerCase().includes(term);
                const matchesMain = sbMainFilter === 'all' || b.main_branch_id === sbMainFilter;
                const matchesState = sbStateFilter === 'all' || b.state === sbStateFilter;
                return matchesText && matchesMain && matchesState;
              });
              const sorted = filtered.sort((a: any, b: any) => {
                const av = (a[sbSortBy] || '').toString().toLowerCase();
                const bv = (b[sbSortBy] || '').toString().toLowerCase();
                if (av < bv) return sbSortDir === 'asc' ? -1 : 1;
                if (av > bv) return sbSortDir === 'asc' ? 1 : -1;
                return 0;
              });
              const totalPages = Math.max(1, Math.ceil(sorted.length / sbPageSize));
              const start = (sbPage - 1) * sbPageSize;
              const pageItems = sorted.slice(start, start + sbPageSize);
              return pageItems.map((branch) => (
                <SubBranchCard
                  key={branch.id}
                  branch={branch}
                  canEdit={canManageClassrooms}
                  classroomCount={classroomCountBySub.get(branch.id) || 0}
                  onEdit={(branch) => {
                    setEditingSubBranch(branch);
                    setIsEditSubBranchDialogOpen(true);
                  }}
                  onDelete={handleDeleteSubBranch}
                />
              ));
            })()}
          </div>

          {/* Pagination */}
          {(() => {
            const term = searchTerm.toLowerCase();
            const filtered = subBranches.filter((b: any) => {
              const matchesText = (b.name || '').toLowerCase().includes(term) ||
                (b.main_branch_name || '').toLowerCase().includes(term) ||
                (b.state || '').toLowerCase().includes(term);
              const matchesMain = sbMainFilter === 'all' || b.main_branch_id === sbMainFilter;
              const matchesState = sbStateFilter === 'all' || b.state === sbStateFilter;
              return matchesText && matchesMain && matchesState;
            });
            const totalPages = Math.max(1, Math.ceil(filtered.length / sbPageSize));
            if (totalPages <= 1) return null;
            const goTo = (p: number) => setSbPage(Math.min(Math.max(1, p), totalPages));
            const links = [] as JSX.Element[];
            const addLink = (p: number, active = false) => links.push(
              <PaginationItem key={p}>
                <PaginationLink href="#" isActive={active} onClick={(e) => { e.preventDefault(); goTo(p); }}>{p}</PaginationLink>
              </PaginationItem>
            );
            if (totalPages <= 7) {
              for (let p = 1; p <= totalPages; p++) addLink(p, p === sbPage);
            } else {
              addLink(1, sbPage === 1);
              if (sbPage > 3) links.push(<PaginationEllipsis key="s" />);
              for (let p = Math.max(2, sbPage - 1); p <= Math.min(totalPages - 1, sbPage + 1); p++) addLink(p, p === sbPage);
              if (sbPage < totalPages - 2) links.push(<PaginationEllipsis key="e" />);
              addLink(totalPages, sbPage === totalPages);
            }
            return (
              <div className="flex justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); goTo(sbPage - 1); }} />
                    </PaginationItem>
                    {links}
                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); goTo(sbPage + 1); }} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            );
          })()}
        </TabsContent>

        {/* Classrooms management */}
        <TabsContent value="classrooms" className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              共 {classrooms.length} 个教室
            </div>
            <div className="flex items-center gap-2">
              <Select value={subBranchFilter} onValueChange={(v) => { setSubBranchFilter(v); setCPage(1); }}>
                <SelectTrigger className="h-8 w-[200px]"><SelectValue placeholder="按分院筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分院</SelectItem>
                  {subBranches
                    .filter((sb) => sb.id && String(sb.id).length > 0)
                    .map(sb => (
                      <SelectItem key={sb.id} value={sb.id}>{sb.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setCPage(1); }}>
                <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="排序字段" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">按名称</SelectItem>
                  <SelectItem value="state">按州属</SelectItem>
                  <SelectItem value="sub_branch_name">按分院</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortDir} onValueChange={(v) => { setSortDir(v as any); setCPage(1); }}>
                <SelectTrigger className="h-8 w-[120px]"><SelectValue placeholder="顺序" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">升序</SelectItem>
                  <SelectItem value="desc">降序</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(cPageSize)} onValueChange={(v) => { setCPageSize(parseInt(v)); setCPage(1); }}>
                <SelectTrigger className="h-8 w-[100px]"><SelectValue placeholder="每页" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const term = searchTerm.toLowerCase();
              const filtered = classrooms.filter((c: any) => {
                const matchesText = (c.name || '').toLowerCase().includes(term) ||
                  (c.sub_branch_name || '').toLowerCase().includes(term) ||
                  (c.state || '').toLowerCase().includes(term);
                const matchesSub = subBranchFilter === 'all' || c.sub_branch_id === subBranchFilter;
                return matchesText && matchesSub;
              });
              const sorted = filtered.sort((a: any, b: any) => {
                const av = (a[sortBy] || '').toString().toLowerCase();
                const bv = (b[sortBy] || '').toString().toLowerCase();
                if (av < bv) return sortDir === 'asc' ? -1 : 1;
                if (av > bv) return sortDir === 'asc' ? 1 : -1;
                return 0;
              });
              const totalPages = Math.max(1, Math.ceil(sorted.length / cPageSize));
              const start = (cPage - 1) * cPageSize;
              const pageItems = sorted.slice(start, start + cPageSize);

              return pageItems.map((c: any) => (
                <ClassroomCard
                  key={c.id}
                  classroom={c}
                  canEdit={canManageClassrooms}
                  onEdit={(ci) => { setEditingClassroom(ci); setIsEditClassroomDialogOpen(true); }}
                  onDelete={(id) => handleDeleteClassroom(id)}
                />
              ));
            })()}
          </div>

          {/* Pagination */}
          {(() => {
            const term = searchTerm.toLowerCase();
            const filtered = classrooms.filter((c: any) => {
              const matchesText = (c.name || '').toLowerCase().includes(term) ||
                (c.sub_branch_name || '').toLowerCase().includes(term) ||
                (c.state || '').toLowerCase().includes(term);
              const matchesSub = subBranchFilter === 'all' || c.sub_branch_id === subBranchFilter;
              return matchesText && matchesSub;
            });
            const totalPages = Math.max(1, Math.ceil(filtered.length / cPageSize));
            if (totalPages <= 1) return null;
            const goTo = (p: number) => setCPage(Math.min(Math.max(1, p), totalPages));
            const links = [] as JSX.Element[];
            const addLink = (p: number, active = false) => links.push(
              <PaginationItem key={p}>
                <PaginationLink href="#" isActive={active} onClick={(e) => { e.preventDefault(); goTo(p); }}>{p}</PaginationLink>
              </PaginationItem>
            );
            if (totalPages <= 7) {
              for (let p = 1; p <= totalPages; p++) addLink(p, p === cPage);
            } else {
              addLink(1, cPage === 1);
              if (cPage > 3) links.push(<PaginationEllipsis key="s" />);
              for (let p = Math.max(2, cPage - 1); p <= Math.min(totalPages - 1, cPage + 1); p++) addLink(p, p === cPage);
              if (cPage < totalPages - 2) links.push(<PaginationEllipsis key="e" />);
              addLink(totalPages, cPage === totalPages);
            }
            return (
              <div className="flex justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); goTo(cPage - 1); }} />
                    </PaginationItem>
                    {links}
                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); goTo(cPage + 1); }} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            );
          })()}
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
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{classrooms.length}</div>
            <div className="text-sm text-gray-600">教室数量</div>
          </CardContent>
        </Card>
      </div>


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

      {/* Edit Classroom Dialog */}
      <Dialog open={isEditClassroomDialogOpen} onOpenChange={setIsEditClassroomDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑教室</DialogTitle>
          </DialogHeader>
          {editingClassroom && (
            <ClassroomForm
              initialData={editingClassroom}
              onSubmit={(data) => handleEditClassroom(data as ClassroomItem)}
              onCancel={() => {
                setEditingClassroom(null);
                setIsEditClassroomDialogOpen(false);
              }}
              subBranches={subBranches}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classrooms;
