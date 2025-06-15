
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Edit, Trash2, User2 } from 'lucide-react';

interface Cadre {
  id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  role: '班长' | '副班长' | '关怀员';
  mother_class: string;
  support_classes: string[];
}

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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const hasAttendancePermission = (role: string) => {
    return role === '班长' || role === '副班长';
  };

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
          <Badge className={getRoleColor(cadre.role)}>
            {cadre.role}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">母班班名:</span>
            <span className="font-medium">{cadre.mother_class}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">护持班名:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {cadre.support_classes.map((className, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {className}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">性别:</span>
            <span className="font-medium">{cadre.gender === 'male' ? '男' : '女'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">年龄:</span>
            <span className="font-medium">{calculateAge(cadre.date_of_birth)}岁</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">出生日期:</span>
            <span className="font-medium">{cadre.date_of_birth}</span>
          </div>
          {hasAttendancePermission(cadre.role) && (
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <User2 className="h-4 w-4" />
              <span>可管理考勤和注册</span>
            </div>
          )}
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
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(cadre.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CadreCard;
