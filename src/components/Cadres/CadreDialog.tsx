
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CadreForm from './CadreForm';

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

interface CadreDialogProps {
  isAddDialogOpen: boolean;
  onAddDialogChange: (open: boolean) => void;
  editingCadre: Cadre | null;
  onEditingCadreChange: (cadre: Cadre | null) => void;
  onAddCadre: (cadre: Omit<Cadre, 'id'>) => void;
  onEditCadre: (cadre: Cadre) => void;
}

const CadreDialog: React.FC<CadreDialogProps> = ({
  isAddDialogOpen,
  onAddDialogChange,
  editingCadre,
  onEditingCadreChange,
  onAddCadre,
  onEditCadre
}) => {
  return (
    <>
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={onAddDialogChange}>
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
          <CadreForm onSubmit={onAddCadre} onCancel={() => onAddDialogChange(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingCadre !== null} onOpenChange={(open) => !open && onEditingCadreChange(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑干部信息</DialogTitle>
          </DialogHeader>
          {editingCadre && (
            <CadreForm 
              initialData={editingCadre} 
              onSubmit={onEditCadre} 
              onCancel={() => onEditingCadreChange(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CadreDialog;
