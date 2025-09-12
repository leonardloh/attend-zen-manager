import React, { useState, useEffect } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Student } from '@/data/types';
import { useDatabase } from '@/contexts/DatabaseContext';

interface StudentSearchInputProps {
  value: string;
  onChange: (studentId: string) => void;
  placeholder?: string;
  excludeIds?: string[]; // Student IDs to exclude from search results
  className?: string;
}

const StudentSearchInput: React.FC<StudentSearchInputProps> = ({
  value,
  onChange,
  placeholder = "搜索学号或姓名...",
  excludeIds = [],
  className
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { students } = useDatabase();

  // Find selected student
  const safeStudentsForFind = Array.isArray(students) ? students : [];
  const selectedStudent = safeStudentsForFind.find(s => s.student_id === value);

  // Filter students based on search term and exclude list
  const safeStudents = Array.isArray(students) ? students : [];
  const filteredStudents = safeStudents.filter(student => {
    if (excludeIds.includes(student.student_id)) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      student.student_id.toLowerCase().includes(searchLower) ||
      student.chinese_name.toLowerCase().includes(searchLower) ||
      student.english_name.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (studentId: string) => {
    onChange(studentId);
    setSearchTerm('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
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
          <div
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              className
            )}
            onClick={() => setOpen(!open)}
          >
            {selectedStudent ? (
              <span className="flex items-center">
                {selectedStudent.student_id} - {selectedStudent.chinese_name}
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <div className="flex items-center gap-1">
              {selectedStudent && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="hover:bg-gray-200 rounded-full p-1 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="搜索学号或姓名..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>没有找到学员</CommandEmpty>
              <CommandGroup>
                {filteredStudents.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={`${student.student_id} ${student.chinese_name} ${student.english_name}`}
                    onSelect={() => handleSelect(student.student_id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === student.student_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{student.student_id}</span>
                      <span className="text-sm text-gray-500">
                        {student.chinese_name} ({student.english_name})
                      </span>
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

export default StudentSearchInput;