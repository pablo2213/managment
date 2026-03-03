'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { modules, tasks } from '@/lib/data';
import { getDelayDays, formatDelay } from '@/lib/utils';

interface ProjectModulesProps {
  projectId: string;
  showAllTasks?: boolean;
}

export function ProjectModules({ projectId, showAllTasks = false }: ProjectModulesProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  
  const projectModules = modules.filter(m => m.projectId === projectId);
  
  const toggleModule = (moduleId: string) => {
    if (showAllTasks) return; // Si mostramos todas, no colapsar
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getModuleTasks = (moduleId: string) => {
    return tasks.filter(t => t.moduleId === moduleId);
  };

  const getModuleProgress = (moduleId: string) => {
    const moduleTasks = getModuleTasks(moduleId);
    if (moduleTasks.length === 0) return 0;
    const completedTasks = moduleTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / moduleTasks.length) * 100);
  };

  const getModuleHours = (moduleId: string) => {
    const moduleTasks = getModuleTasks(moduleId);
    const estimated = moduleTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
    const actual = moduleTasks.reduce((acc, t) => acc + t.actualHours, 0);
    return { estimated, actual };
  };

  return (
    <div className="space-y-3">
      {projectModules.map(module => {
        const isExpanded = showAllTasks || expandedModules.includes(module.id);
        const moduleTasks = getModuleTasks(module.id);
        const moduleProgress = getModuleProgress(module.id);
        const { estimated, actual } = getModuleHours(module.id);
        const delayDays = getDelayDays(module.endDate, module.progress);
        const isDelayed = delayDays > 0;

        return (
          <Card 
            key={module.id} 
            className={`border-l-4 ${
              module.status === 'completed' ? 'border-l-green-500' :
              isDelayed ? 'border-l-red-500' : 'border-l-blue-500'
            }`}
          >
            <CardHeader 
              className={`${!showAllTasks ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`}
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{module.name}</CardTitle>
                    <Badge variant={
                      module.status === 'completed' ? 'default' :
                      module.status === 'in-progress' ? 'secondary' :
                      module.status === 'blocked' ? 'destructive' : 'outline'
                    }>
                      {module.status === 'completed' ? 'Completado' :
                       module.status === 'in-progress' ? 'En progreso' :
                       module.status === 'blocked' ? 'Bloqueado' : 'Pendiente'}
                    </Badge>
                    {isDelayed && module.status !== 'completed' && (
                      <Badge variant="destructive" className="text-xs">
                        {formatDelay(delayDays)}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Fechas del módulo */}
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Inicio: {new Date(module.startDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Fin: {new Date(module.endDate).toLocaleDateString()}
                      {isDelayed && module.status !== 'completed' && (
                        <span className="text-red-500">(original)</span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Horas del módulo */}
                  <div className="text-right">
                    <div className="text-sm font-medium">{actual}/{estimated}h</div>
                    <div className="text-xs text-muted-foreground">
                      {estimated > 0 ? Math.round((actual / estimated) * 100) : 0}% consumido
                    </div>
                  </div>
                  {!showAllTasks && (
                    isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>
              
              {/* Barra de progreso del módulo */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progreso del módulo</span>
                  <span className={isDelayed && module.status !== 'completed' ? 'text-red-500' : ''}>
                    {module.progress}%
                  </span>
                </div>
                <Progress value={module.progress} className={`h-2 ${isDelayed ? 'bg-red-100' : ''}`} />
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent>
                <h4 className="text-sm font-medium mb-3">Tareas del módulo</h4>
                <div className="space-y-3">
                  {moduleTasks.map(task => (
                    <div key={task.id} className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : task.status === 'in-progress' ? (
                            <Clock className="h-4 w-4 text-amber-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">{task.name}</span>
                        </div>
                        <Badge variant="outline">
                          {task.actualHours}/{task.estimatedHours}h
                        </Badge>
                      </div>
                      {task.assignedTo && (
                        <div className="text-xs text-muted-foreground mt-1 ml-6">
                          Asignado a: {task.assignedTo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Resumen de horas del módulo */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span>Total horas estimadas: {estimated}h</span>
                    <span>Total horas reales: {actual}h</span>
                    <span className={
                      actual > estimated ? 'text-red-500' : 
                      actual < estimated ? 'text-green-500' : 'text-muted-foreground'
                    }>
                      {estimated > 0 ? (
                        <>Desviación: {((actual - estimated) / estimated * 100).toFixed(1)}%</>
                      ) : 'Sin estimación'}
                    </span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}