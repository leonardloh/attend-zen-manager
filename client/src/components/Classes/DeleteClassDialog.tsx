import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClassInfo } from '@/data/types';

interface DeleteClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classToDelete: ClassInfo | null;
  onConfirmDelete: (classId: string) => void;
  isDeleting?: boolean;
}

const DeleteClassDialog: React.FC<DeleteClassDialogProps> = ({
  isOpen,
  onOpenChange,
  classToDelete,
  onConfirmDelete,
  isDeleting = false
}) => {
  const [confirmationText, setConfirmationText] = useState('');

  // Reset confirmation text when dialog opens/closes or class changes
  useEffect(() => {
    if (isOpen && classToDelete) {
      setConfirmationText('');
    }
  }, [isOpen, classToDelete]);

  const handleDelete = () => {
    if (!classToDelete || confirmationText !== classToDelete.name) return;
    onConfirmDelete(classToDelete.id);
  };

  const isConfirmed = confirmationText === classToDelete?.name;

  if (!classToDelete) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            删除班级
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-1">
                  警告：此操作不可撤销
                </h3>
                <p className="text-sm text-red-700">
                  您即将删除班级 <strong>"{classToDelete.name}"</strong>。
                  此操作将永久删除班级信息，包括：
                </p>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>班级基本信息和学习进度</li>
                  <li>与该班级关联的点名记录</li>
                  <li>干部职位分配信息</li>
                  <li>学员班级归属记录</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">班级信息</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>班级名称：</strong>{classToDelete.name}</div>
              <div><strong>地区：</strong>{classToDelete.region}</div>
              <div><strong>上课时间：</strong>{classToDelete.time}</div>
              <div><strong>学员人数：</strong>{classToDelete.student_count}名</div>
              <div><strong>出席率：</strong>{classToDelete.attendance_rate}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmationInput">
              请输入班级名称 <strong>"{classToDelete.name}"</strong> 来确认删除：
            </Label>
            <Input
              id="confirmationInput"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`请输入：${classToDelete.name}`}
              className={cn(
                "transition-colors",
                confirmationText && !isConfirmed && "border-red-300 focus:border-red-500"
              )}
            />
            {confirmationText && !isConfirmed && (
              <p className="text-sm text-red-600">
                输入的班级名称不匹配，请重新输入
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                删除中...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                确认删除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default DeleteClassDialog;