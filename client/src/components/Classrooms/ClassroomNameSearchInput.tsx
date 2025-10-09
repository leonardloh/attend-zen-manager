import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClassroomLookupItem {
  id: string;
  name: string;
  state?: string;
  address?: string;
  student_id?: string;
  sub_branch_id: string;
  sub_branch_name?: string;
}

interface ClassroomNameSearchInputProps {
  value: string;
  onChange: (classroomName: string, classroomData?: ClassroomLookupItem) => void;
  placeholder?: string;
  className?: string;
  classrooms?: ClassroomLookupItem[];
  disabledIds?: string[];
}

const ClassroomNameSearchInput: React.FC<ClassroomNameSearchInputProps> = ({
  value,
  onChange,
  placeholder = '搜索教室名称...',
  className,
  classrooms = [],
  disabledIds = [],
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedClassroom = useMemo(() => classrooms.find((c) => c.name === value), [classrooms, value]);

  const filteredClassrooms = classrooms.filter((classroom) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      classroom.name.toLowerCase().includes(searchLower) ||
      classroom.state?.toLowerCase().includes(searchLower) ||
      classroom.sub_branch_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (classroom: ClassroomLookupItem) => {
    onChange(classroom.name, classroom);
    setSearchTerm('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value ? (
              <span className="truncate">{value}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <div className="flex items-center gap-1">
              {value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="hover:bg-gray-200 rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            <Input
              placeholder="搜索教室名称或所属分院..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-60 overflow-auto">
              {filteredClassrooms.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  没有找到匹配的教室
                </div>
              ) : (
                filteredClassrooms.map((classroom) => {
                  const isDisabled = disabledIds.includes(classroom.id);
                  return (
                    <button
                      key={classroom.id}
                      onClick={() => !isDisabled && handleSelect(classroom)}
                      className={cn(
                        'w-full flex items-center justify-between p-2 text-sm rounded transition-colors',
                        value === classroom.name ? 'bg-gray-100' : 'hover:bg-gray-100',
                        isDisabled && 'opacity-50 cursor-not-allowed'
                      )}
                      type="button"
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">{classroom.name}</span>
                        <div className="text-xs text-gray-500 space-x-2">
                          {classroom.state && <span>州属: {classroom.state}</span>}
                          {classroom.sub_branch_name && <span>当前分院: {classroom.sub_branch_name}</span>}
                        </div>
                      </div>
                      {value === classroom.name && <Check className="h-4 w-4 text-green-600" />}
                    </button>
                  );
                })
              )}
            </div>
            {selectedClassroom && selectedClassroom.sub_branch_name && (
              <p className="mt-2 text-xs text-orange-600 bg-orange-50 border border-orange-100 p-2 rounded">
                当前教室隶属分院: {selectedClassroom.sub_branch_name}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ClassroomNameSearchInput;
