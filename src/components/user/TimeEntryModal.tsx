'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, Calendar } from 'lucide-react';
import { users, tasks, TimeEntry } from '@/lib/data';

interface TimeEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  userId: string;
  onSave: (updatedTask: any) => void;
}

export function TimeEntryModal({ open, onOpenChange, task, userId, onSave }: TimeEntryModalProps) {
  const [hours, setHours] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');

  const user = users.find(u => u.id === userId);

  const hoursLogged = task.timeEntries?.reduce((acc, e) => acc + e.hours, 0) || 0;
  const remaining = Math.max(0, task.estimatedHours - hoursLogged);

  const handleSubmit = () => {
    if (hours <= 0) return;

    const newEntry: TimeEntry = {
      id: `te-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      taskId: task.id,
      userId,
      userName: user?.name || 'Usuario',
      hours,
      date,
      description: description || undefined,
    };

    const currentTimeEntries = task.timeEntries || [];
    const updatedTimeEntries = [...currentTimeEntries, newEntry];
    
    const totalActualHours = updatedTimeEntries.reduce((acc, e) => acc + e.hours, 0);
    
    const updatedTask = {
      ...task,
      timeEntries: updatedTimeEntries,
      actualHours: totalActualHours,
    };

    const taskIndex = tasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      tasks[taskIndex] = updatedTask;
    }

    onSave(updatedTask);
    setHours(0);
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registrar horas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tarea */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-medium">{task.name}</p>
          </div>

          {/* Resumen de horas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-2 rounded text-center">
              <div className="text-xs text-muted-foreground">Registradas</div>
              <div className="text-lg font-bold">{hoursLogged}h</div>
            </div>
            <div className="bg-muted/30 p-2 rounded text-center">
              <div className="text-xs text-muted-foreground">Estimadas</div>
              <div className="text-lg font-bold">{task.estimatedHours}h</div>
            </div>
          </div>

          <div className="bg-blue-50 p-2 rounded text-center border border-blue-200">
            <span className="text-sm text-blue-700">Disponibles hoy: </span>
            <span className="text-lg font-bold text-blue-700">{remaining}h</span>
          </div>

          {/* Formulario */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hours">Horas</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0.5}
                  max={remaining}
                  step={0.5}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="date">Fecha</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="¿Qué trabajaste en este tiempo?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Resumen de registros anteriores */}
          {task.timeEntries && task.timeEntries.length > 0 && (
            <div className="mt-2 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Registros anteriores ({task.timeEntries.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                {task.timeEntries.slice(-3).map(entry => (
                  <div key={entry.id} className="flex justify-between text-muted-foreground">
                    <span>{entry.date}</span>
                    <span className="font-medium">{entry.hours}h</span>
                  </div>
                ))}
                {task.timeEntries.length > 3 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    +{task.timeEntries.length - 3} registros más
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={hours <= 0}>
            Registrar {hours > 0 ? `${hours}h` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}