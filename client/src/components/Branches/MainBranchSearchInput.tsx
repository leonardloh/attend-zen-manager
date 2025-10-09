import React, { useEffect, useMemo, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Building2, Check, ChevronDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDatabase } from '@/contexts/DatabaseContext';

interface MainBranchSearchInputProps {
  value?: string;
  onChange: (branchId: string) => void;
  placeholder?: string;
  className?: string;
}

const deriveRegion = (branch: { name?: string; region?: string }) => {
  if (branch.region) return branch.region as MainBranchSearchInputProps['value'];
  const derived = branch.name?.replace(/总院.*$/u, '').trim();
  return derived || undefined;
};

const MainBranchSearchInput: React.FC<MainBranchSearchInputProps> = ({
  value,
  onChange,
  placeholder = '选择州属分院...',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { mainBranches, isLoadingMainBranches } = useDatabase();

  const branches = useMemo(() => (Array.isArray(mainBranches) ? mainBranches : []), [mainBranches]);
  const selectedBranch = useMemo(() => branches.find((branch) => branch.id === value), [branches, value]);

  const filteredBranches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return branches;
    return branches.filter((branch) => {
      const name = branch.name?.toLowerCase() ?? '';
      const region = deriveRegion(branch)?.toLowerCase() ?? '';
      const contact = branch.contact_person?.toLowerCase() ?? '';
      return name.includes(term) || region.includes(term) || contact.includes(term);
    });
  }, [branches, searchTerm]);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const handleSelect = (branchId: string) => {
    onChange(branchId);
    setOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-left ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            className,
          )}
        >
          {selectedBranch ? (
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{selectedBranch.name}</span>
              {deriveRegion(selectedBranch) && (
                <span className="text-xs text-muted-foreground">({deriveRegion(selectedBranch)})</span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <span className="flex items-center gap-1">
            {selectedBranch && (
              <span
                role="button"
                aria-label="清除所选州属分院"
                className="rounded-full p-1 hover:bg-muted"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        {isLoadingMainBranches ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="搜索州属分院..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>暂无符合条件的州属分院</CommandEmpty>
              <CommandGroup>
                {filteredBranches.map((branch) => (
                  <CommandItem
                    key={branch.id}
                    value={`${branch.name || ''} ${branch.region || ''}`.trim()}
                    onSelect={() => handleSelect(branch.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        branch.id === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{branch.name || '未命名州属分院'}</span>
                      <span className="text-xs text-muted-foreground">
                        {deriveRegion(branch) ? `州属: ${deriveRegion(branch)}` : '未设置州属'}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MainBranchSearchInput;
