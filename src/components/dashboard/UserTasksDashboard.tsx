'use client';
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Clock, CheckCircle2, Filter, Download, 
  Layers, Activity, Calendar, AlertTriangle,
  BarChart3, Users, Award
} from 'lucide-react';
import { users, tasks, modules, projects, areas } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { UserCommitmentsView } from '@/components/planning/UserCommitmentsView';
import { PlanningSimpleView } from '@/components/planning/PlanningSimpleView';

interface UserTasksDashboardProps {
  initialUserId?: string;
}

export function UserTasksDashboard({ initialUserId }: UserTasksDashboardProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId || 'all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortMetric, setSortMetric] = useState<'hours' | 'completion' | 'tasks'>('hours');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [viewType, setViewType] = useState<'week' | 'month' | 'custom'>('month');

  // ============================================
  // FILTRADO DE DATOS
  // ============================================
  
  const filteredModulesByProject = useMemo(() => {
    if (selectedProjectId === 'all') return modules;
    return modules.filter(m => m.projectId === selectedProjectId);
  }, [selectedProjectId]);

  const filteredModulesByArea = useMemo(() => {
    if (selectedAreaId === 'all') return filteredModulesByProject;
    return filteredModulesByProject.filter(m => m.areaId === selectedAreaId);
  }, [selectedAreaId, filteredModulesByProject]);

  const filteredModules = useMemo(() => {
    if (selectedModuleId === 'all') return filteredModulesByArea;
    return filteredModulesByArea.filter(m => m.id === selectedModuleId);
  }, [selectedModuleId, filteredModulesByArea]);

  const moduleIds = filteredModules.map(m => m.id);

  // ============================================
  // TAREAS FILTRADAS
  // ============================================

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(t => moduleIds.includes(t.moduleId));
    
    if (selectedUserId !== 'all') {
      filtered = filtered.filter(t => t.assignedTo?.includes(selectedUserId));
    }

    return filtered;
  }, [moduleIds, selectedUserId]);

  const enrichedTasks = useMemo(() => {
    return filteredTasks.map(task => {
      const taskModule = modules.find(m => m.id === task.moduleId);
      const taskProject = taskModule ? projects.find(p => p.id === taskModule.projectId) : null;
      const taskArea = taskModule?.areaId ? areas.find(a => a.id === taskModule.areaId) : null;
      const taskUsers = users.filter(u => task.assignedTo?.includes(u.id));

      const totalActualHours = task.timeEntries 
        ? task.timeEntries.reduce((s, e) => s + e.hours, 0) 
        : task.actualHours || 0;

      return {
        ...task,
        module: taskModule,
        project: taskProject,
        area: taskArea,
        assignedUsers: taskUsers,
        totalActualHours,
        progress: task.estimatedHours > 0 
          ? Math.round((totalActualHours / task.estimatedHours) * 100) 
          : 0,
      };
    });
  }, [filteredTasks]);

  // ============================================
  // ESTADÍSTICAS DE USUARIOS
  // ============================================

  const userStats = useMemo(() => {
    
    return users
      .map(user => {
        // Filtrar tareas del usuario
        const userTasks = tasks.filter(t => {
          const isAssigned = t.assignedTo?.includes(user.id) || false;
          if (!isAssigned) return false;

          if (selectedProjectId !== 'all') {
            const taskModule = modules.find(m => m.id === t.moduleId);
            if (taskModule?.projectId !== selectedProjectId) return false;
          }

          if (selectedAreaId !== 'all') {
            const taskModule = modules.find(m => m.id === t.moduleId);
            if (taskModule?.areaId !== selectedAreaId) return false;
          }

          if (selectedModuleId !== 'all') {
            if (t.moduleId !== selectedModuleId) return false;
          }

          return true;
        });
        
        // Calcular horas en el rango de fechas
        let totalHoursInRange = 0;
        let hoursByDate: Record<string, number> = {};
        
        userTasks.forEach(task => {
          if (task.timeEntries) {
            task.timeEntries.forEach(entry => {
              const entryDate = new Date(entry.date);
              if (entryDate >= dateRange.from && entryDate <= dateRange.to) {
                totalHoursInRange += entry.hours;
                const dateKey = entryDate.toISOString().split('T')[0];
                hoursByDate[dateKey] = (hoursByDate[dateKey] || 0) + entry.hours;
              }
            });
          } else if (task.actualHours && task.createdAt) {
            const taskDate = new Date(task.createdAt);
            if (taskDate >= dateRange.from && taskDate <= dateRange.to) {
              totalHoursInRange += task.actualHours;
            }
          }
        });

        const totalHoursAllTime = userTasks.reduce((acc, t) => {
          if (t.timeEntries) return acc + t.timeEntries.reduce((s, e) => s + e.hours, 0);
          return acc + (t.actualHours || 0);
        }, 0);

        const totalTasks = userTasks.length;
        const completedTasks = userTasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = userTasks.filter(t => t.status === 'in-progress' || t.status === 'review').length;
        const pendingTasks = userTasks.filter(t => t.status === 'pending').length;
        const blockedTasks = userTasks.filter(t => t.status === 'blocked').length;
        
        const estimatedHours = userTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
        
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const timeProgress = estimatedHours > 0 ? Math.round((totalHoursAllTime / estimatedHours) * 100) : 0;

        const userProjectIds = new Set(
          userTasks
            .map(t => modules.find(m => m.id === t.moduleId)?.projectId)
            .filter(Boolean)
        );
        
        const tasksByArea = userTasks.reduce((acc, task) => {
          const taskModule = modules.find(m => m.id === task.moduleId);
          const areaId = taskModule?.areaId;
          if (areaId) {
            acc[areaId] = (acc[areaId] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const topAreaId = Object.entries(tasksByArea)
          .sort(([,a], [,b]) => b - a)[0]?.[0];
        const topArea = topAreaId ? areas.find(a => a.id === topAreaId) : null;

        const daysInPeriod = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        const dailyAverage = totalHoursInRange > 0 ? Math.round((totalHoursInRange / daysInPeriod) * 10) / 10 : 0;
        
        // Obtener planning semanal
        let workloadLevel: 'baja' | 'media' | 'alta' = 'baja';
        if (totalHoursInRange > 0) {
          if (dailyAverage <= 4) workloadLevel = 'baja';
          else if (dailyAverage <= 7) workloadLevel = 'media';
          else workloadLevel = 'alta';
        }

        const hasActivityInRange = totalHoursInRange > 0;

        return {
          user,
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          blockedTasks,
          totalHoursInRange,
          totalHoursAllTime,
          estimatedHours,
          completionRate,
          timeProgress,
          projectsCount: userProjectIds.size,
          topArea,
          dailyAverage,
          workloadLevel,
          hoursByDate,
          hasActivityInRange,
        };
      })
      .filter(stat => selectedProjectId !== 'all' ? stat.hasActivityInRange : true)
      .sort((a, b) => {
        if (a.hasActivityInRange && !b.hasActivityInRange) return -1;
        if (!a.hasActivityInRange && b.hasActivityInRange) return 1;
        
        if (a.hasActivityInRange && b.hasActivityInRange) {
          switch(sortMetric) {
            case 'hours': return b.totalHoursInRange - a.totalHoursInRange;
            case 'completion': return b.completionRate - a.completionRate;
            case 'tasks': return b.totalTasks - a.totalTasks;
            default: return 0;
          }
        }
        
        return a.user.name.localeCompare(b.user.name);
      });
  }, [selectedProjectId, selectedAreaId, selectedModuleId, dateRange, sortMetric]);

  const totalFilteredHours = enrichedTasks.reduce((acc, t) => acc + t.totalActualHours, 0);
  const totalFilteredEstimated = enrichedTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const completedFilteredTasks = enrichedTasks.filter(t => t.status === 'completed').length;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getWorkloadColor = (level: string) => {
    switch(level) {
      case 'baja': return 'bg-blue-500';
      case 'media': return 'bg-amber-500';
      case 'alta': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getWorkloadMessage = (level: string) => {
    switch(level) {
      case 'baja': return 'Capacidad disponible';
      case 'media': return 'Ritmo sostenible';
      case 'alta': return 'Considerar redistribuir';
      default: return '';
    }
  };

  const totalHoursInPeriod = userStats.reduce((acc, u) => acc + u.totalHoursInRange, 0);
  const daysInPeriod = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
  const dailyAverageTeam = daysInPeriod > 0 ? Math.round((totalHoursInPeriod / daysInPeriod) * 10) / 10 : 0;

  return (
    
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard de Tareas por Usuario</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Tabs principales */}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard general</TabsTrigger>
          <TabsTrigger value="planning">Planning semanal</TabsTrigger>
          {selectedUserId !== 'all' && (
            <TabsTrigger value="my-commitments">Mis compromisos</TabsTrigger>
          )}
        </TabsList>

        {/* TAB: DASHBOARD GENERAL */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* FILTROS */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                {/* Filtro por Usuario */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Usuario</label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Proyecto */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Proyecto</label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los proyectos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los proyectos</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Área */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Área</label>
                  <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las áreas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las áreas</SelectItem>
                      {areas.map(area => (
                        <SelectItem key={area.id} value={area.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: area.color }} />
                            <span>{area.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Módulo */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Módulo</label>
                  <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los módulos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los módulos</SelectItem>
                      {filteredModulesByArea.map(module => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por fechas */}
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Período</label>
                  <div className="flex gap-2">
                    <Button
                      variant={viewType === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setViewType('week');
                        const to = new Date();
                        const from = new Date();
                        from.setDate(to.getDate() - 7);
                        setDateRange({ from, to });
                      }}
                    >
                      Última semana
                    </Button>
                    <Button
                      variant={viewType === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setViewType('month');
                        const to = new Date();
                        const from = new Date();
                        from.setMonth(to.getMonth() - 1);
                        setDateRange({ from, to });
                      }}
                    >
                      Último mes
                    </Button>
                    <Button
                      variant={viewType === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewType('custom')}
                    >
                      Personalizar
                    </Button>
                  </div>
                  
                  {viewType === 'custom' && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="date"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={dateRange.from.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                      />
                      <span className="text-sm py-2">→</span>
                      <input
                        type="date"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={dateRange.to.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RESUMEN DE HORAS EN EL PERÍODO */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Total horas en período</div>
                <div className="text-2xl font-bold">{totalHoursInPeriod}h</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {userStats.filter(u => u.totalHoursInRange > 0).length} usuarios activos
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Promedio diario equipo</div>
                <div className="text-2xl font-bold">{dailyAverageTeam}h</div>
                <div className="text-xs text-muted-foreground mt-1">
                  en {daysInPeriod} días
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Usuario con más horas</div>
                {userStats.length > 0 && userStats[0]?.totalHoursInRange > 0 && (
                  <>
                    <div className="text-lg font-bold">{userStats[0]?.user.name}</div>
                    <div className="text-sm">{userStats[0]?.totalHoursInRange}h</div>
                  </>
                )}
                {(!userStats.length || userStats[0]?.totalHoursInRange === 0) && (
                  <div className="text-sm text-muted-foreground">Sin datos en período</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Tareas en período</div>
                <div className="text-2xl font-bold">{enrichedTasks.length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {completedFilteredTasks} completadas
                </div>
              </CardContent>
            </Card>
          </div>

          {/* VISTA DE CARGA LABORAL DEL EQUIPO */}
          <Card className="border-2 border-primary/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Carga laboral del equipo {viewType === 'week' ? '(última semana)' : viewType === 'month' ? '(último mes)' : '(período seleccionado)'}
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Ordenar por:</span>
                  <Select value={sortMetric} onValueChange={(value: any) => setSortMetric(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Métrica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Horas en período</SelectItem>
                      <SelectItem value="completion">% de avance</SelectItem>
                      <SelectItem value="tasks">Cantidad de tareas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {userStats.map((stat) => (
                  <Card key={stat.user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {/* Header con usuario */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/10">
                            <AvatarImage src={stat.user.avatar} />
                            <AvatarFallback>{getInitials(stat.user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{stat.user.name}</h3>
                              {stat.inProgressTasks > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                  <span className="text-xs text-green-600 font-medium">
                                    {stat.inProgressTasks} activa{stat.inProgressTasks !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{stat.user.role}</p>
                          </div>
                        </div>
                        
                        {stat.hasActivityInRange && (
                          <div className="text-right">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getWorkloadColor(stat.workloadLevel)}`}>
                              Carga {stat.workloadLevel}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getWorkloadMessage(stat.workloadLevel)}
                            </p>
                          </div>
                        )}

                        {!stat.hasActivityInRange && (
                          <Badge variant="outline" className="ml-auto">
                            Sin actividad en el período
                          </Badge>
                        )}
                      </div>

                      {/* Métricas principales */}
                      {stat.hasActivityInRange ? (
                        <>
                          <div className="grid grid-cols-5 gap-2 mb-4">
                            <div className="text-center p-2 bg-muted/30 rounded">
                              <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <div className="text-sm font-bold">{stat.totalHoursInRange}h</div>
                              <div className="text-xs text-muted-foreground">en período</div>
                            </div>
                            <div className="text-center p-2 bg-muted/30 rounded">
                              <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <div className="text-sm font-bold">{stat.completedTasks}</div>
                              <div className="text-xs text-muted-foreground">completadas</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                              <Activity className="h-4 w-4 mx-auto mb-1 text-green-600" />
                              <div className="text-sm font-bold text-green-700">{stat.inProgressTasks}</div>
                              <div className="text-xs text-green-600 font-medium">activas</div>
                            </div>
                            <div className="text-center p-2 bg-muted/30 rounded">
                              <Layers className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <div className="text-sm font-bold">{stat.projectsCount}</div>
                              <div className="text-xs text-muted-foreground">proyectos</div>
                            </div>
                            <div className="text-center p-2 bg-muted/30 rounded">
                              <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <div className="text-sm font-bold">{stat.dailyAverage}h</div>
                              <div className="text-xs text-muted-foreground">/día</div>
                            </div>
                          </div>

                          {/* Mini timeline */}
                          {Object.keys(stat.hoursByDate).length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs font-medium mb-1">Distribución en el período</div>
                              <div className="flex gap-1 h-8 items-end">
                                {Object.entries(stat.hoursByDate)
                                  .sort(([a], [b]) => a.localeCompare(b))
                                  .slice(-7)
                                  .map(([date, hours]) => {
                                    const maxHours = Math.max(...Object.values(stat.hoursByDate));
                                    const height = Math.max((hours / maxHours) * 32, 4);
                                    
                                    return (
                                      <TooltipProvider key={date}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="flex-1 flex flex-col items-center">
                                              <div 
                                                className="w-full bg-blue-500 rounded-t"
                                                style={{ height: `${height}px` }}
                                              />
                                              <div className="text-[8px] text-muted-foreground mt-1">
                                                {new Date(date).getDate()}
                                              </div>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{new Date(date).toLocaleDateString()}: {hours}h</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* Planning semanal */}
                          {stat.weeklyPlanning && stat.weeklyPlanning.totalPlannedHours > 0 && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">Planning esta semana</span>
                                <Badge variant={stat.weeklyPlanning.onTrack ? 'default' : 'secondary'} className="text-[10px]">
                                  {stat.weeklyPlanning.deviation}% avance
                                </Badge>
                              </div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Horas</span>
                                <span>{stat.weeklyPlanning.totalActualHours}/{stat.weeklyPlanning.totalPlannedHours}h</span>
                              </div>
                              <Progress value={stat.weeklyPlanning.deviation} className="h-1.5" />
                              <div className="flex flex-wrap gap-1 mt-2">
                                {stat.weeklyPlanning.commitments.slice(0, 2).map(c => {
                                  const task = tasks.find(t => t.id === c.taskId);
                                  return task ? (
                                    <Badge key={c.id} variant="outline" className="text-[8px]">
                                      {c.status === 'in-progress' && '▶️ '}
                                      {c.status === 'paused' && '⏸️ '}
                                      {task.name.substring(0, 15)}...
                                    </Badge>
                                  ) : null;
                                })}
                                {stat.weeklyPlanning.commitments.length > 2 && (
                                  <Badge variant="outline" className="text-[8px]">
                                    +{stat.weeklyPlanning.commitments.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Barras de progreso */}
                          <div className="space-y-3 mt-4">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Avance general</span>
                                <span className="font-medium">{stat.completionRate}%</span>
                              </div>
                              <Progress value={stat.completionRate} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Tiempo invertido (total)</span>
                                <span className="font-medium">
                                  {stat.totalHoursAllTime} / {stat.estimatedHours}h
                                </span>
                              </div>
                              <Progress 
                                value={stat.timeProgress} 
                                className={`h-2 ${
                                  stat.timeProgress > 100 ? 'bg-purple-100' : 'bg-blue-100'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mt-4">
                            {stat.topArea && (
                              <Badge 
                                variant="outline"
                                className="text-xs"
                                style={{ 
                                  borderLeftColor: stat.topArea.color, 
                                  borderLeftWidth: '3px' 
                                }}
                              >
                                {stat.topArea.name}
                              </Badge>
                            )}
                            {stat.pendingTasks > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {stat.pendingTasks} pendientes
                              </Badge>
                            )}
                            {stat.blockedTasks > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {stat.blockedTasks} bloqueadas
                              </Badge>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-lg">
                          Sin actividad en el período seleccionado
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {userStats.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay usuarios con tareas asignadas en este período
                </div>
              )}
            </CardContent>
          </Card>

          {/* LISTA DE TAREAS */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-2 gap-4">
              {enrichedTasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{task.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {task.project?.name}
                          </Badge>
                          {task.area && (
                            <Badge 
                              variant="outline" 
                              className="text-[10px]"
                              style={{ 
                                borderLeftColor: task.area.color, 
                                borderLeftWidth: '3px' 
                              }}
                            >
                              {task.area.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={
                        task.status === 'completed' ? 'default' :
                        task.status === 'in-progress' ? 'secondary' :
                        task.status === 'blocked' ? 'destructive' :
                        task.status === 'review' ? 'outline' : 'secondary'
                      }>
                        {task.status === 'completed' ? 'Completada' :
                         task.status === 'in-progress' ? 'En progreso' :
                         task.status === 'review' ? 'Revisión' :
                         task.status === 'blocked' ? 'Bloqueada' : 'Pendiente'}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span className={task.totalActualHours > task.estimatedHours ? 'text-purple-600' : ''}>
                          {task.totalActualHours}/{task.estimatedHours}h
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <User className="h-3 w-3" />
                        <div className="flex -space-x-2">
                          {task.assignedUsers.slice(0, 3).map(user => (
                            <Avatar key={user.id} className="h-5 w-5 border border-background">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-[8px]">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignedUsers.length > 3 && (
                            <Badge variant="outline" className="h-5 px-1 text-[8px]">
                              +{task.assignedUsers.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>Progreso</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress 
                        value={task.progress} 
                        className={`h-1 ${
                          task.progress >= 100 ? 'bg-green-100' : 
                          task.status === 'blocked' ? 'bg-red-100' : ''
                        }`} 
                      />
                    </div>

                    <div className="mt-2 text-[10px] text-muted-foreground">
                      📦 {task.module?.name}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {enrichedTasks.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  No hay tareas que coincidan con los filtros seleccionados
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarea</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Asignados</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Progreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedTasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>{task.project?.name}</TableCell>
                        <TableCell>{task.module?.name}</TableCell>
                        <TableCell>
                          {task.area && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.area.color }} />
                              <span>{task.area.name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {task.assignedUsers.slice(0, 3).map(user => (
                              <Avatar key={user.id} className="h-6 w-6 border border-background">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-[8px]">{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                            ))}
                            {task.assignedUsers.length > 3 && (
                              <Badge variant="outline" className="h-6 px-1 text-[8px]">
                                +{task.assignedUsers.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in-progress' ? 'secondary' :
                            task.status === 'blocked' ? 'destructive' :
                            task.status === 'review' ? 'outline' : 'secondary'
                          }>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={task.totalActualHours > task.estimatedHours ? 'text-purple-600' : ''}>
                            {task.totalActualHours}/{task.estimatedHours}h
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress} className="w-16 h-1" />
                            <span className="text-xs">{task.progress}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: PLANNING SEMANAL */}
        <TabsContent value="planning">
           <PlanningSimpleView />
        </TabsContent>

        {/* TAB: MIS COMPROMISOS (solo si hay usuario seleccionado) */}
        {selectedUserId !== 'all' && (
          <TabsContent value="my-commitments">
            <UserCommitmentsView userId={selectedUserId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}