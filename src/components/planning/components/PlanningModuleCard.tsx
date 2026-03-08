'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FolderTree, Users, Trash2, Clock, 
  ChevronDown, ChevronRight, FileText, Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { users, tasks, TimeEntry } from '@/lib/data';
import { getModuleEstimatedHours, getModuleActualHours, getModuleMetrics } from '@/lib/utils';
import * as planningService from '@/lib/planningSimple';

interface PlanningModuleCardProps {
  module: planningService.PlanningModule;
  onRemove: (moduleId: string) => void;
}

export function PlanningModuleCard({ module, onRemove }: PlanningModuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Obtener métricas del módulo desde las tareas
  const metrics = getModuleMetrics(module.moduleId);
  
  // Obtener todas las tareas reales de este módulo
  const moduleTasks = tasks.filter(t => t.moduleId === module.moduleId);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Ordenar time entries por fecha (más recientes primero)
  const getTaskTimeEntries = (taskId: string) => {
    const task = moduleTasks.find(t => t.id === taskId);
    if (!task || !task.timeEntries) return [];
    return [...task.timeEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <Card className="border-l-4" style={{ borderLeftColor: module.areaColor || '#ccc' }}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Cabecera del módulo (clickeable) */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setExpanded(!expanded)}
            >
              <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              
              <FolderTree className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{module.moduleName}</span>
              
              <Badge variant="secondary" className="text-[10px]">
                {module.taskCount} tareas
              </Badge>
              
              <Badge className={
                module.status === 'completado' ? 'bg-green-500' :
                module.status === 'en progreso' ? 'bg-blue-500' : 'bg-gray-500'
              }>
                {module.status}
              </Badge>
            </div>
            
            {/* Información del módulo (siempre visible) */}
            <div className="flex items-center gap-2 mt-2 ml-8">
              <Badge variant="outline" className="text-xs">
                {module.projectName}
              </Badge>
              {module.areaName && (
                <Badge variant="outline" className="text-xs">
                  {module.areaName}
                </Badge>
              )}
            </div>

            {/* Métricas de horas */}
            <div className="ml-8 mt-2 flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className={metrics.actual > metrics.estimated ? 'text-red-500' : 'text-green-500'}>
                {metrics.actual.toFixed(1)} / {metrics.estimated}h
              </span>
              <Badge variant="outline" className="text-[8px]">
                {metrics.efficiency}% eficiencia
              </Badge>
            </div>

            {/* Barra de progreso */}
            <div className="ml-8 mt-2">
              <Progress value={metrics.progress} className="h-1.5" />
            </div>

            {/* Usuarios asignados */}
            <div className="ml-8 mt-2 flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <div className="flex -space-x-2">
                {module.assignedUsers.slice(0, 5).map(userId => {
                  const user = users.find(u => u.id === userId);
                  return user ? (
                    <Avatar key={userId} className="h-5 w-5 border border-background">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-[8px]">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : null;
                })}
                {module.assignedUsers.length > 5 && (
                  <Badge variant="outline" className="h-5 px-1 text-[8px]">
                    +{module.assignedUsers.length - 5}
                  </Badge>
                )}
              </div>
            </div>

            {/* DETALLE EXPANDIDO: Tareas del módulo */}
            {expanded && (
              <div className="mt-4 ml-8 space-y-3 border-l-2 border-muted pl-3">
                <h4 className="text-xs font-medium flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Tareas del módulo ({moduleTasks.length})
                </h4>
                
                {moduleTasks.map(task => {
                  const taskTimeEntries = getTaskTimeEntries(task.id);
                  const taskActual = taskTimeEntries.reduce((acc, te) => acc + te.hours, 0);
                  const isPlannedInThisModule = module.tasks.some(t => t.taskId === task.id);
                  
                  return (
                    <Card key={task.id} className="border-l-2 border-l-primary/30">
                      <CardContent className="p-2">
                        {/* Cabecera de la tarea */}
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{task.name}</span>
                          <Badge variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in-progress' ? 'secondary' : 'outline'
                          } className="text-[8px] h-4">
                            {task.status}
                          </Badge>
                          {isPlannedInThisModule && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[8px] h-4">
                              En planning
                            </Badge>
                          )}
                        </div>

                        {/* Horas de la tarea */}
                        <div className="grid grid-cols-3 gap-2 mt-1 text-[10px]">
                          <div>
                            <span className="text-muted-foreground">Estimadas:</span>
                            <span className="ml-1 font-medium">{task.estimatedHours}h</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reales:</span>
                            <span className={`ml-1 font-medium ${
                              taskActual > task.estimatedHours ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {taskActual.toFixed(1)}h
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Eficiencia:</span>
                            <span className={`ml-1 font-medium ${
                              taskActual <= task.estimatedHours ? 'text-green-500' : 'text-amber-500'
                            }`}>
                              {task.estimatedHours > 0 
                                ? Math.round((taskActual / task.estimatedHours) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>

                        {/* Usuarios asignados a la tarea */}
                        {task.assignedTo && task.assignedTo.length > 0 && (
                          <div className="mt-1 flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <div className="flex -space-x-1">
                              {task.assignedTo.slice(0, 3).map(userId => {
                                const user = users.find(u => u.id === userId);
                                return user ? (
                                  <Avatar key={userId} className="h-4 w-4 border border-background">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="text-[6px]">{getInitials(user.name)}</AvatarFallback>
                                  </Avatar>
                                ) : null;
                              })}
                              {task.assignedTo.length > 3 && (
                                <Badge variant="outline" className="h-4 px-1 text-[6px]">
                                  +{task.assignedTo.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Time entries de la tarea */}
                        {taskTimeEntries.length > 0 && (
                          <div className="mt-2 pt-1 border-t border-dashed">
                            <p className="text-[8px] text-muted-foreground mb-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Registros de tiempo ({taskTimeEntries.length})
                            </p>
                            <div className="space-y-1">
                              {taskTimeEntries.slice(0, 2).map(entry => (
                                <div key={entry.id} className="text-[8px] flex items-center justify-between bg-muted/30 p-1 rounded">
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">{entry.date}</span>
                                    <span className="font-bold">{entry.hours}h</span>
                                    <span className="text-muted-foreground">por {entry.userName}</span>
                                  </div>
                                  {entry.description && (
                                    <span className="text-muted-foreground truncate max-w-[100px]">
                                      {entry.description}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {taskTimeEntries.length > 2 && (
                                <p className="text-[8px] text-muted-foreground">
                                  +{taskTimeEntries.length - 2} registros más
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-500"
            onClick={() => onRemove(module.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}