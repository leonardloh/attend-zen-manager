import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Student } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';

interface StudentMultiSelectProps {
  value: string[];
  onChange: (studentIds: string[]) => void;
  placeholder?: string;
  excludeIds?: string[]; // Student IDs to exclude from search results
  className?: string;
  maxSelection?: number;
}

const StudentMultiSelect: React.FC<StudentMultiSelectProps> = ({
  value,
  onChange,
  placeholder = "选择班级学员...",
  excludeIds = [],
  className,
  maxSelection
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { students } = useData();

  // Find selected students
  const selectedStudents = students.filter(s => value.includes(s.student_id));

  // Filter students based on search term and exclude list
  const filteredStudents = students.filter(student => {
    if (excludeIds.includes(student.student_id)) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      student.student_id.toLowerCase().includes(searchLower) ||
      student.chinese_name.toLowerCase().includes(searchLower) ||
      student.english_name.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (studentId: string) => {
    if (value.includes(studentId)) {
      // Remove student
      onChange(value.filter(id => id !== studentId));
    } else {
      // Add student (check max selection limit)
      if (!maxSelection || value.length < maxSelection) {
        onChange([...value, studentId]);
      }
    }
  };

  const handleRemove = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(id => id !== studentId));
  };

  const handleClearAll = () => {
    onChange([]);
    setSearchTerm('');
  };

  // Reset search term when popover closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[40px] h-auto"
          >
            <div className="flex items-center flex-wrap gap-1 flex-1">
              {selectedStudents.length > 0 ? (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  <div className="flex flex-wrap gap-1">
                    {selectedStudents.slice(0, 3).map((student) => (
                      <Badge
                        key={student.student_id}
                        variant="secondary"
                        className="text-xs pr-1"
                      >
                        <span>{student.chinese_name}</span>
                        <span
                          onClick={(e) => handleRemove(student.student_id, e)}
                          className="ml-1 hover:bg-gray-300 rounded-full cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </Badge>
                    ))}
                    {selectedStudents.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedStudents.length - 3}
                      </Badge>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2">
              {selectedStudents.length > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  className="hover:bg-gray-200 rounded-full p-1 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="搜索学号或姓名..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <div className="px-3 py-2 border-b">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>已选择: {value.length}</span>
                {maxSelection && (
                  <span>最多可选: {maxSelection}</span>
                )}
                {value.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-6 px-2 text-xs"
                  >
                    清空
                  </Button>
                )}
              </div>
            </div>
            <CommandList>
              <CommandEmpty>没有找到学员</CommandEmpty>
              <CommandGroup>
                {filteredStudents.map((student) => {
                  const isSelected = value.includes(student.student_id);
                  const canSelect = !maxSelection || value.length < maxSelection || isSelected;
                  
                  return (
                    <CommandItem
                      key={student.id}
                      value={`${student.student_id} ${student.chinese_name} ${student.english_name}`}
                      onSelect={() => canSelect && handleSelect(student.student_id)}
                      className={cn(
                        !canSelect && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{student.student_id}</span>
                        <span className="text-sm text-gray-500">
                          {student.chinese_name} ({student.english_name})
                        </span>
                      </div>
                      {!canSelect && !isSelected && (
                        <span className="text-xs text-red-500">已达上限</span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default StudentMultiSelect;