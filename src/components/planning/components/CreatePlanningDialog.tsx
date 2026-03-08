'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Link2 } from 'lucide-react';
import { projects } from '@/lib/data';
import * as planningService from '@/lib/planningSimple';

interface CreatePlanningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanningCreated: () => void;
  availableWeeks: Array<{ value: string; label: string; fullLabel: string }>;
  allPlannings: planningService.Planning[];
}

export function CreatePlanningDialog({
  open,
  onOpenChange,
  onPlanningCreated,
  availableWeeks,
  allPlannings
}: CreatePlanningDialogProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [planningDescription, setPlanningDescription] = useState('');
  const [previousPlanning, setPreviousPlanning] = useState<string>('none');
  const [dependsOn, setDependsOn] = useState<string[]>([]);

  const handleCreatePlanning = () => {
    if (!selectedProject || selectedWeeks.length === 0) return;

    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    planningService.createPlanningWithContinuation(
      selectedProject,
      project.name,
      selectedWeeks,
      planningDescription,
      previousPlanning !== 'none' ? previousPlanning : undefined,
      dependsOn.length > 0 ? dependsOn : undefined
    );

    onPlanningCreated();
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedProject('');
    setSelectedWeeks([]);
    setPlanningDescription('');
    setPreviousPlanning('none');
    setDependsOn([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nuevo planning</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Proyecto */}
          <div>
            <Label className="text-sm font-medium mb-1 block">
              Proyecto
            </Label>
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

          {/* Semanas */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Semanas
            </Label>
            <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
              {availableWeeks.map(week => (
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

          {/* Planning anterior (continuidad) */}
          <div>
            <Label className="text-sm font-medium mb-1 block">
              ¿Continúa algún planning anterior?
            </Label>
            <Select value={previousPlanning} onValueChange={setPreviousPlanning}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar planning anterior (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno (planning nuevo)</SelectItem>
                {allPlannings
                  .filter(p => p.projectId === selectedProject && p.status !== 'completado')
                  .map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.status})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dependencias */}
          <div>
            <Label className="text-sm font-medium mb-1 block flex items-center gap-1">
              <Link2 className="h-4 w-4" />
              Dependencias (plannings que deben completarse antes)
            </Label>
            <div className="border rounded-lg p-3 max-h-[150px] overflow-y-auto space-y-2">
              {allPlannings
                .filter(p => p.projectId === selectedProject && p.id !== previousPlanning)
                .map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`dep-${p.id}`}
                      checked={dependsOn.includes(p.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setDependsOn([...dependsOn, p.id]);
                        } else {
                          setDependsOn(dependsOn.filter(id => id !== p.id));
                        }
                      }}
                    />
                    <label htmlFor={`dep-${p.id}`} className="text-sm cursor-pointer flex-1">
                      {p.name} ({p.status})
                    </label>
                  </div>
                ))}
              {allPlannings.filter(p => p.projectId === selectedProject).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No hay otros plannings en este proyecto
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label className="text-sm font-medium mb-1 block">
              Descripción (opcional)
            </Label>
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
            onOpenChange(false);
            resetForm();
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
  );
}