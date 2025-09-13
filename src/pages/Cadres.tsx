import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import CadreCard from '@/components/Cadres/CadreCard';
import CadreStats from '@/components/Cadres/CadreStats';
import CadreFilters from '@/components/Cadres/CadreFilters';
import CadreDialog from '@/components/Cadres/CadreDialog';
import { useDatabase } from '@/contexts/DatabaseContext';
import { type Cadre } from '@/data/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';


const Cadres: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCadre, setEditingCadre] = useState<Cadre | null>(null);
  const { toast } = useToast();

  // Use DatabaseContext for cadres data
  const { cadres, updateCadre, addCadre, deleteCadre } = useDatabase();

  const filteredCadres = cadres.filter(cadre =>
    cadre.chinese_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.roles.some(role => 
      role.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    cadre.support_classes?.some(cls => cls.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const totalPages = Math.max(1, Math.ceil(filteredCadres.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedCadres = filteredCadres.slice(start, start + pageSize);
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const handleAddCadre = (newCadre: Omit<Cadre, 'id'>) => {
    addCadre(newCadre);
    setIsAddDialogOpen(false);
    toast({
      title: "成功",
      description: "干部已成功添加"
    });
  };

  const handleEditCadre = (updatedCadre: Cadre) => {
    updateCadre(updatedCadre);
    setEditingCadre(null);
    toast({
      title: "成功",
      description: "干部信息已更新"
    });
  };

  const handleDeleteCadre = (cadreId: string) => {
    const deletedCadre = cadres.find(cadre => cadre.id === cadreId);
    deleteCadre(cadreId);
    toast({
      title: "干部删除成功",
      description: `${deletedCadre?.chinese_name} 的干部信息已被永久删除。`,
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">干部管理</h1>
          <p className="text-gray-600">Cadre Management</p>
        </div>
        <CadreDialog
          isAddDialogOpen={isAddDialogOpen}
          onAddDialogChange={setIsAddDialogOpen}
          editingCadre={editingCadre}
          onEditingCadreChange={setEditingCadre}
          onAddCadre={handleAddCadre}
          onEditCadre={handleEditCadre}
        />
      </div>

      {/* Search and Filters */}
      <CadreFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Cadres Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>学员编号</TableHead>
                <TableHead>中文姓名</TableHead>
                <TableHead>英文姓名</TableHead>
                <TableHead>担任职位</TableHead>
                <TableHead>负责班级</TableHead>
                <TableHead>电话</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedCadres.map((cadre) => {
                const rolesText = cadre.roles.map(r => `${r.class_name}（${r.role}）`).join('，');
                const classesText = Array.from(new Set(cadre.roles.map(r => r.class_name))).join('，');
                return (
                  <TableRow key={cadre.id}>
                    <TableCell className="font-mono text-xs">{cadre.student_id}</TableCell>
                    <TableCell className="font-medium">{cadre.chinese_name}</TableCell>
                    <TableCell className="text-muted-foreground">{cadre.english_name}</TableCell>
                    <TableCell>{rolesText || '-'}</TableCell>
                    <TableCell>{classesText || '-'}</TableCell>
                    <TableCell>{cadre.phone || '-'}</TableCell>
                    <TableCell>{cadre.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingCadre(cadre)}>
                          <Edit className="h-4 w-4 mr-1" /> 编辑
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除干部</AlertDialogTitle>
                              <AlertDialogDescription>
                                您确定要删除 <strong>{cadre.chinese_name}</strong> 的干部信息吗？
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCadre(cadre.id)} className="bg-red-600 hover:bg-red-700">
                                确认删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pagedCadres.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    无匹配的干部
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          显示 {filteredCadres.length === 0 ? 0 : start + 1}-{Math.min(start + pageSize, filteredCadres.length)} / 共 {filteredCadres.length}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
            className="h-8 border rounded px-2 text-sm"
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={18}>18</option>
          </select>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); goTo(page - 1); }} />
                </PaginationItem>
                {(() => {
                  const links: JSX.Element[] = [];
                  const add = (p: number, active = false) => links.push(
                    <PaginationItem key={p}>
                      <PaginationLink href="#" isActive={active} onClick={(e) => { e.preventDefault(); goTo(p); }}>{p}</PaginationLink>
                    </PaginationItem>
                  );
                  if (totalPages <= 7) {
                    for (let p = 1; p <= totalPages; p++) add(p, p === page);
                  } else {
                    add(1, page === 1);
                    if (page > 3) links.push(<PaginationEllipsis key="s" />);
                    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) add(p, p === page);
                    if (page < totalPages - 2) links.push(<PaginationEllipsis key="e" />);
                    add(totalPages, page === totalPages);
                  }
                  return links;
                })()}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); goTo(page + 1); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <CadreStats cadres={cadres} />
    </div>
  );
};

export default Cadres;
