'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderTree, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { areas } from '@/lib/data';
import * as planningService from '@/lib/planningSimple';

interface AddModulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planning: planningService.Planning; // El planning actual
  onAddModules: () => void;
}

export function AddModulesDialog({
  open,
  onOpenChange,
  planning,
  onAddModules
}: AddModulesDialogProps) {
  
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Cargar módulos disponibles (excluyendo los que ya están en el planning)
  useEffect(() => {
    if (open && planning) {
      const modules = planningService.getAvailableModulesForPlanning(
        planning.id,
        planning.projectId, // ← Usa el proyecto del planning actual
        'all', // ← Ya no filtramos por proyecto
        areaFilter
      ).filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      setAvailableModules(modules);
    }
  }, [open, planning, areaFilter, searchTerm]);

  const toggleExpand = (moduleId: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId);
    } else {
      newSet.add(moduleId);
    }
    setExpandedModules(newSet);
  };

  const handleAddModules = () => {
    if (selectedModules.size === 0) return;

    planningService.addModulesToPlanning(planning.id, Array.from(selectedModules));
    onAddModules();
    onOpenChange(false);
    setSelectedModules(new Set());
  };

  const formatWeeks = (weeks: string[]) => {
    if (!weeks || weeks.length === 0) return 'Sin semanas';
    if (weeks.length === 1) {
      return weeks[0];
    }
    return `${weeks.length} semanas`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Agregar módulos al planning</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Proyecto: <span className="font-medium">{planning.projectName}</span> · 
            Semanas: {formatWeeks(planning.weeks)}
          </p>
        </DialogHeader>

        {/* Filtros (SOLO ÁREA Y BÚSQUEDA) */}
        <div className="flex gap-2 mb-4">
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

        {/* Lista de módulos disponibles */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {availableModules.length > 0 ? (
            availableModules.map(module => (
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
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay módulos disponibles</p>
              <p className="text-sm">Todos los módulos de este proyecto ya están en el planning</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedModules.size} módulos seleccionados
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddModules} disabled={selectedModules.size === 0}>
            Agregar al planning ({selectedModules.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}