import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDatabase } from '@/contexts/DatabaseContext';



interface ClassSearchInputProps {
  value: string;
  onChange: (className: string) => void;
  placeholder?: string;
  excludeClasses?: string[]; // Class names to exclude from search results
  className?: string;
  includeInactive?: boolean; // Whether to include inactive classes
}

const ClassSearchInput: React.FC<ClassSearchInputProps> = ({
  value,
  onChange,
  placeholder = "搜索班级名称...",
  excludeClasses = [],
  className,
  includeInactive = true
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { classes } = useDatabase();

  // Normalize DB classes to the shape used here
  const classOptions = classes.map(c => ({
    id: c.id,
    name: c.name,
    region: c.sub_branch_name || '',
    time: c.time || '',
    student_count: c.student_count || 0,
    status: c.status,
  }));

  const selectedClass = classOptions.find(c => c.name === value);

  // Filter classes based on search term, exclude list, and status
  const filteredClasses = classOptions.filter(classInfo => {
    if (excludeClasses.includes(classInfo.name)) return false;
    if (!includeInactive && classInfo.status === 'inactive') return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      classInfo.name.toLowerCase().includes(searchLower) ||
      (classInfo.region || '').toLowerCase().includes(searchLower) ||
      classInfo.time.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (className: string) => {
    onChange(className);
    setSearchTerm('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active' ? 'text-green-600' : 'text-gray-500';
  };

  const getRegionColor = (region: string) => {
    switch (region) {
      case '北马':
        return 'text-blue-600';
      case '中马':
        return 'text-green-600';
      case '南马':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
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
            {selectedClass ? (
              <span className="flex items-center">
                {selectedClass.name}
                <span className={cn("ml-2 text-sm", getRegionColor(selectedClass.region))}>
                  ({selectedClass.region})
                </span>
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <div className="flex items-center gap-1">
              {selectedClass && (
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
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="搜索班级名称、地区或时间..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>没有找到班级</CommandEmpty>
              <CommandGroup>
                {filteredClasses.map((classInfo) => (
                  <CommandItem
                    key={classInfo.id}
                    value={classInfo.name}
                    onSelect={() => handleSelect(classInfo.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === classInfo.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{classInfo.name}</span>
                        <span className={cn("text-xs", getStatusColor(classInfo.status))}>
                          {classInfo.status === 'active' ? '活跃' : '停课'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className={getRegionColor(classInfo.region)}>
                          {classInfo.region}
                        </span>
                        <span>{classInfo.time}</span>
                        <span>{classInfo.student_count}名学员</span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ClassSearchInput;
