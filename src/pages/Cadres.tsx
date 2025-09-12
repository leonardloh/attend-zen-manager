import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import CadreCard from '@/components/Cadres/CadreCard';
import CadreStats from '@/components/Cadres/CadreStats';
import CadreFilters from '@/components/Cadres/CadreFilters';
import CadreDialog from '@/components/Cadres/CadreDialog';
import { useDatabase } from '@/contexts/DatabaseContext';
import { type Cadre } from '@/data/types';


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
