import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building2, Edit, MapPin, Trash2, Home, User } from 'lucide-react';
import { getStudentById, type SubBranch } from '@/data/types';

export interface ClassroomItem {
  id: string;
  name: string;
  state?: string;
  address?: string;
  student_id?: string;    // public student id
  sub_branch_id: string;
  sub_branch_name?: string;
}

interface ClassroomCardProps {
  classroom: ClassroomItem;
  canEdit: boolean;
  onEdit: (c: ClassroomItem) => void;
  onDelete: (id: string) => void;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom, canEdit, onEdit, onDelete }) => {
  const contactStudent = classroom.student_id ? getStudentById(classroom.student_id) : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
              <p className="text-sm text-gray-600">教室</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {classroom.sub_branch_name && (
            <div className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">所属分院:</span>
              <span className="font-medium">{classroom.sub_branch_name}</span>
            </div>
          )}

          {classroom.state && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">所在州属:</span>
              <span className="font-medium">{classroom.state}</span>
            </div>
          )}

          {contactStudent && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">负责人:</span>
              <span className="font-medium">{contactStudent.chinese_name}</span>
              <span className="text-xs text-gray-500">({contactStudent.student_id})</span>
            </div>
          )}

          {classroom.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-gray-600">地址:</span>
                <p className="font-medium">{classroom.address}</p>
              </div>
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(classroom)}>
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
                  <AlertDialogTitle>确认删除教室</AlertDialogTitle>
                  <AlertDialogDescription>
                    该操作将永久删除教室 <strong>{classroom.name}</strong>。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(classroom.id)}>
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassroomCard;

