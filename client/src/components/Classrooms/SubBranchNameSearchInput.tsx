import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubBranch } from '@/data/types';

interface SubBranchNameSearchInputProps {
  value: string;
  onChange: (branchName: string, branchData?: SubBranch) => void;
  placeholder?: string;
  className?: string;
  subBranches?: SubBranch[];
}

const SubBranchNameSearchInput: React.FC<SubBranchNameSearchInputProps> = ({
  value,
  onChange,
  placeholder = "搜索分院名称...",
  className,
  subBranches = []
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Find selected branch
  const selectedBranch = subBranches.find(b => b.name === value);

  // Filter branches based on search term
  const filteredBranches = subBranches.filter(branch => {
    const searchLower = searchTerm.toLowerCase();
    return (
      branch.name.toLowerCase().includes(searchLower) ||
      branch.state.toLowerCase().includes(searchLower) ||
      (branch.address && branch.address.toLowerCase().includes(searchLower))
    );
  });

  const handleSelect = (branch: SubBranch) => {
    onChange(branch.name, branch);
    setSearchTerm('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const handleManualInput = (branchName: string) => {
    onChange(branchName);
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
              placeholder="搜索分院名称、州属或地址..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            
            {/* Manual Input Option */}
            <div className="border-b pb-2 mb-2">
              <p className="text-xs text-gray-500 mb-1">手动输入新分院名称:</p>
              <Input
                placeholder="输入新分院名称"
                value={value}
                onChange={(e) => handleManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setOpen(false);
                  }
                }}
              />
            </div>

            {/* Search Results */}
            <div className="max-h-60 overflow-auto">
              {filteredBranches.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  没有找到匹配的分院
                </div>
              ) : (
                filteredBranches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleSelect(branch)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 text-sm hover:bg-gray-100 rounded",
                      value === branch.name && "bg-gray-100"
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{branch.name}</span>
                      {branch.address && (
                        <span className="text-xs text-gray-500 truncate max-w-48">
                          {branch.address}
                        </span>
                      )}
                    </div>
                    {value === branch.name && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

    </div>
  );
};

export default SubBranchNameSearchInput;