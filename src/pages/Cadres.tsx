
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Shield, Calendar, User2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CadreForm from '@/components/Cadres/CadreForm';
import { useToast } from '@/hooks/use-toast';

interface Cadre {
  id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  role: '班长' | '副班长' | '关怀员';
  class_name: string;
}

const Cadres: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCadre, setEditingCadre] = useState<Cadre | null>(null);
  const { toast } = useToast();

  // Mock data with new structure
  const [cadres, setCadres] = useState<Cadre[]>([
    {
      id: '1',
      chinese_name: '李明',
      english_name: 'Li Ming',
      gender: 'male',
      date_of_birth: '2000-05-15',
      role: '班长',
      class_name: '初级班A'
    },
    {
      id: '2',
      chinese_name: '王丽',
      english_name: 'Wang Li',
      gender: 'female',
      date_of_birth: '2001-03-20',
      role: '副班长',
      class_name: '中级班B'
    },
    {
      id: '3',
      chinese_name: '张伟',
      english_name: 'Zhang Wei',
      gender: 'male',
      date_of_birth: '2000-12-08',
      role: '关怀员',
      class_name: '高级班C'
    },
    {
      id: '4',
      chinese_name: '刘华',
      english_name: 'Liu Hua',
      gender: 'female',
      date_of_birth: '2001-07-22',
      role: '班长',
      class_name: '初级班D'
    }
  ]);

  const filteredCadres = cadres.filter(cadre =>
    cadre.chinese_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.class_name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case '班长': return 'bg-red-100 text-red-800';
      case '副班长': return 'bg-orange-100 text-orange-800';
      case '关怀员': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const hasAttendancePermission = (role: string) => {
    return role === '班长' || role === '副班长';
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
                placeholder="搜索干部姓名、职位或班级..."
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
                班长
              </Button>
              <Button variant="outline" size="sm">
                副班长
              </Button>
              <Button variant="outline" size="sm">
                关怀员
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
                <Badge className={getRoleColor(cadre.role)}>
                  {cadre.role}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">所属班级:</span>
                  <span className="font-medium">{cadre.class_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">性别:</span>
                  <span className="font-medium">{cadre.gender === 'male' ? '男' : '女'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">年龄:</span>
                  <span className="font-medium">{calculateAge(cadre.date_of_birth)}岁</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">出生日期:</span>
                  <span className="font-medium">{cadre.date_of_birth}</span>
                </div>
                {hasAttendancePermission(cadre.role) && (
                  <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                    <User2 className="h-4 w-4" />
                    <span>可管理考勤和注册</span>
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
            <div className="text-2xl font-bold text-red-600">
              {cadres.filter(c => c.role === '班长').length}
            </div>
            <div className="text-sm text-gray-600">班长</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {cadres.filter(c => c.role === '副班长').length}
            </div>
            <div className="text-sm text-gray-600">副班长</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {cadres.filter(c => hasAttendancePermission(c.role)).length}
            </div>
            <div className="text-sm text-gray-600">可管理考勤</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cadres;
