import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CadreForm from './CadreForm';
import { Cadre } from '@/data/types';

interface CadreDialogProps {
  isAddDialogOpen: boolean;
  onAddDialogChange: (open: boolean) => void;
  onAddCadre: (cadre: Omit<Cadre, 'id'>) => void;
}

const CadreDialog: React.FC<CadreDialogProps> = ({
  isAddDialogOpen,
  onAddDialogChange,
  onAddCadre
}) => {
  return (
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
  );
};

export default CadreDialog;