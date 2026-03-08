'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Calendar, Clock, FolderTree, Users,
  ZoomIn, ZoomOut, ChevronRight,
  CheckCircle2, AlertTriangle, Activity, Sparkles
} from 'lucide-react';
import * as planningService from '@/lib/planningSimple';
import { getWeekStart, getWeekEnd } from '@/lib/dateUtils';

interface ProjectsGanttViewProps {
  onSelectPlanning?: (planningId: string) => void;
}

// Generar semanas disponibles (rango amplio para cubrir todos los plannings)
const generateWeeksRange = (allPlannings: planningService.Planning[]) => {
  if (allPlannings.length === 0) {
    // Rango por defecto: últimos 3 meses + próximos 3 meses
    const weeks = [];
    const today = new Date();
    for (let i = -12; i < 12; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + (i * 7));
      const weekStart = getWeekStart(date);
      weeks.push({
        value: weekStart.toISOString().split('T')[0],
        label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`
      });
    }
    return weeks;
  }
  
  // Encontrar la semana más temprana y más tardía
  const allWeeks = new Set<string>();
  allPlannings.forEach(p => p.weeks.forEach(w => allWeeks.add(w)));
  
  const weekValues = Array.from(allWeeks).sort();
  const earliestWeek = weekValues[0];
  const latestWeek = weekValues[weekValues.length - 1];
  
  const earliestDate = new Date(earliestWeek);
  const latestDate = new Date(latestWeek);
  
  // Generar semanas desde 1 mes antes hasta 1 mes después
  const weeks = [];
  const startDate = new Date(earliestDate);
  startDate.setMonth(earliestDate.getMonth() - 1);
  startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));
  
  const endDate = new Date(latestDate);
  endDate.setMonth(latestDate.getMonth() + 1);
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    weeks.push({
      value: currentDate.toISOString().split('T')[0],
      label: `${currentDate.getDate()}/${currentDate.getMonth() + 1}`
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
};

export function ProjectsGanttView({ onSelectPlanning }: ProjectsGanttViewProps) {
  const router = useRouter();
  const [allPlannings, setAllPlannings] = useState<planningService.Planning[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [weekRange, setWeekRange] = useState<any[]>([]);

  useEffect(() => {
    const plannings = planningService.getAllPlannings();
    setAllPlannings(plannings);
    setWeekRange(generateWeeksRange(plannings));
    
    // Expandir todos los proyectos por defecto
    const projectIds = new Set(plannings.map(p => p.projectId));
    setExpandedProjects(projectIds);
  }, []);

  // Agrupar plannings por proyecto
  const planningsByProject = () => {
    const grouped: Record<string, {
      projectId: string;
      projectName: string;
      plannings: planningService.Planning[];
    }> = {};

    allPlannings.forEach(planning => {
      if (!grouped[planning.projectId]) {
        grouped[planning.projectId] = {
          projectId: planning.projectId,
          projectName: planning.projectName,
          plannings: []
        };
      }
      grouped[planning.projectId].plannings.push(planning);
    });

    return Object.values(grouped).sort((a, b) => a.projectName.localeCompare(b.projectName));
  };

  const toggleProject = (projectId: string) => {
    const newSet = new Set(expandedProjects);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else {
      newSet.add(projectId);
    }
    setExpandedProjects(newSet);
  };

  // Obtener color y estilo según estado del planning
  const getPlanningStyle = (planning: planningService.Planning) => {
    const today = new Date();
    const lastWeek = new Date(planning.weeks[planning.weeks.length - 1]);
    const firstWeek = new Date(planning.weeks[0]);
    
    let bgColor = '';
    let borderColor = '';
    let textColor = '';
    let icon = null;
    let statusText = '';
    
    if (planning.status === 'completado') {
      bgColor = 'bg-green-100 dark:bg-green-900/30';
      borderColor = 'border-green-500';
      textColor = 'text-green-700 dark:text-green-300';
      icon = <CheckCircle2 className="h-3 w-3 text-green-500" />;
      statusText = 'Completado';
    } else if (planning.status === 'en progreso') {
      bgColor = 'bg-blue-100 dark:bg-blue-900/30';
      borderColor = 'border-blue-500';
      textColor = 'text-blue-700 dark:text-blue-300';
      icon = <Activity className="h-3 w-3 text-blue-500 animate-pulse" />;
      statusText = 'En progreso';
    } else if (today > lastWeek) {
      bgColor = 'bg-red-100 dark:bg-red-900/30';
      borderColor = 'border-red-500';
      textColor = 'text-red-700 dark:text-red-300';
      icon = <AlertTriangle className="h-3 w-3 text-red-500" />;
      statusText = 'Retrasado';
    } else if (firstWeek > today) {
      bgColor = 'bg-amber-100 dark:bg-amber-900/30';
      borderColor = 'border-amber-500';
      textColor = 'text-amber-700 dark:text-amber-300';
      icon = <Sparkles className="h-3 w-3 text-amber-500" />;
      statusText = 'Futuro';
    } else {
      bgColor = 'bg-gray-100 dark:bg-gray-800';
      borderColor = 'border-gray-400';
      textColor = 'text-gray-600 dark:text-gray-400';
      icon = <Calendar className="h-3 w-3 text-gray-500" />;
      statusText = 'Planificado';
    }
    
    return { bgColor, borderColor, textColor, icon, statusText };
  };

  // Calcular posición en el timeline
  const getPlanningPosition = (planning: planningService.Planning) => {
    if (weekRange.length === 0) return { left: 0, width: 0 };
    
    const weekIndices = planning.weeks
      .map(w => weekRange.findIndex(week => week.value === w))
      .filter(i => i !== -1);
    
    if (weekIndices.length === 0) return { left: 0, width: 0 };
    
    const minIndex = Math.min(...weekIndices);
    const maxIndex = Math.max(...weekIndices);
    const span = maxIndex - minIndex + 1;
    
    const left = (minIndex / weekRange.length) * 100;
    const width = (span / weekRange.length) * 100;
    
    return { left, width };
  };

  // Calcular métricas del planning
  const getPlanningMetrics = (planning: planningService.Planning) => {
    const totalModules = planning.modules.length;
    const completedModules = planning.modules.filter(m => m.status === 'completado').length;
    const totalHours = planning.modules.reduce((acc, m) => acc + m.estimatedHours, 0);
    
    return {
      modules: totalModules,
      completedModules,
      progress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      hours: totalHours,
      participants: new Set(planning.modules.flatMap(m => m.assignedUsers)).size
    };
  };

  const projectsList = planningsByProject();

  return (
    <Card className="border-2 border-primary/10 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Timeline de Plannings por Proyecto
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Cabecera de semanas */}
        <div className="flex border-b sticky top-0 bg-background z-10 mb-4">
          <div className="w-64 flex-shrink-0 p-2 font-medium">Proyecto</div>
          <div className="flex-1 flex" style={{ transform: `scaleX(${zoom})`, transformOrigin: 'left' }}>
            {weekRange.map((week, idx) => (
              <TooltipProvider key={week.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1 text-center p-2 text-xs font-medium border-l hover:bg-muted/50 cursor-default">
                      {idx % 2 === 0 ? week.label : ''}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Semana del {week.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Filas por proyecto */}
        <div className="space-y-4">
          {projectsList.map(project => (
            <div key={project.projectId} className="border rounded-lg overflow-hidden">
              {/* Cabecera del proyecto */}
              <div 
                className="flex items-center gap-2 p-3 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleProject(project.projectId)}
              >
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                  {expandedProjects.has(project.projectId) ? 
                    <ChevronRight className="h-4 w-4 rotate-90" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{project.projectName}</span>
                    <Badge variant="outline">{project.plannings.length} plannings</Badge>
                  </div>
                </div>
              </div>

              {/* Plannings del proyecto */}
              {expandedProjects.has(project.projectId) && (
                <div className="p-3 space-y-3">
                  {project.plannings.map(planning => {
                    const { left, width } = getPlanningPosition(planning);
                    const style = getPlanningStyle(planning);
                    const metrics = getPlanningMetrics(planning);
                    
                    return (
                      <div 
                        key={planning.id} 
                        className="relative flex items-center py-1 group cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          // Navegar a la ruta dinámica
                          router.push(`/planning/${planning.projectId}/${planning.id}`)
                          if (onSelectPlanning) onSelectPlanning(planning.id);
                        }}
                      >
                        {/* Nombre del planning */}
                        <div className="w-56 flex-shrink-0 text-sm pr-2">
                          <div className="font-medium truncate">{planning.name}</div>
                          {planning.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {planning.description}
                            </div>
                          )}
                        </div>

                        {/* Barra de timeline */}
                        <div className="flex-1 h-16 relative" style={{ transform: `scaleX(${zoom})`, transformOrigin: 'left' }}>
                          <div 
                            className={`absolute h-14 rounded-lg border-2 ${style.borderColor} ${style.bgColor} shadow-sm hover:shadow-md transition-all`}
                            style={{ left: `${left}%`, width: `${width}%`, minWidth: '4px' }}
                          >
                            {/* Contenido de la barra */}
                            <div className="absolute inset-0 p-2 flex items-center justify-between">
                              <div className="flex items-center gap-1 truncate max-w-[60%]">
                                {style.icon}
                                <span className={`text-xs font-medium truncate ${style.textColor}`}>
                                  {planning.name}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-[8px] h-4 bg-background/80">
                                {metrics.modules} mod
                              </Badge>
                            </div>

                            {/* Barra de progreso (si tiene módulos) */}
                            {metrics.progress > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
                                <div 
                                  className="h-full bg-green-500"
                                  style={{ width: `${metrics.progress}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Tooltip flotante al hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                            <div className="bg-popover text-popover-foreground text-xs rounded-lg shadow-lg p-3 min-w-[200px]">
                              <div className="font-semibold mb-1">{planning.name}</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Estado:</span>
                                  <span className={style.textColor}>{style.statusText}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Semanas:</span>
                                  <span>{planning.weeks.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Módulos:</span>
                                  <span>{metrics.modules} ({metrics.progress}%)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Horas:</span>
                                  <span>{metrics.hours}h</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Participantes:</span>
                                  <span>{metrics.participants}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Métricas rápidas a la derecha */}
                        <div className="w-32 flex-shrink-0 text-xs text-right pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1 justify-end">
                            <FolderTree className="h-3 w-3" />
                            <span>{metrics.modules}</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />
                            <span>{metrics.hours}h</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Leyenda de colores */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-6 pt-4 border-t">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Completado
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-blue-500" />
            En progreso
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Futuro
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            Retrasado
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-500" />
            Planificado
          </span>
        </div>
      </CardContent>
    </Card>
  );
}