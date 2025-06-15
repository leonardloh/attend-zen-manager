
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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

interface CadreStatsProps {
  cadres: Cadre[];
}

const CadreStats: React.FC<CadreStatsProps> = ({ cadres }) => {
  const hasAttendancePermission = (role: string) => {
    return role === '班长' || role === '副班长';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{cadres.length}</div>
          <div className="text-sm text-gray-600">总干部数</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {cadres.filter(c => c.role === '班长').length}
          </div>
          <div className="text-sm text-gray-600">班长</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {cadres.filter(c => c.role === '副班长').length}
          </div>
          <div className="text-sm text-gray-600">副班长</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {cadres.filter(c => hasAttendancePermission(c.role)).length}
          </div>
          <div className="text-sm text-gray-600">可管理考勤</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadreStats;
