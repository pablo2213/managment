'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Clock, Plus, Sparkles, FolderTree, 
  ChevronDown, ChevronRight, Search 
} from 'lucide-react';
import { tasks, modules, projects } from '@/lib/data';
import * as planningService from '@/lib/planningSimple';
import { TimeEntryModal } from './TimeEntryModal';
import { getWeekStart, formatWeek, getWeekEnd } from '@/lib/dateUtils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserTaskInboxProps {
  userId: string;
}

export function UserTaskInbox({ userId }: UserTaskInboxProps) {
  const [selectedWeek, setSelectedWeek] = useState<Date>(getWeekStart(new Date()));
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // ============================================
  // OBTENER DATOS
  // ============================================
  const allUserTasks = useMemo(() => {
    return tasks.filter(t => t.assignedTo?.includes(userId));
  }, [userId, refreshKey]);

  // Obtener planning de la semana
  const weeklyPlanning = useMemo(() => {
    const allPlannings = planningService.getAllPlannings();
    return allPlannings.find(p => 
      p.weeks.includes(selectedWeek.toISOString().split('T')[0])
    );
  }, [selectedWeek]);

  // Mapa de tareas planificadas (para acceso rápido)
  const plannedTaskMap = useMemo(() => {
    const map = new Map();
    if (weeklyPlanning) {
      weeklyPlanning.modules.forEach(module => {
        module.tasks.forEach(task => {
          if (task.assignedUsers.includes(userId)) {
            map.set(task.taskId, {
              planningName: weeklyPlanning.name,
              planningId: weeklyPlanning.id,
              moduleName: module.moduleName
            });
          }
        });
      });
    }
    return map;
  }, [weeklyPlanning, userId]);

  // ============================================
  // AGRUPAR POR PROYECTO
  // ============================================
  const tasksByProject = useMemo(() => {
    const grouped: Record<string, {
      projectId: string;
      projectName: string;
      tasks: any[];
      totalEstimated: number;
      totalActual: number;
      completedCount: number;
    }> = {};

    allUserTasks.forEach(task => {
      const taskModule = modules.find(m => m.id === task.moduleId);
      const project = taskModule ? projects.find(p => p.id === taskModule.projectId) : null;
      const projectId = project?.id || 'sin-proyecto';
      const projectName = project?.name || 'Sin proyecto';

      if (!grouped[projectId]) {
        grouped[projectId] = {
          projectId,
          projectName,
          tasks: [],
          totalEstimated: 0,
          totalActual: 0,
          completedCount: 0,
        };
      }

      grouped[projectId].tasks.push(task);
      
      const taskActual = task.timeEntries?.reduce((acc, e) => acc + e.hours, 0) || 0;
      grouped[projectId].totalEstimated += task.estimatedHours;
      grouped[projectId].totalActual += taskActual;
      if (task.status === 'completed') {
        grouped[projectId].completedCount++;
      }
    });

    return Object.values(grouped).sort((a, b) => a.projectName.localeCompare(b.projectName));
  }, [allUserTasks]);

  // ============================================
  // FILTROS
  // ============================================
  const getFilteredTasks = (tasks: any[]) => {
    return tasks.filter(task => {
      // Filtro por estado
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      
      // Filtro por búsqueda
      if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
    });
  };

  // ============================================
  // MÉTRICAS GLOBALES
  // ============================================
  const globalMetrics = useMemo(() => {
    const totalHours = allUserTasks.reduce((acc, t) => {
      const logged = t.timeEntries?.reduce((s, e) => s + e.hours, 0) || 0;
      return acc + logged;
    }, 0);

    const totalEstimated = allUserTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
    const completedTasks = allUserTasks.filter(t => t.status === 'completed').length;
    const plannedTasksCount = allUserTasks.filter(t => plannedTaskMap.has(t.id)).length;

    return {
      totalHours,
      totalEstimated,
      completedTasks,
      totalTasks: allUserTasks.length,
      plannedTasks: plannedTasksCount,
      progress: allUserTasks.length > 0 ? Math.round((completedTasks / allUserTasks.length) * 100) : 0
    };
  }, [allUserTasks, plannedTaskMap]);

  const handleRegisterTime = (task: any) => {
    setSelectedTask(task);
    setShowTimeModal(true);
  };

  const handleTaskUpdate = (updatedTask: any) => {
    setRefreshKey(prev => prev + 1);
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

  const renderTaskCard = (task: any) => {
    const taskModule = modules.find(m => m.id === task.moduleId);
    const taskProject = taskModule ? projects.find(p => p.id === taskModule.projectId) : null;
    const planningInfo = plannedTaskMap.get(task.id);
    
    const hoursLogged = task.timeEntries?.reduce((acc, e) => acc + e.hours, 0) || 0;
    const progress = Math.min(100, Math.round((hoursLogged / task.estimatedHours) * 100));
    
    // ============================================
    // DETERMINAR ESTADO DEL PLANNING (VERSIÓN SIMPLE)
    // ============================================
    let planningStatus = 'none'; // 'current' | 'future' | 'none'
    let planningDateText = '';
    let planningColor = '';
    let planningBadge = null;
    let statusText = '';

    if (planningInfo) {
      const allPlannings = planningService.getAllPlannings();
      const planning = allPlannings.find(p => p.id === planningInfo.planningId);
      
      if (planning && planning.weeks.length > 0) {
        const today = new Date();
        const currentWeekStart = getWeekStart(today);
        const currentWeekEnd = getWeekEnd(today);
        
        // Verificar si la semana actual está dentro del rango del planning
        const isCurrentWeekInPlanning = planning.weeks.some(week => {
          const weekDate = new Date(week);
          return weekDate >= currentWeekStart && weekDate <= currentWeekEnd;
        });
        
        // Formatear fechas para mostrar
        const formatWeekRange = (weeks: string[]) => {
          if (weeks.length === 0) return '';
          const startDate = new Date(weeks[0]);
          const endDate = new Date(weeks[weeks.length - 1]);
          return `${startDate.getDate()}/${startDate.getMonth()+1} - ${endDate.getDate()}/${endDate.getMonth()+1}`;
        };
        
        const weekRangeText = formatWeekRange(planning.weeks);
        
        if (isCurrentWeekInPlanning) {
          // CASO 1: Tarea que hay que hacer ESTA SEMANA
          planningStatus = 'current';
          planningColor = 'border-l-4 border-l-blue-500 bg-blue-50/50';
          planningBadge = (
            <Badge className="bg-blue-500 text-white border-0 text-xs font-normal">
              ⏳ Esta semana
            </Badge>
          );
          statusText = `Planificada para esta semana (${weekRangeText})`;
        } else {
          // CASO 2: Tarea que VENDRÁ en un futuro planning
          planningStatus = 'future';
          planningColor = 'border-l-4 border-l-gray-300 bg-gray-50/30';
          planningBadge = (
            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 text-xs font-normal">
              📅 Próximamente
            </Badge>
          );
          statusText = `Viene en planning: ${weekRangeText}`;
        }
      }
    }

    // Determinar estilo de la tarjeta
    let cardStyle = 'border-l-8 ';

    if (planningStatus === 'current') {
      cardStyle += planningColor;
    } else if (planningStatus === 'future') {
      cardStyle += planningColor;
    } else if (hoursLogged > 0) {
      cardStyle += 'border-l-purple-400 bg-purple-50/20';
      statusText = 'Trabajo extra (fuera de planning)';
    } else if (task.status === 'completed') {
      cardStyle += 'border-l-gray-400 bg-gray-50/20';
      statusText = 'Completada sin planificar';
    } else {
      cardStyle += 'border-l-gray-300';
      statusText = 'Sin planificar';
    }

    const iconType = planningStatus === 'current' ? '⏳' : 
                     planningStatus === 'future' ? '📅' :
                     hoursLogged > 0 ? '✨' :
                     task.status === 'completed' ? '✔️' : '📋';
    
    const sortedEntries = task.timeEntries 
      ? [...task.timeEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      : [];
    
    return (
      <Card key={task.id} className={`${cardStyle} hover:shadow-lg transition-shadow`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Icono grande a la izquierda */}
            <div className="text-3xl mt-1">{iconType}</div>
            
            <div className="flex-1">
              {/* Cabecera con título y badges */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h4 className="font-semibold text-base">{task.name}</h4>
                
                {/* Badge de estado principal */}
                <Badge className={`
                  ${task.status === 'completed' ? 'bg-green-500' : 
                    task.status === 'in-progress' ? 'bg-blue-500' : 
                    'bg-gray-500'} text-white border-0
                `}>
                  {task.status === 'completed' ? 'Completada' : 
                   task.status === 'in-progress' ? 'En progreso' : 
                   'Pendiente'}
                </Badge>
                
                {/* Badge de planning (si aplica) */}
                {planningBadge}
              </div>

              {/* Mensaje de estado claro */}
              <p className="text-xs font-medium mb-2 text-muted-foreground">
                {statusText}
              </p>

              {/* Contexto del proyecto/módulo */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                  <FolderTree className="h-3 w-3" />
                  {taskProject?.name} / {taskModule?.name}
                </span>
                {planningInfo && (
                  <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <Calendar className="h-3 w-3" />
                    {planningInfo.moduleName}
                  </span>
                )}
              </div>
              
              {/* Horas y progreso */}
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={`font-bold ${
                    hoursLogged > task.estimatedHours ? 'text-red-500' : 
                    hoursLogged === 0 ? 'text-gray-400' : 'text-green-600'
                  }`}>
                    {hoursLogged}h
                  </span>
                  <span className="text-muted-foreground">/ {task.estimatedHours}h</span>
                </div>
                
                {/* Indicador de progreso */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Progreso:</span>
                  <span className={`font-bold ${
                    progress >= 100 ? 'text-green-500' : 
                    progress > 0 ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-4">
                <Progress 
                  value={progress} 
                  className={`h-2 ${
                    progress >= 100 ? 'bg-green-100' : 
                    progress > 0 ? 'bg-blue-100' : 'bg-gray-100'
                  }`} 
                />
              </div>

              {/* HISTORIAL DE TIEMPO - MINIMIZADO */}
              {sortedEntries.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {sortedEntries.length} registro{sortedEntries.length !== 1 ? 's' : ''}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-5 px-1">
                      {hoursLogged}h
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 max-h-24 overflow-y-auto text-xs">
                    {sortedEntries.map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{entry.date}</span>
                          <span className="font-mono font-bold">{entry.hours}h</span>
                          {index === 0 && (
                            <span className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded">último</span>
                          )}
                        </div>
                        <span className="text-muted-foreground text-[10px]">{entry.userName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              size="default"
              onClick={() => handleRegisterTime(task)}
              disabled={task.status === 'completed'}
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
      {/* Cabecera con selector de semana y filtros */}
      <div className="flex items-center justify-between mb-4">
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
            ← Anterior
          </Button>
          <div className="px-3 py-1 border rounded-md bg-muted/30">
            <span className="text-sm font-medium">{formatWeek(selectedWeek)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = new Date(selectedWeek);
              next.setDate(next.getDate() + 7);
              setSelectedWeek(next);
            }}
          >
            Siguiente →
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 w-[200px]"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="in-progress">En progreso</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Total horas</div>
            <div className="text-xl font-bold">{globalMetrics.totalHours}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Estimadas</div>
            <div className="text-xl font-bold">{globalMetrics.totalEstimated}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Completadas</div>
            <div className="text-xl font-bold text-green-500">{globalMetrics.completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Planificadas</div>
            <div className="text-xl font-bold text-blue-500">{globalMetrics.plannedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Progreso</div>
            <div className="text-xl font-bold">{globalMetrics.progress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tareas agrupadas por proyecto */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Tareas por Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasksByProject.map(project => {
            const filteredTasks = getFilteredTasks(project.tasks);
            const isExpanded = expandedProjects.has(project.projectId);
            const projectProgress = project.totalEstimated > 0 
              ? Math.round((project.totalActual / project.totalEstimated) * 100) 
              : 0;

            if (filteredTasks.length === 0) return null;

            return (
              <div key={project.projectId} className="border rounded-lg overflow-hidden">
                {/* Cabecera del proyecto (clickeable) */}
                <div 
                  className="flex items-center gap-2 p-3 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleProject(project.projectId)}
                >
                  <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{project.projectName}</h3>
                      <Badge variant="outline">
                        {project.completedCount}/{project.tasks.length} tareas
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {project.totalActual}/{project.totalEstimated}h
                      </Badge>
                    </div>
                    
                    {/* Mini barra de progreso del proyecto */}
                    <div className="mt-2 max-w-md">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progreso del proyecto</span>
                        <span>{projectProgress}%</span>
                      </div>
                      <Progress value={projectProgress} className="h-1.5" />
                    </div>
                  </div>
                </div>

                {/* Tareas del proyecto (expandidas) */}
                {isExpanded && (
                  <div className="p-3 space-y-3 bg-background">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map(task => renderTaskCard(task))
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No hay tareas que coincidan con los filtros
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {tasksByProject.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              No tienes tareas asignadas
            </p>
          )}
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