'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, AlertTriangle, Sparkles, User, Link2, Plus, Edit2, Trash2 } from 'lucide-react'; // ← AÑADIDO Trash2
import { Module, Task, projects, modules, tasks as initialTasks, TimeEntry } from '@/lib/data';
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
import {
  AlertDialog,  // ← NUEVO
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
  onModuleDelete?: (moduleId: string) => void; // ← NUEVO
}

export function ModuleModal({
  module,
  tasks,
  open,
  onOpenChange,
  onTasksUpdate,
  onModuleUpdate,
  onModuleDelete // ← NUEVO
}: ModuleModalProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [actualHours, setActualHours] = useState<number>(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // ← NUEVO
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    estimatedHours: 0,
    actualHours: 0,
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    timeEntries: [],
  });

  // Actualizar localTasks cuando cambian las tasks prop
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Recalcular horas reales cada vez que cambian localTasks
  useEffect(() => {
    if (module && Array.isArray(localTasks)) {
      const hours = getModuleActualHours(module.id, localTasks);
      setActualHours(hours);
    } else {
      setActualHours(0);
    }
  }, [localTasks, module]);

  if (!module) return null;

  const project = projects.find(p => p.id === module.projectId);
  const delayDays = getDelayDays(module.endDate, module.progress);
  const isDelayed = delayDays > 0 && module.status !== 'completed';
  const isProjectCompleted = project?.status === 'completed';
  const completionType = isProjectCompleted && project ? getProjectCompletionType(project) : null;

  const hourDeviation = module.estimatedHours > 0
    ? Math.round((actualHours / module.estimatedHours) * 100)
    : 0;
  const isOverBudget = actualHours > module.estimatedHours;

  // Estadísticas de tareas
  const totalTasks = localTasks.length;
  const completedTasks = localTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = localTasks.filter(t => t.status === 'in-progress').length;
  const blockedTasks = localTasks.filter(t => t.status === 'blocked').length;
  const pendingTasks = localTasks.filter(t => t.status === 'pending').length;
  const reviewTasks = localTasks.filter(t => t.status === 'review').length;

  // ============================================
  // FUNCIÓN PARA RECALCULAR Y ACTUALIZAR MÓDULO
  // ============================================
  const recalcAndUpdateModule = (updatedTasks: Task[]) => {
    const { progress } = recalculateModuleFromTasks(module.id, updatedTasks);
    onModuleUpdate?.(module.id, { progress });
  };

  // ============================================
  // FUNCIÓN PARA ELIMINAR MÓDULO (NUEVA)
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

    const task: Task = {
      id: `task-${Date.now()}`,
      moduleId: module.id,
      name: newTask.name,
      estimatedHours: newTask.estimatedHours || 0,
      actualHours: newTask.actualHours || 0,
      status: newTask.status as any || 'pending',
      priority: newTask.priority as any || 'medium',
      assignedTo: newTask.assignedTo,
      createdAt: new Date().toISOString().split('T')[0],
      timeEntries: [],
    };

    const updatedTasks = [...localTasks, task];
    setLocalTasks(updatedTasks);
    onTasksUpdate?.(module.id, updatedTasks);

    // Recalcular y actualizar el módulo
    recalcAndUpdateModule(updatedTasks);

    setShowNewTaskForm(false);
    setNewTask({
      name: '',
      estimatedHours: 0,
      actualHours: 0,
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
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

    // Recalcular y actualizar el módulo
    recalcAndUpdateModule(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = localTasks.filter(task => task.id !== taskId);
    setLocalTasks(updatedTasks);
    onTasksUpdate?.(module.id, updatedTasks);

    // Recalcular y actualizar el módulo
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

    // Recalcular y actualizar el módulo
    recalcAndUpdateModule(updatedTasks);
  };

const handleModuleSave = (updatedModule: Partial<Module>) => {
  // Asegurar que se pasan todos los campos necesarios
  onModuleUpdate?.(module.id, {
    name: updatedModule.name,
    description: updatedModule.description,
    priority: updatedModule.priority,
    estimatedHours: updatedModule.estimatedHours,
    startDate: updatedModule.startDate,
    endDate: updatedModule.endDate,
    assignedTeam: updatedModule.assignedTeam,
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
              <div className="flex items-center gap-2"> {/* ← MODIFICADO: grupo de botones */}
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
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Información del Módulo</TabsTrigger>
              <TabsTrigger value="tasks">
                Tareas ({localTasks.length})
              </TabsTrigger>
            </TabsList>

          {/* TAB 1: Información del Módulo */}
          <TabsContent value="info" className="space-y-4 mt-4">
            {isEditingModule ? (
              <ModuleInfoForm
                module={module}
                onSave={handleModuleSave}
                onCancel={() => setIsEditingModule(false)}
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
                        <div className="text-xs text-muted-foreground">Estimadas</div>
                        <div className="text-lg font-semibold">{module.estimatedHours}h</div>
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
                  {module.assignedTeam && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Equipo asignado</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{module.assignedTeam}</span>
                      </div>
                    </div>
                  )}

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

            <Button
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showNewTaskForm ? 'Cancelar' : 'Nueva Tarea'}
            </Button>

            {showNewTaskForm && (
              <Card className="p-4 border-2 border-primary/20">
                <div className="space-y-3">
                  <Input
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    placeholder="Nombre de la tarea"
                    className="font-medium"
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Horas estimadas</label>
                      <Input
                        type="number"
                        value={newTask.estimatedHours}
                        onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                        min={0}
                        step={0.5}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Horas reales</label>
                      <Input
                        type="number"
                        value={newTask.actualHours}
                        onChange={(e) => setNewTask({ ...newTask, actualHours: Number(e.target.value) })}
                        min={0}
                        step={0.5}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Asignado a</label>
                    <Input
                      value={newTask.assignedTo || ''}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      placeholder="Nombre del responsable"
                    />
                  </div>

                  <Button onClick={handleCreateTask} className="w-full">
                    Crear Tarea
                  </Button>
                </div>
              </Card>
            )}

            {/* Lista de tareas */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {localTasks.length > 0 ? (
                localTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    onAddTimeEntry={handleAddTimeEntry}
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

    {/* Diálogo de confirmación para eliminar módulo (NUEVO) */}
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