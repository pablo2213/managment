'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Ban, 
  Eye,
  TrendingUp,
  TrendingDown,
  Gauge,
  Users
} from 'lucide-react';

interface ProjectStatsProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    inProgressTasks: number;
    reviewTasks: number;
    overCostTasks: number;
    underCostTasks: number;
    avgSpeed: number;
    completionRate: number;
  };
  criticalModules: any[];
  highRiskTasks: any[];
}

export function ProjectStats({ stats, criticalModules, highRiskTasks }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {/* Tarjeta de progreso general */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Progreso General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tareas completadas</span>
              <span className="font-medium">{stats.completedTasks}/{stats.totalTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tasa de completado</span>
              <span className="font-medium">{stats.completionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Velocidad promedio</span>
              <span className="font-medium">{stats.avgSpeed} h/día</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta de estado de tareas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Estado de Tareas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">{stats.completedTasks} completadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm">{stats.inProgressTasks} en progreso</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{stats.reviewTasks} revisión</span>
            </div>
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-500" />
              <span className="text-sm">{stats.blockedTasks} bloqueadas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta de eficiencia */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Eficiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sobrecosto</span>
              <Badge variant="destructive">{stats.overCostTasks} tareas</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ahorro</span>
              <Badge variant="default" className="bg-green-500">{stats.underCostTasks} tareas</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de riesgos */}
      {(criticalModules.length > 0 || highRiskTasks.length > 0) && (
        <Card className="md:col-span-3 border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Alertas y Riesgos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {criticalModules.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-2">Módulos críticos ({criticalModules.length})</h4>
                  <ul className="space-y-1">
                    {criticalModules.slice(0, 3).map(module => (
                      <li key={module.id} className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {module.name} - {module.status === 'blocked' ? 'Bloqueado' : 'Con retraso'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {highRiskTasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-2">Tareas de alto riesgo ({highRiskTasks.length})</h4>
                  <ul className="space-y-1">
                    {highRiskTasks.slice(0, 3).map(task => (
                      <li key={task.id} className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        {task.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}