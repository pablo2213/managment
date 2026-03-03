'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProjectTimeMetricsProps {
  estimated: number;
  actual: number;
  byStatus: {
    completed: number;
    inProgress: number;
    pending: number;
  };
  weightedProgress: number;
  modulesHours: Array<{
    moduleName: string;
    estimated: number;
    actual: number;
    progress: number;
    status: string;
  }>;
}

export function ProjectTimeMetrics({ 
  estimated, 
  actual, 
  byStatus,
  weightedProgress,
  modulesHours 
}: ProjectTimeMetricsProps) {
  
  const deviation = estimated > 0 ? ((actual - estimated) / estimated * 100) : 0;
  const isOverBudget = actual > estimated;
  const totalHours = byStatus.completed + byStatus.inProgress + byStatus.pending;
  
  // Colores para los estados
  const statusColors = {
    completed: 'bg-green-500',
    inProgress: 'bg-amber-500',
    pending: 'bg-gray-300'
  };

  return (
    <Card className="mt-4 bg-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Métricas de tiempo del proyecto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Resumen de horas totales */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-background rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Horas estimadas</div>
            <div className="text-2xl font-bold">{estimated}h</div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Horas reales</div>
            <div className="text-2xl font-bold">{actual}h</div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Desviación</div>
            <div className={`text-2xl font-bold flex items-center gap-1 ${
              isOverBudget ? 'text-red-500' : 'text-green-500'
            }`}>
              {isOverBudget ? '+' : ''}{deviation.toFixed(1)}%
              {isOverBudget ? 
                <TrendingUp className="h-4 w-4" /> : 
                <TrendingDown className="h-4 w-4" />
              }
            </div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Progreso ponderado</div>
            <div className="text-2xl font-bold">{weightedProgress}%</div>
          </div>
        </div>

        {/* Distribución de horas por estado */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <PieChart className="h-4 w-4" />
              Distribución de horas por estado
            </h4>
            <span className="text-xs text-muted-foreground">Total: {totalHours}h</span>
          </div>
          
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-xs">Completado</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${(byStatus.completed / totalHours) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-xs text-right font-medium">{byStatus.completed}h</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{((byStatus.completed / totalHours) * 100).toFixed(1)}% del tiempo total</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-xs">En progreso</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500"
                        style={{ width: `${(byStatus.inProgress / totalHours) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-xs text-right font-medium">{byStatus.inProgress}h</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{((byStatus.inProgress / totalHours) * 100).toFixed(1)}% del tiempo total</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-xs">Pendiente</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-400"
                        style={{ width: `${(byStatus.pending / totalHours) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-xs text-right font-medium">{byStatus.pending}h</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{((byStatus.pending / totalHours) * 100).toFixed(1)}% del tiempo total</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Horas por módulo (top 3) */}
        {modulesHours.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Horas por módulo
            </h4>
            <div className="space-y-2">
              {modulesHours.slice(0, 3).map(module => (
                <div key={module.moduleId} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="w-24 truncate">
                    {module.moduleName}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{module.actual}/{module.estimated}h</span>
                      <span className={module.actual > module.estimated ? 'text-red-500' : 'text-green-500'}>
                        {module.progress}%
                      </span>
                    </div>
                    <Progress value={module.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}