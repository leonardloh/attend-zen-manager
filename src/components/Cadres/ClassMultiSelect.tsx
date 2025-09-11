import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassMultiSelectProps {
  value: string[];
  onChange: (classes: string[]) => void;
  availableClasses: string[];
  label?: string;
  placeholder?: string;
}

const ClassMultiSelect: React.FC<ClassMultiSelectProps> = ({
  value,
  onChange,
  availableClasses,
  label = "护持班名",
  placeholder = "搜索并选择班级..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = availableClasses.filter(className =>
    className.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(className)
  );

  const handleSelect = (className: string) => {
    if (!value.includes(className)) {
      onChange([...value, className]);
    }
    setSearchTerm('');
  };

  const handleRemove = (className: string) => {
    onChange(value.filter(cls => cls !== className));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Selected Classes as Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 min-h-[40px]">
          {value.map((className) => (
            <Badge key={className} variant="secondary" className="flex items-center gap-1 pr-1">
              <span>{className}</span>
              <span
                onClick={() => handleRemove(className)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </span>
            </Badge>
          ))}
        </div>
      )}

      {/* Search and Select Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="搜索班级..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>没有找到班级</CommandEmpty>
              <CommandGroup>
                {filteredClasses.map((className) => (
                  <CommandItem
                    key={className}
                    value={className}
                    onSelect={() => {
                      handleSelect(className);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(className) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {className}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="text-sm text-gray-500">可搜索并选择一个或多个护持班级</p>
    </div>
  );
};

export default ClassMultiSelect;