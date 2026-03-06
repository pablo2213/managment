'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, Sparkles, FolderTree } from 'lucide-react';
import { tasks, modules, projects } from '@/lib/data';
import * as planningService from '@/lib/planningSimple';
import { TimeEntryModal } from './TimeEntryModal';
import { getWeekStart, formatWeek } from '@/lib/dateUtils';

interface UserTaskInboxProps {
  userId: string;
}

export function UserTaskInbox({ userId }: UserTaskInboxProps) {
  const [selectedWeek, setSelectedWeek] = useState<Date>(getWeekStart(new Date()));
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // ============================================
  // OBTENER TODAS LAS TAREAS DEL USUARIO
  // ============================================
  const allUserTasks = useMemo(() => {
    return tasks.filter(t => t.assignedTo?.includes(userId));
  }, [userId, refreshKey]);

  // ============================================
  // OBTENER TAREAS PLANIFICADAS (del planning)
  // ============================================
  const weeklyPlanning = useMemo(() => {
    const allPlannings = planningService.getAllPlannings();
    return allPlannings.find(p => 
      p.weeks.includes(selectedWeek.toISOString().split('T')[0])
    );
  }, [selectedWeek]);

  const plannedTaskIds = useMemo(() => {
    if (!weeklyPlanning) return new Set<string>();
    
    const ids = new Set<string>();
    weeklyPlanning.modules.forEach(module => {
      module.tasks.forEach(task => {
        if (task.assignedUsers.includes(userId)) {
          ids.add(task.taskId);
        }
      });
    });
    return ids;
  }, [weeklyPlanning, userId]);

  // Tareas planificadas (en planning)
  const plannedTasks = useMemo(() => {
    return allUserTasks.filter(t => plannedTaskIds.has(t.id));
  }, [allUserTasks, plannedTaskIds]);

  // Tareas no planificadas (fuera de planning)
  const unplannedTasks = useMemo(() => {
    return allUserTasks.filter(t => !plannedTaskIds.has(t.id));
  }, [allUserTasks, plannedTaskIds]);

  // ============================================
  // MÉTRICAS
  // ============================================
  const metrics = useMemo(() => {
    const totalHours = allUserTasks.reduce((acc, t) => {
      const logged = t.timeEntries?.reduce((s, e) => s + e.hours, 0) || 0;
      return acc + logged;
    }, 0);

    const totalEstimated = allUserTasks.reduce((acc, t) => acc + t.estimatedHours, 0);

    const completedTasks = allUserTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = allUserTasks.filter(t => t.status === 'in-progress').length;
    const pendingTasks = allUserTasks.filter(t => t.status === 'pending').length;

    return {
      totalHours,
      totalEstimated,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      progress: totalEstimated > 0 ? Math.round((completedTasks / allUserTasks.length) * 100) : 0
    };
  }, [allUserTasks]);

  const handleRegisterTime = (task: any) => {
    setSelectedTask(task);
    setShowTimeModal(true);
  };

  const handleTaskUpdate = (updatedTask: any) => {
    setRefreshKey(prev => prev + 1);
  };

  const renderTaskCard = (task: any, isPlanned: boolean) => {
    const taskModule = modules.find(m => m.id === task.moduleId);
    const taskProject = taskModule ? projects.find(p => p.id === taskModule.projectId) : null;
    
    const hoursLogged = task.timeEntries?.reduce((acc, e) => acc + e.hours, 0) || 0;
    const progress = Math.min(100, Math.round((hoursLogged / task.estimatedHours) * 100));
    
    return (
      <Card key={task.id} className={`border-l-4 ${isPlanned ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium">{task.name}</h4>
                {isPlanned && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Planificada
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px]">
                  {taskProject?.name}
                </Badge>
                {taskModule && (
                  <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                    <FolderTree className="h-3 w-3" />
                    {taskModule.name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={hoursLogged > task.estimatedHours ? 'text-red-500' : ''}>
                    {hoursLogged} / {task.estimatedHours}h
                  </span>
                </div>
                
                <Badge variant={
                  task.status === 'completed' ? 'default' :
                  task.status === 'in-progress' ? 'secondary' : 'outline'
                }>
                  {task.status === 'completed' ? 'Completada' :
                   task.status === 'in-progress' ? 'En progreso' : 'Pendiente'}
                </Badge>
              </div>

              {/* Barra de progreso */}
              <div className="mt-3">
                <Progress value={progress} className="h-2" />
              </div>

              {/* Últimos registros */}
              {task.timeEntries && task.timeEntries.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Últimos registros:</p>
                  <div className="space-y-1">
                    {task.timeEntries.slice(-2).map(entry => (
                      <div key={entry.id} className="text-xs flex justify-between">
                        <span>{entry.date} - {entry.description || 'Sin descripción'}</span>
                        <span className="font-medium">{entry.hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              size="sm"
              onClick={() => handleRegisterTime(task)}
              disabled={task.status === 'completed'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Resumen rápido */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Total horas</div>
            <div className="text-xl font-bold">{metrics.totalHours}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Estimadas</div>
            <div className="text-xl font-bold">{metrics.totalEstimated}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Completadas</div>
            <div className="text-xl font-bold text-green-500">{metrics.completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Pendientes</div>
            <div className="text-xl font-bold text-amber-500">{metrics.pendingTasks}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mis Tareas</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prev = new Date(selectedWeek);
                  prev.setDate(prev.getDate() - 7);
                  setSelectedWeek(prev);
                }}
              >
                ← Semana anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = new Date(selectedWeek);
                  next.setDate(next.getDate() + 7);
                  setSelectedWeek(next);
                }}
              >
                Semana siguiente →
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Semana del {formatWeek(selectedWeek)}
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Todas ({allUserTasks.length})
              </TabsTrigger>
              <TabsTrigger value="planned">
                Planificadas ({plannedTasks.length})
              </TabsTrigger>
              <TabsTrigger value="unplanned">
                Extras ({unplannedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {allUserTasks.length > 0 ? (
                allUserTasks.map(task => renderTaskCard(task, plannedTaskIds.has(task.id)))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No tienes tareas asignadas
                </p>
              )}
            </TabsContent>

            <TabsContent value="planned" className="space-y-3">
              {plannedTasks.length > 0 ? (
                plannedTasks.map(task => renderTaskCard(task, true))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No hay tareas planificadas para esta semana
                </p>
              )}
            </TabsContent>

            <TabsContent value="unplanned" className="space-y-3">
              {unplannedTasks.length > 0 ? (
                unplannedTasks.map(task => renderTaskCard(task, false))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No tienes tareas extra
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedTask && (
        <TimeEntryModal
          open={showTimeModal}
          onOpenChange={setShowTimeModal}
          task={selectedTask}
          userId={userId}
          onSave={handleTaskUpdate}
        />
      )}
    </>
  );
}