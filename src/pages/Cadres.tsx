
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, User, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CadreForm from '@/components/Cadres/CadreForm';
import { useToast } from '@/hooks/use-toast';

interface Cadre {
  id: string;
  chinese_name: string;
  english_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  class_assignments: string[];
  appointment_date: string;
  status: 'active' | 'inactive';
  permissions: string[];
}

const Cadres: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCadre, setEditingCadre] = useState<Cadre | null>(null);
  const { toast } = useToast();

  // Mock data
  const [cadres, setCadres] = useState<Cadre[]>([
    {
      id: '1',
      chinese_name: '李班长',
      english_name: 'Li Ming',
      email: 'li.ming@example.com',
      phone: '13800138001',
      position: '班长',
      department: '学生会',
      class_assignments: ['初级班A', '中级班B'],
      appointment_date: '2024-01-15',
      status: 'active',
      permissions: ['attendance_management', 'student_reports']
    },
    {
      id: '2',
      chinese_name: '王副班长',
      english_name: 'Wang Lei',
      email: 'wang.lei@example.com',
      phone: '13800138002',
      position: '副班长',
      department: '学生会',
      class_assignments: ['高级班C'],
      appointment_date: '2024-02-01',
      status: 'active',
      permissions: ['attendance_management']
    },
    {
      id: '3',
      chinese_name: '张组长',
      english_name: 'Zhang Wei',
      email: 'zhang.wei@example.com',
      phone: '13800138003',
      position: '学习组长',
      department: '学习部',
      class_assignments: ['初级班A'],
      appointment_date: '2024-01-20',
      status: 'active',
      permissions: ['student_reports']
    },
    {
      id: '4',
      chinese_name: '刘干事',
      english_name: 'Liu Hua',
      email: 'liu.hua@example.com',
      phone: '13800138004',
      position: '宣传干事',
      department: '宣传部',
      class_assignments: [],
      appointment_date: '2024-03-01',
      status: 'inactive',
      permissions: []
    }
  ]);

  const filteredCadres = cadres.filter(cadre =>
    cadre.chinese_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCadre = (newCadre: Omit<Cadre, 'id'>) => {
    const cadre: Cadre = {
      ...newCadre,
      id: Date.now().toString()
    };
    setCadres([...cadres, cadre]);
    setIsAddDialogOpen(false);
    toast({
      title: "成功",
      description: "干部已成功添加"
    });
  };

  const handleEditCadre = (updatedCadre: Cadre) => {
    setCadres(cadres.map(cadre => 
      cadre.id === updatedCadre.id ? updatedCadre : cadre
    ));
    setEditingCadre(null);
    toast({
      title: "成功",
      description: "干部信息已更新"
    });
  };

  const handleDeleteCadre = (cadreId: string) => {
    setCadres(cadres.filter(cadre => cadre.id !== cadreId));
    toast({
      title: "成功",
      description: "干部已删除"
    });
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case '班长': return 'bg-red-100 text-red-800';
      case '副班长': return 'bg-orange-100 text-orange-800';
      case '学习组长': return 'bg-blue-100 text-blue-800';
      case '宣传干事': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">干部管理</h1>
          <p className="text-gray-600">Cadre Management</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              添加干部
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>添加新干部</DialogTitle>
            </DialogHeader>
            <CadreForm onSubmit={handleAddCadre} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索干部姓名、职位或部门..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                全部
              </Button>
              <Button variant="outline" size="sm">
                活跃
              </Button>
              <Button variant="outline" size="sm">
                非活跃
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cadres Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCadres.map((cadre) => (
          <Card key={cadre.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cadre.chinese_name}</h3>
                    <p className="text-sm text-gray-600">{cadre.english_name}</p>
                  </div>
                </div>
                <Badge variant={cadre.status === 'active' ? 'default' : 'secondary'}>
                  {cadre.status === 'active' ? '活跃' : '非活跃'}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">职位:</span>
                  <Badge className={getPositionColor(cadre.position)}>
                    {cadre.position}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">部门:</span>
                  <span className="font-medium">{cadre.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">任职日期:</span>
                  <span className="font-medium">{cadre.appointment_date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">负责班级:</span>
                  <span className="font-medium">
                    {cadre.class_assignments.length > 0 
                      ? `${cadre.class_assignments.length}个班级`
                      : '无'
                    }
                  </span>
                </div>
                {cadre.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">电话:</span>
                    <span className="font-medium">{cadre.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Dialog open={editingCadre?.id === cadre.id} onOpenChange={(open) => !open && setEditingCadre(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setEditingCadre(cadre)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>编辑干部信息</DialogTitle>
                    </DialogHeader>
                    {editingCadre && (
                      <CadreForm 
                        initialData={editingCadre} 
                        onSubmit={handleEditCadre} 
                        onCancel={() => setEditingCadre(null)} 
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteCadre(cadre.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{cadres.length}</div>
            <div className="text-sm text-gray-600">总干部数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {cadres.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">活跃干部</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {cadres.filter(c => c.position === '班长' || c.position === '副班长').length}
            </div>
            <div className="text-sm text-gray-600">班级干部</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {cadres.reduce((total, c) => total + c.class_assignments.length, 0)}
            </div>
            <div className="text-sm text-gray-600">管理班级数</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cadres;
