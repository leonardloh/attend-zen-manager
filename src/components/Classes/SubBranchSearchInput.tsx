import React, { useState, useEffect } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Building, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDatabase } from '@/contexts/DatabaseContext';

interface SubBranchSearchInputProps {
  value?: string;
  onChange: (subBranchId: string, subBranchName: string) => void;
  placeholder?: string;
  className?: string;
}

const SubBranchSearchInput: React.FC<SubBranchSearchInputProps> = ({
  value,
  onChange,
  placeholder = "搜索分院...",
  className
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { subBranches } = useDatabase();

  // Ensure subBranches is always an array
  const safeBranches = Array.isArray(subBranches) ? subBranches : [];
  const selectedSubBranch = safeBranches.find(branch => branch.id === value);

  // Filter branches based on search term
  const filteredBranches = safeBranches.filter(branch => {
    const searchLower = searchTerm.toLowerCase();
    return (
      branch.name.toLowerCase().includes(searchLower) ||
      (branch.state && branch.state.toLowerCase().includes(searchLower)) ||
      (branch.main_branch_name && branch.main_branch_name.toLowerCase().includes(searchLower))
    );
  });

  const handleSelect = (branchId: string) => {
    const selectedBranch = safeBranches.find(b => b.id === branchId);
    if (selectedBranch) {
      onChange(branchId, selectedBranch.name);
      setSearchTerm('');
      setOpen(false);
    }
  };

  const handleClear = () => {
    onChange('', '');
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
            {selectedSubBranch ? (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>{selectedSubBranch.name}</span>
                <span className="text-gray-500 text-sm">({selectedSubBranch.state})</span>
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <div className="flex items-center gap-1">
              {selectedSubBranch && (
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
              placeholder="搜索分院名称..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>找不到相关分院</CommandEmpty>
              <CommandGroup>
                {filteredBranches.map((branch) => (
                  <CommandItem
                    key={branch.id}
                    value={`${branch.name} ${branch.state} ${branch.main_branch_name || ''}`}
                    onSelect={() => handleSelect(branch.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === branch.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Building className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{branch.name}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{branch.state}</span>
                          {branch.main_branch_name && (
                            <>
                              <span>•</span>
                              <span>属于: {branch.main_branch_name}</span>
                            </>
                          )}
                        </div>
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

export default SubBranchSearchInput;