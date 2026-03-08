'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanningSimpleView } from '@/components/planning/PlanningSimpleView';
import { ProjectsGanttView } from '@/components/planning/components/ProjectsGanttView';

export default function PlanningPage() {
  const [view, setView] = useState<'list' | 'gantt'>('list');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Planificación</h1>
        <Tabs value={view} onValueChange={(v: any) => setView(v)}>
          <TabsList>
            <TabsTrigger value="list">Vista por proyecto</TabsTrigger>
            <TabsTrigger value="gantt">Timeline global</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === 'list' ? (
        <PlanningSimpleView />
      ) : (
        <ProjectsGanttView />
      )}
    </div>
  );
}