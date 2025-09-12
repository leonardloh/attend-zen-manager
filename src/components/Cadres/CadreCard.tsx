import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Edit, Trash2 } from 'lucide-react';
import { Cadre, CadreRole } from '@/data/types';

interface CadreCardProps {
  cadre: Cadre;
  onEdit: (cadre: Cadre) => void;
  onDelete: (cadreId: string) => void;
}

const CadreCard: React.FC<CadreCardProps> = ({ cadre, onEdit, onDelete }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case '班长': return 'bg-red-100 text-red-800';
      case '副班长': return 'bg-orange-100 text-orange-800';
      case '关怀员': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle both old and new cadre structures
  // New structure has 'roles' array, old structure has direct properties
  const cadreRoles = cadre.roles 
    ? cadre.roles 
    : cadre.role 
      ? [{ 
          class_id: '', 
          class_name: cadre.mother_class || '未分配', 
          role: cadre.role, 
          appointment_date: cadre.appointment_date || new Date().toISOString().split('T')[0] 
        }] 
      : [];

  return (
    <Card className="hover:shadow-md transition-shadow">
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
          <div className="flex flex-col gap-1">
            {cadreRoles && cadreRoles.length > 0 ? (
              cadreRoles.slice(0, 2).map((role, index) => (
                <Badge key={index} className={getRoleColor(role.role)} style={{ fontSize: '10px' }}>
                  {role.role}
                </Badge>
              ))
            ) : (
              <Badge className="bg-gray-100 text-gray-800" style={{ fontSize: '10px' }}>
                无职位
              </Badge>
            )}
            {cadreRoles && cadreRoles.length > 2 && (
              <Badge className="bg-gray-100 text-gray-800" style={{ fontSize: '10px' }}>
                +{cadreRoles.length - 2}个
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">学员编号:</span>
            <span className="font-medium">{cadre.student_id}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">担任职位:</span>
            <div className="mt-1 space-y-1">
              {cadreRoles && cadreRoles.length > 0 ? (
                cadreRoles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                    <span className="font-medium">{role.class_name}</span>
                    <Badge className={getRoleColor(role.role)} style={{ fontSize: '10px' }}>
                      {role.role}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-xs">暂无职位</div>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">电话:</span>
            <span className="font-medium">{cadre.phone}</span>
          </div>
          {cadre.email && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">邮箱:</span>
              <span className="font-medium">{cadre.email}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">创建日期:</span>
            <span className="font-medium">
              {cadre.created_date || cadre.appointment_date || new Date().toISOString().split('T')[0]}
            </span>
          </div>
        </div>

        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(cadre)}
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
                <AlertDialogTitle>确认删除干部</AlertDialogTitle>
                <AlertDialogDescription>
                  您确定要删除干部 <strong>{cadre.chinese_name}</strong> 吗？
                  <br /><br />
                  删除后将清除以下信息：
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    <li>干部基本资料（姓名、电话、邮箱等）</li>
                    <li>所有职位信息：{cadreRoles.map(r => `${r.class_name}(${r.role})`).join('、') || '无职位'}</li>
                  </ul>
                  <br />
                  <strong>此操作不可撤销。</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(cadre.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default CadreCard;