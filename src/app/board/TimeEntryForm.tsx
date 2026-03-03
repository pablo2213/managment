'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Plus, Save, X } from 'lucide-react';
import { TimeEntry } from '@/lib/data';

interface TimeEntryFormProps {
  taskId: string;
  onSave: (entry: Omit<TimeEntry, 'id'>) => void;
  onCancel: () => void;
}

export function TimeEntryForm({ taskId, onSave, onCancel }: TimeEntryFormProps) {
  const [entry, setEntry] = useState({
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    userId: 'u1', // En un sistema real, vendría del usuario autenticado
    userName: 'Usuario Actual',
  });

  const handleSubmit = () => {
    if (entry.hours <= 0) return;
    onSave({
      taskId,
      ...entry,
    });
  };

  return (
    <Card className="p-3 bg-muted/30">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Registrar tiempo</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Horas</label>
            <Input
              type="number"
              value={entry.hours}
              onChange={(e) => setEntry({ ...entry, hours: Number(e.target.value) })}
              min={0.5}
              max={24}
              step={0.5}
              className="h-8"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
            <Input
              type="date"
              value={entry.date}
              onChange={(e) => setEntry({ ...entry, date: e.target.value })}
              className="h-8"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Descripción (opcional)</label>
          <Textarea
            value={entry.description}
            onChange={(e) => setEntry({ ...entry, description: e.target.value })}
            placeholder="¿Qué se hizo en este tiempo?"
            className="h-16 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-1" />
            Guardar tiempo
          </Button>
        </div>
      </div>
    </Card>
  );
}