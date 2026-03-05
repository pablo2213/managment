'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  Calendar, Clock, AlertTriangle, Sparkles, User, Link2,
  Plus, Edit2, Trash2, Building2, Star, Users
} from 'lucide-react';
import { Module, Task, projects, modules, tasks as initialTasks, TimeEntry, users, areas } from '@/lib/data';
import {
  getDelayDays,
  formatDelay,
  getProjectCompletionType,
  priorityColors,
  getModuleActualHours,
  recalculateModuleFromTasks
} from '@/lib/utils';
import { TaskItem } from '@/app/board/TaskItem';
import { ModuleInfoForm } from '@/app/board/ModuleInfoForm';
import { UserSelector } from '@/components/board/UserSelector';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ModuleModalProps {
  module: Module | null;
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTasksUpdate?: (moduleId: string, updatedTasks: Task[]) => void;
  onModuleUpdate?: (moduleId: string, updatedModule: Partial<Module>) => void;
  onModuleDelete?: (moduleId: string) => void;
  currentUserId?: string;
}

export function ModuleModal({
  module,
  tasks,
  open,
  onOpenChange,
  onTasksUpdate,
  onModuleUpdate,
  onModuleDelete,
  currentUserId
}: ModuleModalProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [actualHours, setActualHours] = useState<number>(0);
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    description: '',
    estimatedHours: 0,
    status: 'pending',
    priority: 'medium',
    assignedTo: [],
    timeEntries: [],
  });

  // Actualizar localTasks cuando cambian las tasks prop
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Recalcular horas cada vez que cambian localTasks
  useEffect(() => {
    if (module && Array.isArray(localTasks)) {
      const actual = getModuleActualHours(module.id, localTasks);
      setActualHours(actual);

      const estimated = localTasks
        .filter(t => t.moduleId === module.id)
        .reduce((acc, t) => acc + t.estimatedHours, 0);
      setEstimatedHours(estimated);
    } else {
      setActualHours(0);
      setEstimatedHours(0);
    }
  }, [localTasks, module]);

  if (!module) return null;

  const project = projects.find(p => p.id === module.projectId);
  const delayDays = getDelayDays(module.endDate, module.progress);
  const isDelayed = delayDays > 0 && module.status !== 'completed';
  const isProjectCompleted = project?.status === 'completed';
  const completionType = isProjectCompleted && project ? getProjectCompletionType(project) : null;

  const hourDeviation = estimatedHours > 0
    ? Math.round((actualHours / estimatedHours) * 100)
    : 0;
  const isOverBudget = actualHours > estimatedHours;

  // Estadísticas de tareas
  const totalTasks = localTasks.length;
  const completedTasks = localTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = localTasks.filter(t => t.status === 'in-progress').length;
  const blockedTasks = localTasks.filter(t => t.status === 'blocked').length;
  const pendingTasks = localTasks.filter(t => t.status === 'pending').length;
  const reviewTasks = localTasks.filter(t => t.status === 'review').length;

  // Tareas asignadas al usuario actual
  const myTasks = localTasks.filter(t => t.assignedTo?.includes(currentUserId || ''));

  // Obtener datos del área y líder
  const area = module.areaId ? areas.find(a => a.id === module.areaId) : null;
  const leadUser = module.leadId ? users.find(u => u.id === module.leadId) : null;
  const assignedUsers = module.assignedUsers
    ? users.filter(u => module.assignedUsers?.includes(u.id))
    : [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // ============================================
  // FUNCIÓN PARA RECALCULAR Y ACTUALIZAR MÓDULO
  // ============================================
  const recalcAndUpdateModule = (updatedTasks: Task[]) => {
    const { progress } = recalculateModuleFromTasks(module.id, updatedTasks);
    onModuleUpdate?.(module.id, { progress });
  };

  // ============================================
  // FUNCIÓN PARA ELIMINAR MÓDULO
  // ============================================
  const handleDeleteModule = () => {
    onModuleDelete?.(module.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  // ============================================
  // CRUD DE TAREAS
  // ============================================

  const handleCreateTask = () => {
    if (!newTask.name) return;

    const assignedUsersData = users.filter(u => newTask.assignedTo?.includes(u.id));
    const assignedToNames = assignedUsersData.map(u => u.name);

    const task: Task = {
      id: `task-${Date.now()}`,
      moduleId: module.id,
      name: newTask.name,
      description: newTask.description || '',
      estimatedHours: newTask.estimatedHours || 0,
      actualHours: 0,
      status: newTask.status as any || 'pending',
      priority: newTask.priority as any || 'medium',
      assignedTo: newTask.assignedTo || [],
      assignedToNames: assignedToNames,
      createdAt: new Date().toISOString().split('T')[0],
      timeEntries: [],
    };

    const updatedTasks = [...localTasks, task];
    setLocalTasks(updatedTasks);
    onTasksUpdate?.(module.id, updatedTasks);

    recalcAndUpdateModule(updatedTasks);

    setShowNewTaskForm(false);
    setNewTask({
      name: '',
      description: '',
      estimatedHours: 0,
      status: 'pending',
      priority: 'medium',
      assignedTo: [],
      timeEntries: [],
    });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = localTasks.map(task =>
      task.id === taskId ? {
        ...task,
        ...updates,
        completedAt: updates.status === 'completed' && !task.completedAt
          ? new Date().toISOString().split('T')[0]
          : task.completedAt
      } : task
    );

    setLocalTasks(updatedTasks);
    onTasksUpdate?.(module.id, updatedTasks);

    recalcAndUpdateModule(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = localTasks.filter(task => task.id !== taskId);
    setLocalTasks(updatedTasks);
    onTasksUpdate?.(module.id, updatedTasks);

    recalcAndUpdateModule(updatedTasks);
  };

  const handleAddTimeEntry = (taskId: string, entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: `te-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedTasks = localTasks.map(task => {
      if (task.id === taskId) {
        const timeEntries = [...(task.timeEntries || []), newEntry];
        const totalActualHours = timeEntries.reduce((acc, e) => acc + e.hours, 0);
        return {
          ...task,
          timeEntries,
          actualHours: totalActualHours,
        };
      }
      return task;
    });

    setLocalTasks(updatedTasks);
    onTasksUpdate?.(module.id, updatedTasks);

    recalcAndUpdateModule(updatedTasks);
  };

  const handleModuleSave = (updatedModule: Partial<Module>) => {
    onModuleUpdate?.(module.id, {
      name: updatedModule.name,
      description: updatedModule.description,
      priority: updatedModule.priority,
      startDate: updatedModule.startDate,
      endDate: updatedModule.endDate,
      assignedTeam: updatedModule.assignedTeam,
      assignedUsers: updatedModule.assignedUsers,
      areaId: updatedModule.areaId,
      leadId: updatedModule.leadId,
    });
    setIsEditingModule(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl flex items-center gap-2 flex-wrap">
                {module.name}
                <Badge variant="outline" className={`text-xs ${priorityColors[module.priority]}`}>
                  {module.priority === 'critical' ? 'Crítica' :
                    module.priority === 'high' ? 'Alta' :
                      module.priority === 'medium' ? 'Media' : 'Baja'} prioridad
                </Badge>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingModule(!isEditingModule)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogDescription>
              {module.description || 'Sin descripción'}
            </DialogDescription>

            {/* Badges de estado */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={
                module.status === 'completed' ? 'default' :
                  module.status === 'in-progress' ? 'secondary' :
                    module.status === 'blocked' ? 'destructive' :
                      module.status === 'on-hold' ? 'outline' : 'secondary'
              }>
                {module.status === 'completed' ? 'Completado' :
                  module.status === 'in-progress' ? 'En progreso' :
                    module.status === 'blocked' ? 'Bloqueado' :
                      module.status === 'on-hold' ? 'En espera' : 'Pendiente'}
              </Badge>

              {isDelayed && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formatDelay(delayDays)}
                </Badge>
              )}

              {isProjectCompleted && completionType === 'early' && (
                <Badge variant="default" className="bg-green-500">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Proyecto anticipado
                </Badge>
              )}
            </div>

            {/* Indicador de tareas asignadas al usuario actual */}
            {myTasks.length > 0 && (
              <div className="mt-2 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                Tienes {myTasks.length} tarea(s) asignada(s) en este módulo
              </div>
            )}
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Información del Módulo</TabsTrigger>
              <TabsTrigger value="tasks">
                Tareas ({localTasks.length})
                {myTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1">
                    {myTasks.length} mías
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Información del Módulo */}
            <TabsContent value="info" className="space-y-4 mt-4">
              {isEditingModule ? (
                <ModuleInfoForm
                  module={module}
                  onSave={handleModuleSave}
                  onCancel={() => setIsEditingModule(false)}
                  availableModules={modules} // ← Pasar todos los módulos del proyecto
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* Columna izquierda */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Progreso</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completado</span>
                          <span className={isDelayed ? 'text-red-500 font-medium' : ''}>
                            {module.progress}%
                          </span>
                        </div>
                        <Progress value={module.progress} className={`h-2 ${isDelayed ? 'bg-red-100' : ''}`} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Horas</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">Estimadas (de tareas)</div>
                          <div className="text-lg font-semibold">{estimatedHours}h</div>
                        </div>
                        <div className="bg-muted/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">Reales (Time Entries)</div>
                          <div className={`text-lg font-semibold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                            {actualHours}h
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Eficiencia: </span>
                        <span className={isOverBudget ? 'text-red-500' : 'text-green-500'}>
                          {hourDeviation}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Fechas</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Inicio: {new Date(module.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Fin: {new Date(module.endDate).toLocaleDateString()}</span>
                          {isDelayed && (
                            <span className="text-xs text-red-500">(retrasado)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-4">
                    {/* Área responsable */}
                    {area && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Área responsable
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: area.color }}
                          />
                          <span className="font-medium">{area.name}</span>
                          <span className="text-xs text-muted-foreground">· {area.description}</span>
                        </div>
                      </div>
                    )}

                    {/* Líder del módulo */}
                    {leadUser && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Líder del módulo
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={leadUser.avatar} />
                            <AvatarFallback>{getInitials(leadUser.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{leadUser.name}</span>
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              {leadUser.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Equipo asignado al módulo */}
                    {assignedUsers.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Equipo del módulo ({assignedUsers.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {assignedUsers.map(user => {
                            const userArea = areas.find(a => a.id === user.areaId);
                            return (
                              <Badge
                                key={user.id}
                                variant="outline"
                                className="flex items-center gap-1 px-2 py-1"
                                style={{ borderLeftColor: userArea?.color, borderLeftWidth: '3px' }}
                              >
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="text-[8px]">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{user.name}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Dependencias */}
                    {module.dependencies && module.dependencies.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Dependencias</h3>
                        <div className="space-y-1">
                          {module.dependencies.map(depId => {
                            const depModule = modules.find(m => m.id === depId);
                            return depModule ? (
                              <div key={depId} className="flex items-center gap-2 text-sm">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                <span>{depModule.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {depModule.status}
                                </Badge>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Proyecto */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Proyecto</h3>
                      <div className="text-sm">
                        <p className="font-medium">{project?.name}</p>
                        <p className="text-xs text-muted-foreground">{project?.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: Tareas */}
            <TabsContent value="tasks" className="space-y-4 mt-4">
              {/* Estadísticas de tareas */}
              <div className="grid grid-cols-5 gap-2">
                <div className="bg-green-500/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Completadas</div>
                  <div className="text-lg font-semibold text-green-500">{completedTasks}</div>
                </div>
                <div className="bg-blue-500/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">En progreso</div>
                  <div className="text-lg font-semibold text-blue-500">{inProgressTasks}</div>
                </div>
                <div className="bg-yellow-500/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Revisión</div>
                  <div className="text-lg font-semibold text-yellow-500">{reviewTasks}</div>
                </div>
                <div className="bg-red-500/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Bloqueadas</div>
                  <div className="text-lg font-semibold text-red-500">{blockedTasks}</div>
                </div>
                <div className="bg-gray-500/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Pendientes</div>
                  <div className="text-lg font-semibold text-gray-500">{pendingTasks}</div>
                </div>
              </div>

              <Separator />
              {showNewTaskForm ? '' : (
                <Button
                  onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Tarea
                </Button>
              )}
              {showNewTaskForm && (
                <Card className="p-4 border-2 border-primary/20">
                  <div className="space-y-3">
                    <Input
                      value={newTask.name}
                      onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                      placeholder="Nombre de la tarea"
                      className="font-medium"
                    />

                    <Textarea
                      value={newTask.description || ''}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Descripción de la tarea (opcional)"
                      rows={2}
                      className="text-sm"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Estado</label>
                        <Select
                          value={newTask.status}
                          onValueChange={(value: any) => setNewTask({ ...newTask, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="in-progress">En progreso</SelectItem>
                            <SelectItem value="review">Revisión</SelectItem>
                            <SelectItem value="completed">Completada</SelectItem>
                            <SelectItem value="blocked">Bloqueada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Prioridad</label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="critical">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Asignar a</label>
                      <UserSelector
                        selectedUsers={newTask.assignedTo || []}
                        onChange={(userIds) => setNewTask({ ...newTask, assignedTo: userIds })}
                        placeholder="Seleccionar responsables..."
                        showAreaFilter={true}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Horas estimadas</label>
                      <Input
                        type="number"
                        value={newTask.estimatedHours}
                        onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                        min={0}
                        step={0.5}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Las horas reales se registrarán mediante time entries
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => setShowNewTaskForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="default"
                        onClick={handleCreateTask}
                        className="flex-1 bg-primary hover:bg-primary/90"
                        disabled={!newTask.name?.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Tarea
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {localTasks.length > 0 ? (
                  localTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      onAddTimeEntry={handleAddTimeEntry}
                      currentUserId={currentUserId}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay tareas asignadas a este módulo. ¡Crea una nueva!
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              ¿Eliminar módulo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el módulo <span className="font-bold">{module?.name}</span> y todas sus tareas asociadas.
              <br /><br />
              <span className="text-red-500">Esta acción no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteModule} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}