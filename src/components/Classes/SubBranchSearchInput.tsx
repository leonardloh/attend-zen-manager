import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';

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
  
  try {
    const { subBranches } = useData();
    console.log('SubBranchSearchInput - subBranches:', subBranches);
    
    // Ensure subBranches is always an array
    const safeBranches = Array.isArray(subBranches) ? subBranches : [];
    console.log('SubBranchSearchInput - safeBranches:', safeBranches);
    
    const selectedSubBranch = safeBranches.find(branch => branch.id === value);
    console.log('SubBranchSearchInput - selectedSubBranch:', selectedSubBranch);

    // Filter branches based on search term
    const filteredBranches = safeBranches.filter(branch => {
      const searchLower = searchTerm.toLowerCase();
      return (
        branch.name.toLowerCase().includes(searchLower) ||
        (branch.state && branch.state.toLowerCase().includes(searchLower)) ||
        (branch.main_branch_name && branch.main_branch_name.toLowerCase().includes(searchLower))
      );
    });

  return (
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
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="flex flex-col min-h-[200px] max-h-[300px]">
          <div className="p-2 border-b">
            <Input
              placeholder="搜索分院名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredBranches && filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onChange(branch.id, branch.name);
                    setSearchTerm('');
                    setOpen(false);
                  }}
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
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? '找不到相关分院' : '暂无分院数据'}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
  } catch (error) {
    console.error('SubBranchSearchInput error:', error);
    return (
      <div className="p-4 text-red-600 border border-red-300 rounded">
        Error loading sub-branches: {error.message}
      </div>
    );
  }
};

export default SubBranchSearchInput;