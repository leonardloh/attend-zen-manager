import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, Edit, Trash2, Calendar, MapPin, User, Phone, Home } from 'lucide-react';
import type { SubBranch } from '@/pages/Classrooms';

interface SubBranchCardProps {
  branch: SubBranch;
  canEdit: boolean;
  onEdit: (branch: SubBranch) => void;
  onDelete: (branchId: string) => void;
}

const SubBranchCard: React.FC<SubBranchCardProps> = ({ branch, canEdit, onEdit, onDelete }) => {
  const getRegionColor = (regionName: string) => {
    switch (regionName) {
      case '北马': return 'bg-blue-100 text-blue-800';
      case '中马': return 'bg-green-100 text-green-800';
      case '南马': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            <Badge className={getRegionColor(branch.region_name)} style={{ fontSize: '10px' }}>
              {branch.region_name}
            </Badge>
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
          
          {branch.region_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">所属地区:</span>
              <span className="font-medium">{branch.region_name}</span>
            </div>
          )}
          
          {branch.student_id && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">联系人学员:</span>
              <span className="font-medium">{branch.student_id}</span>
            </div>
          )}
          
          {branch.contact_person && (
            <div className="flex justify-between text-sm ml-6">
              <span className="text-gray-600">姓名:</span>
              <span className="font-medium">{branch.contact_person}</span>
            </div>
          )}
          
          {branch.contact_phone && (
            <div className="flex items-center gap-2 text-sm ml-6">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">电话:</span>
              <span className="font-medium">{branch.contact_phone}</span>
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
                  <AlertDialogTitle>确认删除分院</AlertDialogTitle>
                  <AlertDialogDescription>
                    您确定要删除分院 <strong>{branch.name}</strong> 吗？
                    <br /><br />
                    删除后将清除以下信息：
                    <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                      <li>分院基本信息（名称：{branch.name}）</li>
                      {branch.main_branch_name && <li>所属总院：{branch.main_branch_name}</li>}
                      {branch.state && <li>所在州属：{branch.state}</li>}
                      {branch.region_name && <li>所属地区：{branch.region_name}</li>}
                      {branch.contact_person && <li>联系人信息</li>}
                      {branch.address && <li>地址信息</li>}
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

export default SubBranchCard;