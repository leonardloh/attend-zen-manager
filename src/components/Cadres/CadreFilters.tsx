
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CadreFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const CadreFilters: React.FC<CadreFiltersProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索干部姓名、职位、母班或护持班..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              全部
            </Button>
            <Button variant="outline" size="sm">
              班长
            </Button>
            <Button variant="outline" size="sm">
              副班长
            </Button>
            <Button variant="outline" size="sm">
              关怀员
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CadreFilters;
