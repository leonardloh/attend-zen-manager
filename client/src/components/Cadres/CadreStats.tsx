
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Cadre {
  id: string;
  chinese_name: string;
  english_name: string;
  gender: 'male' | 'female';
  year_of_birth: number;
  role: '班长' | '副班长' | '关怀员';
  mother_class: string;
  support_classes: string[];
  can_take_attendance: boolean;
  can_register_students: boolean;
}

interface CadreStatsProps {
  cadres: Cadre[];
}

const CadreStats: React.FC<CadreStatsProps> = ({ cadres }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            {cadres.filter(c => c.can_take_attendance).length}
          </div>
          <div className="text-sm text-gray-600">可管理考勤</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {cadres.filter(c => c.can_register_students).length}
          </div>
          <div className="text-sm text-gray-600">可注册学员</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadreStats;
