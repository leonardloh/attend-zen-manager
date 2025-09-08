import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building2, Edit, Trash2, MapPin, User, Phone } from 'lucide-react';
import type { MainBranch, SubBranch } from '@/data/mockData';
import { getStudentById } from '@/data/mockData';

interface MainBranchCardProps {
  branch: MainBranch;
  canEdit: boolean;
  onEdit: (branch: MainBranch) => void;
  onDelete: (branchId: string) => void;
  subBranches?: SubBranch[]; // Sub-branches for counting purposes
}

const MainBranchCard: React.FC<MainBranchCardProps> = ({ branch, canEdit, onEdit, onDelete, subBranches }) => {
  const getRegionColor = (regionName: string) => {
    switch (regionName) {
      case '北马': return 'bg-blue-100 text-blue-800';
      case '中马': return 'bg-green-100 text-green-800';
      case '南马': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Count sub-branches under this main branch
  const subBranchCount = subBranches?.filter(sb => sb.main_branch_id === branch.id).length || 0;
  
  // Get student information if student_id is available
  const contactStudent = branch.student_id ? getStudentById(branch.student_id) : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{branch.name}</h3>
              <p className="text-sm text-gray-600">总院</p>
            </div>
          </div>
          <Badge className={getRegionColor(branch.region)}>
            {branch.region}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">所属地区:</span>
            <span className="font-medium">{branch.region}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">管理分院:</span>
            <span className="font-medium">{subBranchCount} 个分院</span>
          </div>
          
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
                  <AlertDialogTitle>确认删除总院</AlertDialogTitle>
                  <AlertDialogDescription>
                    您确定要删除总院 <strong>{branch.name}</strong> 吗？
                    <br /><br />
                    删除后将清除以下信息：
                    <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                      <li>总院基本信息（名称：{branch.name}）</li>
                      <li>所属地区：{branch.region}</li>
                      <li>管理分院：{subBranchCount} 个分院</li>
                      {branch.contact_person && <li>联系人信息</li>}
                      <li>该总院下的所有分院信息</li>
                    </ul>
                    <br />
                    <strong>此操作不可撤销。</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(branch.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    确认删除
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

export default MainBranchCard;