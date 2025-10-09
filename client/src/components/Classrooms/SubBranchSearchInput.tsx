import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubBranch } from '@/data/types';

interface SubBranchSearchInputProps {
  value: string;
  onChange: (branchName: string) => void;
  placeholder?: string;
  className?: string;
  onCreateNew?: () => void; // Callback to trigger navigation to sub-branch creation
  subBranches?: SubBranch[]; // Optional prop for sub-branches data
}

const SubBranchSearchInput: React.FC<SubBranchSearchInputProps> = ({
  value,
  onChange,
  placeholder = "搜索分院名称...",
  className,
  onCreateNew,
  subBranches
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use provided sub-branches or fall back to empty array if none provided
  const defaultSubBranches: SubBranch[] = [];
  
  const availableSubBranches = subBranches || defaultSubBranches;

  // Find selected branch
  const selectedBranch = availableSubBranches.find(b => b.name === value);

  // Filter branches based on search term
  const filteredBranches = availableSubBranches.filter(branch => {
    const searchLower = searchTerm.toLowerCase();
    return (
      branch.name.toLowerCase().includes(searchLower) ||
      branch.region_name.toLowerCase().includes(searchLower) ||
      branch.state.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (branchName: string) => {
    onChange(branchName);
    setSearchTerm('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    setOpen(false);
    if (onCreateNew) {
      onCreateNew();
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
            {selectedBranch ? (
              <span className="flex items-center">
                {selectedBranch.name} ({selectedBranch.region_name} - {selectedBranch.state})
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <div className="flex items-center gap-1">
              {selectedBranch && (
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
              placeholder="搜索分院名称、地区或州属..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {filteredBranches.length === 0 ? (
                <div className="p-4 text-center">
                  <CommandEmpty>没有找到分院</CommandEmpty>
                  {onCreateNew && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleCreateNew}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      前往分院管理注册新分院
                    </Button>
                  )}
                </div>
              ) : (
                <CommandGroup>
                  {filteredBranches.map((branch) => (
                    <CommandItem
                      key={branch.id}
                      value={branch.name}
                      onSelect={() => handleSelect(branch.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === branch.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{branch.name}</span>
                        <span className="text-sm text-gray-500">
                          {branch.region_name} - {branch.state}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                  {onCreateNew && (
                    <CommandItem onSelect={handleCreateNew}>
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="text-blue-600">前往分院管理注册新分院</span>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SubBranchSearchInput;