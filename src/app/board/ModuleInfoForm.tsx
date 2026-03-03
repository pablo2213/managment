'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { Module } from '@/lib/data';

interface ModuleInfoFormProps {
  module: Module;
  onSave: (updatedModule: Partial<Module>) => void;
  onCancel: () => void;
}

export function ModuleInfoForm({ module, onSave, onCancel }: ModuleInfoFormProps) {
  const [editedModule, setEditedModule] = useState({
    name: module.name,
    description: module.description || '',
    estimatedHours: module.estimatedHours,
    startDate: module.startDate,
    endDate: module.endDate,
    priority: module.priority,
    assignedTeam: module.assignedTeam || '',
  });

  const handleSubmit = () => {
    onSave({
      name: editedModule.name,
      description: editedModule.description,
      priority: editedModule.priority,
      estimatedHours: editedModule.estimatedHours,
      startDate: editedModule.startDate,
      endDate: editedModule.endDate,
      assignedTeam: editedModule.assignedTeam,
    });
  };

  return (
    <Card className="p-4 border-2 border-primary/20 mt-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Editar información del módulo</h3>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Nombre del módulo</label>
          <Input
            value={editedModule.name}
            onChange={(e) => setEditedModule({ ...editedModule, name: e.target.value })}
            placeholder="Nombre"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Descripción</label>
          <Textarea
            value={editedModule.description}
            onChange={(e) => setEditedModule({ ...editedModule, description: e.target.value })}
            placeholder="Descripción del módulo"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Prioridad</label>
            <Select
              value={editedModule.priority}
              onValueChange={(value: any) => setEditedModule({ ...editedModule, priority: value })}
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

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Horas estimadas</label>
            <Input
              type="number"
              value={editedModule.estimatedHours}
              onChange={(e) => setEditedModule({ ...editedModule, estimatedHours: Number(e.target.value) })}
              min={0}
              step={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fecha de inicio</label>
            <Input
              type="date"
              value={editedModule.startDate}
              onChange={(e) => setEditedModule({ ...editedModule, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fecha de fin</label>
            <Input
              type="date"
              value={editedModule.endDate}
              onChange={(e) => setEditedModule({ ...editedModule, endDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Equipo asignado</label>
          <Input
            value={editedModule.assignedTeam}
            onChange={(e) => setEditedModule({ ...editedModule, assignedTeam: e.target.value })}
            placeholder="Nombre del equipo"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-1" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </Card>
  );
}