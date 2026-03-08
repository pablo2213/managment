'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, 
  Users, FolderTree, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronRight as ChevronRightIcon,
  User, FileText, Target, BarChart3, Plus
} from 'lucide-react';
import * as planningService from '@/lib/planningSimple';
import { users, tasks } from '@/lib/data';
import { getTaskActualHours, getModuleEstimatedHours, getModuleActualHours, getTaskActualHoursInRange, getUserActualHoursInModule, getUserTaskDetailsInModule } from '@/lib/utils';
import { getWeekStart, getWeekEnd } from '@/lib/dateUtils';

interface PlanningHistoryViewProps {
  projectId: string;
  onSelectPlanning: (planningId: string) => void;
  onAddModules: () => void; // ← NUEVA PROP
}

export function PlanningHistoryView({ projectId, onSelectPlanning, onAddModules }: PlanningHistoryViewProps) {
  const [history, setHistory] = useState<planningService.Planning[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    const projectHistory = planningService.getPlanningHistory(projectId);
    setHistory(projectHistory);
    if (projectHistory.length > 0) {
      setSelectedIndex(projectHistory.length - 1);
    }
  }, [projectId]);

  // ============================================
  // FUNCIÓN PARA OBTENER RANGO DE FECHAS DEL PLANNING
  // ============================================
  const getPlanningDateRange = (planning: planningService.Planning) => {
    const weeks = planning.weeks.map(w => new Date(w));
    const startDate = new Date(Math.min(...weeks.map(d => d.getTime())));
    const endDate = new Date(Math.max(...weeks.map(d => d.getTime())));
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  };

  // ============================================
  // FUNCIÓN PARA CALCULAR HORAS DEL PLANNING
  // ============================================
  const calculatePlanningHours = (planning: planningService.Planning) => {
    const { startDate, endDate } = getPlanningDateRange(planning);
    
    let totalPlanned = 0;
    let totalActual = 0;
    let completedModules = 0;
    
    planning.modules.forEach(module => {
      const moduleTasks = tasks.filter(t => t.moduleId === module.moduleId);
      const moduleEstimated = moduleTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
      const moduleActual = moduleTasks.reduce((acc, task) => {
        return acc + getTaskActualHoursInRange(task, startDate, endDate);
      }, 0);
      
      totalPlanned += moduleEstimated;
      totalActual += moduleActual;
      
      if (module.status === 'completado') {
        completedModules++;
      }
    });
    
    const progress = planning.modules.length > 0 
      ? Math.round((completedModules / planning.modules.length) * 100) 
      : 0;
      
    const efficiency = totalPlanned > 0 
      ? Math.round((totalActual / totalPlanned) * 100) 
      : 0;
    
    return {
      planned: totalPlanned,
      actual: totalActual,
      completedModules,
      totalModules: planning.modules.length,
      progress,
      efficiency
    };
  };

  // ============================================
  // FUNCIÓN PARA OBTENER DETALLE DE PARTICIPANTES
  // ============================================
  const getParticipantsDetail = (planning: planningService.Planning) => {
    const { startDate, endDate } = getPlanningDateRange(planning);
    const participantsMap = new Map();
    
    planning.modules.forEach(module => {
      module.assignedUsers.forEach(userId => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const taskDetails = getUserTaskDetailsInModule(userId, module.moduleId, startDate, endDate);
        
        const actualHours = taskDetails.reduce((acc, t) => acc + t.actual, 0);
        const estimatedHours = taskDetails.reduce((acc, t) => acc + t.estimated, 0);
        
        if (!participantsMap.has(userId)) {
          participantsMap.set(userId, {
            userId,
            userName: user.name,
            userRole: user.role,
            avatar: user.avatar,
            actualHours,
            estimatedHours,
            tasks: taskDetails,
            efficiency: estimatedHours > 0 ? Math.round((actualHours / estimatedHours) * 100) : 0
          });
        } else {
          const existing = participantsMap.get(userId);
          existing.actualHours += actualHours;
          existing.estimatedHours += estimatedHours;
          existing.tasks.push(...taskDetails);
          existing.efficiency = existing.estimatedHours > 0 
            ? Math.round((existing.actualHours / existing.estimatedHours) * 100) 
            : 0;
        }
      });
    });
    
    return Array.from(participantsMap.values()).sort((a, b) => b.actualHours - a.actualHours);
  };

  // ============================================
  // FUNCIÓN PARA OBTENER TAREAS DE MÓDULOS
  // ============================================
  const getModuleTasksDetail = (module: planningService.PlanningModule, planning: planningService.Planning) => {
    const { startDate, endDate } = getPlanningDateRange(planning);
    const moduleTasks = tasks.filter(t => t.moduleId === module.moduleId);
    
    return moduleTasks.map(task => {
      const actualTotal = getTaskActualHoursInRange(task, startDate, endDate);
      const isPlanned = module.tasks.some(t => t.taskId === task.id);
      
      return {
        id: task.id,
        name: task.name,
        estimated: task.estimatedHours,
        actual: actualTotal,
        status: task.status,
        isPlanned,
        efficiency: task.estimatedHours > 0 ? Math.round((actualTotal / task.estimatedHours) * 100) : 0,
        assignedUsers: task.assignedTo?.map(id => users.find(u => u.id === id)).filter(Boolean) || [],
        hasTimeEntries: actualTotal > 0
      };
    }).sort((a, b) => b.estimated - a.estimated);
  };

  // ============================================
  // FUNCIÓN PARA OBTENER ESTILO DE ESTADO
  // ============================================
  const getStatusStyle = (planning: planningService.Planning) => {
    const today = new Date();
    const lastWeek = new Date(planning.weeks[planning.weeks.length - 1]);
    
    if (planning.status === 'completado') {
      return {
        bg: 'bg-green-50 dark:bg-green-950/20',
        border: 'border-l-4 border-l-green-500',
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        badge: <Badge className="bg-green-500">Completado</Badge>
      };
    } else if (planning.status === 'en progreso') {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-l-4 border-l-blue-500',
        icon: <div className="h-5 w-5 bg-blue-500 rounded-full animate-pulse" />,
        badge: <Badge className="bg-blue-500">En progreso</Badge>
      };
    } else if (today > lastWeek) {
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        border: 'border-l-4 border-l-red-500',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        badge: <Badge className="bg-red-500">Retrasado</Badge>
      };
    } else {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        border: 'border-l-4 border-l-amber-500',
        icon: <Calendar className="h-5 w-5 text-amber-500" />,
        badge: <Badge className="bg-amber-500">Planificado</Badge>
      };
    }
  };

  // ============================================
  // FUNCIÓN PARA FORMATEAR SEMANAS
  // ============================================
  const formatWeeksRange = (weeks: string[]) => {
    if (weeks.length === 0) return 'Sin fechas';
    const start = new Date(weeks[0]);
    const end = new Date(weeks[weeks.length - 1]);
    const endWeekEnd = getWeekEnd(end);
    return `${start.getDate()}/${start.getMonth() + 1} - ${endWeekEnd.getDate()}/${endWeekEnd.getMonth() + 1}`;
  };

  const toggleModule = (moduleId: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId);
    } else {
      newSet.add(moduleId);
    }
    setExpandedModules(newSet);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay histórico de plannings</h3>
          <p className="text-sm text-muted-foreground">
            Este proyecto aún no tiene plannings creados
          </p>
        </CardContent>
      </Card>
    );
  }

  const current = history[selectedIndex];
  const hours = calculatePlanningHours(current);
  const participants = getParticipantsDetail(current);
  const statusStyle = getStatusStyle(current);
  
  const today = new Date();
  const firstWeek = new Date(current.weeks[0]);
  const lastWeek = new Date(current.weeks[current.weeks.length - 1]);
  const daysUntilStart = Math.ceil((firstWeek.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysSinceEnd = Math.ceil((today.getTime() - lastWeek.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="border-2 border-primary/10 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Historial de Plannings
          </CardTitle>
          
          {/* ✅ BOTÓN AGREGAR MÓDULOS ARRIBA (ÚNICA MODIFICACIÓN) */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              onClick={onAddModules}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar módulos
            </Button>
            
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={selectedIndex === 0}
                onClick={() => setSelectedIndex(selectedIndex - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                {selectedIndex + 1} de {history.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={selectedIndex === history.length - 1}
                onClick={() => setSelectedIndex(selectedIndex + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Timeline visual */}
        <div className="flex items-center justify-between mb-6 px-2">
          {history.map((p, idx) => {
            const isPast = new Date(p.weeks[p.weeks.length - 1]) < today;
            const isCurrent = idx === selectedIndex;
            const isFuture = new Date(p.weeks[0]) > today;
            
            let dotColor = 'bg-gray-300';
            if (p.status === 'completado') dotColor = 'bg-green-500';
            else if (p.status === 'en progreso') dotColor = 'bg-blue-500';
            else if (isPast) dotColor = 'bg-red-500';
            else if (isFuture) dotColor = 'bg-amber-500';
            
            return (
              <div 
                key={p.id} 
                className="flex flex-col items-center cursor-pointer group flex-1"
                onClick={() => setSelectedIndex(idx)}
              >
                <div className={`w-3 h-3 rounded-full ${dotColor} ${isCurrent ? 'ring-4 ring-primary/20' : ''}`} />
                <div className="text-[10px] mt-1 text-muted-foreground group-hover:text-foreground transition-colors">
                  {idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cabecera del planning */}
        <div className={`p-6 rounded-xl ${statusStyle.bg} ${statusStyle.border} mb-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1">{statusStyle.icon}</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{current.name}</h3>
                  {statusStyle.badge}
                  {current.description && (
                    <Badge variant="outline" className="bg-white/50">
                      {current.description}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatWeeksRange(current.weeks)} · {current.weeks.length} {current.weeks.length === 1 ? 'semana' : 'semanas'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderTree className="h-4 w-4" />
                    {hours.totalModules} módulos
                  </span>
                </div>

                {/* Indicadores de tiempo */}
                <div className="flex gap-3">
                  {daysUntilStart > 0 && current.status === 'planificado' && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                      Comienza en {daysUntilStart} días
                    </Badge>
                  )}
                  {daysSinceEnd > 0 && current.status === 'completado' && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      Finalizó hace {daysSinceEnd} días
                    </Badge>
                  )}
                  {daysSinceEnd > 0 && current.status !== 'completado' && current.status !== 'en progreso' && (
                    <Badge variant="destructive">
                      {daysSinceEnd} días de retraso
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Métricas rápidas */}
            <div className="flex gap-2">
              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center min-w-[80px]">
                <div className="text-xs text-muted-foreground">Progreso</div>
                <div className="text-lg font-bold">{hours.progress}%</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center min-w-[100px]">
                <div className="text-xs text-muted-foreground">Horas</div>
                <div className="text-lg font-bold">{Math.round(hours.actual)}h</div>
                <div className="text-xs text-muted-foreground">de {Math.round(hours.planned)}h</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center min-w-[80px]">
                <div className="text-xs text-muted-foreground">Eficiencia</div>
                <div className={`text-lg font-bold ${
                  hours.efficiency <= 100 ? 'text-green-500' : 'text-amber-500'
                }`}>
                  {hours.efficiency}%
                </div>
              </div>
            </div>
          </div>

          {/* Barras de progreso */}
          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1">
                  <FolderTree className="h-3 w-3" />
                  Módulos completados
                </span>
                <span className="font-medium">{hours.completedModules}/{hours.totalModules}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(hours.completedModules / hours.totalModules) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Horas utilizadas
                </span>
                <span className="font-medium">{Math.round(hours.actual)}/{Math.round(hours.planned)}h</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    hours.efficiency <= 100 ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(hours.efficiency, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid de 2 columnas: Participantes y Módulos */}
        <div className="grid grid-cols-2 gap-4">
          {/* PARTICIPANTES */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participantes ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
              {participants.map(p => (
                <div key={p.userId} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.avatar} />
                      <AvatarFallback>{p.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p.userName}</div>
                      <div className="text-xs text-muted-foreground">{p.userRole}</div>
                    </div>
                    <Badge variant={p.efficiency <= 100 ? 'default' : 'secondary'}>
                      {p.efficiency}% eficiencia
                    </Badge>
                  </div>

                  {/* Comparativa de horas REALES vs ESTIMADAS */}
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Horas registradas:</span>
                    <span className="font-medium text-blue-600">{p.actualHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Horas estimadas:</span>
                    <span className="font-medium">{p.estimatedHours.toFixed(1)}h</span>
                  </div>

                  {/* Barra de comparación real vs estimado */}
                  <div className="mt-2 mb-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-blue-200/30" />
                      <div 
                        className={`h-full rounded-full ${
                          p.actualHours <= p.estimatedHours ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min((p.actualHours / p.estimatedHours) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Real</span>
                      <span>{p.actualHours.toFixed(1)}h / {p.estimatedHours.toFixed(1)}h</span>
                    </div>
                  </div>

                  {/* Lista minimalista de tareas con sus horas */}
                  <div className="space-y-1 mt-2">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">Tareas:</p>
                    {p.tasks.slice(0, 3).map((task, idx) => (
                      <div key={idx} className="text-xs flex items-center justify-between bg-muted/20 p-1 rounded">
                        <div className="flex items-center gap-1 truncate max-w-[150px]">
                          <span className="truncate">{task.taskName}</span>
                          <Badge variant="outline" className="text-[8px] h-4">
                            {task.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={task.actual > task.estimated ? 'text-red-500' : 'text-green-500'}>
                            {task.actual.toFixed(1)}h
                          </span>
                          <span className="text-muted-foreground">/ {task.estimated}h</span>
                        </div>
                      </div>
                    ))}
                    {p.tasks.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-right">
                        +{p.tasks.length - 3} tareas más
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* MÓDULOS CON TAREAS Y HORAS REALES */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                Módulos en este planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
              {current.modules.map(module => {
                const moduleTasks = getModuleTasksDetail(module, current);
                
                const moduleEstimated = moduleTasks.reduce((acc, t) => acc + t.estimated, 0);
                const moduleActual = moduleTasks.reduce((acc, t) => acc + t.actual, 0);
                const moduleEfficiency = moduleEstimated > 0 ? Math.round((moduleActual / moduleEstimated) * 100) : 0;
                
                const isExpanded = expandedModules.has(module.id);
                
                return (
                  <Card key={module.id} className="border-l-4" style={{ borderLeftColor: module.areaColor }}>
                    <CardContent className="p-3">
                      {/* Cabecera del módulo (clickeable) */}
                      <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => toggleModule(module.id)}
                      >
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                        </Button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FolderTree className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">{module.moduleName}</span>
                            <Badge className={
                              module.status === 'completado' ? 'bg-green-500' :
                              module.status === 'en progreso' ? 'bg-blue-500' : 'bg-gray-500'
                            }>
                              {module.status}
                            </Badge>
                          </div>
                          
                          {/* Métricas de horas del módulo */}
                          <div className="flex items-center gap-4 mt-1 text-xs">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className={moduleActual > moduleEstimated ? 'text-red-500' : 'text-green-500'}>
                                {moduleActual.toFixed(1)}h
                              </span>
                              <span className="text-muted-foreground">/ {moduleEstimated}h</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {moduleTasks.filter(t => t.status === 'completed').length}/{moduleTasks.length} tareas
                              </span>
                            </span>
                            <Badge variant="outline" className="text-[8px]">
                              {moduleEfficiency}% eficiencia
                            </Badge>
                          </div>

                          {/* Barra de progreso del módulo */}
                          <div className="mt-2">
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  moduleEfficiency <= 100 ? 'bg-green-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(moduleEfficiency, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tareas del módulo (expandidas) */}
                      {isExpanded && (
                        <div className="mt-3 ml-8 space-y-2">
                          {moduleTasks.map(task => (
                            <div key={task.id} className="text-xs border-l-2 border-muted pl-2 py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{task.name}</span>
                                  {task.isPlanned && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[8px] h-4">
                                      Planificada
                                    </Badge>
                                  )}
                                  <Badge variant={
                                    task.status === 'completed' ? 'default' :
                                    task.status === 'in-progress' ? 'secondary' : 'outline'
                                  } className="text-[8px] h-4">
                                    {task.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={task.actual > task.estimated ? 'text-red-500' : 'text-green-500'}>
                                    {task.actual.toFixed(1)}h
                                  </span>
                                  <span className="text-muted-foreground">/ {task.estimated}h</span>
                                </div>
                              </div>
                              
                              {/* Usuarios asignados (mini avatares) */}
                              {task.assignedUsers.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <div className="flex -space-x-1">
                                    {task.assignedUsers.slice(0, 3).map(user => (
                                      <Avatar key={user.id} className="h-4 w-4 border border-background">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="text-[6px]">{getInitials(user.name)}</AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {task.assignedUsers.length > 3 && (
                                      <Badge variant="outline" className="h-4 px-1 text-[6px]">
                                        +{task.assignedUsers.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Indicador de time entries */}
                              {task.hasTimeEntries && (
                                <div className="mt-1 text-[8px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Con registros de tiempo</span>
                                </div>
                              )}

                              {/* Mini barra de progreso de la tarea */}
                              <div className="mt-1">
                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      task.efficiency <= 100 ? 'bg-green-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${Math.min(task.efficiency, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Leyenda de colores */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-6 pt-4 border-t">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Completado
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            En progreso
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            Planificado
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Retrasado
          </span>
        </div>
      </CardContent>
    </Card>
  );
}