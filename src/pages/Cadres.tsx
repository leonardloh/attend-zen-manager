import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import CadreCard from '@/components/Cadres/CadreCard';
import CadreStats from '@/components/Cadres/CadreStats';
import CadreFilters from '@/components/Cadres/CadreFilters';
import CadreDialog from '@/components/Cadres/CadreDialog';

interface Cadre {
  id: string;
  student_id: string; // Reference to student
  chinese_name: string; // Auto-populated from student
  english_name: string; // Auto-populated from student
  gender: 'male' | 'female'; // Auto-populated from student
  date_of_birth: string; // Auto-populated from student
  role: '班长' | '副班长' | '关怀员';
  mother_class: string;
  support_classes: string[];
  can_take_attendance: boolean;
  can_register_students: boolean;
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
      student_id: 'S2024001',
      chinese_name: '王小明',
      english_name: 'Wang Xiaoming',
      gender: 'male',
      date_of_birth: '1995-05-15',
      role: '班长',
      mother_class: '初级班A',
      support_classes: ['初级班A', '初级班D'],
      can_take_attendance: true,
      can_register_students: true
    },
    {
      id: '2',
      student_id: 'S2024002',
      chinese_name: '李小红',
      english_name: 'Li Xiaohong',
      gender: 'female',
      date_of_birth: '1992-08-22',
      role: '副班长',
      mother_class: '中级班B',
      support_classes: ['中级班B', '中级班E'],
      can_take_attendance: true,
      can_register_students: false
    },
    {
      id: '3',
      student_id: 'S2024003',
      chinese_name: '张三',
      english_name: 'Zhang San',
      gender: 'male',
      date_of_birth: '1988-12-10',
      role: '关怀员',
      mother_class: '高级班C',
      support_classes: ['高级班C'],
      can_take_attendance: false,
      can_register_students: true
    }
  ]);

  const filteredCadres = cadres.filter(cadre =>
    cadre.chinese_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.mother_class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadre.support_classes.some(cls => cls.toLowerCase().includes(searchTerm.toLowerCase()))
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
    const deletedCadre = cadres.find(cadre => cadre.id === cadreId);
    setCadres(cadres.filter(cadre => cadre.id !== cadreId));
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

      {/* Cadres Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCadres.map((cadre) => (
          <CadreCard
            key={cadre.id}
            cadre={cadre}
            onEdit={setEditingCadre}
            onDelete={handleDeleteCadre}
          />
        ))}
      </div>

      {/* Summary Stats */}
      <CadreStats cadres={cadres} />
    </div>
  );
};

export default Cadres;
