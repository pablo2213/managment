'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PlanningKPICardsProps {
  metrics: {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    totalPlannedHours: number;
    totalActualHours: number;
    weightedProgress: number;
    moduleProgress: number;
  };
}

export function PlanningKPICards({ metrics }: PlanningKPICardsProps) {
  // Calcular eficiencia (horas reales / horas planificadas)
  const efficiency = metrics.totalPlannedHours > 0 
    ? Math.round((metrics.totalActualHours / metrics.totalPlannedHours) * 100) 
    : 0;

  // Determinar color según eficiencia
  const getEfficiencyColor = () => {
    if (efficiency <= 100) return 'text-green-500';
    if (efficiency <= 120) return 'text-amber-500';
    return 'text-red-500';
  };

  const getEfficiencyText = () => {
    if (efficiency <= 100) return 'Dentro de lo planificado';
    if (efficiency <= 120) return 'Ligeramente sobre lo planificado';
    return 'Excede lo planificado';
  };

  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Progreso</div>
          <div className="text-2xl font-bold">{metrics.weightedProgress}%</div>
          <Progress value={metrics.weightedProgress} className="h-1.5 mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Horas</div>
          <div className="text-2xl font-bold">{Math.round(metrics.totalActualHours)}h</div>
          <div className="text-xs text-muted-foreground mt-1">
            de {metrics.totalPlannedHours}h planificadas
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Módulos</div>
          <div className="text-2xl font-bold">{metrics.completedModules}/{metrics.totalModules}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.inProgressModules} en progreso
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Eficiencia</div>
          <div className={`text-2xl font-bold ${getEfficiencyColor()}`}>
            {efficiency}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {getEfficiencyText()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}