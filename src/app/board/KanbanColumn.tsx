import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Module, Task } from '@/lib/data';
import { KanbanCard } from './KanbanCard';
import { CreateModuleModal } from '@/app/board/CreateModuleModal';
import { Plus, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { useState } from 'react';

interface KanbanColumnProps {
  id: string;
  title: string;
  modules: Module[];
  tasks: Task[];
  projectId: string;
  onModuleClick: (module: Module) => void;
  onAddModule: (columnId: string, moduleData: any) => void;
}

export function KanbanColumn({ 
  id, 
  title, 
  modules, 
  tasks,
  projectId,
  onModuleClick, 
  onAddModule 
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calcular métricas de la columna
  let totalEstimated = 0;
  let totalActual = 0;
  let notStarted = 0;
  let inProgress = 0;
  let delayed = 0;
  const today = new Date();

  modules.forEach(module => {
    const moduleTasks = tasks.filter(t => t.moduleId === module.id);
    totalEstimated += moduleTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
    totalActual += moduleTasks.reduce((acc, t) => {
      if (t.timeEntries) return acc + t.timeEntries.reduce((s, e) => s + e.hours, 0);
      return acc + (t.actualHours || 0);
    }, 0);

    // Contar estados temporales
    const start = new Date(module.startDate);
    const end = new Date(module.endDate);
    
    if (module.status === 'completed') return;
    if (today < start) notStarted++;
    else if (today > end) delayed++;
    else if (today >= start && today <= end) inProgress++;
  });

  const handleCreateModule = (moduleData: any) => {
    onAddModule(id, moduleData);
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="bg-muted/40 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge variant="secondary">{modules.length}</Badge>
          </div>
          
          {/* Métricas de la columna */}
          {modules.length > 0 && (
            <div className="space-y-1 mt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Horas:
                </span>
                <span className="font-medium">
                  {totalActual}/{totalEstimated}h
                </span>
              </div>
              
              {notStarted > 0 && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Calendar className="h-3 w-3" />
                  <span>{notStarted} por iniciar</span>
                </div>
              )}
              
              {inProgress > 0 && (
                <div className="flex items-center gap-1 text-blue-500">
                  <Clock className="h-3 w-3" />
                  <span>{inProgress} en curso</span>
                </div>
              )}
              
              {delayed > 0 && (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{delayed} retrasados</span>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          <div ref={setNodeRef} className="min-h-[200px]">
            <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {modules.map(module => (
                <KanbanCard 
                  key={module.id} 
                  module={module}
                  tasks={tasks}
                  onClick={() => onModuleClick(module)}
                />
              ))}
            </SortableContext>
          </div>

          {/* Botón para agregar módulo */}
          <div className="mt-4 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar módulo
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateModuleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreateModule={handleCreateModule}
        columnTitle={title}
      />
    </>
  );
}