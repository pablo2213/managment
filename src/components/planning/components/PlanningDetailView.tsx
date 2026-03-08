'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar, FolderTree, Users, Plus } from 'lucide-react';
import * as planningService from '@/lib/planningSimple';
import { users, tasks } from '@/lib/data';
import { PlanningHistoryView } from '../PlanningHistoryView';
import { PlanningKPICards } from './PlanningKPICards';
import { PlanningModuleCard } from './PlanningModuleCard';
import { PlanningParticipantsList } from './PlanningParticipantsList';
import { AddModulesDialog } from './AddModulesDialog';
import { getTaskActualHours, getModuleEstimatedHours, getModuleActualHours } from '@/lib/utils';

interface PlanningDetailViewProps {
  planning: planningService.Planning;
  onBack: () => void;
  onPlanningChange: (planning: planningService.Planning | null) => void;
  formatWeeks: (weeks: string[]) => string;
}

export function PlanningDetailView({ planning, onBack, onPlanningChange, formatWeeks }: PlanningDetailViewProps) {
  const [showAddModulesDialog, setShowAddModulesDialog] = useState(false);

  // Log para depuración
  console.log('🎯 PlanningDetailView renderizando con:', planning?.id, planning?.name);

  // Calcular KPI reales del planning
  const planningMetrics = useMemo(() => {
    if (!planning) return null;
    
    let totalModules = planning.modules.length;
    let completedModules = planning.modules.filter(m => m.status === 'completado').length;
    let inProgressModules = planning.modules.filter(m => m.status === 'en progreso').length;
    
    const totalPlannedHours = planning.modules.reduce((acc, m) => acc + m.estimatedHours, 0);
    
    let totalActualHours = 0;
    planning.modules.forEach(module => {
      const moduleTasks = tasks.filter(t => t.moduleId === module.moduleId);
      moduleTasks.forEach(task => {
        if (task.timeEntries) {
          totalActualHours += task.timeEntries.reduce((acc, te) => acc + te.hours, 0);
        }
      });
    });
    
    const weightedProgress = totalPlannedHours > 0 
      ? Math.round((totalActualHours / totalPlannedHours) * 100) 
      : 0;
    
    return {
      totalModules,
      completedModules,
      inProgressModules,
      totalPlannedHours,
      totalActualHours,
      weightedProgress,
      moduleProgress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
    };
  }, [planning]);

  // Obtener participantes REALES
  const planningParticipants = useMemo(() => {
    if (!planning) return [];
    
    const participantsMap = new Map();
    
    planning.modules.forEach(module => {
      module.assignedUsers.forEach(userId => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        if (!participantsMap.has(userId)) {
          participantsMap.set(userId, {
            userId,
            userName: user.name,
            userRole: user.role,
            avatar: user.avatar,
            totalHours: 0,
            modules: []
          });
        }
        
        const participant = participantsMap.get(userId);
        participant.totalHours += module.estimatedHours;
        participant.modules.push(module.moduleName);
      });
    });
    
    return Array.from(participantsMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  }, [planning]);

  const handleRemoveModule = (moduleInstanceId: string) => {
    if (!planning) return;
    
    planningService.removeModuleFromPlanning(planning.id, moduleInstanceId);
    const updated = planningService.getPlanningById(planning.id);
    onPlanningChange(updated || null);
  };

  if (!planning) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver a plannings
        </Button>
        <h2 className="text-2xl font-bold">{planning.projectName}</h2>
      </div>

      <PlanningHistoryView 
        projectId={planning.projectId}
        onSelectPlanning={(id) => {
          const p = planningService.getPlanningById(id);
          onPlanningChange(p || null);
        }}
        onAddModules={() => setShowAddModulesDialog(true)}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{planning.name}</h3>
                <Badge className={
                  planning.status === 'completado' ? 'bg-green-500' :
                  planning.status === 'en progreso' ? 'bg-blue-500' : 'bg-gray-500'
                }>
                  {planning.status === 'completado' ? 'Completado' :
                   planning.status === 'en progreso' ? 'En progreso' : 'Planificado'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatWeeks(planning.weeks)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FolderTree className="h-4 w-4" />
                  <span>{planningMetrics?.totalModules || 0} módulos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{planningParticipants.length} participantes</span>
                </div>
              </div>
              
              {planning.description && (
                <p className="text-sm text-muted-foreground mt-2">{planning.description}</p>
              )}
            </div>
            
            <Button onClick={() => setShowAddModulesDialog(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Agregar módulos
            </Button>
          </div>

          {planningMetrics && <PlanningKPICards metrics={planningMetrics} />}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Módulos en este planning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
            {planning.modules?.map(module => (
              <PlanningModuleCard
                key={module.id}
                module={module}
                onRemove={handleRemoveModule}
              />
            ))}

            {(!planning.modules || planning.modules.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="mb-2">No hay módulos cargados</p>
                <Button variant="link" onClick={() => setShowAddModulesDialog(true)}>
                  Agregar módulos al planning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participantes del planning</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanningParticipantsList participants={planningParticipants} />
          </CardContent>
        </Card>
      </div>

      <AddModulesDialog
        open={showAddModulesDialog}
        onOpenChange={setShowAddModulesDialog}
        planning={planning}
        onAddModules={() => {
          const updated = planningService.getPlanningById(planning.id);
          onPlanningChange(updated || null);
          setShowAddModulesDialog(false);
        }}
      />
    </div>
  );
}