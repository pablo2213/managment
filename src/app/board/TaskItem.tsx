'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar, Clock, User, Edit2, Trash2, CheckCircle2,
  AlertTriangle, Plus, History, ChevronDown, ChevronUp,
  ListChecks
} from 'lucide-react';
import { Task, Subtask, TimeEntry } from '@/lib/data';
import { priorityColors } from '@/lib/utils';
import { TimeEntryForm } from './TimeEntryForm';
import { TimeEntryList } from './TimeEntryList';
import { SubtaskList } from './SubtaskList';

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onAddTimeEntry: (taskId: string, entry: Omit<TimeEntry, 'id'>) => void;
}

export function TaskItem({ task, onUpdate, onDelete, onAddTimeEntry }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [showTimeHistory, setShowTimeHistory] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showAddSubtaskInput, setShowAddSubtaskInput] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    if (editedTask.status === 'completed' && task.status !== 'completed') {
      editedTask.completedAt = new Date().toISOString().split('T')[0];
    }
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  // Función para agregar subtarea
  const handleAddSubtask = () => {
    if (!newSubtaskName.trim()) return;

    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newSubtaskName,
      completed: false,
    };

    const currentSubtasks = task.subtasks || [];
    onUpdate(task.id, { subtasks: [...currentSubtasks, newSubtask] });

    setNewSubtaskName('');
    if (!task.subtasks || task.subtasks.length === 0) {
      setShowAddSubtaskInput(false);
    }
  };

  // ============================================
  // NUEVA FUNCIÓN PARA ELIMINAR TIME ENTRY
  // ============================================
  const handleDeleteTimeEntry = (entryId: string) => {
    if (!task.timeEntries) return;
    
    const updatedTimeEntries = task.timeEntries.filter(e => e.id !== entryId);
    const totalActualHours = updatedTimeEntries.reduce((acc, e) => acc + e.hours, 0);
    
    onUpdate(task.id, { 
      timeEntries: updatedTimeEntries,
      actualHours: totalActualHours 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask();
    }
  };

  const totalHours = task.timeEntries?.reduce((acc, entry) => acc + entry.hours, 0) || task.actualHours;
  const subtasksCompleted = task.subtasks?.filter(st => st.completed).length || 0;
  const subtasksTotal = task.subtasks?.length || 0;

  if (isEditing) {
    return (
      <Card className="p-4 border-2 border-primary/20">
        <div className="space-y-3">
          <Input
            value={editedTask.name}
            onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
            placeholder="Nombre de la tarea"
            className="font-medium"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Estado</label>
              <Select
                value={editedTask.status}
                onValueChange={(value: any) => setEditedTask({ ...editedTask, status: value })}
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
                value={editedTask.priority}
                onValueChange={(value: any) => setEditedTask({ ...editedTask, priority: value })}
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
                value={editedTask.estimatedHours}
                onChange={(e) => setEditedTask({ ...editedTask, estimatedHours: Number(e.target.value) })}
                min={0}
                step={0.5}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Horas registradas</label>
              <div className="h-10 px-3 py-2 rounded-md border bg-muted text-sm flex items-center">
                {totalHours}h
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Asignado a</label>
            <Input
              value={editedTask.assignedTo || ''}
              onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
              placeholder="Nombre del responsable"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{task.name}</span>
            <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
              {task.priority === 'critical' ? 'Crítica' :
                task.priority === 'high' ? 'Alta' :
                  task.priority === 'medium' ? 'Media' : 'Baja'}
            </Badge>
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

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className={totalHours > task.estimatedHours ? 'text-red-500 font-medium' : ''}>
                {totalHours}/{task.estimatedHours}h
              </span>
            </span>
            {task.assignedTo && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {task.assignedTo}
              </span>
            )}
            {task.completedAt && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {new Date(task.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Subtareas existentes */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs w-full justify-start"
                onClick={() => setShowSubtasks(!showSubtasks)}
              >
                <ListChecks className="h-3 w-3 mr-2" />
                Subtareas ({subtasksCompleted}/{subtasksTotal})
                {showSubtasks ? <ChevronUp className="h-3 w-3 ml-2" /> : <ChevronDown className="h-3 w-3 ml-2" />}
              </Button>

              {showSubtasks && (
                <div className="mt-2 pl-2 border-l-2 border-muted">
                  <SubtaskList
                    subtasks={task.subtasks}
                    onChange={(newSubtasks) => {
                      onUpdate(task.id, { subtasks: newSubtasks });
                    }}
                  />

                  {/* Input para nueva subtarea - SIEMPRE VISIBLE cuando hay subtareas */}
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      value={newSubtaskName}
                      onChange={(e) => setNewSubtaskName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSubtask();
                        }
                      }}
                      placeholder="Nueva subtarea..."
                      className="h-8 text-sm flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddSubtask}
                      className="h-8"
                      disabled={!newSubtaskName.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Si NO hay subtareas, mostrar botón que abre input */}
          {(!task.subtasks || task.subtasks.length === 0) && (
            <div className="mt-2">
              {!showAddSubtaskInput ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowAddSubtaskInput(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar subtareas
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSubtask();
                      }
                    }}
                    placeholder="Nombre de la subtarea..."
                    className="h-8 text-sm flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleAddSubtask}
                    className="h-8"
                    disabled={!newSubtaskName.trim()}
                  >
                    Agregar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddSubtaskInput(false);
                      setNewSubtaskName('');
                    }}
                    className="h-8"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción de tiempo */}
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowTimeForm(!showTimeForm)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Registrar tiempo
            </Button>
            {task.timeEntries && task.timeEntries.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowTimeHistory(!showTimeHistory)}
              >
                <History className="h-3 w-3 mr-1" />
                Ver historial ({task.timeEntries.length})
              </Button>
            )}
          </div>

          {/* Formulario de registro de tiempo */}
          {showTimeForm && (
            <div className="mt-3">
              <TimeEntryForm
                taskId={task.id}
                onSave={(entry) => {
                  onAddTimeEntry(task.id, entry);
                  setShowTimeForm(false);
                }}
                onCancel={() => setShowTimeForm(false)}
              />
            </div>
          )}

          {/* Historial de tiempos - AHORA CON FUNCIÓN PARA ELIMINAR */}
          {showTimeHistory && task.timeEntries && (
            <div className="mt-3">
              <TimeEntryList 
                entries={task.timeEntries} 
                onDeleteEntry={handleDeleteTimeEntry}  // ← NUEVO
              />
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(task.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}