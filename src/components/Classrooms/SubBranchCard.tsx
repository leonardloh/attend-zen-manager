import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, Edit, Trash2, Calendar, MapPin, User, Phone, Home } from 'lucide-react';
import type { SubBranch } from '@/data/types';
import { getStudentById } from '@/data/types';

interface SubBranchCardProps {
  branch: SubBranch;
  canEdit: boolean;
  onEdit: (branch: SubBranch) => void;
  onDelete: (branchId: string) => void;
}

const SubBranchCard: React.FC<SubBranchCardProps> = ({ branch, canEdit, onEdit, onDelete }) => {
  const getStateColor = (state: string) => {
    // Different color scheme for states
    const colors = [
      'bg-orange-100 text-orange-800',
      'bg-cyan-100 text-cyan-800',
      'bg-pink-100 text-pink-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const index = state.length % colors.length;
    return colors[index];
  };

  // Get student information if student_id is available
  const contactStudent = branch.student_id ? getStudentById(branch.student_id) : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{branch.name}</h3>
              <p className="text-sm text-gray-600">分院</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getStateColor(branch.state || '未知')} style={{ fontSize: '10px' }}>
              {branch.state || '未知州属'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {branch.main_branch_name && (
            <div className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">所属总院:</span>
              <span className="font-medium">{branch.main_branch_name}</span>
            </div>
          )}
          
          {branch.state && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">所在州属:</span>
              <span className="font-medium">{branch.state}</span>
            </div>
          )}
          
          
          {contactStudent ? (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">负责人:</span>
                  <span className="font-medium">{contactStudent.chinese_name}</span>
                  <span className="text-xs text-gray-500">({contactStudent.student_id})</span>
                </div>
                <div className="flex items-center gap-2 ml-4 mt-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600 text-xs">电话:</span>
                  <span className="font-medium text-xs">{contactStudent.phone}</span>
                </div>
              </div>
            </div>
          ) : branch.contact_person && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">负责人:</span>
                  <span className="font-medium">{branch.contact_person}</span>
                </div>
                {branch.contact_phone && (
                  <div className="flex items-center gap-2 ml-4 mt-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600 text-xs">电话:</span>
                    <span className="font-medium text-xs">{branch.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {branch.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-gray-600">地址:</span>
                <p className="font-medium">{branch.address}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">创建日期:</span>
            <span className="font-medium">{branch.created_date}</span>
          </div>
        </div>
        
        {canEdit && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onEdit(branch)}
            >
              <Edit className="h-4 w-4 mr-1" />
              编辑
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认移除分院关联</AlertDialogTitle>
                  <AlertDialogDescription>
                    您确定要将分院 <strong>{branch.name}</strong> 从该总院中移除吗？
                    <br /><br />
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                      <div className="text-blue-800 font-medium mb-2">ℹ️ 重要说明：</div>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• 此操作只会解除分院与该总院的隶属关系</li>
                        <li>• <strong>{branch.name}</strong> 仍将保留在"分院管理"中</li>
                        <li>• 分院的所有基本信息不会被删除</li>
                        <li>• 可以重新关联到其他总院</li>
                      </ul>
                    </div>
                    <br />
                    移除后，该分院将变为未关联状态。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      console.log('Delete confirmation clicked for branch:', branch.name, 'ID:', branch.id);
                      onDelete(branch.id);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    确认移除关联
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

export default SubBranchCard;