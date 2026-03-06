'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Clock, Users, FolderTree, 
  Plus, Trash2, ChevronDown, ChevronRight, 
  ChevronLeft, FileText, CheckSquare, BarChart3
} from 'lucide-react';
import { users, projects, areas } from '@/lib/data';
import * as planningService from '@/lib/planningSimple';

// Generar semanas disponibles (para el eje X)
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
    const label = `${startDate.getDate()}/${startDate.getMonth()+1}`;
    const fullLabel = `${startDate.getDate()}/${startDate.getMonth()+1} - ${endDate.getDate()}/${endDate.getMonth()+1}`;
    
    weeks.push({ value, label, fullLabel });
  }
  
  return weeks;
};

const AVAILABLE_WEEKS = generateWeeks();

export function PlanningSimpleView() {
  const [allPlannings, setAllPlannings] = useState<planningService.Planning[]>([]);
  const [selectedPlanning, setSelectedPlanning] = useState<planningService.Planning | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('gantt'); // Por defecto vista Gantt
  
  // Dialog creación
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [planningDescription, setPlanningDescription] = useState('');
  
  // Dialog agregar módulos
  const [showAddModulesDialog, setShowAddModulesDialog] = useState(false);
  const [projectFilter, setProjectFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar lista de plannings al inicio
  useEffect(() => {
    setAllPlannings(planningService.getAllPlannings());
  }, []);

  // Actualizar datos cuando cambia el planning seleccionado
  useEffect(() => {
    if (selectedPlanning) {
      setParticipants(planningService.getPlanningParticipants(selectedPlanning.id));
      setSummary(planningService.getPlanningSummary(selectedPlanning.id));
    }
  }, [selectedPlanning]);

  // Cargar módulos disponibles cuando se abre el dialog
  useEffect(() => {
    if (showAddModulesDialog && selectedPlanning) {
      const modules = planningService.getAvailableModulesForPlanning(
        selectedPlanning.id,
        selectedPlanning.projectId,
        projectFilter,
        areaFilter
      ).filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      setAvailableModules(modules);
    }
  }, [showAddModulesDialog, selectedPlanning, projectFilter, areaFilter, searchTerm]);

  // Organizar plannings por proyecto
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

  const handleCreatePlanning = () => {
    if (!selectedProject || selectedWeeks.length === 0) return;

    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    const newPlanning = planningService.createPlanning(
      selectedProject,
      project.name,
      selectedWeeks,
      planningDescription
    );

    setAllPlannings(planningService.getAllPlannings());
    
    // Auto expandir el proyecto del nuevo planning
    setExpandedProjects(new Set([selectedProject]));
    
    setShowCreateDialog(false);
    setSelectedProject('');
    setSelectedWeeks([]);
    setPlanningDescription('');
  };

  const handleAddModules = () => {
    if (!selectedPlanning || selectedModules.size === 0) return;

    planningService.addModulesToPlanning(selectedPlanning.id, Array.from(selectedModules));
    
    // Actualizar datos
    setSelectedPlanning(planningService.getPlanningById(selectedPlanning.id) || null);
    setParticipants(planningService.getPlanningParticipants(selectedPlanning.id));
    setSummary(planningService.getPlanningSummary(selectedPlanning.id));
    setAllPlannings(planningService.getAllPlannings());
    
    setShowAddModulesDialog(false);
    setSelectedModules(new Set());
  };

  const handleRemoveModule = (moduleInstanceId: string) => {
    if (!selectedPlanning) return;
    
    planningService.removeModuleFromPlanning(selectedPlanning.id, moduleInstanceId);
    
    // Actualizar datos
    setSelectedPlanning(planningService.getPlanningById(selectedPlanning.id) || null);
    setParticipants(planningService.getPlanningParticipants(selectedPlanning.id));
    setSummary(planningService.getPlanningSummary(selectedPlanning.id));
    setAllPlannings(planningService.getAllPlannings());
  };

  const toggleExpand = (moduleId: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId);
    } else {
      newSet.add(moduleId);
    }
    setExpandedModules(newSet);
  };

  const formatWeeks = (weeks: string[]) => {
    if (!weeks || weeks.length === 0) return 'Sin semanas';
    if (weeks.length === 1) {
      const week = AVAILABLE_WEEKS.find(w => w.value === weeks[0]);
      return week?.fullLabel || weeks[0];
    }
    return `${weeks.length} semanas`;
  };

  // Obtener el rango de semanas para la vista Gantt
  const getWeekRange = () => {
    if (allPlannings.length === 0) return AVAILABLE_WEEKS.slice(4, 10); // Rango por defecto
    
    const allWeeks = new Set<string>();
    allPlannings.forEach(p => p.weeks.forEach(w => allWeeks.add(w)));
    
    return AVAILABLE_WEEKS.filter(w => allWeeks.has(w.value));
  };

  const weekRange = getWeekRange();

  // Vista Gantt
  const renderGanttView = () => {
    const projects = planningsByProject();
    
    return (
      <div className="space-y-4 overflow-x-auto">
        {/* Cabecera con semanas */}
        <div className="flex border-b sticky top-0 bg-background z-10">
          <div className="w-64 flex-shrink-0 p-2 font-medium">Proyecto / Planning</div>
          <div className="flex-1 flex">
            {weekRange.map(week => (
              <div key={week.value} className="flex-1 text-center p-2 text-sm font-medium border-l">
                {week.label}
              </div>
            ))}
          </div>
        </div>

        {/* Filas por proyecto */}
        {projects.map(project => (
          <div key={project.projectId} className="border rounded-lg">
            {/* Cabecera de proyecto */}
            <div 
              className="flex items-center gap-2 p-3 bg-muted/20 cursor-pointer"
              onClick={() => toggleProject(project.projectId)}
            >
              <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                {expandedProjects.has(project.projectId) ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </Button>
              <span className="font-semibold">{project.projectName}</span>
              <Badge variant="outline">{project.plannings.length} plannings</Badge>
            </div>

            {/* Plannings del proyecto */}
            {expandedProjects.has(project.projectId) && (
              <div className="pl-8 pr-2 pb-2 space-y-2">
                {project.plannings.map(planning => {
                  // Calcular posición en el timeline
                  const weekIndices = planning.weeks
                    .map(w => weekRange.findIndex(week => week.value === w))
                    .filter(i => i !== -1);
                  
                  const minIndex = Math.min(...weekIndices);
                  const maxIndex = Math.max(...weekIndices);
                  const span = maxIndex - minIndex + 1;

                  return (
                    <div key={planning.id} className="relative flex items-center py-1 group">
                      {/* Nombre del planning */}
                      <div className="w-56 flex-shrink-0 text-sm truncate pr-2">
                        <span className="font-medium">{planning.name}</span>
                        {planning.description && (
                          <span className="text-xs text-muted-foreground ml-1 truncate block">
                            {planning.description}
                          </span>
                        )}
                      </div>

                      {/* Timeline */}
                      <div className="flex-1 flex h-12">
                        {/* Semanas vacías antes del planning */}
                        {Array(minIndex).fill(0).map((_, i) => (
                          <div key={`before-${i}`} className="flex-1 border-l border-dashed" />
                        ))}

                        {/* Semanas del planning */}
                        <div 
                          className="relative cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ flex: span }}
                          onClick={() => setSelectedPlanning(planning)}
                        >
                          <div className={`
                            absolute inset-1 rounded-lg border-2 
                            ${planning.status === 'completado' ? 'bg-green-100 border-green-500' :
                              planning.status === 'en progreso' ? 'bg-blue-100 border-blue-500' :
                              'bg-gray-100 border-gray-300'}
                          `}>
                            <div className="absolute inset-0 flex items-center justify-between px-2">
                              <span className="text-xs font-medium truncate">
                                {planning.modules.length} módulos
                              </span>
                              <span className="text-xs">
                                {planning.modules.reduce((acc, m) => acc + m.estimatedHours, 0)}h
                              </span>
                            </div>
                            
                            {/* Barra de progreso */}
                            {planning.modules.length > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                                <div 
                                  className="h-full bg-green-500"
                                  style={{ 
                                    width: `${
                                      (planning.modules.filter(m => m.status === 'completado').length / 
                                      planning.modules.length) * 100
                                    }%` 
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Semanas después del planning */}
                        {Array(weekRange.length - maxIndex - 1).fill(0).map((_, i) => (
                          <div key={`after-${i}`} className="flex-1 border-l border-dashed" />
                        ))}
                      </div>

                      {/* Botón ver detalle (hover) */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedPlanning(planning)}
                      >
                        Ver detalle
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Vista Lista (la que ya teníamos)
  const renderListView = () => {
    const projects = planningsByProject();
    
    return (
      <div className="space-y-4">
        {projects.map(project => (
          <Card key={project.projectId}>
            <CardHeader className="pb-2">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleProject(project.projectId)}
              >
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                  {expandedProjects.has(project.projectId) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
                <CardTitle className="text-lg">{project.projectName}</CardTitle>
                <Badge variant="outline">{project.plannings.length} plannings</Badge>
              </div>
            </CardHeader>
            
            {expandedProjects.has(project.projectId) && (
              <CardContent>
                <div className="space-y-3">
                  {project.plannings.map(planning => (
                    <Card 
                      key={planning.id} 
                      className="cursor-pointer hover:border-primary transition-colors ml-6"
                      onClick={() => setSelectedPlanning(planning)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatWeeks(planning.weeks)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{planning.name}</p>
                            {planning.description && (
                              <p className="text-xs text-muted-foreground mb-2">📝 {planning.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>📦 {planning.modules.length} módulos</span>
                              <span>👥 {
                                new Set(planning.modules.flatMap(m => m.assignedUsers)).size
                              } participantes</span>
                              <span>⏱️ {
                                planning.modules.reduce((acc, m) => acc + m.estimatedHours, 0)
                              }h</span>
                            </div>
                          </div>
                          <Badge variant={
                            planning.status === 'completado' ? 'default' :
                            planning.status === 'en progreso' ? 'secondary' : 'outline'
                          }>
                            {planning.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  };

  // Si hay un planning seleccionado, mostrar su detalle
  if (selectedPlanning) {
    return (
      <div className="space-y-4">
        {/* Cabecera con navegación */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedPlanning(null)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a plannings
          </Button>
          <h2 className="text-2xl font-bold">{selectedPlanning.projectName}</h2>
        </div>

        {/* Cabecera del planning */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{selectedPlanning.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatWeeks(selectedPlanning.weeks)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FolderTree className="h-4 w-4" />
                    <span>{selectedPlanning.modules?.length || 0} módulos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{participants.length} participantes</span>
                  </div>
                </div>
                {selectedPlanning.description && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedPlanning.description}</p>
                )}
              </div>
              <Button onClick={() => setShowAddModulesDialog(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Agregar módulos
              </Button>
            </div>

            {selectedPlanning.modules && selectedPlanning.modules.length > 0 && summary && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progreso general</span>
                  <span className="font-medium">
                    {summary.completedHours}/{summary.totalHours}h ({summary.progress}%)
                  </span>
                </div>
                <Progress value={summary.progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Módulos en planning */}
          <Card>
            <CardHeader>
              <CardTitle>Módulos en este planning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {selectedPlanning.modules?.map(module => (
                <Card key={module.id} className="border-l-4" style={{ 
                  borderLeftColor: module.areaColor || '#ccc' 
                }}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{module.moduleName}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {module.taskCount} tareas
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {module.projectName}
                          </Badge>
                          {module.areaName && (
                            <Badge variant="outline" className="text-xs">
                              {module.areaName}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Tareas del módulo */}
                        <div className="mt-2 space-y-1">
                          {module.tasks.map(task => (
                            <div key={task.id} className="text-xs p-1 bg-muted/30 rounded flex justify-between">
                              <span>{task.taskName}</span>
                              <span className="font-medium">{task.estimatedHours}h</span>
                            </div>
                          ))}
                        </div>

                        {/* Usuarios asignados */}
                        <div className="flex items-center gap-1 mt-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <div className="flex -space-x-2">
                            {module.assignedUsers.slice(0, 5).map(userId => {
                              const user = users.find(u => u.id === userId);
                              return user ? (
                                <Avatar key={userId} className="h-5 w-5 border border-background">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="text-[8px]">
                                    {user.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                              ) : null;
                            })}
                            {module.assignedUsers.length > 5 && (
                              <Badge variant="outline" className="h-5 px-1 text-[8px]">
                                +{module.assignedUsers.length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => handleRemoveModule(module.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!selectedPlanning.modules || selectedPlanning.modules.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="mb-2">No hay módulos cargados</p>
                  <Button variant="link" onClick={() => setShowAddModulesDialog(true)}>
                    Agregar módulos al planning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participantes */}
          <Card>
            <CardHeader>
              <CardTitle>Participantes del planning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {participants.map(p => (
                <div key={p.userId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>{p.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{p.userName}</div>
                    <div className="text-xs text-muted-foreground">{p.userRole}</div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm">{p.totalHours}h asignadas</span>
                      <Badge variant="outline">
                        {p.modules.length} módulos
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No hay participantes</p>
                  <p className="text-sm">Los participantes aparecerán al agregar módulos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog agregar módulos */}
        <Dialog open={showAddModulesDialog} onOpenChange={setShowAddModulesDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Agregar módulos al planning</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Semanas: {formatWeeks(selectedPlanning.weeks)}
              </p>
            </DialogHeader>

            {/* Filtros */}
            <div className="flex gap-2 mb-4">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todos los proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas las áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  {areas.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                        {a.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Buscar módulos..."
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lista de módulos */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {availableModules.map(module => (
                <div key={module.id} className="border rounded-lg">
                  <div className="flex items-start gap-3 p-3 bg-muted/20">
                    <Checkbox
                      checked={selectedModules.has(module.id)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedModules);
                        if (checked) {
                          newSet.add(module.id);
                        } else {
                          newSet.delete(module.id);
                        }
                        setSelectedModules(newSet);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6"
                      onClick={() => toggleExpand(module.id)}
                    >
                      {expandedModules.has(module.id) ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </Button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{module.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {module.projectName}
                        </Badge>
                        {module.areaName && (
                          <Badge variant="outline" className="text-xs">
                            {module.areaName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{module.taskCount} tareas</span>
                        <span>{module.totalHours}h</span>
                        <span>{module.assignedUsers.length} participantes</span>
                      </div>
                    </div>
                  </div>

                  {expandedModules.has(module.id) && (
                    <div className="pl-12 pr-3 pb-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground mt-2">
                        Tareas del módulo:
                      </p>
                      {module.tasks.map((task: any) => (
                        <div key={task.id} className="text-sm p-2 border rounded bg-white">
                          <div className="flex justify-between">
                            <span>{task.taskName}</span>
                            <Badge variant="outline">{task.estimatedHours}h</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{task.assignedUsers.length} asignados</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter className="mt-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {selectedModules.size} módulos seleccionados
              </div>
              <Button variant="outline" onClick={() => {
                setShowAddModulesDialog(false);
                setSelectedModules(new Set());
              }}>
                Cancelar
              </Button>
              <Button onClick={handleAddModules} disabled={selectedModules.size === 0}>
                Agregar al planning
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Vista principal con selector de modo
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plannings</h2>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="mr-4">
            <TabsList>
              <TabsTrigger value="list">Vista Lista</TabsTrigger>
              <TabsTrigger value="gantt">Vista Timeline</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo planning
          </Button>
        </div>
      </div>

      {allPlannings.length > 0 ? (
        viewMode === 'gantt' ? renderGanttView() : renderListView()
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No hay plannings</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer planning para comenzar
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog crear planning */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo planning</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Proyecto
              </label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Semanas
              </label>
              <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                {AVAILABLE_WEEKS.map(week => (
                  <div key={week.value} className="flex items-center gap-2">
                    <Checkbox
                      id={week.value}
                      checked={selectedWeeks.includes(week.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedWeeks([...selectedWeeks, week.value]);
                        } else {
                          setSelectedWeeks(selectedWeeks.filter(w => w !== week.value));
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
              <label className="text-sm font-medium mb-1 block">
                Descripción (opcional)
              </label>
              <Textarea
                placeholder="Ej: Sprint 12 - Implementación de módulo de usuarios"
                value={planningDescription}
                onChange={(e) => setPlanningDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setSelectedProject('');
              setSelectedWeeks([]);
              setPlanningDescription('');
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreatePlanning}
              disabled={!selectedProject || selectedWeeks.length === 0}
            >
              Crear planning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}