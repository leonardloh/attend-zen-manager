import React, { useEffect, useMemo, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Building, MapPin, Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDatabase } from '@/contexts/DatabaseContext';

export type ManagerType = 'sub_branch' | 'classroom';

interface ClassManagerSearchInputProps {
  selectedType?: ManagerType;
  selectedId?: string;
  selectedName?: string;
  onSelect: (selection: { type: ManagerType; id: string; name: string }) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

interface ManagerOption {
  type: ManagerType;
  id: string;
  name: string;
  subtitle?: string;
}

const ClassManagerSearchInput: React.FC<ClassManagerSearchInputProps> = ({
  selectedType,
  selectedId,
  selectedName,
  onSelect,
  onClear,
  placeholder = '搜索并选择所属分院或者教室...',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { subBranches, classrooms } = useDatabase();

  const options = useMemo<ManagerOption[]>(() => {
    const branchOptions = (subBranches || []).map(branch => ({
      type: 'sub_branch' as ManagerType,
      id: branch.id,
      name: branch.name,
      subtitle: branch.state || branch.main_branch_name || undefined,
    }));

    const classroomOptions = (classrooms || []).map(classroom => ({
      type: 'classroom' as ManagerType,
      id: classroom.id,
      name: classroom.name,
      subtitle: classroom.sub_branch_name || classroom.state || undefined,
    }));

    return [...branchOptions, ...classroomOptions];
  }, [subBranches, classrooms]);

  const filteredOptions = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    if (!lowerSearch) return options;

    return options.filter(option => {
      return (
        option.name.toLowerCase().includes(lowerSearch) ||
        (option.subtitle && option.subtitle.toLowerCase().includes(lowerSearch))
      );
    });
  }, [options, searchTerm]);

  const selectedOption = options.find(
    option => option.type === selectedType && option.id === selectedId
  );

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const handleSelect = (option: ManagerOption) => {
    onSelect({ type: option.type, id: option.id, name: option.name });
    setOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClear();
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="combobox"
            aria-expanded={open}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
              className,
            )}
            onClick={() => setOpen(!open)}
          >
            {selectedOption ? (
              <div className="flex items-center gap-2">
                {selectedOption.type === 'sub_branch' ? (
                  <Building className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>{selectedOption.name}</span>
                {selectedOption.subtitle && (
                  <span className="text-gray-500 text-sm">({selectedOption.subtitle})</span>
                )}
              </div>
            ) : selectedName ? (
              <span>{selectedName}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <div className="flex items-center gap-1">
              {selectedOption && (
                <span
                  onClick={handleClear}
                  className="hover:bg-gray-200 rounded-full p-1"
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
              placeholder="搜索分院或者教室..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>未找到匹配的分院或者教室</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map(option => (
                  <CommandItem
                    key={`${option.type}-${option.id}`}
                    value={`${option.type}-${option.id}`}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedOption?.type === option.type && selectedOption?.id === option.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {option.type === 'sub_branch' ? (
                        <Building className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{option.name}</span>
                        {option.subtitle && (
                          <span className="text-xs text-gray-500">{option.subtitle}</span>
                        )}
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

export default ClassManagerSearchInput;
