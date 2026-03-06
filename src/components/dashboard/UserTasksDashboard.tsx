'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Clock, CheckCircle2, Filter, 
  Download, Users, Layers, Activity, Calendar,
  FolderTree, CheckSquare, Target, Plus, Settings,
  BarChart3, TrendingUp
} from 'lucide-react';
import { users, tasks, modules, projects, areas } from '@/lib/data';
import * as planningService from '@/lib/planningSimple';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Importar componentes de planning
import { PlanningSimpleView } from '@/components/planning/PlanningSimpleView';

interface UserTasksDashboardProps {
  initialUserId?: string;
}

// Generar semanas disponibles
const generateWeeks = () => {
  const weeks = [];
  const today = new Date();
  
  for (let i = -4; i < 12; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + (i * 7));
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const value = startDate.toISOString().split('T')[0];
    const label = `${startDate.getDate()}/${startDate.getMonth()+1} - ${endDate.getDate()}/${endDate.getMonth()+1}`;
    
    weeks.push({ value, label, fullLabel: label });
  }
  
  return weeks;
};

const AVAILABLE_WEEKS = generateWeeks();

export function UserTasksDashboard({ initialUserId }: UserTasksDashboardProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId || 'all');
  const [activeTab, setActiveTab] = useState<string>('usuarios');
  const [selectedPlanningId, setSelectedPlanningId] = useState<string>('current');
  const [selectedDateRange, setSelectedDateRange] = useState<'week' | 'month' | 'all'>('week');
  
  // Estado para creación de planning
  const [showCreatePlanning, setShowCreatePlanning] = useState(false);
  const [newPlanningProject, setNewPlanningProject] = useState('');
  const [newPlanningWeeks, setNewPlanningWeeks] = useState<string[]>([]);
  const [newPlanningDescription, setNewPlanningDescription] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Estado para mostrar/ocultar planificador
  const [showPlanner, setShowPlanner] = useState(false);

  // Obtener todos los plannings
  const allPlannings = planningService.getAllPlannings();
  
  // Planning seleccionado
  const currentPlanning = useMemo(() => {
    if (selectedPlanningId === 'current') {
      return allPlannings.length > 0 ? allPlannings[0] : null;
    }
    return allPlannings.find(p => p.id === selectedPlanningId) || null;
  }, [allPlannings, selectedPlanningId, refreshKey]);

  // ============================================
  // FUNCIONES DE PLANNING
  // ============================================
  
  const handleCreatePlanning = () => {
    if (!newPlanningProject || newPlanningWeeks.length === 0) return;

    const project = projects.find(p => p.id === newPlanningProject);
    if (!project) return;

    // Crear planning
    planningService.createPlanning(
      newPlanningProject,
      project.name,
      newPlanningWeeks,
      newPlanningDescription
    );

    // Forzar refresco
    setRefreshKey(prev => prev + 1);
    
    // Limpiar y cerrar
    setShowCreatePlanning(false);
    setNewPlanningProject('');
    setNewPlanningWeeks([]);
    setNewPlanningDescription('');
    
    // Seleccionar el planning recién creado
    const updatedPlannings = planningService.getAllPlannings();
    if (updatedPlannings.length > 0) {
      setSelectedPlanningId(updatedPlannings[0].id);
    }
    
    // Mostrar el planificador
    setShowPlanner(true);
  };

  // ============================================
  // FILTROS
  // ============================================
  
  const modulesByProject = useMemo(() => {
    if (selectedProjectId === 'all') return modules;
    return modules.filter(m => m.projectId === selectedProjectId);
  }, [selectedProjectId]);

  const modulesByArea = useMemo(() => {
    if (selectedAreaId === 'all') return modulesByProject;
    return modulesByProject.filter(m => m.areaId === selectedAreaId);
  }, [selectedAreaId, modulesByProject]);

  const filteredModules = useMemo(() => {
    if (selectedModuleId === 'all') return modulesByArea;
    return modulesByArea.filter(m => m.id === selectedModuleId);
  }, [selectedModuleId, modulesByArea]);

  const moduleIds = useMemo(() => {
    return filteredModules.map(m => m.id);
  }, [filteredModules]);

  const tasksByModule = useMemo(() => {
    return tasks.filter(t => moduleIds.includes(t.moduleId));
  }, [moduleIds]);

  const filteredTasks = useMemo(() => {
    if (selectedUserId === 'all') return tasksByModule;
    return tasksByModule.filter(t => t.assignedTo?.includes(selectedUserId));
  }, [tasksByModule, selectedUserId]);

  const availableUsers = useMemo(() => {
    if (selectedUserId !== 'all') return users;
    
    const userIds = new Set<string>();
    tasksByModule.forEach(task => {
      task.assignedTo?.forEach(id => userIds.add(id));
    });
    
    return users.filter(u => userIds.has(u.id));
  }, [tasksByModule, selectedUserId]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // ============================================
  // ESTADÍSTICAS DE USUARIOS (userStats)
  // ============================================
  
  const userStats = useMemo(() => {
    return availableUsers
      .map(user => {
        const userTasks = filteredTasks.filter(t => t.assignedTo?.includes(user.id) || false);
        
        const horasReales = userTasks.reduce((acc, t) => {
          if (t.timeEntries) return acc + t.timeEntries.reduce((s, e) => s + e.hours, 0);
          return acc + (t.actualHours || 0);
        }, 0);
        
        const horasEstimadas = userTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
        
        const tareas = {
          total: userTasks.length,
          completadas: userTasks.filter(t => t.status === 'completed').length,
          progreso: userTasks.filter(t => t.status === 'in-progress' || t.status === 'review').length,
          pendientes: userTasks.filter(t => t.status === 'pending').length,
          bloqueadas: userTasks.filter(t => t.status === 'blocked').length
        };
        
        const proyectos = new Set(
          userTasks.map(t => modules.find(m => m.id === t.moduleId)?.projectId).filter(Boolean)
        ).size;
        
        let planningTareas: any[] = [];
        let planningHoras = 0;
        
        if (currentPlanning) {
          const userModules = currentPlanning.modules.filter(module => 
            moduleIds.includes(module.moduleId) && module.assignedUsers.includes(user.id)
          );
          
          userModules.forEach(module => {
            module.tasks.forEach((task: any) => {
              if (task.assignedUsers.includes(user.id)) {
                planningTareas.push({
                  nombre: task.taskName,
                  modulo: module.moduleName,
                  horas: task.estimatedHours
                });
                planningHoras += task.estimatedHours;
              }
            });
          });
        }

        return {
          id: user.id,
          nombre: user.name,
          rol: user.role,
          avatar: user.avatar,
          horas: { reales: horasReales, estimadas: horasEstimadas, eficiencia: horasEstimadas ? Math.round((horasReales / horasEstimadas) * 100) : 0 },
          tareas,
          proyectos,
          planning: {
            tiene: planningTareas.length > 0,
            tareas: planningTareas,
            totalTareas: planningTareas.length,
            horas: planningHoras
          }
        };
      })
      .filter(user => user.tareas.total > 0 || user.planning.tiene)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [availableUsers, filteredTasks, currentPlanning, moduleIds]);

  // ============================================
  // ESTADÍSTICAS DE MÓDULOS (moduleStats)
  // ============================================
  
  const moduleStats = useMemo(() => {
    return filteredModules
      .map(module => {
        const project = projects.find(p => p.id === module.projectId);
        const area = module.areaId ? areas.find(a => a.id === module.areaId) : null;
        
        const moduleTasks = tasks.filter(t => t.moduleId === module.id);
        
        const horasEstimadas = moduleTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
        const horasReales = moduleTasks.reduce((acc, t) => {
          if (t.timeEntries) return acc + t.timeEntries.reduce((s, e) => s + e.hours, 0);
          return acc + (t.actualHours || 0);
        }, 0);
        
        const tareas = {
          total: moduleTasks.length,
          completadas: moduleTasks.filter(t => t.status === 'completed').length,
          progreso: moduleTasks.filter(t => t.status === 'in-progress' || t.status === 'review').length,
          pendientes: moduleTasks.filter(t => t.status === 'pending').length,
          bloqueadas: moduleTasks.filter(t => t.status === 'blocked').length
        };
        
        const usuarios = new Set<string>();
        moduleTasks.forEach(task => {
          task.assignedTo?.forEach(userId => usuarios.add(userId));
        });
        
        const avance = tareas.total > 0 ? Math.round((tareas.completadas / tareas.total) * 100) : 0;
        
        const enPlanning = currentPlanning?.modules.some(m => m.moduleId === module.id) || false;

        return {
          id: module.id,
          nombre: module.name,
          proyecto: project?.name || 'Sin proyecto',
          area: area?.name,
          areaColor: area?.color,
          horas: { estimadas: horasEstimadas, reales: horasReales },
          tareas,
          usuarios: Array.from(usuarios),
          totalUsuarios: usuarios.size,
          avance,
          enPlanning
        };
      })
      .sort((a, b) => b.avance - a.avance);
  }, [filteredModules, currentPlanning]);

  // ============================================
  // CRUCE DE HORAS TRABAJADAS VS PLANNING
  // ============================================
  
  const timeTrackingStats = useMemo(() => {
    // Determinar rango de fechas
    const now = new Date();
    let startDate = new Date();
    
    if (selectedDateRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (selectedDateRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate = new Date(0); // Todo el histórico
    }

    // Por usuario
    const userTimeStats = availableUsers.map(user => {
      // Horas registradas en timeEntries
      const userTasks = tasks.filter(t => t.assignedTo?.includes(user.id) || false);
      
      let horasRegistradas = 0;
      let horasPorDia: Record<string, number> = {};
      
      userTasks.forEach(task => {
        if (task.timeEntries) {
          task.timeEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= startDate) {
              horasRegistradas += entry.hours;
              const dateKey = entryDate.toISOString().split('T')[0];
              horasPorDia[dateKey] = (horasPorDia[dateKey] || 0) + entry.hours;
            }
          });
        }
      });
      
      // Horas planificadas en planning
      let horasPlanificadas = 0;
      let tareasPlanificadas: string[] = [];
      
      if (currentPlanning) {
        currentPlanning.modules.forEach(module => {
          if (moduleIds.includes(module.moduleId)) {
            module.tasks.forEach((task: any) => {
              if (task.assignedUsers.includes(user.id)) {
                horasPlanificadas += task.estimatedHours;
                tareasPlanificadas.push(task.taskName);
              }
            });
          }
        });
      }
      
      // Días trabajados (días con horas > 0)
      const diasTrabajados = Object.keys(horasPorDia).length;
      
      // Promedio diario
      const promedioDiario = diasTrabajados > 0 
        ? Math.round((horasRegistradas / diasTrabajados) * 10) / 10 
        : 0;
      
      // Desviación vs planning
      const desviacion = horasPlanificadas > 0 
        ? Math.round(((horasRegistradas - horasPlanificadas) / horasPlanificadas) * 100) 
        : 0;

      return {
        userId: user.id,
        nombre: user.name,
        avatar: user.avatar,
        horas: {
          registradas: horasRegistradas,
          planificadas: horasPlanificadas,
          desviacion,
          promedioDiario,
          diasTrabajados
        },
        tareas: {
          planificadas: tareasPlanificadas.length,
          lista: tareasPlanificadas.slice(0, 5)
        },
        horasPorDia
      };
    }).filter(stat => stat.horas.registradas > 0 || stat.horas.planificadas > 0);

    // Totales generales
    const totalHorasRegistradas = userTimeStats.reduce((acc, u) => acc + u.horas.registradas, 0);
    const totalHorasPlanificadas = userTimeStats.reduce((acc, u) => acc + u.horas.planificadas, 0);
    const totalDiasTrabajados = userTimeStats.reduce((acc, u) => acc + u.horas.diasTrabajados, 0);
    const promedioEquipo = userTimeStats.length > 0 
      ? Math.round((totalHorasRegistradas / userTimeStats.length) * 10) / 10 
      : 0;

    return {
      usuarios: userTimeStats,
      totales: {
        registradas: totalHorasRegistradas,
        planificadas: totalHorasPlanificadas,
        desviacion: totalHorasPlanificadas > 0 
          ? Math.round(((totalHorasRegistradas - totalHorasPlanificadas) / totalHorasPlanificadas) * 100) 
          : 0,
        usuariosActivos: userTimeStats.length,
        promedioEquipo,
        diasTrabajados: totalDiasTrabajados
      }
    };
  }, [availableUsers, currentPlanning, moduleIds, selectedDateRange]);

  // ============================================
  // KPI GENERALES
  // ============================================
  
  const kpis = useMemo(() => {
    const filteredTasksForKPI = selectedUserId === 'all' ? tasksByModule : filteredTasks;
    
    const totalTasks = filteredTasksForKPI.length;
    const completedTasks = filteredTasksForKPI.filter(t => t.status === 'completed').length;
    const inProgressTasks = filteredTasksForKPI.filter(t => t.status === 'in-progress' || t.status === 'review').length;
    const pendingTasks = filteredTasksForKPI.filter(t => t.status === 'pending').length;
    const blockedTasks = filteredTasksForKPI.filter(t => t.status === 'blocked').length;
    
    const totalEstimatedHours = filteredTasksForKPI.reduce((acc, t) => acc + t.estimatedHours, 0);
    const totalActualHours = filteredTasksForKPI.reduce((acc, t) => {
      if (t.timeEntries) return acc + t.timeEntries.reduce((s, e) => s + e.hours, 0);
      return acc + (t.actualHours || 0);
    }, 0);
    
    const modulesInFilter = new Set(filteredTasksForKPI.map(t => t.moduleId)).size;
    
    // Planning stats
    let planningTasks = 0;
    let planningHours = 0;
    let planningParticipants = 0;
    
    if (currentPlanning) {
      const participantsSet = new Set();
      
      currentPlanning.modules.forEach(module => {
        if (moduleIds.includes(module.moduleId)) {
          module.tasks.forEach((task: any) => {
            if (selectedUserId === 'all' || task.assignedUsers.includes(selectedUserId)) {
              planningTasks++;
              planningHours += task.estimatedHours;
              task.assignedUsers.forEach((userId: string) => participantsSet.add(userId));
            }
          });
        }
      });
      
      planningParticipants = participantsSet.size;
    }

    return {
      tareas: { total: totalTasks, completed: completedTasks, inProgress: inProgressTasks, pending: pendingTasks, blocked: blockedTasks },
      horas: { estimadas: totalEstimatedHours, reales: totalActualHours, desviacion: totalEstimatedHours ? Math.round((totalActualHours / totalEstimatedHours) * 100) : 0 },
      modulos: { total: filteredModules.length, conTareas: modulesInFilter },
      planning: { tareas: planningTasks, horas: planningHours, participantes: planningParticipants },
      timeTracking: timeTrackingStats.totales
    };
  }, [filteredTasks, tasksByModule, filteredModules, moduleIds, currentPlanning, selectedUserId, timeTrackingStats]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard de Seguimiento</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedDateRange} onValueChange={(v: any) => setSelectedDateRange(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant={showPlanner ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowPlanner(!showPlanner)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showPlanner ? "Ver dashboard" : "Planificar"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* FILTROS */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Proyecto</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Área</label>
              <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  {areas.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                        <span>{a.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Módulo</label>
              <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los módulos</SelectItem>
                  {modulesByArea.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Usuario</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Planning</label>
              <div className="flex gap-2">
                <Select value={selectedPlanningId} onValueChange={setSelectedPlanningId} className="flex-1">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar planning" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Planning actual</SelectItem>
                    {allPlannings.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - {p.projectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" variant="outline" onClick={() => setShowCreatePlanning(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI CARDS */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Horas registradas</p>
                <p className="text-2xl font-bold">{kpis.timeTracking.registradas}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {kpis.timeTracking.usuariosActivos} usuarios activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Horas planificadas</p>
                <p className="text-2xl font-bold">{kpis.timeTracking.planificadas}h</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Planning: {kpis.planning.tareas} tareas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Desviación</p>
                <p className={`text-2xl font-bold ${kpis.timeTracking.desviacion <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {kpis.timeTracking.desviacion > 0 ? '+' : ''}{kpis.timeTracking.desviacion}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              vs planificado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Promedio diario</p>
                <p className="text-2xl font-bold">{kpis.timeTracking.promedioEquipo}h</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              por usuario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Días trabajados</p>
                <p className="text-2xl font-bold">{kpis.timeTracking.diasTrabajados}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              en total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MODO PLANIFICADOR VS DASHBOARD */}
      {showPlanner ? (
        <PlanningSimpleView />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usuarios">
              <Users className="h-4 w-4 mr-2" />
              Usuarios ({userStats.length})
            </TabsTrigger>
            <TabsTrigger value="modulos">
              <FolderTree className="h-4 w-4 mr-2" />
              Módulos ({moduleStats.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: USUARIOS */}
          <TabsContent value="usuarios" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {userStats.map(user => {
                const timeData = timeTrackingStats.usuarios.find(u => u.userId === user.id);
                
                return (
                  <Card key={user.id} className="hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user.nombre)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{user.nombre}</h3>
                            {user.tareas.progreso > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {user.tareas.progreso} activas
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.rol}</p>
                        </div>
                      </div>

                      {/* Métricas de horas trabajadas */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                          <Clock className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                          <div className="text-sm font-bold text-blue-700">{timeData?.horas.registradas || 0}h</div>
                          <div className="text-xs text-blue-600">trabajadas</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <Target className="h-4 w-4 mx-auto mb-1" />
                          <div className="text-sm font-bold">{user.horas.estimadas}h</div>
                          <div className="text-xs text-muted-foreground">asignadas</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <CheckCircle2 className="h-4 w-4 mx-auto mb-1" />
                          <div className="text-sm font-bold">{user.tareas.completadas}</div>
                          <div className="text-xs text-muted-foreground">completadas</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <Calendar className="h-4 w-4 mx-auto mb-1" />
                          <div className="text-sm font-bold">{timeData?.horas.diasTrabajados || 0}</div>
                          <div className="text-xs text-muted-foreground">días</div>
                        </div>
                      </div>

                      {/* Comparativa vs planning */}
                      {timeData && timeData.horas.planificadas > 0 && (
                        <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-purple-700">Vs planning:</span>
                            <span className={timeData.horas.desviacion <= 0 ? 'text-green-600' : 'text-amber-600'}>
                              {timeData.horas.registradas}/{timeData.horas.planificadas}h ({timeData.horas.desviacion > 0 ? '+' : ''}{timeData.horas.desviacion}%)
                            </span>
                          </div>
                          <Progress 
                            value={(timeData.horas.registradas / timeData.horas.planificadas) * 100} 
                            className="h-1.5 bg-purple-100"
                          />
                          <p className="text-xs text-purple-600 mt-1">
                            Promedio: {timeData.horas.promedioDiario}h/día
                          </p>
                        </div>
                      )}

                      {/* Planning de la semana */}
                      {user.planning.tiene && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Planning</span>
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 ml-auto">
                              {user.planning.totalTareas} tareas
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            {user.planning.tareas.slice(0, 3).map((t, i) => (
                              <div key={i} className="text-xs flex justify-between">
                                <span>{t.nombre}</span>
                                <span className="font-medium">{t.horas}h</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-3">
                        {user.tareas.pendientes > 0 && (
                          <Badge variant="outline">{user.tareas.pendientes} pendientes</Badge>
                        )}
                        {user.tareas.bloqueadas > 0 && (
                          <Badge variant="destructive">{user.tareas.bloqueadas} bloqueadas</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 2: MÓDULOS */}
          <TabsContent value="modulos" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {moduleStats.map(module => (
                <Card key={module.id} className={`hover:shadow-md ${module.enPlanning ? 'border-blue-200 bg-blue-50/20' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-blue-500" />
                          <h3 className="font-semibold">{module.nombre}</h3>
                          {module.enPlanning && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-[10px]">
                              En planning
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {module.proyecto}
                          </Badge>
                          {module.area && (
                            <Badge 
                              variant="outline" 
                              className="text-[10px]"
                              style={{ borderLeftColor: module.areaColor, borderLeftWidth: '3px' }}
                            >
                              {module.area}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={module.avance >= 100 ? 'default' : 'outline'}>
                        {module.avance}%
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progreso</span>
                        <span>{module.tareas.completadas}/{module.tareas.total} tareas</span>
                      </div>
                      <Progress value={module.avance} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <Clock className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-sm font-bold">{module.horas.reales}h</div>
                        <div className="text-xs text-muted-foreground">reales</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <Target className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-sm font-bold">{module.horas.estimadas}h</div>
                        <div className="text-xs text-muted-foreground">estimadas</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <Users className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-sm font-bold">{module.totalUsuarios}</div>
                        <div className="text-xs text-muted-foreground">usuarios</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {module.tareas.completadas > 0 && (
                        <Badge variant="default" className="bg-green-500 text-[10px]">
                          ✓ {module.tareas.completadas} completadas
                        </Badge>
                      )}
                      {module.tareas.progreso > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          ● {module.tareas.progreso} en progreso
                        </Badge>
                      )}
                      {module.tareas.pendientes > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          ○ {module.tareas.pendientes} pendientes
                        </Badge>
                      )}
                      {module.tareas.bloqueadas > 0 && (
                        <Badge variant="destructive" className="text-[10px]">
                          ! {module.tareas.bloqueadas} bloqueadas
                        </Badge>
                      )}
                    </div>

                    {module.usuarios.length > 0 && (
                      <div className="flex items-center gap-1 mt-3">
                        <span className="text-xs text-muted-foreground">Asignados:</span>
                        <div className="flex -space-x-2">
                          {module.usuarios.slice(0, 5).map(userId => {
                            const user = users.find(u => u.id === userId);
                            return user ? (
                              <TooltipProvider key={userId}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Avatar className="h-6 w-6 border border-background">
                                      <AvatarImage src={user.avatar} />
                                      <AvatarFallback className="text-[8px]">{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{user.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : null;
                          })}
                          {module.usuarios.length > 5 && (
                            <Badge variant="outline" className="h-6 px-1 text-[8px]">
                              +{module.usuarios.length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* DIALOG CREAR PLANNING */}
      <Dialog open={showCreatePlanning} onOpenChange={setShowCreatePlanning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo planning</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Proyecto</label>
              <Select value={newPlanningProject} onValueChange={setNewPlanningProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Semanas</label>
              <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                {AVAILABLE_WEEKS.map(week => (
                  <div key={week.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={week.value}
                      className="rounded border-gray-300"
                      checked={newPlanningWeeks.includes(week.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewPlanningWeeks([...newPlanningWeeks, week.value]);
                        } else {
                          setNewPlanningWeeks(newPlanningWeeks.filter(w => w !== week.value));
                        }
                      }}
                    />
                    <label htmlFor={week.value} className="text-sm cursor-pointer flex-1">
                      {week.fullLabel}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Descripción (opcional)</label>
              <Textarea
                placeholder="Ej: Sprint 12 - Módulo de usuarios"
                value={newPlanningDescription}
                onChange={(e) => setNewPlanningDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreatePlanning(false);
              setNewPlanningProject('');
              setNewPlanningWeeks([]);
              setNewPlanningDescription('');
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreatePlanning}
              disabled={!newPlanningProject || newPlanningWeeks.length === 0}
            >
              Crear planning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}