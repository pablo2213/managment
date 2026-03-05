'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Clock, CheckCircle2, AlertTriangle, Award, 
  Filter, BarChart3, Download, Users, Layers, TrendingUp,
  Star, Target, Zap, Trophy, Medal
} from 'lucide-react';
import { users, tasks, modules, projects, areas, Task, Module, Project, Area } from '@/lib/data';
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

interface UserTasksDashboardProps {
  initialUserId?: string;
}

export function UserTasksDashboard({ initialUserId }: UserTasksDashboardProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId || 'all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [rankingMetric, setRankingMetric] = useState<'tasks' | 'hours' | 'efficiency' | 'completion'>('tasks');

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

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    filtered = filtered.filter(t => moduleIds.includes(t.moduleId));
    if (selectedUserId !== 'all') {
      filtered = filtered.filter(t => t.assignedTo?.includes(selectedUserId));
    }
    return filtered;
  }, [selectedUserId, moduleIds]);

  // ============================================
  // RANKING DE USUARIOS - NUEVO ENFOQUE
  // ============================================

  const userRanking = useMemo(() => {
    return users.map(user => {
      const userTasks = tasks.filter(t => t.assignedTo?.includes(user.id));
      
      // Métricas de cantidad
      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = userTasks.filter(t => t.status === 'in-progress' || t.status === 'review').length;
      const pendingTasks = userTasks.filter(t => t.status === 'pending').length;
      const blockedTasks = userTasks.filter(t => t.status === 'blocked').length;
      
      // Métricas de horas
      const totalHours = userTasks.reduce((acc, t) => {
        if (t.timeEntries) return acc + t.timeEntries.reduce((s, e) => s + e.hours, 0);
        return acc + (t.actualHours || 0);
      }, 0);

      const estimatedHours = userTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
      
      // Métricas de eficiencia
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const efficiency = estimatedHours > 0 ? Math.round((totalHours / estimatedHours) * 100) : 0;
      const accuracy = completedTasks > 0 
        ? userTasks
            .filter(t => t.status === 'completed')
            .reduce((acc, t) => {
              const taskActual = t.timeEntries 
                ? t.timeEntries.reduce((s, e) => s + e.hours, 0) 
                : t.actualHours || 0;
              return acc + (taskActual / t.estimatedHours);
            }, 0) / completedTasks * 100
        : 0;

      // Proyectos en los que participa
      const userProjectIds = new Set(
        userTasks
          .map(t => modules.find(m => m.id === t.moduleId)?.projectId)
          .filter(Boolean)
      );
      
      // Áreas principales
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

      // Puntuación para ranking (según métrica seleccionada)
      let score = 0;
      switch(rankingMetric) {
        case 'tasks':
          score = completedTasks * 10 + inProgressTasks * 5 - blockedTasks * 2;
          break;
        case 'hours':
          score = totalHours;
          break;
        case 'efficiency':
          score = 100 - Math.abs(efficiency - 100); // Cerca de 100% es mejor
          break;
        case 'completion':
          score = completionRate;
          break;
      }

      return {
        user,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        blockedTasks,
        totalHours,
        estimatedHours,
        completionRate,
        efficiency,
        accuracy: Math.round(accuracy),
        projectsCount: userProjectIds.size,
        topArea,
        score,
      };
    })
    .filter(u => u.totalTasks > 0) // Solo usuarios con tareas
    .sort((a, b) => b.score - a.score);
  }, [rankingMetric]);

  // ============================================
  // TAREAS FILTRADAS (resto del componente)
  // ============================================

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

  const totalFilteredHours = enrichedTasks.reduce((acc, t) => acc + t.totalActualHours, 0);
  const totalFilteredEstimated = enrichedTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const completedFilteredTasks = enrichedTasks.filter(t => t.status === 'completed').length;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Obtener medalla según posición
  const getMedal = (index: number) => {
    switch(index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard de Tareas por Usuario</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* FILTROS (igual que antes) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
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

            {/* Vista Cards/Tabla */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Vista</label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setViewMode('cards')}
                >
                  Tarjetas
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setViewMode('table')}
                >
                  Tabla
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RESUMEN DE FILTROS */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Tareas filtradas</div>
            <div className="text-2xl font-bold">{enrichedTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Horas reales</div>
            <div className="text-2xl font-bold">{totalFilteredHours}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Horas estimadas</div>
            <div className="text-2xl font-bold">{totalFilteredEstimated}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Completadas</div>
            <div className="text-2xl font-bold text-green-500">{completedFilteredTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* RANKING DE USUARIOS - NUEVO DISEÑO */}
      <Card className="border-2 border-primary/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Ranking de Usuarios
            </CardTitle>
            
            {/* Selector de métrica para ranking */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Ordenar por:</span>
              <Select value={rankingMetric} onValueChange={(value: any) => setRankingMetric(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasks">Tareas completadas</SelectItem>
                  <SelectItem value="hours">Horas trabajadas</SelectItem>
                  <SelectItem value="efficiency">Eficiencia</SelectItem>
                  <SelectItem value="completion">% Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Podio (Top 3) */}
            {userRanking.slice(0, 3).map((user, index) => (
              <Card key={user.user.id} className={`relative overflow-hidden ${
                index === 0 ? 'bg-yellow-500/5 border-yellow-500/30' :
                index === 1 ? 'bg-gray-500/5 border-gray-500/30' :
                'bg-amber-600/5 border-amber-600/30'
              }`}>
                <div className="absolute top-2 right-2">
                  {getMedal(index)}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={user.user.avatar} />
                      <AvatarFallback className="text-lg">{getInitials(user.user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-lg">{user.user.name}</div>
                      <Badge variant="outline" className="mt-1">
                        {user.user.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="bg-muted/30 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">Tareas</div>
                      <div className="font-bold text-lg">{user.totalTasks}</div>
                    </div>
                    <div className="bg-muted/30 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">Completadas</div>
                      <div className="font-bold text-lg text-green-500">{user.completedTasks}</div>
                    </div>
                    <div className="bg-muted/30 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">Horas</div>
                      <div className="font-bold text-lg">{user.totalHours}h</div>
                    </div>
                    <div className="bg-muted/30 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">Proyectos</div>
                      <div className="font-bold text-lg">{user.projectsCount}</div>
                    </div>
                  </div>

                  {/* Barras de progreso */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Completado</span>
                        <span className="font-bold">{user.completionRate}%</span>
                      </div>
                      <Progress value={user.completionRate} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Eficiencia</span>
                        <span className={`font-bold ${
                          user.efficiency <= 100 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {user.efficiency}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(user.efficiency, 200)} 
                        className={`h-1.5 ${
                          user.efficiency <= 100 ? 'bg-green-100' : 'bg-red-100'
                        }`} 
                      />
                    </div>
                  </div>

                  {/* Área principal */}
                  {user.topArea && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.topArea.color }} />
                      <span className="text-muted-foreground">Área principal:</span>
                      <span className="font-medium">{user.topArea.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabla de ranking completo (resto de usuarios) */}
          {userRanking.length > 3 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Resto del equipo</h4>
              <div className="space-y-2">
                {userRanking.slice(3).map((user, idx) => (
                  <div key={user.user.id} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="w-8 text-center font-bold text-muted-foreground">
                      #{idx + 4}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user.avatar} />
                      <AvatarFallback>{getInitials(user.user.name)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 grid grid-cols-6 gap-2">
                      <div className="col-span-2">
                        <div className="font-medium">{user.user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.user.role}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Tareas</div>
                        <div className="font-bold">{user.totalTasks}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Completadas</div>
                        <div className="font-bold text-green-500">{user.completedTasks}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Horas</div>
                        <div className="font-bold">{user.totalHours}h</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Eficiencia</div>
                        <div className={`font-bold ${
                          user.efficiency <= 100 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {user.efficiency}%
                        </div>
                      </div>
                    </div>
                    
                    {user.topArea && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.topArea.color }} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.topArea.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {userRanking.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios con tareas asignadas
            </div>
          )}
        </CardContent>
      </Card>

      {/* LISTA DE TAREAS (igual que antes) */}
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
                    <span className={task.totalActualHours > task.estimatedHours ? 'text-red-500' : ''}>
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
        /* VISTA TABLA (igual que antes) */
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
                        {task.status === 'completed' ? 'Completada' :
                         task.status === 'in-progress' ? 'En progreso' :
                         task.status === 'review' ? 'Revisión' :
                         task.status === 'blocked' ? 'Bloqueada' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={task.totalActualHours > task.estimatedHours ? 'text-red-500' : ''}>
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
    </div>
  );
}