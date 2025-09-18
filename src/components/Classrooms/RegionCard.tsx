import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Edit, Trash2, Calendar } from 'lucide-react';
import type { Region } from '@/pages/Classrooms';

interface RegionCardProps {
  region: Region;
  canEdit: boolean;
  onEdit: (region: Region) => void;
  onDelete: (regionId: string) => void;
}

const RegionCard: React.FC<RegionCardProps> = ({ region, canEdit, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{region.name}</h3>
              <p className="text-sm text-gray-600">代码: {region.code}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            地区
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">创建日期:</span>
            <span className="font-medium">{region.created_date}</span>
          </div>

          {/* States */}
          <div className="text-sm">
            <span className="text-gray-600">管理州属 ({region.states?.length || 0}):</span>
            <div className="mt-2 flex flex-wrap gap-1">
              {region.states?.map((state, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {state}
                </Badge>
              )) || (
                <span className="text-xs text-gray-400">暂无州属</span>
              )}
            </div>
          </div>
          
          {region.description && (
            <div className="text-sm">
              <span className="text-gray-600">描述:</span>
              <p className="mt-1 text-gray-700">{region.description}</p>
            </div>
          )}
        </div>
        
        {canEdit && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onEdit(region)}
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
                  <AlertDialogTitle>确认删除地区</AlertDialogTitle>
                  <AlertDialogDescription>
                    您确定要删除地区 <strong>{region.name}</strong> 吗？
                    <br /><br />
                    删除后将清除以下信息：
                    <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                      <li>地区基本信息（名称：{region.name}，代码：{region.code}）</li>
                      <li>该地区下的所有州属分院信息</li>
                      <li>该地区下的所有分院信息</li>
                    </ul>
                    <br />
                    <strong>此操作不可撤销。</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(region.id)}
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

export default RegionCard;
