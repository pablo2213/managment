'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PlanningFiltersProps {
  viewMode: 'list' | 'gantt';
  onViewModeChange: (mode: 'list' | 'gantt') => void;
  onCreateClick: () => void;
}

export function PlanningFilters({ viewMode, onViewModeChange, onCreateClick }: PlanningFiltersProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Plannings</h2>
      <div className="flex items-center gap-2">
        <Tabs value={viewMode} onValueChange={(v: any) => onViewModeChange(v)} className="mr-4">
          <TabsList>
            <TabsTrigger value="list">Vista Lista</TabsTrigger>
            <TabsTrigger value="gantt">Vista Timeline</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo planning
        </Button>
      </div>
    </div>
  );
}