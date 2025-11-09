
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface CadreFiltersProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  mainBranches: Array<{ id: string; name: string }>;
  subBranches: Array<{ id: string; name: string; main_branch_id: string }>;
  classrooms: Array<{ id: string; name: string; sub_branch_id: string }>;
  selectedMainBranch: string;
  selectedSubBranch: string;
  selectedClassroom: string;
  onMainBranchChange: (value: string) => void;
  onSubBranchChange: (value: string) => void;
  onClassroomChange: (value: string) => void;
}

const CadreFilters: React.FC<CadreFiltersProps> = ({ 
  searchTerm, 
  onSearch,
  mainBranches,
  subBranches,
  classrooms,
  selectedMainBranch,
  selectedSubBranch,
  selectedClassroom,
  onMainBranchChange,
  onSubBranchChange,
  onClassroomChange
}) => {
  const [inputValue, setInputValue] = useState(searchTerm);

  // Filter sub-branches based on selected main branch
  const filteredSubBranches = selectedMainBranch === 'all' 
    ? subBranches 
    : subBranches.filter(sb => sb.main_branch_id === selectedMainBranch);

  // Filter classrooms based on selected sub-branch
  const filteredClassrooms = selectedSubBranch === 'all'
    ? classrooms
    : classrooms.filter(c => c.sub_branch_id === selectedSubBranch);

  const handleSearch = () => {
    onSearch(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索干部姓名、职位、母班或护持班..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                data-testid="input-search-cadre"
              />
            </div>
            <Button 
              onClick={handleSearch}
              data-testid="button-search-cadre"
            >
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Branch Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">州属分院 / Main Branch</Label>
              <Select value={selectedMainBranch} onValueChange={onMainBranchChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择州属分院" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部州属分院</SelectItem>
                  {mainBranches.map(mb => (
                    <SelectItem key={mb.id} value={mb.id}>{mb.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Branch Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">分院 / Sub Branch</Label>
              <Select value={selectedSubBranch} onValueChange={onSubBranchChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分院" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分院</SelectItem>
                  {filteredSubBranches.map(sb => (
                    <SelectItem key={sb.id} value={sb.id}>{sb.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Classroom Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">教室 / Classroom</Label>
              <Select value={selectedClassroom} onValueChange={onClassroomChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择教室" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部教室</SelectItem>
                  {filteredClassrooms.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CadreFilters;
