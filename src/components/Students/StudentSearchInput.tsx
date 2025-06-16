import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  student_id: string;
  chinese_name: string;
  english_name: string;
}

// Mock student data - in real app this would come from props or API
const mockStudents: Student[] = [
  { id: '1', student_id: 'S2024001', chinese_name: '王小明', english_name: 'Wang Xiaoming' },
  { id: '2', student_id: 'S2024002', chinese_name: '李小红', english_name: 'Li Xiaohong' },
  { id: '3', student_id: 'S2024003', chinese_name: '张三', english_name: 'Zhang San' },
  { id: '4', student_id: 'S2024004', chinese_name: '李四', english_name: 'Li Si' },
  { id: '5', student_id: 'S2024005', chinese_name: '王五', english_name: 'Wang Wu' },
  { id: '6', student_id: 'S2024006', chinese_name: '赵六', english_name: 'Zhao Liu' },
  { id: '7', student_id: 'S2024007', chinese_name: '钱七', english_name: 'Qian Qi' },
  { id: '8', student_id: 'S2024008', chinese_name: '孙八', english_name: 'Sun Ba' },
];

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

  // Find selected student
  const selectedStudent = mockStudents.find(s => s.student_id === value);

  // Filter students based on search term and exclude list
  const filteredStudents = mockStudents.filter(student => {
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
            {selectedStudent ? (
              <span className="flex items-center">
                {selectedStudent.student_id} - {selectedStudent.chinese_name}
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <div className="flex items-center gap-1">
              {selectedStudent && (
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
              placeholder="搜索学号或姓名..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>没有找到学生</CommandEmpty>
              <CommandGroup>
                {filteredStudents.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={student.student_id}
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