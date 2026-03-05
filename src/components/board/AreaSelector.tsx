'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Building2 } from 'lucide-react';
import { areas, Area } from '@/lib/data';
import { cn } from '@/lib/utils';

interface AreaSelectorProps {
  selectedAreaId?: string;
  onChange: (areaId: string | undefined) => void;
}

export function AreaSelector({ selectedAreaId, onChange }: AreaSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedArea = areas.find(a => a.id === selectedAreaId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedArea ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: selectedArea.color }}
              />
              <span>{selectedArea.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Seleccionar área responsable...</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar área..." />
          <CommandList>
            <CommandEmpty>No se encontraron áreas</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4" />
                <span>Sin área específica</span>
                {!selectedAreaId && <Check className="ml-auto h-4 w-4" />}
              </CommandItem>
              {areas.map(area => (
                <CommandItem
                  key={area.id}
                  onSelect={() => {
                    onChange(area.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: area.color }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{area.name}</div>
                    <div className="text-xs text-muted-foreground">{area.description}</div>
                  </div>
                  {selectedAreaId === area.id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}